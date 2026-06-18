package com.lmsiac.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "entregas_tareas", uniqueConstraints = @UniqueConstraint(columnNames = {"tarea_id", "alumno_id"}))
public class EntregaTarea {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "tarea_id", nullable = false)
    private Tarea tarea;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "alumno_id", nullable = false)
    private Usuario alumno;
    @Column(name = "archivo_url")
    private String archivoUrl;
    private String comentario;
    private BigDecimal nota;
    private String estado = "ENTREGADO";
    @Column(name = "entregado_en", insertable = false, updatable = false)
    private LocalDateTime entregadoEn;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Tarea getTarea() { return tarea; }
    public void setTarea(Tarea tarea) { this.tarea = tarea; }
    public Usuario getAlumno() { return alumno; }
    public void setAlumno(Usuario alumno) { this.alumno = alumno; }
    public String getArchivoUrl() { return archivoUrl; }
    public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }
    public String getComentario() { return comentario; }
    public void setComentario(String comentario) { this.comentario = comentario; }
    public BigDecimal getNota() { return nota; }
    public void setNota(BigDecimal nota) { this.nota = nota; }
    public String getEstado() { return estado; }
    public void setEstado(String estado) { this.estado = estado; }
    public LocalDateTime getEntregadoEn() { return entregadoEn; }
    public void setEntregadoEn(LocalDateTime entregadoEn) { this.entregadoEn = entregadoEn; }
}
