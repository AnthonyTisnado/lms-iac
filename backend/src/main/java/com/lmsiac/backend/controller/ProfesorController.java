package com.lmsiac.backend.controller;

import com.lmsiac.backend.dto.Dto.*;
import com.lmsiac.backend.entity.*;
import com.lmsiac.backend.repository.*;
import com.lmsiac.backend.service.AccessService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.List;

@RestController
@RequestMapping("/api/profesor")
public class ProfesorController {
    private final ClaseRepository clases;
    private final ClaseAlumnoRepository claseAlumnos;
    private final SesionRepository sesiones;
    private final TareaRepository tareas;
    private final EntregaTareaRepository entregas;
    private final ExamenRepository examenes;
    private final PreguntaExamenRepository preguntas;
    private final OpcionPreguntaRepository opciones;
    private final RespuestaExamenRepository respuestas;
    private final ClaseStreamingRepository streaming;
    private final ModuloClaseRepository modulos;
    private final RecursoModuloRepository recursos;
    private final AccessService access;

    public ProfesorController(ClaseRepository clases, ClaseAlumnoRepository claseAlumnos, SesionRepository sesiones, TareaRepository tareas, EntregaTareaRepository entregas, ExamenRepository examenes, PreguntaExamenRepository preguntas, OpcionPreguntaRepository opciones, RespuestaExamenRepository respuestas, ClaseStreamingRepository streaming, ModuloClaseRepository modulos, RecursoModuloRepository recursos, AccessService access) {
        this.clases = clases;
        this.claseAlumnos = claseAlumnos;
        this.sesiones = sesiones;
        this.tareas = tareas;
        this.entregas = entregas;
        this.examenes = examenes;
        this.preguntas = preguntas;
        this.opciones = opciones;
        this.respuestas = respuestas;
        this.streaming = streaming;
        this.modulos = modulos;
        this.recursos = recursos;
        this.access = access;
    }

    @GetMapping("/clases")
    public List<Clase> misClases(@AuthenticationPrincipal Usuario profesor) {
        return clases.findByProfesor_Id(profesor.getId());
    }

    @GetMapping("/dashboard")
    public ProfesorDashboardResponse dashboard(@AuthenticationPrincipal Usuario profesor) {
        List<Clase> misClases = clases.findByProfesor_Id(profesor.getId());
        long totalAlumnos = misClases.stream().mapToLong(c -> accessCountAlumnos(c.getId())).sum();
        long pendientes = misClases.stream()
            .flatMap(c -> tareas.findByClase_Id(c.getId()).stream())
            .mapToLong(t -> entregas.findByTarea_Id(t.getId()).stream().filter(e -> e.getNota() == null).count())
            .sum();
        return new ProfesorDashboardResponse(
            misClases.size(),
            totalAlumnos,
            tareas.countByProfesor_Id(profesor.getId()),
            pendientes,
            examenes.countByProfesor_Id(profesor.getId()),
            streaming.findByProfesor_Id(profesor.getId()).stream().filter(s -> !"FINALIZADA".equalsIgnoreCase(s.getEstado())).count()
        );
    }

    @GetMapping("/clases/{claseId}/alumnos")
    public List<AlumnoClaseResumen> alumnos(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return claseAlumnos.findByClase_Id(claseId).stream()
            .map(ClaseAlumno::getAlumno)
            .map(a -> {
                var notas = entregas.findByAlumno_Id(a.getId()).stream()
                    .filter(e -> e.getTarea().getClase().getId().equals(claseId))
                    .filter(e -> e.getNota() != null)
                    .map(EntregaTarea::getNota)
                    .toList();
                var promedio = notas.isEmpty() ? null : notas.stream().reduce(java.math.BigDecimal.ZERO, java.math.BigDecimal::add).divide(java.math.BigDecimal.valueOf(notas.size()), 2, java.math.RoundingMode.HALF_UP);
                long totalEntregas = entregas.findByAlumno_Id(a.getId()).stream().filter(e -> e.getTarea().getClase().getId().equals(claseId)).count();
                return new AlumnoClaseResumen(a.getId(), a.getNombres(), a.getApellidos(), a.getEmail(), a.getEstado(), totalEntregas, promedio);
            })
            .toList();
    }

