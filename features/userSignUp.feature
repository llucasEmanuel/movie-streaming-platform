Feature: Cadastro de Usuário
    Como um visitante da plataforma
    Eu desejo poder escolher como realizarei meu cadastro, via formulário padrão ou SSO do Google
    Para que eu tenha controle sobre os dados associados à minha conta e flexibilidade no futuro login

Scenario: Cadastro bem sucedido via SSO
    Given eu estou na página "Cadastro"
    And o email "exemplo@test.com" do Google não possui cadastro no sistema
    When eu realizo o cadastro utilizando minha conta Google com email "exemplo@test.com"
    And eu preencho o campo "nome" com "João"
    Then uma nova conta de usuário deve ser criada para "exemplo@test.com"
    And eu sou autenticado automaticamente no sistema
    And eu vejo a mensagem de sucesso "Bem vindo João"

Scenario: Cadastro mal sucedido via SSO
    Given eu estou na página "Cadastro"
    And o email "exemplo@test.com" do Google possui cadastro no sistema
    When eu tento realizar o cadastro utilizando minha conta Google com o email "exemplo@test.com"
    And eu defino o nome de usuário "João"
    Then aparece uma mensagem de aviso "conta já está vinculada"
    And eu devo ser direcionado a página "Login"

Scenario: Cadastro bem sucedido via formulário
    Given eu estou na página "Cadastro"
    And o email "exemplo@test.com" não possui cadastro no sistema
    When eu realizo o cadastro com o email "exemplo@test.com" e senha "12345@aM"
    And eu preencho o campo "nome" com "João"
    Then uma nova conta de usuário deve ser criada para "exemplo@test.com"
    And eu sou autenticado automaticamente no sistema
    And eu vejo a mensagem de sucesso "Bem vindo João"

Scenario: Cadastro mal sucedido via formulário
    Given eu estou na página "Cadastro"
    And o email "exemplo@test.com" possui cadastro no sistema
    When eu preencho o campo "email" com "exemplo@test.com"
    And eu preencho o campo "senha" com "123456Ll"
    And eu preencho o campo "nome" com "João"
    Then aparece uma mensagem de aviso "conta já está vinculada"
    And eu devo ser direcionado a página "Login"

Scenario: Cadastro mal sucedido via formulário devido a senha inválida por tamanho
    Given eu estou na página "Cadastro"
    And o email "exemplo@test.com" não possui cadastro no sistema
    When eu tento realizar o cadastro com o email "exemplo@test.com" e senha "1234@aM"
    And eu preencho o campo "nome" com "João"
    Then deve aparecer uma mensagem de aviso "tamanho de senha inválida"
    And eu devo permanecer na página "Cadastro"

@validacao @api
Scenario: Tentativa de cadastro com formato de e-mail inválido
    When eu envio uma requisição POST para "/register" com os dados:
        | name  | email               | password   |
        | Luiz  | luiz_sem_arroba.com | senha12345 |
    Then o status da resposta deve ser 400
    And a mensagem de erro deve indicar "formato de email inválido"
    And o banco de dados não deve sofrer alterações

@validacao @api
Scenario: Tentativa de cadastro com campos em branco
    When eu envio uma requisição POST para "/register" com os dados:
        | name  | email             | password |
        |       | luiz@exemplo.com  |          |
    Then o status da resposta deve ser 400
    And a mensagem de erro deve indicar "Todos os campos são obrigatórios"

@seguranca @api
Scenario: Tentativa de cadastro com senha excedendo o limite máximo (Prevenção de DoS)
    When eu envio uma requisição POST para "/register" com uma "password" de 1000 caracteres
    Then o status da resposta deve ser 400
    And a mensagem de erro deve indicar "tamanho de senha excede o limite permitido"

@seguranca @api
Scenario: Proteção contra Injeção de NoSQL/SQL nos campos
    When eu envio uma requisição POST para "/register" com o campo email contendo:
        """
        {"$gt": ""}
        """
    Then o status da resposta deve ser 400
    And a API não deve vazar informações do banco de dados na resposta

@sso @google @resiliencia
Scenario: Falha de comunicação com a API do Google
    Given que a API do Google está indisponível ou demorando a responder
    When eu envio uma requisição POST para "/auth/google" com um token válido
    Then o status da resposta deve ser 500 (ou 502/504)
    And a mensagem de erro deve ser "Erro ao autenticar com o Google"
    And a aplicação não deve "quebrar" 

@sso @google @seguranca
Scenario: Tentativa de login com token do Google expirado ou forjado
    When eu envio uma requisição POST para "/auth/google" com um token manipulado
    Then o serviço "verifyIdToken" deve rejeitar a assinatura
    And o status da resposta deve ser 400
    And a mensagem de erro deve ser "Token do Google inválido"