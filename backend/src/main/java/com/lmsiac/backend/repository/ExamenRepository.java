package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Examen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ExamenRepository extends JpaRepository<Examen, Long> {
    List<Examen> findByClase_Id(Long claseId);
    long countByProfesor_Id(Long profesorId);
}
