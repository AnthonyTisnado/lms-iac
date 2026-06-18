package com.lmsiac.backend.service;

import com.lmsiac.backend.entity.Clase;
import com.lmsiac.backend.entity.Usuario;
import com.lmsiac.backend.repository.ClaseAlumnoRepository;
import com.lmsiac.backend.repository.ClaseRepository;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class AccessService {
    private final ClaseRepository claseRepository;
    private final ClaseAlumnoRepository claseAlumnoRepository;

    public AccessService(ClaseRepository claseRepository, ClaseAlumnoRepository claseAlumnoRepository) {
        this.claseRepository = claseRepository;
        this.claseAlumnoRepository = claseAlumnoRepository;
    }

    public Clase clase(Long id) {
        return claseRepository.findById(id)
            .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Clase no encontrada"));
    }

    public Clase profesorClase(Long claseId, Usuario profesor) {
        Clase clase = clase(claseId);
        if (!clase.getProfesor().getId().equals(profesor.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No puede gestionar esta clase");
        }
        return clase;
    }

    public Clase alumnoClase(Long claseId, Usuario alumno) {
        Clase clase = clase(claseId);
        if (!claseAlumnoRepository.existsByClase_IdAndAlumno_Id(claseId, alumno.getId())) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No esta matriculado en esta clase");
        }
        return clase;
    }
}
