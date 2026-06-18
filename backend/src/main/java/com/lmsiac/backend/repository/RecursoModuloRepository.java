package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.RecursoModulo;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface RecursoModuloRepository extends JpaRepository<RecursoModulo, Long> {
    List<RecursoModulo> findByModulo_IdOrderByOrdenAsc(Long moduloId);
    List<RecursoModulo> findByModulo_IdAndVisibleOrderByOrdenAsc(Long moduloId, Boolean visible);
}
