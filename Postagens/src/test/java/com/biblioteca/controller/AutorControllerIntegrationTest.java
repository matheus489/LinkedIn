package com.biblioteca.controller;

import com.biblioteca.dto.AutorDTO;
import com.biblioteca.entity.Autor;
import com.biblioteca.repository.AutorRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.context.WebApplicationContext;

import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.ANY)
@ActiveProfiles("test")
@Transactional
class AutorControllerIntegrationTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private AutorRepository autorRepository;

    @Autowired
    private ObjectMapper objectMapper;

    private MockMvc mockMvc;

    @BeforeEach
    void setUp() {
        mockMvc = MockMvcBuilders
                .webAppContextSetup(context)
                .apply(springSecurity())
                .build();
    }

    @Test
    @WithMockUser
    void listarTodos_DeveRetornarListaDeAutores() throws Exception {
        // Given
        Autor autor = new Autor();
        autor.setNome("Machado de Assis");
        autor.setBiografia("Escritor brasileiro");
        autorRepository.save(autor);

        // When & Then
        mockMvc.perform(get("/api/autores"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].nome").value("Machado de Assis"))
                .andExpect(jsonPath("$[0].biografia").value("Escritor brasileiro"));
    }

    @Test
    @WithMockUser
    void buscarPorId_QuandoAutorExiste_DeveRetornarAutor() throws Exception {
        // Given
        Autor autor = new Autor();
        autor.setNome("Machado de Assis");
        autor.setBiografia("Escritor brasileiro");
        autor = autorRepository.save(autor);

        // When & Then
        mockMvc.perform(get("/api/autores/{id}", autor.getId()))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nome").value("Machado de Assis"))
                .andExpect(jsonPath("$.biografia").value("Escritor brasileiro"));
    }

    @Test
    @WithMockUser
    void buscarPorId_QuandoAutorNaoExiste_DeveRetornar404() throws Exception {
        // When & Then
        mockMvc.perform(get("/api/autores/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void criar_DeveCriarNovoAutor() throws Exception {
        // Given
        AutorDTO autorDTO = new AutorDTO();
        autorDTO.setNome("Clarice Lispector");
        autorDTO.setBiografia("Escritora brasileira");

        // When & Then
        mockMvc.perform(post("/api/autores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(autorDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nome").value("Clarice Lispector"))
                .andExpect(jsonPath("$.biografia").value("Escritora brasileira"));
    }

    @Test
    @WithMockUser
    void criar_QuandoNomeVazio_DeveRetornar400() throws Exception {
        // Given
        AutorDTO autorDTO = new AutorDTO();
        autorDTO.setNome("");
        autorDTO.setBiografia("Escritora brasileira");

        // When & Then
        mockMvc.perform(post("/api/autores")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(autorDTO)))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser
    void atualizar_QuandoAutorExiste_DeveAtualizarAutor() throws Exception {
        // Given
        Autor autor = new Autor();
        autor.setNome("Machado de Assis");
        autor.setBiografia("Escritor brasileiro");
        autor = autorRepository.save(autor);

        AutorDTO autorDTO = new AutorDTO();
        autorDTO.setNome("Machado de Assis Atualizado");
        autorDTO.setBiografia("Escritor brasileiro atualizado");

        // When & Then
        mockMvc.perform(put("/api/autores/{id}", autor.getId())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(autorDTO)))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$.nome").value("Machado de Assis Atualizado"))
                .andExpect(jsonPath("$.biografia").value("Escritor brasileiro atualizado"));
    }

    @Test
    @WithMockUser
    void atualizar_QuandoAutorNaoExiste_DeveRetornar404() throws Exception {
        // Given
        AutorDTO autorDTO = new AutorDTO();
        autorDTO.setNome("Autor Inexistente");
        autorDTO.setBiografia("Biografia");

        // When & Then
        mockMvc.perform(put("/api/autores/999")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(objectMapper.writeValueAsString(autorDTO)))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void deletar_QuandoAutorExiste_DeveDeletarAutor() throws Exception {
        // Given
        Autor autor = new Autor();
        autor.setNome("Autor para Deletar");
        autor.setBiografia("Biografia");
        autor = autorRepository.save(autor);

        // When & Then
        mockMvc.perform(delete("/api/autores/{id}", autor.getId()))
                .andExpect(status().isNoContent());

        // Verificar se foi realmente deletado
        assertFalse(autorRepository.existsById(autor.getId()));
    }

    @Test
    @WithMockUser
    void deletar_QuandoAutorNaoExiste_DeveRetornar404() throws Exception {
        // When & Then
        mockMvc.perform(delete("/api/autores/999"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser
    void buscarPorNome_DeveRetornarAutoresComNomeSimilar() throws Exception {
        // Given
        Autor autor1 = new Autor();
        autor1.setNome("Machado de Assis");
        autor1.setBiografia("Escritor brasileiro");
        autorRepository.save(autor1);

        Autor autor2 = new Autor();
        autor2.setNome("Clarice Lispector");
        autor2.setBiografia("Escritora brasileira");
        autorRepository.save(autor2);

        // When & Then
        mockMvc.perform(get("/api/autores/buscar")
                        .param("nome", "Machado"))
                .andExpect(status().isOk())
                .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                .andExpect(jsonPath("$[0].nome").value("Machado de Assis"));
    }
}
