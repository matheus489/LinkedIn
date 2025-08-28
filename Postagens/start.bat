@echo off
echo ========================================
echo    API de Gerenciamento de Biblioteca
echo ========================================
echo.
echo Iniciando a aplicacao...
echo.

REM Configurar JAVA_HOME automaticamente
for /f "tokens=*" %%i in ('where java') do (
    set JAVA_PATH=%%i
    goto :found_java
)
:found_java
if "%JAVA_PATH%"=="" (
    echo ERRO: Java nao encontrado!
    echo Por favor, instale o Java 17 ou superior.
    pause
    exit /b 1
)

REM Extrair o caminho do Java e configurar JAVA_HOME
for %%i in ("%JAVA_PATH%") do set JAVA_BIN=%%~dpi
set JAVA_HOME=%JAVA_BIN:~0,-4%

REM Verificar se o Java está funcionando
java -version >nul 2>&1
if errorlevel 1 (
    echo ERRO: Java nao encontrado!
    echo Por favor, instale o Java 17 ou superior.
    pause
    exit /b 1
)

REM Verificar se o Maven Wrapper existe
if not exist "mvnw.cmd" (
    echo ERRO: Maven Wrapper nao encontrado!
    echo Por favor, execute o projeto na pasta correta.
    pause
    exit /b 1
)

echo Compilando o projeto...
call mvnw.cmd clean compile

if errorlevel 1 (
    echo ERRO: Falha na compilacao!
    pause
    exit /b 1
)

echo.
echo Executando a aplicacao...
echo.
echo URLs disponiveis:
echo - API: http://localhost:8080
echo - H2 Console: http://localhost:8080/h2-console
echo - Swagger UI: http://localhost:8080/swagger-ui/index.html
echo.
echo Credenciais do H2 Console:
echo - JDBC URL: jdbc:h2:mem:testdb
echo - Username: sa
echo - Password: password
echo.
echo Usuario padrao da API:
echo - Email: admin@biblioteca.com
echo - Senha: admin123
echo.

call mvnw.cmd spring-boot:run -DskipTests

pause
