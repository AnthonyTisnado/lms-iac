package com.lmsiac.backend.service;

import com.lmsiac.backend.dto.Dto.FileUploadResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.http.HttpStatus;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;

import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Locale;
import java.util.Set;
import java.util.UUID;

@Service
public class StorageService {
    private static final Logger log = LoggerFactory.getLogger(StorageService.class);
    private static final long MAX_BYTES = 10L * 1024L * 1024L;
    private static final Set<String> ALLOWED = Set.of("pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "jpg", "jpeg", "png", "mp4");
    private static final Set<String> DANGEROUS = Set.of("exe", "bat", "cmd", "js", "sh");

    private final String supabaseUrl;
    private final String serviceRoleKey;
    private final String bucket;
    private final RestClient restClient;

    public StorageService(
        @Value("${supabase.url:}") String supabaseUrl,
        @Value("${supabase.service-role-key:}") String serviceRoleKey,
        @Value("${supabase.storage.bucket:lmsiac}") String bucket,
        RestClient.Builder builder
    ) {
        this.supabaseUrl = trimTrailingSlash(supabaseUrl);
        this.serviceRoleKey = serviceRoleKey;
        this.bucket = bucket;
        this.restClient = builder.build();
    }

    public FileUploadResponse upload(MultipartFile file, String folder) {
        validateConfig();
        validateFile(file);
        String safeFolder = validateFolder(folder);
        String extension = extension(file.getOriginalFilename());
        String generatedName = Instant.now().toEpochMilli() + "-" + UUID.randomUUID() + "." + extension;
        String path = safeFolder + "/" + generatedName;
        log.info("Supabase Storage upload start: supabaseUrl={}, bucket={}, folder={}, generatedFileName={}",
            supabaseUrl, bucket, safeFolder, generatedName);
        try {
            ResponseEntity<String> response = restClient.post()
                .uri(supabaseUrl + "/storage/v1/object/" + bucket + "/" + encodePath(path))
                .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
                .header("apikey", serviceRoleKey)
                .header("x-upsert", "true")
                .contentType(MediaType.parseMediaType(contentType(file, extension)))
                .body(file.getBytes())
                .retrieve()
                .toEntity(String.class);
            log.info("Supabase Storage upload response: status={}, body={}",
                response.getStatusCode().value(), safeBody(response.getBody()));
            return new FileUploadResponse(publicUrl(path), path);
        } catch (IOException ex) {
            log.warn("Supabase Storage upload failed before request: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "No se pudo leer el archivo");
        } catch (RestClientResponseException ex) {
            log.warn("Supabase Storage upload response error: status={}, body={}",
                ex.getStatusCode().value(), safeBody(ex.getResponseBodyAsString()));
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY,
                "Error al subir archivo a Supabase Storage: status " + ex.getStatusCode().value());
        } catch (RuntimeException ex) {
            log.warn("Supabase Storage upload unexpected error: {}", ex.getMessage());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Error al subir archivo a Supabase Storage");
        }
    }

    public void delete(String path) {
        validateConfig();
        restClient.delete()
            .uri(supabaseUrl + "/storage/v1/object/" + bucket + "/" + encodePath(path))
            .header(HttpHeaders.AUTHORIZATION, "Bearer " + serviceRoleKey)
            .header("apikey", serviceRoleKey)
            .retrieve()
            .toBodilessEntity();
    }

    private void validateConfig() {
        if (!StringUtils.hasText(supabaseUrl)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta configurar SUPABASE_URL");
        }
        if (!StringUtils.hasText(serviceRoleKey)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta configurar SUPABASE_SERVICE_ROLE_KEY");
        }
        if (!StringUtils.hasText(bucket)) {
            throw new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR, "Falta configurar SUPABASE_STORAGE_BUCKET");
        }
    }

    private void validateFile(MultipartFile file) {
        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo requerido");
        }
        if (file.getSize() > MAX_BYTES) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo demasiado grande");
        }
        String extension = extension(file.getOriginalFilename());
        if (DANGEROUS.contains(extension) || !ALLOWED.contains(extension)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Tipo de archivo no permitido");
        }
    }

    private String validateFolder(String folder) {
        String value = folder == null ? "" : folder.trim().toLowerCase(Locale.ROOT);
        if (!Set.of("sesiones", "tareas", "entregas", "recursos").contains(value)) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Folder no permitido");
        }
        return value;
    }

    private String extension(String filename) {
        String clean = filename == null ? "" : filename.toLowerCase(Locale.ROOT);
        int index = clean.lastIndexOf('.');
        if (index < 0 || index == clean.length() - 1) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Archivo sin extension valida");
        }
        return clean.substring(index + 1);
    }

    private String contentType(MultipartFile file, String extension) {
        if (StringUtils.hasText(file.getContentType())) return file.getContentType();
        return switch (extension) {
            case "jpg", "jpeg" -> "image/jpeg";
            case "png" -> "image/png";
            case "mp4" -> "video/mp4";
            case "pdf" -> "application/pdf";
            default -> "application/octet-stream";
        };
    }

    private String publicUrl(String path) {
        return supabaseUrl + "/storage/v1/object/public/" + bucket + "/" + encodePath(path);
    }

    private String encodePath(String path) {
        return URLEncoder.encode(path, StandardCharsets.UTF_8).replace("+", "%20").replace("%2F", "/");
    }

    private String trimTrailingSlash(String value) {
        if (value == null) return "";
        return value.endsWith("/") ? value.substring(0, value.length() - 1) : value;
    }

    private String safeBody(String body) {
        if (body == null || body.isBlank()) return "";
        return body.length() > 2000 ? body.substring(0, 2000) + "...[truncated]" : body;
    }
}
