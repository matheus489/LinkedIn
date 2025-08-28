package com.biblioteca.controller;

import com.biblioteca.dto.EmprestimoDTO;
import com.biblioteca.entity.StatusEmprestimo;
import com.biblioteca.service.EmprestimoService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@RestController
@RequestMapping("/api/emprestimos")
@CrossOrigin(origins = "*")
public class EmprestimoController {

    @Autowired
    private EmprestimoService emprestimoService;

    @GetMapping
    public ResponseEntity<List<EmprestimoDTO>> listarTodos() {
        List<EmprestimoDTO> emprestimos = emprestimoService.listarTodos();
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/{id}")
    public ResponseEntity<EmprestimoDTO> buscarPorId(@PathVariable Long id) {
        Optional<EmprestimoDTO> emprestimo = emprestimoService.buscarPorId(id);
        return emprestimo.map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @GetMapping("/usuario/{usuarioId}")
    public ResponseEntity<List<EmprestimoDTO>> buscarPorUsuario(@PathVariable Long usuarioId) {
        List<EmprestimoDTO> emprestimos = emprestimoService.buscarPorUsuario(usuarioId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/livro/{livroId}")
    public ResponseEntity<List<EmprestimoDTO>> buscarPorLivro(@PathVariable Long livroId) {
        List<EmprestimoDTO> emprestimos = emprestimoService.buscarPorLivro(livroId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<EmprestimoDTO>> buscarPorStatus(@PathVariable StatusEmprestimo status) {
        List<EmprestimoDTO> emprestimos = emprestimoService.buscarPorStatus(status);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/usuario/{usuarioId}/ativos")
    public ResponseEntity<List<EmprestimoDTO>> buscarAtivosPorUsuario(@PathVariable Long usuarioId) {
        List<EmprestimoDTO> emprestimos = emprestimoService.buscarAtivosPorUsuario(usuarioId);
        return ResponseEntity.ok(emprestimos);
    }

    @GetMapping("/atrasados")
    public ResponseEntity<List<EmprestimoDTO>> buscarAtrasados() {
        List<EmprestimoDTO> emprestimos = emprestimoService.buscarAtrasados();
        return ResponseEntity.ok(emprestimos);
    }

    @PostMapping("/emprestar")
    public ResponseEntity<EmprestimoDTO> emprestar(@Valid @RequestBody EmprestimoDTO emprestimoDTO) {
        try {
            EmprestimoDTO novoEmprestimo = emprestimoService.emprestar(emprestimoDTO);
            return ResponseEntity.ok(novoEmprestimo);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/{id}/devolver")
    public ResponseEntity<EmprestimoDTO> devolver(@PathVariable Long id) {
        try {
            EmprestimoDTO emprestimoDevolvido = emprestimoService.devolver(id);
            return ResponseEntity.ok(emprestimoDevolvido);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletar(@PathVariable Long id) {
        boolean deletado = emprestimoService.deletar(id);
        return deletado ? ResponseEntity.noContent().build() : ResponseEntity.notFound().build();
    }

    @GetMapping("/usuario/{usuarioId}/contar-ativos")
    public ResponseEntity<Long> contarEmprestimosAtivosPorUsuario(@PathVariable Long usuarioId) {
        Long quantidade = emprestimoService.contarEmprestimosAtivosPorUsuario(usuarioId);
        return ResponseEntity.ok(quantidade);
    }

    @GetMapping("/livro/{livroId}/contar-ativos")
    public ResponseEntity<Long> contarEmprestimosAtivosPorLivro(@PathVariable Long livroId) {
        Long quantidade = emprestimoService.contarEmprestimosAtivosPorLivro(livroId);
        return ResponseEntity.ok(quantidade);
    }
}
