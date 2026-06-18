package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.PreguntaExamen;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface PreguntaExamenRepository extends JpaRepository<PreguntaExamen, Long> {
    List<PreguntaExamen> findByExamen_Id(Long examenId);
}
