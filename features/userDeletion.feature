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
