variable "aws_region" {
  default = "us-east-1"
}

variable "project_name" {
  default = "student-ec-ems"
}

variable "bucket_name" {
  description = "S3 bucket for frontend hosting"
  default = "student-ec-frontend-12345"
}

variable "ec2_instance_type" {
  default = "t2.micro"
}

variable "key_pair_name" {
  description = "Existing AWS key pair for SSH access"
  default = "student-employee-app-key-ec"
}

variable "allowed_ip" {
  description = "Your IP for SSH access (x.x.x.x/32)"
  default = "47.205.201.155/32"
}