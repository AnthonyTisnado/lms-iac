package com.lmsiac.backend.dto;

import jakarta.validation.constraints.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public final class Dto {
    private Dto() {}

    public record LoginRequest(@Email @NotBlank String email, @NotBlank String password) {}
    public record UsuarioResponse(Long id, String nombres, String apellidos, String email, String rol, Boolean estado) {}
    public record LoginResponse(String token, UsuarioResponse usuario) {}
    public record SetupAdminRequest(@NotBlank String nombres, @NotBlank String apellidos, @Email @NotBlank String email, @NotBlank String password) {}
    public record UsuarioRequest(@NotBlank String nombres, @NotBlank String apellidos, @Email @NotBlank String email, String password, @NotNull Long rolId, Boolean estado) {}
    public record EstadoRequest(@NotNull Boolean estado) {}
    public record CursoRequest(@NotBlank String nombre, String descripcion, Boolean estado) {}
    public record ClaseRequest(@NotBlank String nombre, @NotNull Long cursoId, @NotNull Long profesorId, Boolean estado) {}
    public record SesionRequest(@NotBlank String titulo, String descripcion, LocalDateTime fecha, String materialUrl) {}
    public record TareaRequest(@NotBlank String titulo, String descripcion, String archivoUrl, LocalDateTime fechaEntrega) {}
    public record EntregaRequest(@NotBlank String archivoUrl, String comentario) {}
    public record CalificarRequest(@NotNull BigDecimal nota, String estado) {}
    public record ExamenRequest(@NotBlank String titulo, String descripcion, LocalDateTime fechaInicio, LocalDateTime fechaFin) {}
    public record PreguntaRequest(@NotBlank String pregunta, @NotBlank String tipo, BigDecimal puntaje) {}
    public record OpcionRequest(@NotBlank String texto, Boolean esCorrecta) {}
    public record RespuestaRequest(@NotNull Long preguntaId, String respuesta) {}
    public record ResponderExamenRequest(@NotEmpty List<RespuestaRequest> respuestas) {}
    public record StreamingRequest(@NotBlank String titulo, String descripcion, @NotBlank String enlaceStreaming, LocalDateTime fechaInicio, String estado) {}
    public record DashboardResponse(
        long totalUsuarios,
        long totalAdministradores,
        long totalProfesores,
        long totalAlumnos,
        long totalCursos,
        long totalClases,
        long totalTareas,
        long totalExamenes,
        List<UsuarioResponse> ultimosUsuarios,
        List<CursoResumen> ultimosCursos,
        List<ClaseResumen> ultimasClases
    ) {}
    public record CursoResumen(Long id, String nombre, String descripcion, Boolean estado, long totalClases) {}
    public record ClaseResumen(Long id, String nombre, String curso, String profesor, Boolean estado, long totalAlumnos) {}
    public record ReportesAdminResponse(
        List<CursoResumen> cursosConMasAlumnos,
        List<ProfesorResumen> profesoresConMasClases,
        long alumnosActivos,
        long clasesActivas,
        long tareasCreadas,
        long examenesCreados
    ) {}
    public record ProfesorResumen(Long id, String nombreCompleto, String email, long totalClases) {}
    public record ProfesorDashboardResponse(
        long totalClases,
        long totalAlumnos,
        long tareasCreadas,
        long tareasPendientesRevision,
        long examenesCreados,
        long proximasClasesVivo
    ) {}
    public record AlumnoClaseResumen(Long id, String nombres, String apellidos, String email, Boolean estado, long tareasEntregadas, BigDecimal promedio) {}
    public record AlumnoDashboardResponse(
        long totalClases,
        long tareasPendientes,
        long tareasEntregadas,
        long examenesDisponibles,
        long proximasClasesVivo,
        List<EntregaNotaResponse> ultimasNotas
    ) {}
    public record EntregaNotaResponse(Long id, String curso, String claseNombre, String titulo, BigDecimal nota, String comentario, LocalDateTime fecha) {}
    public record FileUploadResponse(String url, String path) {}
    public record ModuloClaseRequest(
        @NotNull Integer numeroSemana,
        String titulo,
        String descripcion,
        LocalDateTime fechaInicio,
        LocalDateTime fechaFin,
        Boolean visible
    ) {}
    public record RecursoModuloRequest(
        @NotBlank String titulo,
        String descripcion,
        @NotBlank String tipo,
        String archivoUrl,
        String enlaceUrl,
        Integer orden,
        Boolean visible
    ) {}
    public record RecursoModuloResponse(Long id, String titulo, String descripcion, String tipo, String archivoUrl, String enlaceUrl, Integer orden, Boolean visible) {}
    public record ModuloClaseResponse(Long id, Integer numeroSemana, String titulo, String descripcion, LocalDateTime fechaInicio, LocalDateTime fechaFin, Boolean visible, List<RecursoModuloResponse> recursos) {}
    public record PersonasClaseResponse(List<UsuarioResponse> profesores, List<UsuarioResponse> alumnos) {}
}
