package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.ClaseStreaming;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ClaseStreamingRepository extends JpaRepository<ClaseStreaming, Long> {
    List<ClaseStreaming> findByClase_Id(Long claseId);
    List<ClaseStreaming> findByProfesor_Id(Long profesorId);
}
