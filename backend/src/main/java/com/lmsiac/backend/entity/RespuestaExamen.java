package com.lmsiac.backend.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "respuestas_examen")
public class RespuestaExamen {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "examen_id", nullable = false)
    private Examen examen;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "pregunta_id", nullable = false)
    private PreguntaExamen pregunta;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "alumno_id", nullable = false)
    private Usuario alumno;
    private String respuesta;
    @Column(name = "puntaje_obtenido")
    private BigDecimal puntajeObtenido;
    @Column(name = "respondido_en", insertable = false, updatable = false)
    private LocalDateTime respondidoEn;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public Examen getExamen() { return examen; }
    public void setExamen(Examen examen) { this.examen = examen; }
    public PreguntaExamen getPregunta() { return pregunta; }
    public void setPregunta(PreguntaExamen pregunta) { this.pregunta = pregunta; }
    public Usuario getAlumno() { return alumno; }
    public void setAlumno(Usuario alumno) { this.alumno = alumno; }
    public String getRespuesta() { return respuesta; }
    public void setRespuesta(String respuesta) { this.respuesta = respuesta; }
    public BigDecimal getPuntajeObtenido() { return puntajeObtenido; }
    public void setPuntajeObtenido(BigDecimal puntajeObtenido) { this.puntajeObtenido = puntajeObtenido; }
    public LocalDateTime getRespondidoEn() { return respondidoEn; }
    public void setRespondidoEn(LocalDateTime respondidoEn) { this.respondidoEn = respondidoEn; }
}
