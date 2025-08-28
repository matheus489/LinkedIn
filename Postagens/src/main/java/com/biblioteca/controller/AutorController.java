package com.biblioteca.controller;

import com.biblioteca.dto.AutorDTO;
import com.biblioteca.service.AutorService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/autores")
@CrossOrigin(origins = "*")
public class AutorController {

    @Autowired
    private AutorService autorService;

    @GetMapping
    public ResponseEntity<List<AutorDTO>> listarTodos() {
        List<AutorDTO> autores = autorService.listarTodos();
        return ResponseEntity.ok(autores);
    }

    @GetMapping("/{id}")
    public ResponseEntity<AutorDTO> buscarPorId(@PathVariable Long id) {
        Optional<AutorDTO> autor = autorService.buscarPorId(id);
        return autor.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/buscar")
    public ResponseEntity<List<AutorDTO>> buscarPorNome(@RequestParam String nome) {
        List<AutorDTO> autores = autorService.buscarPorNome(nome);
        return ResponseEntity.ok(autores);
    }

    @PostMapping
    public ResponseEntity<AutorDTO> criar(@Valid @RequestBody AutorDTO autorDTO) {
        try {
            AutorDTO novoAutor = autorService.criar(autorDTO);
            return ResponseEntity.ok(novoAutor);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<AutorDTO> atualizar(@PathVariable Long id, @Valid @RequestBody AutorDTO autorDTO) {
        Optional<AutorDTO> autorAtualizado = autorService.atualizar(id, autorDTO);
        return autorAtualizado.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletado = autorService.deletar(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/{id}/livros")
    public ResponseEntity<Long> contarLivros(@PathVariable Long id) {
        Long quantidade = autorService.contarLivrosPorAutor(id);
        return ResponseEntity.ok(quantidade);
    }
}
