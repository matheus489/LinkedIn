package com.biblioteca.controller;

import com.biblioteca.dto.LivroDTO;
import com.biblioteca.service.LivroService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/livros")
@CrossOrigin(origins = "*")
public class LivroController {

    @Autowired
    private LivroService livroService;

    @GetMapping
    public ResponseEntity<List<LivroDTO>> listarTodos() {
        List<LivroDTO> livros = livroService.listarTodos();
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/{id}")
    public ResponseEntity<LivroDTO> buscarPorId(@PathVariable Long id) {
        Optional<LivroDTO> livro = livroService.buscarPorId(id);
        return livro.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/isbn/{isbn}")
    public ResponseEntity<LivroDTO> buscarPorIsbn(@PathVariable String isbn) {
        Optional<LivroDTO> livro = livroService.buscarPorIsbn(isbn);
        return livro.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<LivroDTO>> buscarPorTitulo(@RequestParam String titulo) {
        List<LivroDTO> livros = livroService.buscarPorTitulo(titulo);
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/autor/{autorId}")
    public ResponseEntity<List<LivroDTO>> buscarPorAutor(@PathVariable Long autorId) {
        List<LivroDTO> livros = livroService.buscarPorAutor(autorId);
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/disponiveis")
    public ResponseEntity<List<LivroDTO>> buscarDisponiveis() {
        List<LivroDTO> livros = livroService.buscarDisponiveis();
        return ResponseEntity.ok(livros);
    }

    @GetMapping("/indisponiveis")
    public ResponseEntity<List<LivroDTO>> buscarIndisponiveis() {
        List<LivroDTO> livros = livroService.buscarIndisponiveis();
        return ResponseEntity.ok(livros);
    }

    @PostMapping
    public ResponseEntity<LivroDTO> criar(@Valid @RequestBody LivroDTO livroDTO) {
        try {
            LivroDTO novoLivro = livroService.criar(livroDTO);
            return ResponseEntity.ok(novoLivro);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<LivroDTO> atualizar(@PathVariable Long id, @Valid @RequestBody LivroDTO livroDTO) {
        Optional<LivroDTO> livroAtualizado = livroService.atualizar(id, livroDTO);
        return livroAtualizado.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletado = livroService.deletar(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/emprestimos")
    public ResponseEntity<Long> contarEmprestimosAtivos(@PathVariable Long id) {
        Long quantidade = livroService.contarEmprestimosAtivos(id);
        return ResponseEntity.ok(quantidade);
    }
}
