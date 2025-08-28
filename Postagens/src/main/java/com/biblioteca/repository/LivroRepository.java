package com.biblioteca.repository;

import com.biblioteca.entity.Livro;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LivroRepository extends JpaRepository<Livro, Long> {

    Optional<Livro> findByIsbn(String isbn);

    List<Livro> findByTituloContainingIgnoreCase(String titulo);

    List<Livro> findByAutorId(Long autorId);

    List<Livro> findByAutorNomeContainingIgnoreCase(String autorNome);

    @Query("SELECT l FROM Livro l WHERE l.quantidadeDisponivel > 0")
    List<Livro> findLivrosDisponiveis();

    @Query("SELECT l FROM Livro l WHERE l.quantidadeDisponivel = 0")
    List<Livro> findLivrosIndisponiveis();

    @Query("SELECT l FROM Livro l WHERE l.titulo LIKE %:titulo% OR l.sinopse LIKE %:sinopse%")
    List<Livro> findByTituloOrSinopseContaining(@Param("titulo") String titulo, @Param("sinopse") String sinopse);

    boolean existsByIsbn(String isbn);

    @Query("SELECT COUNT(e) FROM Livro l JOIN l.emprestimos e WHERE l.id = :livroId AND e.status = 'ATIVO'")
    Long countEmprestimosAtivosByLivroId(@Param("livroId") Long livroId);
}
