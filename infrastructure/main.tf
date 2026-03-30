provider "aws" {
  region = var.aws_region
}

# -------------------------
# S3 BUCKET (FRONTEND)
# -------------------------
resource "aws_s3_bucket" "frontend_bucket" {
  bucket = var.bucket_name
}

resource "aws_s3_bucket_public_access_block" "frontend_block" {
  bucket = aws_s3_bucket.frontend_bucket.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_website_configuration" "frontend_site" {
  bucket = aws_s3_bucket.frontend_bucket.id

  index_document {
    suffix = "index.html"
  }
}

resource "aws_s3_bucket_policy" "public_policy" {
  bucket = aws_s3_bucket.frontend_bucket.id

  depends_on = [aws_s3_bucket_public_access_block.frontend_block]

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Effect = "Allow"
      Principal = "*"
      Action = "s3:GetObject"
      Resource = "${aws_s3_bucket.frontend_bucket.arn}/*"
    }]
  })
}

# -------------------------
# CLOUDFRONT
# -------------------------
resource "aws_cloudfront_distribution" "cdn" {
  enabled = true

  # 1. YOUR EXISTING S3 ORIGIN
  origin {
    # Using the website_endpoint string directly
    domain_name = aws_s3_bucket_website_configuration.frontend_site.website_endpoint
    origin_id   = "s3-frontend"

    # Crucial: You MUST use custom_origin_config for S3 Website Endpoints
    custom_origin_config {
      http_port              = 80
      https_port             = 443
      origin_protocol_policy = "http-only" # S3 Website endpoints only support HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 2. ADD THIS NEW EC2 ORIGIN
  origin {
    # Use the Public DNS of your EC2 instance
    domain_name = aws_instance.backend.public_dns
    origin_id   = "ec2-backend"

    custom_origin_config {
      http_port              = 8000
      https_port             = 443
      origin_protocol_policy = "http-only" # CloudFront -> EC2 is HTTP
      origin_ssl_protocols   = ["TLSv1.2"]
    }
  }

  # 3. ADD THIS BEHAVIOR FOR API CALLS
  ordered_cache_behavior {
    path_pattern     = "/auth/*" # Match your login endpoint prefix
    target_origin_id = "ec2-backend"

    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"] # Essential for Auth headers/CORS
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  ordered_cache_behavior {
    path_pattern     = "/employees/*" # Match employees endpoint
    target_origin_id = "ec2-backend"

    allowed_methods  = ["DELETE", "GET", "HEAD", "OPTIONS", "PATCH", "POST", "PUT"]
    cached_methods   = ["GET", "HEAD"]

    forwarded_values {
      query_string = true
      headers      = ["*"] # Essential for Auth headers/CORS
      cookies {
        forward = "all"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
    min_ttl                = 0
    default_ttl            = 0
    max_ttl                = 0
  }

  # YOUR EXISTING DEFAULT BEHAVIOR (S3)
  default_cache_behavior {
    target_origin_id       = "s3-frontend"
    viewer_protocol_policy = "redirect-to-https"
    allowed_methods = ["GET", "HEAD"]
    cached_methods  = ["GET", "HEAD"]

    cache_policy_id = "658327ea-f89d-4fab-a63d-7e88639e58f6" # AWS Managed: CachingOptimized
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}

# -------------------------
# SECURITY GROUP
# -------------------------
resource "aws_security_group" "backend_sg" {
  name = "student-ec-backend-sg"

  ingress {
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.allowed_ip]
  }

  ingress {
    from_port   = 8000
    to_port     = 8000
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    from_port   = 27017
    to_port     = 27017
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }
}

# -------------------------
# EC2 INSTANCE (BACKEND + MONGO)
# -------------------------
data "aws_ami" "al2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }
}
resource "aws_instance" "backend" {
  ami = data.aws_ami.al2023.id
  instance_type = var.ec2_instance_type
  key_name      = var.key_pair_name

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  vpc_security_group_ids = [aws_security_group.backend_sg.id]

  user_data = <<-EOF
    #!/bin/bash
    set -e

    # ----------------------------
    # INSTALLS
    # ----------------------------
    dnf update -y

    dnf install -y docker
    systemctl enable docker
    systemctl start docker

    usermod -aG docker ec2-user

    dnf install -y python3.11 python3.11-pip
    dnf install -y git

    # ----------------------------
    # MONGO CONTAINER
    # ----------------------------
    docker run -d -p 27017:27017 --name mongodb mongo

    # ----------------------------
    # APP SETUP
    # ----------------------------
    cd /home/ec2-user
    git clone https://github.com/eric-clayton/employee-management-system

    cd employee-management-system/backend

    # ----------------------------
    # WRITE .ENV FROM TERRAFORM
    # ----------------------------
    cat <<EOT > .env
    ${file("../backend/.env")}
    EOT
    DB_NAME=$(grep DATABASE_NAME .env | cut -d '=' -f2 | tr -d ' "')

    # 2. Wait for Mongo to be ready
    sleep 10

    # 3. Create the collection explicitly
    docker exec mongodb mongosh --eval "db.getSiblingDB('$DB_NAME').createCollection('employees')"
    # ----------------------------
    # INSTALL DEPENDENCIES
    # ----------------------------
    python3.11 -m pip install --upgrade pip
    python3.11 -m pip install -r requirements.txt

    # ----------------------------
    # RUN APP
    # ----------------------------
    nohup python3.11 -m uvicorn app.main:app --host 0.0.0.0 --port 8000 > app.log 2>&1 &
  EOF

  tags = {
    Name = "student-ec-backend"
  }
}