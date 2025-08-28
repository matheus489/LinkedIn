# Instruções de Uso - API de Gerenciamento de Biblioteca

## 🚀 Início Rápido

### Windows
1. Execute o arquivo `start.bat` clicando duas vezes nele
2. Ou abra o PowerShell/CMD e execute: `.\start.bat`

### Linux/Mac
1. Abra o terminal
2. Navegue até a pasta do projeto
3. Execute: `./start.sh`

### Manual
```bash
mvn clean compile
mvn spring-boot:run
```

## 📋 Pré-requisitos

- **Java 17** ou superior
- **Maven 3.6** ou superior

### Verificar instalações:
```bash
java -version
mvn -version
```

## 🌐 URLs de Acesso

Após iniciar a aplicação, você terá acesso a:

- **API REST**: http://localhost:8080
- **H2 Console**: http://localhost:8080/h2-console
- **Swagger UI**: http://localhost:8080/swagger-ui/index.html

## 🔐 Credenciais Padrão

### H2 Console
- **JDBC URL**: `jdbc:h2:mem:testdb`
- **Username**: `sa`
- **Password**: `password`

### API - Usuário Padrão
- **Email**: `admin@biblioteca.com`
- **Senha**: `admin123`

## 🔑 Autenticação JWT

### 1. Fazer Login
```bash
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@biblioteca.com",
    "senha": "admin123"
  }'
```

### 2. Usar o Token
```bash
curl -X GET http://localhost:8080/api/autores \
  -H "Authorization: Bearer {seu-token-jwt}"
```

## 📚 Exemplos de Uso

### Criar um Autor
```bash
curl -X POST http://localhost:8080/api/autores \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "nome": "Machado de Assis",
    "biografia": "Escritor brasileiro do século XIX"
  }'
```

### Criar um Livro
```bash
curl -X POST http://localhost:8080/api/livros \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "titulo": "Dom Casmurro",
    "isbn": "9788535902778",
    "autorId": 1,
    "anoPublicacao": 1899,
    "quantidade": 3
  }'
```

### Realizar um Empréstimo
```bash
curl -X POST http://localhost:8080/api/emprestimos/emprestar \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {token}" \
  -d '{
    "livroId": 1,
    "usuarioId": 1
  }'
```

### Devolver um Livro
```bash
curl -X POST http://localhost:8080/api/emprestimos/1/devolver \
  -H "Authorization: Bearer {token}"
```

## 🧪 Testes

### Executar todos os testes
```bash
mvn test
```

### Executar testes específicos
```bash
mvn test -Dtest=AutorServiceTest
mvn test -Dtest=AutorControllerIntegrationTest
```

## 📊 Dados Iniciais

A aplicação já vem com dados de exemplo:

### Autores
- Machado de Assis
- Clarice Lispector
- Jorge Amado
- Paulo Coelho
- Monteiro Lobato

### Livros
- Dom Casmurro (Machado de Assis)
- Memórias Póstumas de Brás Cubas (Machado de Assis)
- A Hora da Estrela (Clarice Lispector)
- Gabriela, Cravo e Canela (Jorge Amado)
- O Alquimista (Paulo Coelho)
- Reinações de Narizinho (Monteiro Lobato)

## 🔧 Configurações

### Alterar Porta
Edite `src/main/resources/application.yml`:
```yaml
server:
  port: 8081  # ou qualquer porta desejada
```

### Alterar Banco de Dados
Para usar PostgreSQL, adicione no `pom.xml`:
```xml
<dependency>
    <groupId>org.postgresql</groupId>
    <artifactId>postgresql</artifactId>
    <scope>runtime</scope>
</dependency>
```

E configure no `application.yml`:
```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/biblioteca
    username: seu_usuario
    password: sua_senha
```

## 🐛 Solução de Problemas

### Erro: "Java não encontrado"
- Instale o Java 17 ou superior
- Configure a variável JAVA_HOME

### Erro: "Maven não encontrado"
- Instale o Maven 3.6 ou superior
- Configure a variável PATH

### Erro: "Porta já em uso"
- Altere a porta no `application.yml`
- Ou pare o processo que está usando a porta 8080

### Erro de Autenticação
- Verifique se o usuário existe
- Use as credenciais padrão: admin@biblioteca.com / admin123

## 📝 Logs

Os logs são salvos em:
- **Console**: Durante a execução
- **Arquivo**: `./logs/biblioteca-api.log`

## 🔒 Segurança

- Todas as senhas são criptografadas com BCrypt
- Tokens JWT expiram em 24 horas
- CORS configurado para desenvolvimento
- Validação de dados em todos os endpoints

## 📈 Monitoramento

### Health Check
```bash
curl http://localhost:8080/actuator/health
```

### Métricas (se configurado)
```bash
curl http://localhost:8080/actuator/metrics
```

## 🤝 Suporte

Para dúvidas ou problemas:
1. Verifique os logs em `./logs/biblioteca-api.log`
2. Consulte a documentação Swagger em http://localhost:8080/swagger-ui/index.html
3. Verifique o README.md principal

---

**Nota**: Esta API está configurada para desenvolvimento. Para produção, configure um banco de dados persistente e ajuste as configurações de segurança.
