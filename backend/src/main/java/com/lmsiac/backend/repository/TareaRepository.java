package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Tarea;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TareaRepository extends JpaRepository<Tarea, Long> {
    List<Tarea> findByClase_Id(Long claseId);
    long countByProfesor_Id(Long profesorId);
}
