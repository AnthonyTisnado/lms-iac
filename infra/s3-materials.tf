resource "aws_s3_bucket" "materials" {
  bucket_prefix = "${var.project_name}-${var.environment}-materiales-"

  tags = {
    Name = "${var.project_name}-${var.environment}-materiales"
  }
}
