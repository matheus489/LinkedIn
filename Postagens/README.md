# API RESTful de Gerenciamento de Biblioteca

Uma API completa para gerenciar livros, autores, usuários e empréstimos em uma biblioteca, desenvolvida com Java, Spring Boot e Maven.

## 🚀 Tecnologias Utilizadas

- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security** com JWT
- **Spring Data JPA**
- **H2 Database** (banco em memória)
- **Maven**
- **JUnit 5** para testes
- **Swagger/OpenAPI** para documentação interativa

## 📋 Funcionalidades

### ✅ Funcionalidades Essenciais
- **CRUD completo** para Livros e Autores
- **Registro de empréstimos** de livros
- **Devolução de livros**
- **Gestão de usuários**

### 🎯 Features Bônus Implementadas
- **Autenticação e autorização** com Spring Security e JWT
- **Testes unitários** e de integração
- **Validação de dados** com Bean Validation
- **Documentação interativa** com Swagger UI
- **Banco de dados H2** com console web

## 🚀 Como Executar

### ⚡ **Comandos Rápidos (Windows)**
```bash
# Configurar JAVA_HOME (uma vez só)
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"

# Compilar e executar tudo de uma vez
.\mvnw.cmd spring-boot:run -DskipTests
```

### Pré-requisitos
- Java 17 ou superior
- Maven (opcional - incluímos o Maven Wrapper)

### Passos para execução

1. **Clone o repositório**
```bash
git clone <url-do-repositorio>
cd biblioteca-api
```

2. **Configure o JAVA_HOME (se necessário)**
```bash
# Windows PowerShell
$env:JAVA_HOME = "C:\Program Files\Java\jdk-24"

# Linux/Mac
export JAVA_HOME=/path/to/your/java
```

3. **Compile e execute a aplicação**
```bash
# Compilar o projeto
./mvnw.cmd clean compile

# Executar a aplicação
./mvnw.cmd spring-boot:run

# OU tudo em um comando (recomendado)
./mvnw.cmd spring-boot:run -DskipTests
```

4. **Acesse a aplicação**
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html ⭐ **PRINCIPAL**
- **H2 Console**: http://localhost:8080/h2-console
- **API Base**: http://localhost:8080

