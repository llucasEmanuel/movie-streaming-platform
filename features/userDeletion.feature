@test-delete
Feature: Exclusão de Conta de Usuário
  Como um usuário cadastrado na plataforma de streaming
  Quero poder excluir minha conta permanentemente
  Para que meus dados pessoais sejam removidos do sistema quando eu não quiser mais o serviço

  Background:
    Given existe uma conta ativa cadastrada com o e-mail "Luiz@teste.com" e ID "12345"


  @gui @frontend
  Scenario: Exclusão de conta bem-sucedida confirmada por texto
    Given que o usuário está autenticado no sistema web
    And que o usuário está na página de "Configurações da Conta"
    When o usuário clica no botão "Excluir Conta"
    And o sistema exibe um modal solicitando a digitação da frase "EXCLUIR MINHA CONTA"
    And o usuário digita "EXCLUIR MINHA CONTA" no campo de confirmação
    And o usuário clica no botão "Confirmar Exclusão"
    Then o sistema deve redirecionar o usuário para a página inicial deslogada
    And o sistema deve exibir a mensagem de sucesso "Sua conta foi excluída com sucesso."
    And o usuário não deve mais ter acesso ao sistema com o e-mail "Luiz@teste.com"

  @gui @frontend
  Scenario: Desistência da exclusão no modal de confirmação
    Given que o usuário está autenticado no sistema web
    And que o usuário está na página de "Configurações da Conta"
    When o usuário clica no botão "Excluir Conta"
    And o sistema exibe um modal solicitando a digitação da frase "EXCLUIR MINHA CONTA"
    And o usuário clica no botão "Cancelar"
    Then o modal de confirmação deve ser fechado
    And o usuário deve permanecer na página de "Configurações da Conta"
    And a conta do usuário deve continuar ativa no sistema

  @gui @frontend
  Scenario: Tentativa de exclusão com frase de confirmação incorreta
    Given que o usuário está autenticado no sistema web
    And que o usuário está na página de "Configurações da Conta"
    When o usuário clica no botão "Excluir Conta"
    And o sistema exibe um modal solicitando a digitação da frase "EXCLUIR MINHA CONTA"
    And o usuário digita "DELETAR" no campo de confirmação
    And o usuário clica no botão "Confirmar Exclusão"
    Then o sistema deve exibir a mensagem de erro "A frase de confirmação digitada está incorreta."
    And o modal de confirmação deve permanecer aberto
    And a conta do usuário deve continuar ativa no sistema

  @api @backend
  Scenario: Exclusão de conta com sucesso via requisição de API
    Given que a API está em funcionamento
    And que eu possuo um Token de Autenticação JWT válido para o usuário "12345"
    When eu envio uma requisição "DELETE" para o endpoint "/api/users/me" com o Token no cabeçalho
    Then o código de status HTTP da resposta deve ser 204
    And o usuário com ID "12345" não deve mais ser encontrado no banco de dados

  @api @backend @seguranca
  Scenario: Tentativa de exclusão sem token de autenticação na API
    Given que a API está em funcionamento
    And que eu não adiciono nenhum Token de Autenticação no cabeçalho da requisição
    When eu envio uma requisição "DELETE" para o endpoint "/api/users/me"
    Then o código de status HTTP da resposta deve ser 401
    And o corpo da resposta em JSON deve conter a mensagem de erro "Token de acesso não fornecido"
    And a conta do usuário "Luiz@teste.com" deve continuar ativa no sistema

  @api @backend @seguranca
  Scenario: Tentativa de excluir a conta de outro usuário (IDOR) via API
    Given que o usuário "hacker@malicioso.com" com ID "99999" existe no banco de dados
    And que eu possuo um Token de Autenticação JWT válido para o usuário "99999"
    When eu envio uma requisição "DELETE" para o endpoint "/api/users/12345" com o Token do hacker no cabeçalho
    Then o código de status HTTP da resposta deve ser 403
    And o corpo da resposta em JSON deve conter a mensagem "Você não tem permissão para realizar esta ação"
    And a conta do usuário "Luiz@teste.com" deve continuar ativa no sistema