package com.openclassrooms.etudiant.service;

import com.openclassrooms.etudiant.entities.Etudiant;
import com.openclassrooms.etudiant.repository.EtudiantRepository;
import jakarta.persistence.EntityNotFoundException;
import jakarta.transaction.Transactional;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.Assert;

import java.util.List;

@Slf4j
@Service
@Transactional
@RequiredArgsConstructor
public class EtudiantService {

    private final EtudiantRepository etudiantRepository;

    public Etudiant create(Etudiant etudiant) {
        Assert.notNull(etudiant, "Etudiant must not be null");
        if (etudiantRepository.existsByEmail(etudiant.getEmail())) {
            throw new IllegalArgumentException("Un étudiant avec l'email " + etudiant.getEmail() + " existe déjà");
        }
        log.info("Creating new etudiant");
        return etudiantRepository.save(etudiant);
    }

    public List<Etudiant> findAll() {
        return etudiantRepository.findAll();
    }

    public Etudiant findById(Long id) {
        Assert.notNull(id, "Id must not be null");
        return etudiantRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("Etudiant introuvable avec l'id : " + id));
    }

    public Etudiant update(Long id, Etudiant updated) {
        Assert.notNull(updated, "Etudiant must not be null");
        Etudiant existing = findById(id);
        if (!existing.getEmail().equals(updated.getEmail()) && etudiantRepository.existsByEmail(updated.getEmail())) {
            throw new IllegalArgumentException("Un étudiant avec l'email " + updated.getEmail() + " existe déjà");
        }
        existing.setFirstName(updated.getFirstName());
        existing.setLastName(updated.getLastName());
        existing.setEmail(updated.getEmail());
        existing.setStudentNumber(updated.getStudentNumber());
        log.info("Updating etudiant with id {}", id);
        return etudiantRepository.save(existing);
    }

    public void delete(Long id) {
        Etudiant etudiant = findById(id);
        log.info("Deleting etudiant with id {}", id);
        etudiantRepository.delete(etudiant);
    }
}