    @GetMapping("/clases/{claseId}/personas")
    public PersonasClaseResponse personas(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        Clase clase = access.profesorClase(claseId, profesor);
        List<UsuarioResponse> profesores = List.of(new UsuarioResponse(
            clase.getProfesor().getId(),
            clase.getProfesor().getNombres(),
            clase.getProfesor().getApellidos(),
            clase.getProfesor().getEmail(),
            clase.getProfesor().getRol().getNombre(),
            clase.getProfesor().getEstado()
        ));
        List<UsuarioResponse> alumnos = claseAlumnos.findByClase_Id(claseId).stream()
            .map(ClaseAlumno::getAlumno)
            .map(a -> new UsuarioResponse(a.getId(), a.getNombres(), a.getApellidos(), a.getEmail(), a.getRol().getNombre(), a.getEstado()))
            .toList();
        return new PersonasClaseResponse(profesores, alumnos);
    }

    @GetMapping("/clases/{claseId}/sesiones")
    public List<Sesion> sesiones(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return sesiones.findByClase_Id(claseId);
    }

    @PostMapping("/clases/{claseId}/sesiones")
    public Sesion crearSesion(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody SesionRequest r) {
        Sesion s = new Sesion();
        s.setClase(access.profesorClase(claseId, profesor));
        applySesion(s, r);
        return sesiones.save(s);
    }

    @PutMapping("/sesiones/{id}")
    public Sesion editarSesion(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody SesionRequest r) {
        Sesion s = sesiones.findById(id).orElseThrow(() -> notFound("Sesion no encontrada"));
        access.profesorClase(s.getClase().getId(), profesor);
        applySesion(s, r);
        return sesiones.save(s);
    }

    @DeleteMapping("/sesiones/{id}")
    public void eliminarSesion(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        Sesion s = sesiones.findById(id).orElseThrow(() -> notFound("Sesion no encontrada"));
        access.profesorClase(s.getClase().getId(), profesor);
        sesiones.delete(s);
    }

    @GetMapping("/clases/{claseId}/tareas")
    public List<Tarea> tareas(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return tareas.findByClase_Id(claseId);
    }

    @PostMapping("/clases/{claseId}/tareas")
    public Tarea crearTarea(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody TareaRequest r) {
        Tarea t = new Tarea();
        t.setClase(access.profesorClase(claseId, profesor));
        t.setProfesor(profesor);
        applyTarea(t, r);
        return tareas.save(t);
    }

    @PutMapping("/tareas/{id}")
    public Tarea editarTarea(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody TareaRequest r) {
        Tarea t = tareas.findById(id).orElseThrow(() -> notFound("Tarea no encontrada"));
        access.profesorClase(t.getClase().getId(), profesor);
        applyTarea(t, r);
        return tareas.save(t);
    }

    @DeleteMapping("/tareas/{id}")
    public void eliminarTarea(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        Tarea t = tareas.findById(id).orElseThrow(() -> notFound("Tarea no encontrada"));
        access.profesorClase(t.getClase().getId(), profesor);
        tareas.delete(t);
    }

    @GetMapping("/tareas/{tareaId}/entregas")
    public List<EntregaTarea> entregas(@PathVariable Long tareaId, @AuthenticationPrincipal Usuario profesor) {
        Tarea t = tareas.findById(tareaId).orElseThrow(() -> notFound("Tarea no encontrada"));
        access.profesorClase(t.getClase().getId(), profesor);
        return entregas.findByTarea_Id(tareaId);
    }

    @PatchMapping("/entregas/{entregaId}/calificar")
    public EntregaTarea calificar(@PathVariable Long entregaId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody CalificarRequest r) {
        EntregaTarea e = entregas.findById(entregaId).orElseThrow(() -> notFound("Entrega no encontrada"));
        access.profesorClase(e.getTarea().getClase().getId(), profesor);
        e.setNota(r.nota());
        e.setEstado(r.estado() == null ? "CALIFICADO" : r.estado());
        return entregas.save(e);
    }

    @GetMapping("/clases/{claseId}/examenes")
    public List<Examen> examenes(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return examenes.findByClase_Id(claseId);
    }

