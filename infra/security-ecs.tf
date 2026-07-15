resource "aws_security_group" "ecs" {
  name        = "${var.project_name}-${var.environment}-ecs-sg"
  description = "Permite trafico del balanceador hacia ECS"
  vpc_id      = aws_vpc.main.id

  tags = {
    Name = "${var.project_name}-${var.environment}-ecs-sg"
  }
}

resource "aws_vpc_security_group_ingress_rule" "ecs_from_alb" {
  security_group_id            = aws_security_group.ecs.id
  referenced_security_group_id = aws_security_group.alb.id
  from_port                    = 8080
  to_port                      = 8080
  ip_protocol                  = "tcp"
  description                  = "Acceso del balanceador al backend"
}

resource "aws_vpc_security_group_egress_rule" "ecs_out" {
  security_group_id = aws_security_group.ecs.id
  cidr_ipv4         = "0.0.0.0/0"
  ip_protocol       = "-1"
  description       = "Salida de los contenedores"
}
