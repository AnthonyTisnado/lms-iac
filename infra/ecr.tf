resource "aws_ecr_repository" "backend" {
  name                 = "${var.project_name}-${var.environment}-backend"
  image_tag_mutability = "MUTABLE"

  tags = {
    Name = "${var.project_name}-${var.environment}-backend"
  }
}
