package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Sesion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface SesionRepository extends JpaRepository<Sesion, Long> {
    List<Sesion> findByClase_Id(Long claseId);
}
