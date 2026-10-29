package com.lmsiac.backend.controller;

import static org.junit.jupiter.api.Assertions.assertEquals;

import org.junit.jupiter.api.Test;

class HealthControllerTest {
    @Test
    void debeIndicarQueElServicioEstaActivo() {
        HealthController controller = new HealthController();

        assertEquals("activo", controller.health().get("estado"));
    }
}
