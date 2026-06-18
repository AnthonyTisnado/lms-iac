package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Curso;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CursoRepository extends JpaRepository<Curso, Long> {
    long countByEstado(Boolean estado);
}
