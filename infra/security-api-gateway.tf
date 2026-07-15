resource "aws_security_group" "api_gateway_link" {
  name        = "${var.project_name}-${var.environment}-api-link-sg"
  description = "Seguridad del enlace privado de API Gateway"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-api-link-sg"
  }
}

resource "aws_vpc_security_group_egress_rule" "api_gateway_to_alb" {
  security_group_id            = aws_security_group.api_gateway_link.id
  referenced_security_group_id = aws_security_group.alb.id
  description                  = "Salida hacia el balanceador de carga"
  from_port                    = 80
  to_port                      = 80
  ip_protocol                  = "tcp"
}
