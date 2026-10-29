# Laboratorio Grupo 8

Este directorio es un laboratorio de infraestructura separado del LMS completo de `infra/`.
No sustituye ni demuestra el despliegue del backend Spring Boot o del frontend React.

Crea una Lambda de salud, HTTP API protegida con AWS IAM, Cognito Lite sin usuarios,
un grupo de logs y el rol de ejecucion Lambda. No crea NAT, RDS, ECS, WAF ni balanceadores.
El workflow aplica, verifica la Lambda y destruye el laboratorio en la misma ejecucion.
No cancelar el job: una cancelacion o perdida del runner puede impedir la limpieza.
El estado remoto queda en S3, separado de los recursos del laboratorio.

Antes de publicar el workflow:

1. Crear manualmente el bucket de estado en us-east-2, privado, cifrado y versionado.
   El bucket existente en us-east-1 no puede cambiar de region. No borrarlo ni migrar estados sin revisar su contenido.
2. Crear el entorno GitHub dev y permitir solamente la rama protegida development.
3. Configurar las variables AWS_REGION, AWS_ROLE_ARN y TF_STATE_BUCKET para el entorno dev.
4. Revisar el subject OIDC que emite el repositorio y limitar la confianza a environment:dev.
5. Preparar y aprobar una politica administrada por el cliente limitada a los recursos de main.tf,
   con iam:PassRole solo para lab09-grupo8-dev-lambda y lambda.amazonaws.com.
   El rol creado anteriormente solo accede a S3 y no permite aplicar este laboratorio.
6. Configurar presupuesto y correo de aviso. Un presupuesto avisa; no limita el gasto.
7. Revisar el plan real y el costo antes de autorizar el despliegue.

Capturas necesarias: presupuesto, bucket y sus propiedades, OIDC, confianza/permisos IAM,
entorno dev y rama permitida, variables, codigo, plan, apply, prueba, destroy y estado vacio.
No presentar capturas del workflow basico anterior como prueba de Terraform.
