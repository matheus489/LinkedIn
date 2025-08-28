package com.biblioteca.service;

import com.biblioteca.dto.EmprestimoDTO;
import com.biblioteca.entity.Emprestimo;
import com.biblioteca.entity.Livro;
import com.biblioteca.entity.StatusEmprestimo;
import com.biblioteca.entity.Usuario;
import com.biblioteca.repository.EmprestimoRepository;
import com.biblioteca.repository.LivroRepository;
import com.biblioteca.repository.UsuarioRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class EmprestimoService {

    @Autowired
    private EmprestimoRepository emprestimoRepository;

    @Autowired
    private LivroRepository livroRepository;

    @Autowired
    private UsuarioRepository usuarioRepository;

    public List<EmprestimoDTO> listarTodos() {
        return emprestimoRepository.findAll().stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public Optional<EmprestimoDTO> buscarPorId(Long id) {
        return emprestimoRepository.findById(id)
                .map(this::converterParaDTO);
    }

    public List<EmprestimoDTO> buscarPorUsuario(Long usuarioId) {
        return emprestimoRepository.findByUsuarioId(usuarioId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<EmprestimoDTO> buscarPorLivro(Long livroId) {
        return emprestimoRepository.findByLivroId(livroId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<EmprestimoDTO> buscarPorStatus(StatusEmprestimo status) {
        return emprestimoRepository.findByStatus(status).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<EmprestimoDTO> buscarAtivosPorUsuario(Long usuarioId) {
        return emprestimoRepository.findEmprestimosAtivosByUsuario(usuarioId).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    public List<EmprestimoDTO> buscarAtrasados() {
        return emprestimoRepository.findEmprestimosAtrasados(LocalDateTime.now()).stream()
                .map(this::converterParaDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public EmprestimoDTO emprestar(EmprestimoDTO emprestimoDTO) {
        Livro livro = livroRepository.findById(emprestimoDTO.getLivroId())
                .orElseThrow(() -> new RuntimeException("Livro não encontrado"));

        Usuario usuario = usuarioRepository.findById(emprestimoDTO.getUsuarioId())
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if (!livro.isDisponivel()) {
            throw new RuntimeException("Livro não está disponível para empréstimo");
        }

        // Verificar se o usuário já tem muitos empréstimos ativos (máximo 3)
        Long emprestimosAtivos = emprestimoRepository.countEmprestimosAtivosByUsuario(usuario.getId());
        if (emprestimosAtivos >= 3) {
            throw new RuntimeException("Usuário já possui o máximo de empréstimos ativos (3)");
        }

        Emprestimo emprestimo = new Emprestimo(livro, usuario);
        emprestimo = emprestimoRepository.save(emprestimo);

        // Atualizar quantidade disponível do livro
        livro.emprestar();
        livroRepository.save(livro);

        return converterParaDTO(emprestimo);
    }

    @Transactional
    public EmprestimoDTO devolver(Long emprestimoId) {
        Emprestimo emprestimo = emprestimoRepository.findById(emprestimoId)
                .orElseThrow(() -> new RuntimeException("Empréstimo não encontrado"));

        if (!emprestimo.isAtivo()) {
            throw new RuntimeException("Empréstimo já foi devolvido");
        }

        emprestimo.devolver();
        emprestimo = emprestimoRepository.save(emprestimo);

        // Atualizar quantidade disponível do livro
        Livro livro = emprestimo.getLivro();
        livro.devolver();
        livroRepository.save(livro);

        return converterParaDTO(emprestimo);
    }

    public boolean deletar(Long id) {
        if (emprestimoRepository.existsById(id)) {
            emprestimoRepository.deleteById(id);
            return true;
        }
        return false;
    }

    public Long contarEmprestimosAtivosPorUsuario(Long usuarioId) {
        return emprestimoRepository.countEmprestimosAtivosByUsuario(usuarioId);
    }

    public Long contarEmprestimosAtivosPorLivro(Long livroId) {
        return emprestimoRepository.countEmprestimosAtivosByLivro(livroId);
    }

    private EmprestimoDTO converterParaDTO(Emprestimo emprestimo) {
        EmprestimoDTO dto = new EmprestimoDTO();
        dto.setId(emprestimo.getId());
        dto.setLivroId(emprestimo.getLivro().getId());
        dto.setUsuarioId(emprestimo.getUsuario().getId());
        dto.setLivroTitulo(emprestimo.getLivro().getTitulo());
        dto.setUsuarioNome(emprestimo.getUsuario().getNome());
        dto.setDataEmprestimo(emprestimo.getDataEmprestimo());
        dto.setDataDevolucaoPrevista(emprestimo.getDataDevolucaoPrevista());
        dto.setDataDevolucaoEfetiva(emprestimo.getDataDevolucaoEfetiva());
        dto.setStatus(emprestimo.getStatus());
        dto.setDataCriacao(emprestimo.getDataCriacao());
        dto.setDataAtualizacao(emprestimo.getDataAtualizacao());
        return dto;
    }
}
