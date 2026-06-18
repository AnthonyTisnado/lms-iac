package com.lmsiac.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;

@Entity
@Table(name = "preguntas_examen")
public class PreguntaExamen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "examen_id", nullable = false)
    private Examen examen;
    @Column(nullable = false)
    private String pregunta;
    @Column(nullable = false, length = 30)
    private String tipo;
    private BigDecimal puntaje = BigDecimal.ONE;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Examen getExamen() { return examen; }
    public void setExamen(Examen examen) { this.examen = examen; }
    public String getPregunta() { return pregunta; }
    public void setPregunta(String pregunta) { this.pregunta = pregunta; }
    public String getTipo() { return tipo; }
    public void setTipo(String tipo) { this.tipo = tipo; }
    public BigDecimal getPuntaje() { return puntaje; }
    public void setPuntaje(BigDecimal puntaje) { this.puntaje = puntaje; }
}
