package com.lmsiac.backend.controller;

import com.lmsiac.backend.dto.Dto.*;
import com.lmsiac.backend.entity.Usuario;
import com.lmsiac.backend.repository.RoleRepository;
import com.lmsiac.backend.repository.UsuarioRepository;
import com.lmsiac.backend.security.JwtService;
import com.lmsiac.backend.service.MapperService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api")
public class AuthController {
    private final UsuarioRepository usuarioRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder encoder;
    private final JwtService jwtService;
    private final MapperService mapper;

    public AuthController(UsuarioRepository usuarioRepository, RoleRepository roleRepository, PasswordEncoder encoder, JwtService jwtService, MapperService mapper) {
        this.usuarioRepository = usuarioRepository;
        this.roleRepository = roleRepository;
        this.encoder = encoder;
        this.jwtService = jwtService;
        this.mapper = mapper;
    }

    @PostMapping("/auth/login")
    public LoginResponse login(@Valid @RequestBody LoginRequest request) {
        Usuario usuario = usuarioRepository.findByEmail(request.email())
            .filter(u -> Boolean.TRUE.equals(u.getEstado()))
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas"));
        if (!encoder.matches(request.password(), usuario.getPasswordHash())) {
            throw new ResponseStatusException(HttpStatus.UNAUTHORIZED, "Credenciales invalidas");
        }
        return new LoginResponse(jwtService.generate(usuario), mapper.usuario(usuario));
    }

    @PostMapping("/setup/admin")
    public UsuarioResponse setupAdmin(@Valid @RequestBody SetupAdminRequest request) {
        if (usuarioRepository.existsByRol_Nombre("ADMINISTRADOR")) {
            throw new ResponseStatusException(HttpStatus.CONFLICT, "Ya existe un administrador");
        }
        var rol = roleRepository.findByNombre("ADMINISTRADOR")
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.BAD_REQUEST, "Rol ADMINISTRADOR no existe"));
        Usuario usuario = new Usuario();
        usuario.setNombres(request.nombres());
        usuario.setApellidos(request.apellidos());
        usuario.setEmail(request.email());
        usuario.setPasswordHash(encoder.encode(request.password()));
        usuario.setRol(rol);
        usuario.setEstado(true);
        return mapper.usuario(usuarioRepository.save(usuario));
    }
}
