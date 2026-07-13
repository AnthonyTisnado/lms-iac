resource "aws_security_group" "api_gateway_link" {
  name        = "${var.project_name}-${var.environment}-api-link-sg"
  description = "Seguridad del enlace privado de API Gateway"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-api-link-sg"
  }
}
