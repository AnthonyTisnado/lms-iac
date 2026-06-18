package com.lmsiac.backend.controller;

import com.lmsiac.backend.dto.Dto.*;
import com.lmsiac.backend.entity.*;
import com.lmsiac.backend.repository.*;
import com.lmsiac.backend.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;
import java.util.Comparator;
import java.util.List;

@RestController
@RequestMapping("/api/admin")
public class AdminController {
    private final UsuarioRepository usuarios;
    private final RoleRepository roles;
    private final CursoRepository cursos;
    private final ClaseRepository clases;
    private final ClaseAlumnoRepository claseAlumnos;
    private final TareaRepository tareas;
    private final ExamenRepository examenes;
    private final PasswordEncoder encoder;
    private final MapperService mapper;

    public AdminController(UsuarioRepository usuarios, RoleRepository roles, CursoRepository cursos, ClaseRepository clases, ClaseAlumnoRepository claseAlumnos, TareaRepository tareas, ExamenRepository examenes, PasswordEncoder encoder, MapperService mapper) {
        this.usuarios = usuarios;
        this.roles = roles;
        this.cursos = cursos;
        this.clases = clases;
        this.claseAlumnos = claseAlumnos;
        this.tareas = tareas;
        this.examenes = examenes;
        this.encoder = encoder;
        this.mapper = mapper;
    }

    @GetMapping("/usuarios")
    public List<UsuarioResponse> usuarios() {
        return usuarios.findAll().stream().map(mapper::usuario).toList();
    }

    @PostMapping("/usuarios")
    public UsuarioResponse crearUsuario(@Valid @RequestBody UsuarioRequest r) {
        Usuario u = new Usuario();
        applyUsuario(u, r, true);
        return mapper.usuario(usuarios.save(u));
    }

    @PutMapping("/usuarios/{id}")
    public UsuarioResponse editarUsuario(@PathVariable Long id, @Valid @RequestBody UsuarioRequest r) {
        Usuario u = usuario(id);
        applyUsuario(u, r, false);
        return mapper.usuario(usuarios.save(u));
    }

    @PatchMapping("/usuarios/{id}/estado")
    public UsuarioResponse estadoUsuario(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        Usuario u = usuario(id);
        u.setEstado(r.estado());
        return mapper.usuario(usuarios.save(u));
    }

    @GetMapping("/roles")
    public List<Role> roles() {
        return roles.findAll();
    }

    @GetMapping("/cursos")
    public List<CursoResumen> cursos() {
        return cursos.findAll().stream().map(this::cursoResumen).toList();
    }

    @PostMapping("/cursos")
    public Curso crearCurso(@Valid @RequestBody CursoRequest r) {
        Curso c = new Curso();
        applyCurso(c, r);
        return cursos.save(c);
    }

    @PutMapping("/cursos/{id}")
    public Curso editarCurso(@PathVariable Long id, @Valid @RequestBody CursoRequest r) {
        Curso c = curso(id);
        applyCurso(c, r);
        return cursos.save(c);
    }

    @PatchMapping("/cursos/{id}/estado")
    public Curso estadoCurso(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        Curso c = curso(id);
        c.setEstado(r.estado());
        return cursos.save(c);
    }

    @GetMapping("/clases")
    public List<Clase> clases() {
        return clases.findAll();
    }

    @PostMapping("/clases")
    public Clase crearClase(@Valid @RequestBody ClaseRequest r) {
        Clase c = new Clase();
        applyClase(c, r);
        return clases.save(c);
    }

    @PutMapping("/clases/{id}")
    public Clase editarClase(@PathVariable Long id, @Valid @RequestBody ClaseRequest r) {
        Clase c = clase(id);
        applyClase(c, r);
        return clases.save(c);
    }

    @PatchMapping("/clases/{id}/estado")
    public Clase estadoClase(@PathVariable Long id, @Valid @RequestBody EstadoRequest r) {
        Clase c = clase(id);
        c.setEstado(r.estado());
        return clases.save(c);
    }

    @GetMapping("/clases/{claseId}/alumnos")
    public List<UsuarioResponse> alumnosClase(@PathVariable Long claseId) {
        clase(claseId);
        return claseAlumnos.findByClase_Id(claseId).stream()
            .map(ClaseAlumno::getAlumno)
            .map(mapper::usuario)
            .toList();
    }

    @GetMapping("/clases/{claseId}/personas")
    public PersonasClaseResponse personasClase(@PathVariable Long claseId) {
        Clase c = clase(claseId);
        List<UsuarioResponse> profesores = List.of(mapper.usuario(c.getProfesor()));
        List<UsuarioResponse> alumnos = claseAlumnos.findByClase_Id(claseId).stream()
            .map(ClaseAlumno::getAlumno)
            .map(mapper::usuario)
            .toList();
        return new PersonasClaseResponse(profesores, alumnos);
    }

    @GetMapping("/alumnos-disponibles/{claseId}")
    public List<UsuarioResponse> alumnosDisponibles(@PathVariable Long claseId) {
        clase(claseId);
        return usuarios.findByRol_Nombre("ALUMNO").stream()
            .filter(Usuario::getEstado)
            .filter(alumno -> !claseAlumnos.existsByClase_IdAndAlumno_Id(claseId, alumno.getId()))
            .map(mapper::usuario)
            .toList();
    }

