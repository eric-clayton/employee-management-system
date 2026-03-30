output "frontend_bucket" {
  value = aws_s3_bucket.frontend_bucket.bucket
}

output "cloudfront_url" {
  value = aws_cloudfront_distribution.cdn.domain_name
}

output "ec2_public_ip" {
  value = aws_instance.backend.public_ip
}

output "backend_url" {
  value = "http://${aws_instance.backend.public_ip}:8000"
}