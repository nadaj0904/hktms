package com.hktms.tsys.controller;

import com.hktms.tsys.domain.AttachmentDTO;
import com.hktms.tsys.domain.UserDTO;
import com.hktms.tsys.domain.common.ApiResponse;
import com.hktms.tsys.service.AttachmentService;
import jakarta.servlet.http.HttpSession;
import org.springframework.core.io.Resource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

@RestController
public class AttachmentController {

    private final AttachmentService attachmentService;

    public AttachmentController(AttachmentService attachmentService) {
        this.attachmentService = attachmentService;
    }

    @PostMapping("/api/v1/attachment/upload")
    public ApiResponse<AttachmentDTO> upload(
            @RequestParam("file") MultipartFile file,
            @RequestParam String referenceType,
            @RequestParam Long referenceId,
            HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        Long actorId = loginUser != null ? loginUser.getUserId() : null;
        try {
            AttachmentDTO result = attachmentService.upload(file, referenceType, referenceId, actorId);
            return ApiResponse.success("업로드되었습니다.", result);
        } catch (IllegalArgumentException e) {
            return ApiResponse.error(e.getMessage());
        } catch (Exception e) {
            return ApiResponse.error("파일 업로드 중 오류가 발생했습니다.");
        }
    }

    @GetMapping("/api/v1/attachment/{attachmentId}/download")
    public ResponseEntity<Resource> download(@PathVariable Long attachmentId) {
        try {
            AttachmentDTO info = attachmentService.findById(attachmentId);
            Resource resource = attachmentService.download(attachmentId);
            String encodedName = URLEncoder.encode(info.getOriginalFilename(), StandardCharsets.UTF_8)
                    .replace("+", "%20");
            return ResponseEntity.ok()
                    .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + encodedName)
                    .contentType(MediaType.APPLICATION_OCTET_STREAM)
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping("/api/v1/attachment/{attachmentId}")
    public ApiResponse<Void> delete(@PathVariable Long attachmentId, HttpSession session) {
        UserDTO loginUser = (UserDTO) session.getAttribute("loginUser");
        Long actorId = loginUser != null ? loginUser.getUserId() : null;
        attachmentService.delete(attachmentId, actorId);
        return ApiResponse.success("삭제되었습니다.", null);
    }
}
