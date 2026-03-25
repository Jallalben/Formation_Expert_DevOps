package com.openclassrooms.etudiant.dto;

import lombok.Data;

import java.time.LocalDateTime;

@Data
public class EtudiantResponseDTO {

    private Long id;
    private String firstName;
    private String lastName;
    private String email;
    private String studentNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
