package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.RespuestaExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RespuestaExamenRepository extends JpaRepository<RespuestaExamen, Long> {
    List<RespuestaExamen> findByExamen_IdAndAlumno_Id(Long examenId, Long alumnoId);
    boolean existsByExamen_IdAndAlumno_Id(Long examenId, Long alumnoId);
}
