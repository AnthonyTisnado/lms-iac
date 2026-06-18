package com.lmsiac.backend.controller;

import com.lmsiac.backend.dto.Dto.FileUploadResponse;
import com.lmsiac.backend.entity.Usuario;
import com.lmsiac.backend.service.StorageService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/files")
public class FileController {
    private static final Logger log = LoggerFactory.getLogger(FileController.class);
    private final StorageService storageService;

    public FileController(StorageService storageService) {
        this.storageService = storageService;
    }

    @PostMapping("/upload")
    public FileUploadResponse upload(@RequestParam("file") MultipartFile file, @RequestParam("folder") String folder, @AuthenticationPrincipal Usuario usuario) {
        String rol = usuario.getRol().getNombre();
        String normalizedFolder = folder == null ? "" : folder.trim().toLowerCase();
        log.info("File upload request: userId={}, role={}, folder={}, originalFilename={}, size={}",
            usuario.getId(), rol, normalizedFolder, file == null ? null : file.getOriginalFilename(), file == null ? 0 : file.getSize());
        boolean allowed = "ADMINISTRADOR".equals(rol)
            || ("PROFESOR".equals(rol) && ("sesiones".equals(normalizedFolder) || "tareas".equals(normalizedFolder) || "recursos".equals(normalizedFolder)))
            || ("ALUMNO".equals(rol) && "entregas".equals(normalizedFolder));
        if (!allowed) {
            log.warn("File upload forbidden: userId={}, role={}, folder={}", usuario.getId(), rol, normalizedFolder);
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "No tienes permiso para esta accion");
        }
        return storageService.upload(file, normalizedFolder);
    }
}
