package com.lmsiac.backend.entity;

import jakarta.persistence.*;

@Entity
@Table(name = "opciones_pregunta")
public class OpcionPregunta {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @ManyToOne(fetch = FetchType.EAGER) @JoinColumn(name = "pregunta_id", nullable = false)
    private PreguntaExamen pregunta;
    @Column(nullable = false)
    private String texto;
    @Column(name = "es_correcta")
    private Boolean esCorrecta = false;
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    public PreguntaExamen getPregunta() { return pregunta; }
    public void setPregunta(PreguntaExamen pregunta) { this.pregunta = pregunta; }
    public String getTexto() { return texto; }
    public void setTexto(String texto) { this.texto = texto; }
    public Boolean getEsCorrecta() { return esCorrecta; }
    public void setEsCorrecta(Boolean esCorrecta) { this.esCorrecta = esCorrecta; }
}
