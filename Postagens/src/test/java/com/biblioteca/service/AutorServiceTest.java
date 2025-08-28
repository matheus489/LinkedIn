package com.biblioteca.service;

import com.biblioteca.dto.AutorDTO;
import com.biblioteca.entity.Autor;
import com.biblioteca.repository.AutorRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AutorServiceTest {

    @Mock
    private AutorRepository autorRepository;

    @InjectMocks
    private AutorService autorService;

    private Autor autor;
    private AutorDTO autorDTO;

    @BeforeEach
    void setUp() {
        autor = new Autor();
        autor.setId(1L);
        autor.setNome("Machado de Assis");
        autor.setBiografia("Escritor brasileiro");
        autor.setDataCriacao(LocalDateTime.now());

        autorDTO = new AutorDTO();
        autorDTO.setNome("Machado de Assis");
        autorDTO.setBiografia("Escritor brasileiro");
    }

    @Test
    void listarTodos_DeveRetornarListaDeAutores() {
        // Given
        List<Autor> autores = Arrays.asList(autor);
        when(autorRepository.findAll()).thenReturn(autores);

        // When
        List<AutorDTO> resultado = autorService.listarTodos();

        // Then
        assertNotNull(resultado);
        assertEquals(1, resultado.size());
        assertEquals(autor.getNome(), resultado.get(0).getNome());
        verify(autorRepository).findAll();
    }

    @Test
    void buscarPorId_QuandoAutorExiste_DeveRetornarAutor() {
        // Given
        when(autorRepository.findById(1L)).thenReturn(Optional.of(autor));

        // When
        Optional<AutorDTO> resultado = autorService.buscarPorId(1L);

        // Then
        assertTrue(resultado.isPresent());
        assertEquals(autor.getNome(), resultado.get().getNome());
        verify(autorRepository).findById(1L);
    }

    @Test
    void buscarPorId_QuandoAutorNaoExiste_DeveRetornarVazio() {
        // Given
        when(autorRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<AutorDTO> resultado = autorService.buscarPorId(1L);

        // Then
        assertFalse(resultado.isPresent());
        verify(autorRepository).findById(1L);
    }

    @Test
    void criar_DeveSalvarEAutor() {
        // Given
        when(autorRepository.save(any(Autor.class))).thenReturn(autor);

        // When
        AutorDTO resultado = autorService.criar(autorDTO);

        // Then
        assertNotNull(resultado);
        assertEquals(autor.getNome(), resultado.getNome());
        verify(autorRepository).save(any(Autor.class));
    }

    @Test
    void atualizar_QuandoAutorExiste_DeveAtualizarEAutor() {
        // Given
        when(autorRepository.findById(1L)).thenReturn(Optional.of(autor));
        when(autorRepository.save(any(Autor.class))).thenReturn(autor);

        // When
        Optional<AutorDTO> resultado = autorService.atualizar(1L, autorDTO);

        // Then
        assertTrue(resultado.isPresent());
        assertEquals(autor.getNome(), resultado.get().getNome());
        verify(autorRepository).findById(1L);
        verify(autorRepository).save(any(Autor.class));
    }

    @Test
    void atualizar_QuandoAutorNaoExiste_DeveRetornarVazio() {
        // Given
        when(autorRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<AutorDTO> resultado = autorService.atualizar(1L, autorDTO);

        // Then
        assertFalse(resultado.isPresent());
        verify(autorRepository).findById(1L);
        verify(autorRepository, never()).save(any(Autor.class));
    }

    @Test
    void deletar_QuandoAutorExiste_DeveDeletarERetornarTrue() {
        // Given
        when(autorRepository.existsById(1L)).thenReturn(true);

        // When
        boolean resultado = autorService.deletar(1L);

        // Then
        assertTrue(resultado);
        verify(autorRepository).existsById(1L);
        verify(autorRepository).deleteById(1L);
    }

    @Test
    void deletar_QuandoAutorNaoExiste_DeveRetornarFalse() {
        // Given
        when(autorRepository.existsById(1L)).thenReturn(false);

        // When
        boolean resultado = autorService.deletar(1L);

        // Then
        assertFalse(resultado);
        verify(autorRepository).existsById(1L);
        verify(autorRepository, never()).deleteById(1L);
    }

    @Test
    void existePorId_DeveRetornarResultadoDoRepository() {
        // Given
        when(autorRepository.existsById(1L)).thenReturn(true);

        // When
        boolean resultado = autorService.existePorId(1L);

        // Then
        assertTrue(resultado);
        verify(autorRepository).existsById(1L);
    }
}
