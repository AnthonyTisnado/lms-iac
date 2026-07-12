resource "aws_s3_bucket" "frontend" {
  bucket_prefix = "${var.project_name}-${var.environment}-frontend-"

  tags = {
    Name = "${var.project_name}-${var.environment}-frontend"
  }
}
