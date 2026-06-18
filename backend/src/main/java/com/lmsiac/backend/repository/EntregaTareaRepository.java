package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.EntregaTarea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface EntregaTareaRepository extends JpaRepository<EntregaTarea, Long> {
    List<EntregaTarea> findByTarea_Id(Long tareaId);
    List<EntregaTarea> findByAlumno_Id(Long alumnoId);
    Optional<EntregaTarea> findByTarea_IdAndAlumno_Id(Long tareaId, Long alumnoId);
}
