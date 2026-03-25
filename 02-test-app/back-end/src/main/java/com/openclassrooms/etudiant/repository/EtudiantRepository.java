package com.openclassrooms.etudiant.repository;

import com.openclassrooms.etudiant.entities.Etudiant;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface EtudiantRepository extends JpaRepository<Etudiant, Long> {
    boolean existsByEmail(String email);
}
