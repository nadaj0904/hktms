package com.hktms.tsys.service;

import com.hktms.tsys.domain.AttachmentDTO;
import com.hktms.tsys.repository.AttachmentMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.UUID;

@Service
public class AttachmentService {

    private final AttachmentMapper attachmentMapper;

    @Value("${hktms.upload.path}")
    private String uploadPath;

    private static final long MAX_FILE_SIZE = 50 * 1024 * 1024L;
    private static final java.util.Set<String> ALLOWED_EXTENSIONS =
            java.util.Set.of("jpg", "jpeg", "png", "pdf", "xlsx", "docx");

    public AttachmentService(AttachmentMapper attachmentMapper) {
        this.attachmentMapper = attachmentMapper;
    }

    @Transactional
    public AttachmentDTO upload(MultipartFile file, String referenceType, Long referenceId, Long actorId) throws IOException {
        if (file.isEmpty()) throw new IllegalArgumentException("파일이 비어 있습니다.");
        if (file.getSize() > MAX_FILE_SIZE) throw new IllegalArgumentException("파일 크기는 50MB를 초과할 수 없습니다.");

        String originalFilename = file.getOriginalFilename();
        String ext = getExtension(originalFilename).toLowerCase();
        if (!ALLOWED_EXTENSIONS.contains(ext)) {
            throw new IllegalArgumentException("허용되지 않는 파일 형식입니다. (" + ext + ")");
        }

        String storedFilename = UUID.randomUUID() + "." + ext;
        Path dir = Paths.get(uploadPath, referenceType.toLowerCase());
        Files.createDirectories(dir);
        Path target = dir.resolve(storedFilename);
        file.transferTo(target.toFile());

        AttachmentDTO dto = new AttachmentDTO();
        dto.setReferenceType(referenceType);
        dto.setReferenceId(referenceId);
        dto.setOriginalFilename(originalFilename);
        dto.setStoredFilename(storedFilename);
        dto.setFilePath(target.toString());
        dto.setFileSize(file.getSize());
        dto.setFileType(file.getContentType());
        attachmentMapper.insert(dto);
        return dto;
    }

    public Resource download(Long attachmentId) throws IOException {
        AttachmentDTO attachment = attachmentMapper.findById(attachmentId);
        if (attachment == null) throw new IllegalArgumentException("첨부파일을 찾을 수 없습니다.");
        Path path = Paths.get(attachment.getFilePath());
        Resource resource = new UrlResource(path.toUri());
        if (!resource.exists()) throw new IllegalArgumentException("파일이 존재하지 않습니다.");
        return resource;
    }

    public AttachmentDTO findById(Long attachmentId) {
        return attachmentMapper.findById(attachmentId);
    }

    @Transactional
    public void delete(Long attachmentId, Long actorId) {
        AttachmentDTO param = new AttachmentDTO();
        param.setAttachmentId(attachmentId);
        attachmentMapper.softDelete(param);
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "";
        return filename.substring(filename.lastIndexOf('.') + 1);
    }
}