    @PostMapping("/clases/{claseId}/alumnos/{alumnoId}")
    public ClaseAlumno agregarAlumno(@PathVariable Long claseId, @PathVariable Long alumnoId) {
        if (claseAlumnos.existsByClase_IdAndAlumno_Id(claseId, alumnoId)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "El alumno ya esta matriculado");
        }
        Usuario alumno = usuario(alumnoId);
        if (!"ALUMNO".equals(alumno.getRol().getNombre())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no es alumno");
        }
        ClaseAlumno ca = new ClaseAlumno();
        ca.setClase(clase(claseId));
        ca.setAlumno(alumno);
        return claseAlumnos.save(ca);
    }

    @DeleteMapping("/clases/{claseId}/alumnos/{alumnoId}")
    public void quitarAlumno(@PathVariable Long claseId, @PathVariable Long alumnoId) {
        ClaseAlumno ca = claseAlumnos.findByClase_IdAndAlumno_Id(claseId, alumnoId)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Matricula no encontrada"));
        claseAlumnos.delete(ca);
    }

    @GetMapping("/dashboard")
    public DashboardResponse dashboard() {
        return new DashboardResponse(
            usuarios.count(),
            usuarios.countByRol_Nombre("ADMINISTRADOR"),
            usuarios.countByRol_Nombre("PROFESOR"),
            usuarios.countByRol_Nombre("ALUMNO"),
            cursos.count(),
            clases.count(),
            tareas.count(),
            examenes.count(),
            usuarios.findAll().stream()
                .sorted(Comparator.comparing(Usuario::getId).reversed())
                .limit(5)
                .map(mapper::usuario)
                .toList(),
            cursos.findAll().stream()
                .sorted(Comparator.comparing(Curso::getId).reversed())
                .limit(5)
                .map(this::cursoResumen)
                .toList(),
            clases.findAll().stream()
                .sorted(Comparator.comparing(Clase::getId).reversed())
                .limit(5)
                .map(this::claseResumen)
                .toList()
        );
    }

    @GetMapping("/reportes")
    public ReportesAdminResponse reportes() {
        List<CursoResumen> cursosConMasAlumnos = cursos.findAll().stream()
            .map(this::cursoResumen)
            .sorted(Comparator.comparing(CursoResumen::totalClases).reversed())
            .toList();
        List<ProfesorResumen> profesoresConMasClases = usuarios.findByRol_Nombre("PROFESOR").stream()
            .map(p -> new ProfesorResumen(
                p.getId(),
                p.getNombres() + " " + p.getApellidos(),
                p.getEmail(),
                clases.findByProfesor_Id(p.getId()).size()
            ))
            .sorted(Comparator.comparing(ProfesorResumen::totalClases).reversed())
            .toList();
        return new ReportesAdminResponse(
            cursosConMasAlumnos,
            profesoresConMasClases,
            usuarios.countByRol_Nombre("ALUMNO"),
            clases.countByEstado(true),
            tareas.count(),
            examenes.count()
        );
    }

    private void applyUsuario(Usuario u, UsuarioRequest r, boolean requirePassword) {
        if (requirePassword && (r.password() == null || r.password().isBlank())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password requerido");
        }
        if (r.password() != null && !r.password().isBlank() && r.password().length() < 6) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Password minimo 6 caracteres");
        }
        usuarios.findByEmail(r.email()).ifPresent(existing -> {
            if (u.getId() == null || !existing.getId().equals(u.getId())) {
                throw new ResponseStatusException(HttpStatus.CONFLICT, "Email ya registrado");
            }
        });
        u.setNombres(r.nombres());
        u.setApellidos(r.apellidos());
        u.setEmail(r.email());
        if (r.password() != null && !r.password().isBlank()) {
            u.setPasswordHash(encoder.encode(r.password()));
        }
        u.setRol(roles.findById(r.rolId()).orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol no encontrado")));
        u.setEstado(r.estado() == null || r.estado());
    }

    private void applyCurso(Curso c, CursoRequest r) {
        c.setNombre(r.nombre());
        c.setDescripcion(r.descripcion());
        c.setEstado(r.estado() == null || r.estado());
    }

    private void applyClase(Clase c, ClaseRequest r) {
        Usuario profesor = usuario(r.profesorId());
        if (!"PROFESOR".equals(profesor.getRol().getNombre())) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "El usuario no es profesor");
        }
        c.setNombre(r.nombre());
        c.setCurso(curso(r.cursoId()));
        c.setProfesor(profesor);
        c.setEstado(r.estado() == null || r.estado());
    }

    private Usuario usuario(Long id) {
        return usuarios.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Usuario no encontrado"));
    }
    private Curso curso(Long id) {
        return cursos.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Curso no encontrado"));
    }
    private Clase clase(Long id) {
        return clases.findById(id).orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada"));
    }

    private CursoResumen cursoResumen(Curso curso) {
        long totalClases = clases.countByCurso_Id(curso.getId());
        return new CursoResumen(curso.getId(), curso.getNombre(), curso.getDescripcion(), curso.getEstado(), totalClases);
    }

    private ClaseResumen claseResumen(Clase clase) {
        return new ClaseResumen(
            clase.getId(),
            clase.getNombre(),
            clase.getCurso().getNombre(),
            clase.getProfesor().getNombres() + " " + clase.getProfesor().getApellidos(),
            clase.getEstado(),
            claseAlumnos.findByClase_Id(clase.getId()).size()
        );
    }
}
