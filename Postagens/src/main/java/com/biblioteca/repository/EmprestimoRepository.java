package com.biblioteca.repository;

import com.biblioteca.entity.Emprestimo;
import com.biblioteca.entity.StatusEmprestimo;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface EmprestimoRepository extends JpaRepository<Emprestimo, Long> {

    List<Emprestimo> findByUsuarioId(Long usuarioId);

    List<Emprestimo> findByLivroId(Long livroId);

    List<Emprestimo> findByStatus(StatusEmprestimo status);

    List<Emprestimo> findByUsuarioIdAndStatus(Long usuarioId, StatusEmprestimo status);

    List<Emprestimo> findByLivroIdAndStatus(Long livroId, StatusEmprestimo status);

    @Query("SELECT e FROM Emprestimo e WHERE e.status = 'ATIVO' AND e.dataDevolucaoPrevista < :dataAtual")
    List<Emprestimo> findEmprestimosAtrasados(@Param("dataAtual") LocalDateTime dataAtual);

    @Query("SELECT e FROM Emprestimo e WHERE e.usuario.id = :usuarioId AND e.status = 'ATIVO'")
    List<Emprestimo> findEmprestimosAtivosByUsuario(@Param("usuarioId") Long usuarioId);

    @Query("SELECT e FROM Emprestimo e WHERE e.livro.id = :livroId AND e.status = 'ATIVO'")
    List<Emprestimo> findEmprestimosAtivosByLivro(@Param("livroId") Long livroId);

    @Query("SELECT COUNT(e) FROM Emprestimo e WHERE e.usuario.id = :usuarioId AND e.status = 'ATIVO'")
    Long countEmprestimosAtivosByUsuario(@Param("usuarioId") Long usuarioId);

    @Query("SELECT COUNT(e) FROM Emprestimo e WHERE e.livro.id = :livroId AND e.status = 'ATIVO'")
    Long countEmprestimosAtivosByLivro(@Param("livroId") Long livroId);
}