    @PostMapping("/clases/{claseId}/examenes")
    public Examen crearExamen(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody ExamenRequest r) {
        Examen e = new Examen();
        e.setClase(access.profesorClase(claseId, profesor));
        e.setProfesor(profesor);
        e.setTitulo(r.titulo());
        e.setDescripcion(r.descripcion());
        e.setFechaInicio(r.fechaInicio());
        e.setFechaFin(r.fechaFin());
        return examenes.save(e);
    }

    @PutMapping("/examenes/{id}")
    public Examen editarExamen(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody ExamenRequest r) {
        Examen e = examenes.findById(id).orElseThrow(() -> notFound("Examen no encontrado"));
        access.profesorClase(e.getClase().getId(), profesor);
        e.setTitulo(r.titulo());
        e.setDescripcion(r.descripcion());
        e.setFechaInicio(r.fechaInicio());
        e.setFechaFin(r.fechaFin());
        return examenes.save(e);
    }

    @DeleteMapping("/examenes/{id}")
    public void eliminarExamen(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        Examen e = examenes.findById(id).orElseThrow(() -> notFound("Examen no encontrado"));
        access.profesorClase(e.getClase().getId(), profesor);
        examenes.delete(e);
    }

    @PostMapping("/examenes/{examenId}/preguntas")
    public PreguntaExamen crearPregunta(@PathVariable Long examenId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody PreguntaRequest r) {
        Examen examen = examenes.findById(examenId).orElseThrow(() -> notFound("Examen no encontrado"));
        access.profesorClase(examen.getClase().getId(), profesor);
        PreguntaExamen p = new PreguntaExamen();
        p.setExamen(examen);
        p.setPregunta(r.pregunta());
        p.setTipo(r.tipo());
        if (r.puntaje() != null) p.setPuntaje(r.puntaje());
        return preguntas.save(p);
    }

    @PostMapping("/preguntas/{preguntaId}/opciones")
    public OpcionPregunta crearOpcion(@PathVariable Long preguntaId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody OpcionRequest r) {
        PreguntaExamen pregunta = preguntas.findById(preguntaId).orElseThrow(() -> notFound("Pregunta no encontrada"));
        access.profesorClase(pregunta.getExamen().getClase().getId(), profesor);
        OpcionPregunta o = new OpcionPregunta();
        o.setPregunta(pregunta);
        o.setTexto(r.texto());
        o.setEsCorrecta(Boolean.TRUE.equals(r.esCorrecta()));
        return opciones.save(o);
    }

    @PutMapping("/preguntas/{id}")
    public PreguntaExamen editarPregunta(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody PreguntaRequest r) {
        PreguntaExamen p = preguntas.findById(id).orElseThrow(() -> notFound("Pregunta no encontrada"));
        access.profesorClase(p.getExamen().getClase().getId(), profesor);
        p.setPregunta(r.pregunta());
        p.setTipo(r.tipo());
        if (r.puntaje() != null) p.setPuntaje(r.puntaje());
        return preguntas.save(p);
    }

    @DeleteMapping("/preguntas/{id}")
    public void eliminarPregunta(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        PreguntaExamen p = preguntas.findById(id).orElseThrow(() -> notFound("Pregunta no encontrada"));
        access.profesorClase(p.getExamen().getClase().getId(), profesor);
        preguntas.delete(p);
    }

    @PutMapping("/opciones/{id}")
    public OpcionPregunta editarOpcion(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody OpcionRequest r) {
        OpcionPregunta o = opciones.findById(id).orElseThrow(() -> notFound("Opcion no encontrada"));
        access.profesorClase(o.getPregunta().getExamen().getClase().getId(), profesor);
        o.setTexto(r.texto());
        o.setEsCorrecta(Boolean.TRUE.equals(r.esCorrecta()));
        return opciones.save(o);
    }

    @DeleteMapping("/opciones/{id}")
    public void eliminarOpcion(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        OpcionPregunta o = opciones.findById(id).orElseThrow(() -> notFound("Opcion no encontrada"));
        access.profesorClase(o.getPregunta().getExamen().getClase().getId(), profesor);
        opciones.delete(o);
    }

    @GetMapping("/examenes/{examenId}/respuestas")
    public List<RespuestaExamen> respuestas(@PathVariable Long examenId, @AuthenticationPrincipal Usuario profesor) {
        Examen examen = examenes.findById(examenId).orElseThrow(() -> notFound("Examen no encontrado"));
        access.profesorClase(examen.getClase().getId(), profesor);
        return respuestas.findAll().stream().filter(r -> r.getExamen().getId().equals(examenId)).toList();
    }

