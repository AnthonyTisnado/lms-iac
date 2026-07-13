resource "aws_apigatewayv2_api" "main" {
  name          = "${var.project_name}-${var.environment}-api"
  protocol_type = "HTTP"

  tags = {
    Name = "${var.project_name}-${var.environment}-api"
  }
}

resource "aws_apigatewayv2_vpc_link" "main" {
  name               = "${var.project_name}-${var.environment}-vpc-link"
  security_group_ids = [aws_security_group.api_gateway_link.id]
  subnet_ids         = aws_subnet.private[*].id

  tags = {
    Name = "${var.project_name}-${var.environment}-vpc-link"
  }
}
