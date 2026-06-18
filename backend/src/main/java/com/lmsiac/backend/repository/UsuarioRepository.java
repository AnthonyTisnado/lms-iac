package com.lmsiac.backend.repository;

import com.lmsiac.backend.entity.Usuario;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {
    Optional<Usuario> findByEmail(String email);
    boolean existsByEmail(String email);
    boolean existsByRol_Nombre(String nombre);
    long countByRol_Nombre(String nombre);
    long countByEstado(Boolean estado);
    List<Usuario> findByRol_Nombre(String nombre);
}
