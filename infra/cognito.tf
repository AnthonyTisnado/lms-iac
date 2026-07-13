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

resource "aws_apigatewayv2_authorizer" "cognito" {
  api_id           = aws_apigatewayv2_api.main.id
  authorizer_type  = "JWT"
  identity_sources = ["$request.header.Authorization"]
  name             = "${var.project_name}-${var.environment}-cognito"

  jwt_configuration {
    audience = [aws_cognito_user_pool_client.frontend.id]
    issuer   = "https://cognito-idp.${var.aws_region}.amazonaws.com/${aws_cognito_user_pool.main.id}"
  }
}

resource "aws_cognito_user_group" "administrator" {
  name         = "ADMINISTRADOR"
  user_pool_id = aws_cognito_user_pool.main.id
}
