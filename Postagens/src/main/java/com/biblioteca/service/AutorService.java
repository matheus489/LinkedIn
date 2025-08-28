package com.biblioteca.service;

import com.biblioteca.dto.AutorDTO;
import com.biblioteca.entity.Autor;
import com.biblioteca.repository.AutorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class AutorService {

    @Autowired
    private AutorRepository autorRepository;

    public List<AutorDTO> listarTodos() {
        return autorRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public Optional<AutorDTO> buscarPorId(Long id) {
        return autorRepository.findById(id)
                .map(this::converterParaDTO);
    }

    public List<AutorDTO> buscarPorNome(String nome) {
        return autorRepository.findByNomeContainingIgnoreCase(nome).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public AutorDTO criar(AutorDTO autorDTO) {
        Autor autor = converterParaEntidade(autorDTO);
        autor = autorRepository.save(autor);
        return converterParaDTO(autor);
    }

    public Optional<AutorDTO> atualizar(Long id, AutorDTO autorDTO) {
        return autorRepository.findById(id)
                .map(autor -> {
                    autor.setNome(autorDTO.getNome());
                    autor.setBiografia(autorDTO.getBiografia());
                    autor.setDataNascimento(autorDTO.getDataNascimento());
                    autor = autorRepository.save(autor);
                    return converterParaDTO(autor);
                });
    }

    public boolean deletar(Long id) {
        if (autorRepository.existsById(id)) {
            autorRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean existePorId(Long id) {
        return autorRepository.existsById(id);
    }

    public boolean existePorNome(String nome) {
        return autorRepository.existsByNome(nome);
    }

    public Long contarLivrosPorAutor(Long autorId) {
        return autorRepository.countLivrosByAutorId(autorId);
    }

    private AutorDTO converterParaDTO(Autor autor) {
        AutorDTO dto = new AutorDTO();
        dto.setId(autor.getId());
        dto.setNome(autor.getNome());
        dto.setBiografia(autor.getBiografia());
        dto.setDataNascimento(autor.getDataNascimento());
        dto.setDataCriacao(autor.getDataCriacao());
        dto.setDataAtualizacao(autor.getDataAtualizacao());
        return dto;
    }

    private Autor converterParaEntidade(AutorDTO dto) {
        Autor autor = new Autor();
        autor.setNome(dto.getNome());
        autor.setBiografia(dto.getBiografia());
        autor.setDataNascimento(dto.getDataNascimento());
        return autor;
    }
}
