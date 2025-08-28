package com.biblioteca.repository;

import com.biblioteca.entity.Autor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AutorRepository extends JpaRepository<Autor, Long> {

    Optional<Autor> findByNome(String nome);

    List<Autor> findByNomeContainingIgnoreCase(String nome);

    @Query("SELECT a FROM Autor a WHERE a.nome LIKE %:nome% OR a.biografia LIKE %:biografia%")
    List<Autor> findByNomeOrBiografiaContaining(@Param("nome") String nome, @Param("biografia") String biografia);

    boolean existsByNome(String nome);

    @Query("SELECT COUNT(l) FROM Autor a JOIN a.livros l WHERE a.id = :autorId")
    Long countLivrosByAutorId(@Param("autorId") Long autorId);
}
