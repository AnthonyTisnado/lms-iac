package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.ClaseAlumno;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface ClaseAlumnoRepository extends JpaRepository<ClaseAlumno, Long> {
    List<ClaseAlumno> findByAlumno_Id(Long alumnoId);
    List<ClaseAlumno> findByClase_Id(Long claseId);
    long countByClase_Id(Long claseId);
    boolean existsByClase_IdAndAlumno_Id(Long claseId, Long alumnoId);
    Optional<ClaseAlumno> findByClase_IdAndAlumno_Id(Long claseId, Long alumnoId);
}
