resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-usuarios"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  tags = {
    Name = "${var.project_name}-${var.environment}-usuarios"
  }
}
