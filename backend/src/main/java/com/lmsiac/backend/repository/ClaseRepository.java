package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Clase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaseRepository extends JpaRepository<Clase, Long> {
    List<Clase> findByProfesor_Id(Long profesorId);
    long countByEstado(Boolean estado);
    long countByCurso_Id(Long cursoId);
}
