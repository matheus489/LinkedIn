# 📚 Resumo do Projeto - API RESTful de Gerenciamento de Biblioteca

## 🎯 Objetivo
Desenvolver uma API RESTful completa para gerenciamento de biblioteca, demonstrando os fundamentos de uma API bem-estruturada com Java, Spring Boot e Maven.

## ✅ Funcionalidades Implementadas

### 🔧 Funcionalidades Essenciais
- ✅ **CRUD completo** para Livros e Autores
- ✅ **Registro de empréstimos** de livros
- ✅ **Devolução de livros**
- ✅ **Gestão de usuários**

### 🚀 Features Bônus
- ✅ **Spring Security com JWT** para autenticação/autorização
- ✅ **Testes unitários** e de integração
- ✅ **Validação de dados** com Bean Validation
- ✅ **Documentação Swagger** da API
- ✅ **Banco H2** com console web
- ✅ **Tratamento de exceções** global
- ✅ **Logging** configurado
- ✅ **CORS** configurado

## 🏗️ Arquitetura

### Tecnologias Utilizadas
- **Java 17**
- **Spring Boot 3.2.0**
- **Spring Security + JWT**
- **Spring Data JPA**
- **H2 Database**
- **Maven**
- **JUnit 5**
- **Swagger/OpenAPI**

### Estrutura do Projeto
```
📁 biblioteca-api/
├── 📁 src/main/java/com/biblioteca/
│   ├── 📄 BibliotecaApplication.java
│   ├── 📁 config/          # Configurações (Security, JWT, CORS, Swagger)
│   ├── 📁 controller/      # Controllers REST
│   ├── 📁 dto/            # Data Transfer Objects
│   ├── 📁 entity/         # Entidades JPA
│   ├── 📁 repository/     # Repositórios JPA
│   ├── 📁 security/       # Filtros de segurança
│   ├── 📁 service/        # Lógica de negócio
│   └── 📁 exception/      # Tratamento de exceções
├── 📁 src/test/           # Testes unitários e de integração
├── 📁 src/main/resources/ # Configurações e dados iniciais
├── 📄 pom.xml             # Dependências Maven
├── 📄 README.md           # Documentação completa
├── 📄 INSTRUCOES.md       # Instruções de uso
└── 📄 start.bat/.sh       # Scripts de inicialização
```

## 📊 Modelo de Dados

### Entidades Principais
1. **Autor** - Informações dos autores
2. **Livro** - Catálogo de livros com controle de estoque
3. **Usuario** - Usuários do sistema
4. **Emprestimo** - Controle de empréstimos e devoluções

### Relacionamentos
- Um Autor pode ter muitos Livros
- Um Livro pode ter muitos Empréstimos
- Um Usuario pode ter muitos Empréstimos

## 🔐 Segurança

### Autenticação JWT
- Tokens com expiração de 24 horas
- Senhas criptografadas com BCrypt
- Filtro JWT para validação de tokens

### Endpoints Protegidos
- Todos os endpoints de negócio requerem autenticação
- Endpoints de autenticação são públicos
- H2 Console e Swagger UI acessíveis sem autenticação

## 📚 Endpoints da API

### Autenticação
- `POST /api/auth/login` - Login
- `POST /api/auth/registrar` - Registro

### Autores (CRUD)
- `GET /api/autores` - Listar todos
- `GET /api/autores/{id}` - Buscar por ID
- `POST /api/autores` - Criar
- `PUT /api/autores/{id}` - Atualizar
- `DELETE /api/autores/{id}` - Deletar

### Livros (CRUD)
- `GET /api/livros` - Listar todos
- `GET /api/livros/{id}` - Buscar por ID
- `POST /api/livros` - Criar
- `PUT /api/livros/{id}` - Atualizar
- `DELETE /api/livros/{id}` - Deletar

### Empréstimos
- `POST /api/emprestimos/emprestar` - Realizar empréstimo
- `POST /api/emprestimos/{id}/devolver` - Devolver livro
- `GET /api/emprestimos/atrasados` - Listar atrasados

## 🧪 Testes

### Cobertura de Testes
- ✅ Testes unitários para serviços
- ✅ Testes de integração para controllers
- ✅ Configuração de teste separada

### Execução
```bash
mvn test                    # Todos os testes
mvn test -Dtest=AutorServiceTest  # Teste específico
```

## 🎯 Regras de Negócio

### Empréstimos
- Máximo 3 empréstimos ativos por usuário
- Prazo padrão de 15 dias
- Controle automático de disponibilidade

### Livros
- ISBN único obrigatório
- Controle de quantidade disponível
- Relacionamento obrigatório com autor

### Validações
- Campos obrigatórios validados
- Formato de email validado
- Tamanhos de campos controlados

## 🚀 Como Executar

### Pré-requisitos
- Java 17+
- Maven 3.6+

### Início Rápido
```bash
# Windows
start.bat

# Linux/Mac
./start.sh

# Manual
mvn spring-boot:run
```

### URLs de Acesso
- **API**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

### Credenciais Padrão
- **Email**: admin@biblioteca.com
- **Senha**: admin123

## 📈 Dados Iniciais

A aplicação já vem com dados de exemplo:
- 5 autores brasileiros famosos
- 6 livros clássicos da literatura brasileira
- 1 usuário administrador

## 🔧 Configurações

### Banco de Dados
- **Desenvolvimento**: H2 (memória)
- **Produção**: Configurável para PostgreSQL/MySQL

### Logging
- Console e arquivo
- Rotação automática de logs
- Níveis configuráveis

### CORS
- Configurado para desenvolvimento
- Permitindo todas as origens

## 📝 Documentação

### Arquivos de Documentação
- `README.md` - Documentação completa
- `INSTRUCOES.md` - Instruções de uso
- `RESUMO_PROJETO.md` - Este resumo

### Documentação da API
- Swagger UI automática
- Exemplos de uso
- Esquemas de dados

## 🎉 Conclusão

Este projeto demonstra uma implementação completa e profissional de uma API RESTful com:

✅ **Arquitetura bem estruturada** seguindo boas práticas
✅ **Segurança robusta** com JWT e Spring Security
✅ **Testes abrangentes** (unitários e integração)
✅ **Documentação completa** e fácil de usar
✅ **Configuração flexível** para diferentes ambientes
✅ **Código limpo** e bem organizado

O projeto está pronto para ser usado como referência para desenvolvimento de APIs RESTful com Spring Boot, demonstrando todos os conceitos fundamentais de uma API bem-estruturada.

---

**Status**: ✅ **COMPLETO E FUNCIONAL**
**Pronto para**: Demonstração, Aprendizado, Base para Projetos Reais
