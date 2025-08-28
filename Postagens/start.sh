#!/bin/bash

echo "========================================"
echo "   API de Gerenciamento de Biblioteca"
echo "========================================"
echo ""
echo "Iniciando a aplicacao..."
echo ""

# Verificar se o Java está instalado
if ! command -v java &> /dev/null; then
    echo "ERRO: Java não encontrado!"
    echo "Por favor, instale o Java 17 ou superior."
    exit 1
fi

# Verificar se o Maven está instalado
if ! command -v mvn &> /dev/null; then
    echo "ERRO: Maven não encontrado!"
    echo "Por favor, instale o Maven 3.6 ou superior."
    exit 1
fi

echo "Compilando o projeto..."
mvn clean compile

if [ $? -ne 0 ]; then
    echo "ERRO: Falha na compilação!"
    exit 1
fi

echo ""
echo "Executando a aplicação..."
echo ""
echo "URLs disponíveis:"
echo "- API: http://localhost:8080"
echo "- H2 Console: http://localhost:8080/h2-console"
echo "- Swagger UI: http://localhost:8080/swagger-ui/index.html"
echo ""
echo "Credenciais do H2 Console:"
echo "- JDBC URL: jdbc:h2:mem:testdb"
echo "- Username: sa"
echo "- Password: password"
echo ""
echo "Usuário padrão da API:"
echo "- Email: admin@biblioteca.com"
echo "- Senha: admin123"
echo ""

mvn spring-boot:run
