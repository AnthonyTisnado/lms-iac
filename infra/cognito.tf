resource "aws_cognito_user_pool" "main" {
  name = "${var.project_name}-${var.environment}-usuarios"

  username_attributes      = ["email"]
  auto_verified_attributes = ["email"]

  tags = {
    Name = "${var.project_name}-${var.environment}-usuarios"
  }
}

resource "aws_cognito_user_pool_client" "frontend" {
  name         = "${var.project_name}-${var.environment}-frontend"
  user_pool_id = aws_cognito_user_pool.main.id

  generate_secret = false
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]
}
