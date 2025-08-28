-- Inserir usuário padrão (senha: admin123)
INSERT INTO usuarios (nome, email, senha, data_criacao) 
VALUES ('Administrador', 'admin@biblioteca.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVEFDa', CURRENT_TIMESTAMP);

-- Inserir autores
INSERT INTO autores (nome, biografia, data_criacao) 
VALUES 
('Machado de Assis', 'Escritor brasileiro, considerado o maior nome da literatura nacional', CURRENT_TIMESTAMP),
('Clarice Lispector', 'Escritora brasileira de origem ucraniana, uma das mais importantes do século XX', CURRENT_TIMESTAMP),
('Jorge Amado', 'Escritor brasileiro, autor de obras como Gabriela, Cravo e Canela', CURRENT_TIMESTAMP),
('Paulo Coelho', 'Escritor brasileiro, autor de O Alquimista', CURRENT_TIMESTAMP),
('Monteiro Lobato', 'Escritor brasileiro, criador do Sítio do Picapau Amarelo', CURRENT_TIMESTAMP);

-- Inserir livros
INSERT INTO livros (titulo, sinopse, isbn, ano_publicacao, quantidade, quantidade_disponivel, autor_id, data_criacao) 
VALUES 
('Dom Casmurro', 'Romance de Machado de Assis que narra a história de Bentinho e Capitu', '9788535902778', 1899, 5, 5, 1, CURRENT_TIMESTAMP),
('Memórias Póstumas de Brás Cubas', 'Romance narrado por um defunto autor', '9788535902779', 1881, 3, 3, 1, CURRENT_TIMESTAMP),
('A Hora da Estrela', 'Último romance de Clarice Lispector', '9788535902780', 1977, 4, 4, 2, CURRENT_TIMESTAMP),
('Gabriela, Cravo e Canela', 'Romance de Jorge Amado sobre a Bahia', '9788535902781', 1958, 6, 6, 3, CURRENT_TIMESTAMP),
('O Alquimista', 'Romance sobre a busca pelo sonho pessoal', '9788535902782', 1988, 8, 8, 4, CURRENT_TIMESTAMP),
('Reinações de Narizinho', 'Primeiro livro do Sítio do Picapau Amarelo', '9788535902783', 1931, 4, 4, 5, CURRENT_TIMESTAMP);