    @GetMapping("/clases/{claseId}/streaming")
    public List<ClaseStreaming> streaming(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return streaming.findByClase_Id(claseId);
    }

    @PostMapping("/clases/{claseId}/streaming")
    public ClaseStreaming crearStreaming(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody StreamingRequest r) {
        ClaseStreaming s = new ClaseStreaming();
        s.setClase(access.profesorClase(claseId, profesor));
        s.setProfesor(profesor);
        applyStreaming(s, r);
        return streaming.save(s);
    }

    @PutMapping("/streaming/{id}")
    public ClaseStreaming editarStreaming(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody StreamingRequest r) {
        ClaseStreaming s = streaming.findById(id).orElseThrow(() -> notFound("Streaming no encontrado"));
        access.profesorClase(s.getClase().getId(), profesor);
        applyStreaming(s, r);
        return streaming.save(s);
    }

    @DeleteMapping("/streaming/{id}")
    public void eliminarStreaming(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor) {
        ClaseStreaming s = streaming.findById(id).orElseThrow(() -> notFound("Streaming no encontrado"));
        access.profesorClase(s.getClase().getId(), profesor);
        streaming.delete(s);
    }

    @PatchMapping("/streaming/{id}/estado")
    public ClaseStreaming estadoStreaming(@PathVariable Long id, @AuthenticationPrincipal Usuario profesor, @RequestBody java.util.Map<String, String> body) {
        ClaseStreaming s = streaming.findById(id).orElseThrow(() -> notFound("Streaming no encontrado"));
        access.profesorClase(s.getClase().getId(), profesor);
        String estado = body.getOrDefault("estado", "").trim();
        if (!List.of("PROGRAMADA", "EN_VIVO", "FINALIZADA").contains(estado)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Estado no permitido");
        }
        s.setEstado(estado);
        return streaming.save(s);
    }

    @GetMapping("/clases/{claseId}/modulos")
    public List<ModuloClaseResponse> modulos(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor) {
        access.profesorClase(claseId, profesor);
        return modulos.findByClase_IdOrderByNumeroSemanaAsc(claseId).stream().map(this::moduloResponse).toList();
    }

    @PostMapping("/clases/{claseId}/modulos")
    public ModuloClaseResponse crearModulo(@PathVariable Long claseId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody ModuloClaseRequest r) {
        ModuloClase m = new ModuloClase();
        m.setClase(access.profesorClase(claseId, profesor));
        applyModulo(m, r);
        return moduloResponse(modulos.save(m));
    }

    @PutMapping("/modulos/{moduloId}")
    public ModuloClaseResponse editarModulo(@PathVariable Long moduloId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody ModuloClaseRequest r) {
        ModuloClase m = moduloProfesor(moduloId, profesor);
        applyModulo(m, r);
        return moduloResponse(modulos.save(m));
    }

    @DeleteMapping("/modulos/{moduloId}")
    public void eliminarModulo(@PathVariable Long moduloId, @AuthenticationPrincipal Usuario profesor) {
        modulos.delete(moduloProfesor(moduloId, profesor));
    }

    @PatchMapping("/modulos/{moduloId}/visible")
    public ModuloClaseResponse visibleModulo(@PathVariable Long moduloId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody EstadoRequest r) {
        ModuloClase m = moduloProfesor(moduloId, profesor);
        m.setVisible(r.estado());
        return moduloResponse(modulos.save(m));
    }

    @GetMapping("/modulos/{moduloId}/recursos")
    public List<RecursoModuloResponse> recursos(@PathVariable Long moduloId, @AuthenticationPrincipal Usuario profesor) {
        moduloProfesor(moduloId, profesor);
        return recursos.findByModulo_IdOrderByOrdenAsc(moduloId).stream().map(this::recursoResponse).toList();
    }

    @PostMapping("/modulos/{moduloId}/recursos")
    public RecursoModuloResponse crearRecurso(@PathVariable Long moduloId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody RecursoModuloRequest r) {
        RecursoModulo recurso = new RecursoModulo();
        recurso.setModulo(moduloProfesor(moduloId, profesor));
        applyRecurso(recurso, r);
        return recursoResponse(recursos.save(recurso));
    }

