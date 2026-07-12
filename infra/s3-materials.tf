resource "aws_s3_bucket" "materials" {
  bucket_prefix = "${var.project_name}-${var.environment}-materiales-"

  tags = {
    Name = "${var.project_name}-${var.environment}-materiales"
  }
}

resource "aws_s3_bucket_public_access_block" "materials" {
  bucket = aws_s3_bucket.materials.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_versioning" "materials" {
  bucket = aws_s3_bucket.materials.id

  versioning_configuration {
    status = "Enabled"
  }
}
