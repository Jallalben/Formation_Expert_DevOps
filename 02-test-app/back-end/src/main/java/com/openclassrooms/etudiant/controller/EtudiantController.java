package com.openclassrooms.etudiant.controller;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.dto.EtudiantResponseDTO;
import com.openclassrooms.etudiant.mapper.EtudiantDtoMapper;
import com.openclassrooms.etudiant.service.EtudiantService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/etudiants")
@RequiredArgsConstructor
public class EtudiantController {

    private final EtudiantService etudiantService;
    private final EtudiantDtoMapper etudiantDtoMapper;

    @PostMapping
    public ResponseEntity<EtudiantResponseDTO> create(@Valid @RequestBody EtudiantDTO etudiantDTO) {
        EtudiantResponseDTO created = etudiantDtoMapper.toResponseDTO(
                etudiantService.create(etudiantDtoMapper.toEntity(etudiantDTO))
        );
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    public ResponseEntity<List<EtudiantResponseDTO>> findAll() {
        List<EtudiantResponseDTO> list = etudiantService.findAll().stream()
                .map(etudiantDtoMapper::toResponseDTO)
                .toList();
        return ResponseEntity.ok(list);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EtudiantResponseDTO> findById(@PathVariable Long id) {
        return ResponseEntity.ok(
                etudiantDtoMapper.toResponseDTO(etudiantService.findById(id))
        );
    }

    @PutMapping("/{id}")
    public ResponseEntity<EtudiantResponseDTO> update(@PathVariable Long id,
                                                      @Valid @RequestBody EtudiantDTO etudiantDTO) {
        EtudiantResponseDTO updated = etudiantDtoMapper.toResponseDTO(
                etudiantService.update(id, etudiantDtoMapper.toEntity(etudiantDTO))
        );
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        etudiantService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
