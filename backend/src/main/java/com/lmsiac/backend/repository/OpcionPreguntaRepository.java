package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.OpcionPregunta;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface OpcionPreguntaRepository extends JpaRepository<OpcionPregunta, Long> {
    List<OpcionPregunta> findByPregunta_Id(Long preguntaId);
}
