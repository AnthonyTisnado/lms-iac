resource "aws_db_subnet_group" "main" {
  name       = "${var.project_name}-${var.environment}-datos"
  subnet_ids = aws_subnet.data[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-datos"
  }
}
