package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.ModuloClase;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ModuloClaseRepository extends JpaRepository<ModuloClase, Long> {
    List<ModuloClase> findByClase_IdOrderByNumeroSemanaAsc(Long claseId);
    List<ModuloClase> findByClase_IdAndVisibleOrderByNumeroSemanaAsc(Long claseId, Boolean visible);
}
