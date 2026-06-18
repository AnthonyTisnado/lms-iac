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
import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/alumno")
public class AlumnoController {
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

    public AlumnoController(ClaseAlumnoRepository claseAlumnos, SesionRepository sesiones, TareaRepository tareas, EntregaTareaRepository entregas, ExamenRepository examenes, PreguntaExamenRepository preguntas, OpcionPreguntaRepository opciones, RespuestaExamenRepository respuestas, ClaseStreamingRepository streaming, ModuloClaseRepository modulos, RecursoModuloRepository recursos, AccessService access) {
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
    public List<Clase> clases(@AuthenticationPrincipal Usuario alumno) {
        return claseAlumnos.findByAlumno_Id(alumno.getId()).stream().map(ClaseAlumno::getClase).toList();
    }

    @GetMapping("/dashboard")
    public AlumnoDashboardResponse dashboard(@AuthenticationPrincipal Usuario alumno) {
        List<Clase> misClases = claseAlumnos.findByAlumno_Id(alumno.getId()).stream().map(ClaseAlumno::getClase).toList();
        List<Tarea> tareasAlumno = misClases.stream().flatMap(c -> tareas.findByClase_Id(c.getId()).stream()).toList();
        long entregadas = entregas.findByAlumno_Id(alumno.getId()).size();
        long pendientes = tareasAlumno.stream().filter(t -> entregas.findByTarea_IdAndAlumno_Id(t.getId(), alumno.getId()).isEmpty()).count();
        long examenesDisponibles = misClases.stream().flatMap(c -> examenes.findByClase_Id(c.getId()).stream())
            .filter(e -> e.getFechaFin() == null || e.getFechaFin().isAfter(LocalDateTime.now()))
            .filter(e -> !respuestas.existsByExamen_IdAndAlumno_Id(e.getId(), alumno.getId()))
            .count();
        long proximas = misClases.stream().flatMap(c -> streaming.findByClase_Id(c.getId()).stream())
            .filter(s -> !"FINALIZADA".equalsIgnoreCase(s.getEstado()))
            .count();
        List<EntregaNotaResponse> ultimasNotas = entregas.findByAlumno_Id(alumno.getId()).stream()
            .filter(e -> e.getNota() != null)
            .sorted((a, b) -> b.getId().compareTo(a.getId()))
            .limit(5)
            .map(this::nota)
            .toList();
        return new AlumnoDashboardResponse(misClases.size(), pendientes, entregadas, examenesDisponibles, proximas, ultimasNotas);
    }

    @GetMapping("/clases/{claseId}/sesiones")
    public List<Sesion> sesiones(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        access.alumnoClase(claseId, alumno);
        return sesiones.findByClase_Id(claseId);
    }

    @GetMapping("/clases/{claseId}/personas")
    public PersonasClaseResponse personas(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        Clase clase = access.alumnoClase(claseId, alumno);
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

    @GetMapping("/clases/{claseId}/tareas")
    public List<Tarea> tareas(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        access.alumnoClase(claseId, alumno);
        return tareas.findByClase_Id(claseId);
    }

    @PostMapping("/tareas/{tareaId}/entregar")
    public EntregaTarea entregar(@PathVariable Long tareaId, @AuthenticationPrincipal Usuario alumno, @Valid @RequestBody EntregaRequest r) {
        Tarea tarea = tareas.findById(tareaId).orElseThrow(() -> notFound("Tarea no encontrada"));
        access.alumnoClase(tarea.getClase().getId(), alumno);
        EntregaTarea e = entregas.findByTarea_IdAndAlumno_Id(tareaId, alumno.getId()).orElseGet(EntregaTarea::new);
        e.setTarea(tarea);
        e.setAlumno(alumno);
        e.setArchivoUrl(r.archivoUrl());
        e.setComentario(r.comentario());
        e.setEstado("ENTREGADO");
        return entregas.save(e);
    }

    @PutMapping("/entregas/{entregaId}")
    public EntregaTarea actualizarEntrega(@PathVariable Long entregaId, @AuthenticationPrincipal Usuario alumno, @Valid @RequestBody EntregaRequest r) {
        EntregaTarea e = entregas.findById(entregaId).orElseThrow(() -> notFound("Entrega no encontrada"));
        if (!e.getAlumno().getId().equals(alumno.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puede actualizar esta entrega");
        }
        if (e.getNota() != null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No puede actualizar una entrega calificada");
        }
        e.setArchivoUrl(r.archivoUrl());
        e.setComentario(r.comentario());
        e.setEstado("ENTREGADO");
        return entregas.save(e);
    }

    @GetMapping("/clases/{claseId}/examenes")
    public List<Examen> examenes(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        access.alumnoClase(claseId, alumno);
        return examenes.findByClase_Id(claseId);
    }

    @GetMapping("/examenes/{examenId}")
    public Examen examen(@PathVariable Long examenId, @AuthenticationPrincipal Usuario alumno) {
        Examen examen = examenes.findById(examenId).orElseThrow(() -> notFound("Examen no encontrado"));
        access.alumnoClase(examen.getClase().getId(), alumno);
        return examen;
    }

    @GetMapping("/examenes/{examenId}/preguntas")
    public List<PreguntaExamen> preguntas(@PathVariable Long examenId, @AuthenticationPrincipal Usuario alumno) {
        Examen examen = examenes.findById(examenId).orElseThrow(() -> notFound("Examen no encontrado"));
        access.alumnoClase(examen.getClase().getId(), alumno);
        return preguntas.findByExamen_Id(examenId);
    }

    @GetMapping("/preguntas/{preguntaId}/opciones")
    public List<OpcionPregunta> opciones(@PathVariable Long preguntaId) {
        return opciones.findByPregunta_Id(preguntaId);
    }

    @PostMapping("/examenes/{examenId}/responder")
    public List<RespuestaExamen> responder(@PathVariable Long examenId, @AuthenticationPrincipal Usuario alumno, @Valid @RequestBody ResponderExamenRequest r) {
        Examen examen = examenes.findById(examenId).orElseThrow(() -> notFound("Examen no encontrado"));
        access.alumnoClase(examen.getClase().getId(), alumno);
        LocalDateTime ahora = LocalDateTime.now();
        if (examen.getFechaInicio() != null && examen.getFechaInicio().isAfter(ahora)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El examen aun no esta disponible");
        }
        if (examen.getFechaFin() != null && examen.getFechaFin().isBefore(ahora)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El examen esta cerrado");
        }
        if (respuestas.existsByExamen_IdAndAlumno_Id(examenId, alumno.getId())) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El examen ya fue respondido");
        }
        return r.respuestas().stream().map(item -> {
            PreguntaExamen p = preguntas.findById(item.preguntaId()).orElseThrow(() -> notFound("Pregunta no encontrada"));
            if (!p.getExamen().getId().equals(examenId)) {
                throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Pregunta no pertenece al examen");
            }
            RespuestaExamen respuesta = new RespuestaExamen();
            respuesta.setExamen(examen);
            respuesta.setPregunta(p);
            respuesta.setAlumno(alumno);
            respuesta.setRespuesta(item.respuesta());
            return respuestas.save(respuesta);
        }).toList();
    }

    @GetMapping("/clases/{claseId}/streaming")
    public List<ClaseStreaming> streaming(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        access.alumnoClase(claseId, alumno);
        return streaming.findByClase_Id(claseId);
    }

    @GetMapping("/clases/{claseId}/modulos")
    public List<ModuloClaseResponse> modulos(@PathVariable Long claseId, @AuthenticationPrincipal Usuario alumno) {
        access.alumnoClase(claseId, alumno);
        return modulos.findByClase_IdAndVisibleOrderByNumeroSemanaAsc(claseId, true).stream()
            .map(m -> new ModuloClaseResponse(
                m.getId(),
                m.getNumeroSemana(),
                m.getTitulo(),
                m.getDescripcion(),
                m.getFechaInicio(),
                m.getFechaFin(),
                m.getVisible(),
                recursos.findByModulo_IdAndVisibleOrderByOrdenAsc(m.getId(), true).stream()
                    .map(r -> new RecursoModuloResponse(r.getId(), r.getTitulo(), r.getDescripcion(), r.getTipo(), r.getArchivoUrl(), r.getEnlaceUrl(), r.getOrden(), r.getVisible()))
                    .toList()
            ))
            .toList();
    }

    @GetMapping("/notas")
    public List<EntregaTarea> notas(@AuthenticationPrincipal Usuario alumno) {
        return entregas.findByAlumno_Id(alumno.getId());
    }

    private EntregaNotaResponse nota(EntregaTarea e) {
        return new EntregaNotaResponse(
            e.getId(),
            e.getTarea().getClase().getCurso().getNombre(),
            e.getTarea().getClase().getNombre(),
            e.getTarea().getTitulo(),
            e.getNota(),
            e.getComentario(),
            e.getEntregadoEn()
        );
    }

    private ResponseStatusException notFound(String message) {
        return new ResponseStatusException(HttpStatus.NOT_FOUND, message);
    }
}