    @PutMapping("/recursos/{recursoId}")
    public RecursoModuloResponse editarRecurso(@PathVariable Long recursoId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody RecursoModuloRequest r) {
        RecursoModulo recurso = recursoProfesor(recursoId, profesor);
        applyRecurso(recurso, r);
        return recursoResponse(recursos.save(recurso));
    }

    @DeleteMapping("/recursos/{recursoId}")
    public void eliminarRecurso(@PathVariable Long recursoId, @AuthenticationPrincipal Usuario profesor) {
        recursos.delete(recursoProfesor(recursoId, profesor));
    }

    @PatchMapping("/recursos/{recursoId}/visible")
    public RecursoModuloResponse visibleRecurso(@PathVariable Long recursoId, @AuthenticationPrincipal Usuario profesor, @Valid @RequestBody EstadoRequest r) {
        RecursoModulo recurso = recursoProfesor(recursoId, profesor);
        recurso.setVisible(r.estado());
        return recursoResponse(recursos.save(recurso));
    }

    private void applySesion(Sesion s, SesionRequest r) {
        s.setTitulo(r.titulo());
        s.setDescripcion(r.descripcion());
        s.setFecha(r.fecha());
        s.setMaterialUrl(r.materialUrl());
    }

    private void applyTarea(Tarea t, TareaRequest r) {
        t.setTitulo(r.titulo());
        t.setDescripcion(r.descripcion());
        t.setArchivoUrl(r.archivoUrl());
        t.setFechaEntrega(r.fechaEntrega());
    }

    private void applyStreaming(ClaseStreaming s, StreamingRequest r) {
        s.setTitulo(r.titulo());
        s.setDescripcion(r.descripcion());
        s.setEnlaceStreaming(r.enlaceStreaming());
        s.setFechaInicio(r.fechaInicio());
        s.setEstado(r.estado() == null ? "PROGRAMADA" : r.estado());
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }

    private void applyModulo(ModuloClase m, ModuloClaseRequest r) {
        m.setNumeroSemana(r.numeroSemana());
        m.setTitulo(r.titulo());
        m.setDescripcion(r.descripcion());
        m.setFechaInicio(r.fechaInicio());
        m.setFechaFin(r.fechaFin());
        m.setVisible(r.visible() == null || r.visible());
    }

    private void applyRecurso(RecursoModulo recurso, RecursoModuloRequest r) {
        recurso.setTitulo(r.titulo());
        recurso.setDescripcion(r.descripcion());
        recurso.setTipo(r.tipo());
        recurso.setArchivoUrl(r.archivoUrl());
        recurso.setEnlaceUrl(r.enlaceUrl());
        recurso.setOrden(r.orden() == null ? 1 : r.orden());
        recurso.setVisible(r.visible() == null || r.visible());
    }

    private ModuloClase moduloProfesor(Long moduloId, Usuario profesor) {
        ModuloClase m = modulos.findById(moduloId).orElseThrow(() -> notFound("Modulo no encontrado"));
        access.profesorClase(m.getClase().getId(), profesor);
        return m;
    }

    private RecursoModulo recursoProfesor(Long recursoId, Usuario profesor) {
        RecursoModulo recurso = recursos.findById(recursoId).orElseThrow(() -> notFound("Recurso no encontrado"));
        access.profesorClase(recurso.getModulo().getClase().getId(), profesor);
        return recurso;
    }

    private ModuloClaseResponse moduloResponse(ModuloClase m) {
        return new ModuloClaseResponse(m.getId(), m.getNumeroSemana(), m.getTitulo(), m.getDescripcion(), m.getFechaInicio(), m.getFechaFin(), m.getVisible(), recursos.findByModulo_IdOrderByOrdenAsc(m.getId()).stream().map(this::recursoResponse).toList());
    }

    private RecursoModuloResponse recursoResponse(RecursoModulo r) {
        return new RecursoModuloResponse(r.getId(), r.getTitulo(), r.getDescripcion(), r.getTipo(), r.getArchivoUrl(), r.getEnlaceUrl(), r.getOrden(), r.getVisible());
    }

    private long accessCountAlumnos(Long claseId) {
        return claseAlumnos.countByClase_Id(claseId);
    }
}