### Configurações do H2 Console
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`

## 🎯 Como Usar a API

### 📖 **Interface Swagger UI (Recomendado)**

A forma mais fácil de testar a API é através do **Swagger UI**:

1. **Acesse**: http://localhost:8080/swagger-ui/index.html
2. **Faça login**:
   - Clique em `/api/auth/login`
   - Clique em "Try it out"
   - Preencha:
     ```json
     {
       "email": "admin@biblioteca.com",
       "senha": "admin123"
     }
     ```
   - Clique em "Execute"
   - Copie o token retornado

3. **Configure a autenticação**:
   - Clique no botão "Authorize" (🔒) no topo da página
   - Cole o token no campo "Value"
   - Clique em "Authorize"

4. **Teste as APIs**:
   - Agora você pode testar todos os endpoints
   - Clique em qualquer endpoint
   - Clique em "Try it out"
   - Preencha os dados
   - Clique em "Execute"

### 🔐 **Credenciais Padrão**
- **Email**: `admin@biblioteca.com`
- **Senha**: `admin123`

## 📚 Endpoints Disponíveis

### 🔐 Autenticação
- `POST /api/auth/login` - Fazer login
- `POST /api/auth/registrar` - Registrar novo usuário

### 👨‍💼 Autores
- `GET /api/autores` - Listar todos os autores
- `GET /api/autores/{id}` - Buscar autor por ID
- `GET /api/autores/buscar?nome={nome}` - Buscar autores por nome
- `POST /api/autores` - Criar novo autor
- `PUT /api/autores/{id}` - Atualizar autor
- `DELETE /api/autores/{id}` - Deletar autor

### 📖 Livros
- `GET /api/livros` - Listar todos os livros
- `GET /api/livros/{id}` - Buscar livro por ID
- `GET /api/livros/isbn/{isbn}` - Buscar livro por ISBN
- `GET /api/livros/buscar?titulo={titulo}` - Buscar livros por título
- `GET /api/livros/disponiveis` - Listar livros disponíveis
- `POST /api/livros` - Criar novo livro
- `PUT /api/livros/{id}` - Atualizar livro
- `DELETE /api/livros/{id}` - Deletar livro

### 📚 Empréstimos
- `GET /api/emprestimos` - Listar todos os empréstimos
- `GET /api/emprestimos/{id}` - Buscar empréstimo por ID
- `GET /api/emprestimos/atrasados` - Listar empréstimos atrasados
- `POST /api/emprestimos/emprestar` - Realizar empréstimo
- `POST /api/emprestimos/{id}/devolver` - Devolver livro

## 🧪 Testes

### Executar todos os testes
```bash
./mvnw test
```

### Executar testes específicos
```bash
./mvnw test -Dtest=AutorServiceTest
./mvnw test -Dtest=AutorControllerIntegrationTest
```

## 📊 Modelo de Dados

### Entidades Principais

#### Autor
- `id` (Long, PK)
- `nome` (String, obrigatório)
- `biografia` (String, opcional)
- `dataNascimento` (LocalDateTime, opcional)
- `dataCriacao` (LocalDateTime)
- `dataAtualizacao` (LocalDateTime)

#### Livro
- `id` (Long, PK)
- `titulo` (String, obrigatório)
- `isbn` (String, único, obrigatório)
- `sinopse` (String, opcional)
- `anoPublicacao` (Integer, opcional)
- `quantidade` (Integer, obrigatório)
- `quantidadeDisponivel` (Integer, obrigatório)
- `autor` (Autor, obrigatório)

#### Usuario
- `id` (Long, PK)
- `nome` (String, obrigatório)
- `email` (String, único, obrigatório)
- `senha` (String, obrigatório)

#### Emprestimo
- `id` (Long, PK)
- `livro` (Livro, obrigatório)
- `usuario` (Usuario, obrigatório)
- `dataEmprestimo` (LocalDateTime)
- `dataDevolucaoPrevista` (LocalDateTime)
- `dataDevolucaoEfetiva` (LocalDateTime)
- `status` (StatusEmprestimo)

## 🔒 Segurança

- **Spring Security** com autenticação JWT
- **Senhas criptografadas** com BCrypt
- **Validação de dados** com Bean Validation
- **CORS configurado** para desenvolvimento

## 🎯 Regras de Negócio

1. **Empréstimos**:
   - Máximo 3 empréstimos ativos por usuário
   - Prazo padrão de 15 dias
   - Controle automático de disponibilidade

2. **Livros**:
   - ISBN único obrigatório
   - Controle de quantidade disponível
   - Relacionamento obrigatório com autor

3. **Autores**:
   - Nome obrigatório
   - Biografia opcional

## 🏗️ Arquitetura

```
src/
├── main/java/com/biblioteca/
│   ├── BibliotecaApplication.java
│   ├── config/
│   │   ├── SecurityConfig.java
│   │   └── JwtConfig.java
│   ├── controller/
│   │   ├── AuthController.java
│   │   ├── AutorController.java
│   │   ├── LivroController.java
│   │   └── EmprestimoController.java
│   ├── dto/
│   │   ├── AutorDTO.java
│   │   ├── LivroDTO.java
│   │   ├── EmprestimoDTO.java
│   │   ├── LoginDTO.java
│   │   └── TokenDTO.java
│   ├── entity/
│   │   ├── Autor.java
│   │   ├── Livro.java
│   │   ├── Usuario.java
│   │   ├── Emprestimo.java
│   │   └── StatusEmprestimo.java
│   ├── repository/
│   │   ├── AutorRepository.java
│   │   ├── LivroRepository.java
│   │   ├── UsuarioRepository.java
│   │   └── EmprestimoRepository.java
│   ├── security/
│   │   └── JwtAuthenticationFilter.java
│   └── service/
│       ├── AuthService.java
│       ├── AutorService.java
│       ├── LivroService.java
│       ├── EmprestimoService.java
│       └── JwtService.java
└── test/java/com/biblioteca/
    ├── service/
    │   └── AutorServiceTest.java
    └── controller/
        └── AutorControllerIntegrationTest.java
```

## 📈 Melhorias Futuras

- [ ] Implementar PostgreSQL como banco de dados
- [ ] Adicionar cache com Redis
- [ ] Implementar notificações de empréstimos atrasados
- [ ] Adicionar relatórios e estatísticas
- [ ] Implementar busca avançada com Elasticsearch
- [ ] Adicionar upload de imagens para livros
- [ ] Implementar sistema de reservas

## 🤝 Contribuição

1. Faça um fork do projeto
2. Crie uma branch para sua feature (`git checkout -b feature/AmazingFeature`)
3. Commit suas mudanças (`git commit -m 'Add some AmazingFeature'`)
4. Push para a branch (`git push origin feature/AmazingFeature`)
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

## 👨‍💻 Autor

Desenvolvido como projeto de demonstração de API RESTful com Spring Boot.

---

## ⭐ **Dica Importante**

**Use o Swagger UI** para testar a API! É muito mais fácil e visual do que usar comandos curl. Acesse:
```
http://localhost:8080/swagger-ui/index.html
```

**Nota**: Esta API está configurada para desenvolvimento com banco H2 em memória. Para produção, recomenda-se configurar um banco de dados persistente como PostgreSQL.
