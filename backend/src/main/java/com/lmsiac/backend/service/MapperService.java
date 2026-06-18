package com.lmsiac.backend.service;

import com.lmsiac.backend.dto.Dto.UsuarioResponse;
import com.lmsiac.backend.dto.Dto.RecursoModuloResponse;
import com.lmsiac.backend.entity.RecursoModulo;
import com.lmsiac.backend.entity.Usuario;
import org.springframework.stereotype.Service;

@Service
public class MapperService {
    public UsuarioResponse usuario(Usuario usuario) {
        return new UsuarioResponse(
            usuario.getId(),
            usuario.getNombres(),
            usuario.getApellidos(),
            usuario.getEmail(),
            usuario.getRol().getNombre(),
            usuario.getEstado()
        );
    }

    public RecursoModuloResponse recurso(RecursoModulo recurso) {
        return new RecursoModuloResponse(
            recurso.getId(),
            recurso.getTitulo(),
            recurso.getDescripcion(),
            recurso.getTipo(),
            recurso.getArchivoUrl(),
            recurso.getEnlaceUrl(),
            recurso.getOrden(),
            recurso.getVisible()
        );
    }
}
