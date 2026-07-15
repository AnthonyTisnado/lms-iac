# LMSIAC

## Descripción del proyecto

LMSIAC es una plataforma web de gestión de aprendizaje orientada a instituciones educativas que necesitan centralizar cursos, clases, tareas, evaluaciones, archivos académicos y sesiones en vivo. El sistema está dirigido a administradores, profesores y alumnos, permitiendo organizar la información académica de manera ordenada, segura y accesible desde un entorno web.

Actualmente, muchas instituciones gestionan sus cursos mediante herramientas separadas como hojas de cálculo, carpetas compartidas, enlaces externos y canales de comunicación no centralizados. Esto genera duplicidad de información, pérdida de evidencias, dificultad para monitorear tareas y evaluaciones, y poca trazabilidad sobre el avance académico de los estudiantes.

La propuesta LMSIAC busca resolver esta problemática mediante una plataforma LMS con arquitectura orientada a la nube, donde los usuarios puedan acceder según su rol, los profesores puedan administrar sus clases, tareas y evaluaciones, y los alumnos puedan consultar materiales, entregar actividades y visualizar sus calificaciones.

El proyecto funciona como una aplicación web compuesta por frontend, backend, base de datos, almacenamiento de archivos e infraestructura cloud. Para la propuesta de arquitectura de la primera unidad, se plantea una arquitectura objetivo sobre Amazon Web Services AWS, considerando disponibilidad, escalabilidad, seguridad, tolerancia a fallos, recuperación ante errores y observabilidad.

---

## Problemática

Las instituciones educativas requieren plataformas digitales que permitan gestionar procesos académicos de forma segura y centralizada. Sin embargo, cuando la información se encuentra distribuida en diferentes herramientas, se presentan problemas como:

- Dificultad para controlar usuarios, roles y permisos.
- Pérdida o desorden de materiales académicos.
- Falta de trazabilidad en tareas, entregas y evaluaciones.
- Riesgo de exposición de información académica sensible.
- Baja disponibilidad cuando los servicios no están preparados para alta demanda.
- Ausencia de monitoreo ante errores, caídas o fallos parciales.
- Dificultad para integrar clases en vivo, archivos y calificaciones en una sola plataforma.

Por ello, LMSIAC propone una solución cloud que permita administrar los procesos académicos principales de manera segura, escalable y tolerante a fallos.

---

## Objetivo del proyecto

Diseñar e implementar una plataforma LMS web con arquitectura cloud en AWS, que permita gestionar cursos, clases, usuarios, tareas, evaluaciones, archivos académicos y clases en vivo, priorizando atributos de calidad como seguridad, disponibilidad, escalabilidad, rendimiento, recuperabilidad y observabilidad.

---

## Público objetivo

El sistema está orientado a:

- Administradores académicos.
- Profesores.
- Alumnos.
- Instituciones educativas que requieren una plataforma LMS centralizada.

---

## Tecnologías del prototipo

### Backend

- Java 21
- Spring Boot 3
- Spring Web
- Spring Security
- Spring Data JPA
- JWT
- Maven
- PostgreSQL Driver

### Frontend

- React
- Vite
- TypeScript
- Tailwind CSS
- Axios
- React Router

### Base de datos del prototipo

- Supabase PostgreSQL

### Infraestructura propuesta

- Amazon Web Services AWS
- Terraform
- Docker
- GitHub Actions
- Checkov
- CloudWatch

---

## Arquitectura objetivo en AWS

La arquitectura propuesta para LMSIAC se organiza por capas: acceso, seguridad, frontend, APIs, microservicios, datos, archivos, streaming, eventos y monitoreo.

```mermaid
flowchart TB
    U[Usuarios<br/>Administrador, Profesor, Alumno]

    U --> R53[Amazon Route 53<br/>DNS]
    R53 --> CF[Amazon CloudFront<br/>Distribución del frontend]
    CF --> WAF[AWS WAF<br/>Protección web]
    WAF --> FE[Amazon S3 / AWS Amplify<br/>Frontend React]

    FE --> APIGW[Amazon API Gateway<br/>Entrada segura a APIs]
    APIGW --> COG[Amazon Cognito<br/>Autenticación y roles]

    APIGW --> ALB[Application Load Balancer]

    subgraph VPC[Amazon VPC]
        subgraph PRIV[Subredes privadas Multi-AZ]
            ECS[Amazon ECS Fargate<br/>Microservicios LMSIAC]
            AUTH[MS Usuarios y Roles]
            ACADEMIC[MS Académico]
            TASKS[MS Tareas]
            EXAMS[MS Evaluaciones]
            FILES[MS Archivos]
            STREAM[MS Streaming]
            NOTIF[MS Notificaciones]
        end

        subgraph DATA[Subredes privadas de datos]
            RDS[(Amazon RDS PostgreSQL Multi-AZ)]
        end
    end

    ALB --> ECS
    ECS --> AUTH
    ECS --> ACADEMIC
    ECS --> TASKS
    ECS --> EXAMS
    ECS --> FILES
    ECS --> STREAM
    ECS --> NOTIF

    AUTH --> RDS
    ACADEMIC --> RDS
    TASKS --> RDS
    EXAMS --> RDS
    NOTIF --> RDS

    FILES --> S3FILES[Amazon S3<br/>Materiales, tareas y entregas]
    STREAM --> KVS[Amazon Kinesis Video Streams<br/>Clases en vivo]

    S3FILES --> LAMBDA1[AWS Lambda<br/>Procesamiento de archivos]
    STREAM --> EVENT[Amazon EventBridge<br/>Eventos programados]
    EVENT --> LAMBDA2[AWS Lambda<br/>Recordatorios y auditoría]
    LAMBDA2 --> SNS[Amazon SNS / SES<br/>Notificaciones]

    ECS --> SM[AWS Secrets Manager<br/>Credenciales seguras]

    APIGW --> CW[Amazon CloudWatch<br/>Logs, métricas y alarmas]
    ECS --> CW
    RDS --> CW
    KVS --> CW
    LAMBDA1 --> CW
    LAMBDA2 --> CW
    CW --> SNS

    RDS --> BACKUP[AWS Backup / RDS Backups]
