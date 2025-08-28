package com.biblioteca.service;

import com.biblioteca.dto.LivroDTO;
import com.biblioteca.entity.Autor;
import com.biblioteca.entity.Livro;
import com.biblioteca.repository.AutorRepository;
import com.biblioteca.repository.LivroRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class LivroService {

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private AutorRepository autorRepository;

    public List<LivroDTO> listarTodos() {
        return livroRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public Optional<LivroDTO> buscarPorId(Long id) {
        return livroRepository.findById(id)
                .map(this::converterParaDTO);
    }

    public Optional<LivroDTO> buscarPorIsbn(String isbn) {
        return livroRepository.findByIsbn(isbn)
                .map(this::converterParaDTO);
    }

    public List<LivroDTO> buscarPorTitulo(String titulo) {
        return livroRepository.findByTituloContainingIgnoreCase(titulo).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<LivroDTO> buscarPorAutor(Long autorId) {
        return livroRepository.findByAutorId(autorId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<LivroDTO> buscarDisponiveis() {
        return livroRepository.findLivrosDisponiveis().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<LivroDTO> buscarIndisponiveis() {
        return livroRepository.findLivrosIndisponiveis().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public LivroDTO criar(LivroDTO livroDTO) {
        Autor autor = autorRepository.findById(livroDTO.getAutorId())
                .orElseThrow(() -> new RuntimeException("Autor não encontrado"));

        Livro livro = converterParaEntidade(livroDTO);
        livro.setAutor(autor);
        livro = livroRepository.save(livro);
        return converterParaDTO(livro);
    }

    public Optional<LivroDTO> atualizar(Long id, LivroDTO livroDTO) {
        return livroRepository.findById(id)
                .map(livro -> {
                    livro.setTitulo(livroDTO.getTitulo());
                    livro.setSinopse(livroDTO.getSinopse());
                    livro.setIsbn(livroDTO.getIsbn());
                    livro.setAnoPublicacao(livroDTO.getAnoPublicacao());
                    livro.setQuantidade(livroDTO.getQuantidade());

                    if (livroDTO.getAutorId() != null && !livroDTO.getAutorId().equals(livro.getAutor().getId())) {
                        Autor autor = autorRepository.findById(livroDTO.getAutorId())
                                .orElseThrow(() -> new RuntimeException("Autor não encontrado"));
                        livro.setAutor(autor);
                    }

                    livro = livroRepository.save(livro);
                    return converterParaDTO(livro);
                });
    }

    public boolean deletar(Long id) {
        if (livroRepository.existsById(id)) {
            livroRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public boolean existePorId(Long id) {
        return livroRepository.existsById(id);
    }

    public boolean existePorIsbn(String isbn) {
        return livroRepository.existsByIsbn(isbn);
    }

    public Long contarEmprestimosAtivos(Long livroId) {
        return livroRepository.countEmprestimosAtivosByLivroId(livroId);
    }

    private LivroDTO converterParaDTO(Livro livro) {
        LivroDTO dto = new LivroDTO();
        dto.setId(livro.getId());
        dto.setTitulo(livro.getTitulo());
        dto.setSinopse(livro.getSinopse());
        dto.setIsbn(livro.getIsbn());
        dto.setAnoPublicacao(livro.getAnoPublicacao());
        dto.setQuantidade(livro.getQuantidade());
        dto.setQuantidadeDisponivel(livro.getQuantidadeDisponivel());
        dto.setAutorId(livro.getAutor().getId());
        dto.setAutorNome(livro.getAutor().getNome());
        dto.setDataCriacao(livro.getDataCriacao());
        dto.setDataAtualizacao(livro.getDataAtualizacao());
        return dto;
    }

    private Livro converterParaEntidade(LivroDTO dto) {
        Livro livro = new Livro();
        livro.setTitulo(dto.getTitulo());
        livro.setSinopse(dto.getSinopse());
        livro.setIsbn(dto.getIsbn());
        livro.setAnoPublicacao(dto.getAnoPublicacao());
        livro.setQuantidade(dto.getQuantidade());
        livro.setQuantidadeDisponivel(dto.getQuantidade());
        return livro;
    }
}
