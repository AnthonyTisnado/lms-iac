package com.lmsiac.backend.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "recursos_modulo")
public class RecursoModulo {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "modulo_id", nullable = false)
    private ModuloClase modulo;
    @Column(nullable = false, length = 200)
    private String titulo;
    private String descripcion;
    @Column(nullable = false, length = 50)
    private String tipo;
    @Column(name = "archivo_url")
    private String archivoUrl;
    @Column(name = "enlace_url")
    private String enlaceUrl;
    private Integer orden = 1;
    private Boolean visible = true;
    @Column(name = "creado_en", insertable = false, updatable = false)
    private LocalDateTime creadoEn;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public ModuloClase getModulo() { return modulo; }
    public void setModulo(ModuloClase modulo) { this.modulo = modulo; }
    public String getTitulo() { return titulo; }
    public void setTitulo(String titulo) { this.titulo = titulo; }
    public String getDescripcion() { return descripcion; }
    public void setDescripcion(String descripcion) { this.descripcion = descripcion; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public String getArchivoUrl() { return archivoUrl; }
    public void setArchivoUrl(String archivoUrl) { this.archivoUrl = archivoUrl; }
    public String getEnlaceUrl() { return enlaceUrl; }
    public void setEnlaceUrl(String enlaceUrl) { this.enlaceUrl = enlaceUrl; }
    public Integer getOrden() { return orden; }
    public void setOrden(Integer orden) { this.orden = orden; }
    public Boolean getVisible() { return visible; }
    public void setVisible(Boolean visible) { this.visible = visible; }
    public LocalDateTime getCreadoEn() { return creadoEn; }
    public void setCreadoEn(LocalDateTime creadoEn) { this.creadoEn = creadoEn; }
}
