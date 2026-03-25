package com.openclassrooms.etudiant.mapper;

import com.openclassrooms.etudiant.dto.EtudiantDTO;
import com.openclassrooms.etudiant.dto.EtudiantResponseDTO;
import com.openclassrooms.etudiant.entities.Etudiant;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring",
        unmappedTargetPolicy = ReportingPolicy.ERROR)
public interface EtudiantDtoMapper {

    @Mapping(target = "id", ignore = true)
    @Mapping(target = "createdAt", ignore = true)
    @Mapping(target = "updatedAt", ignore = true)
    Etudiant toEntity(EtudiantDTO etudiantDTO);

    EtudiantResponseDTO toResponseDTO(Etudiant etudiant);
}
