@test-delete-service
Feature: Exclusão de Conta de Utilizador
    Como um utilizador registado na plataforma
    Desejo poder excluir a minha conta permanentemente
    Para que os meus dados pessoais sejam removidos do sistema de acordo com a minha vontade

Background: Utilizadores registados na plataforma
    Given que os seguintes utilizadores existem no sistema:
        | ID    | Email                |
        | 12345 | luiz@teste.com       |
        | 99999 | hacker@malicioso.com |

@autenticacao @interface
Scenario: Exclusão de conta com sucesso pelo próprio utilizador
    Given que eu estou autenticado com o ID "12345"
    When eu solicito a exclusão permanente da minha conta de utilizador
    Then o sistema deve confirmar a eliminação com sucesso
    And o meu perfil de utilizador não deve mais estar acessível na plataforma

@seguranca @api
Scenario: Tentativa de exclusão de conta sem credenciais de autenticação
    Given que eu não estou autenticado na plataforma
    When eu tento solicitar a remoção da conta do utilizador "12345"
    Then o sistema deve rejeitar o pedido exigindo autenticação
    And a conta do utilizador "12345" deve continuar ativa no sistema

@seguranca @api @idor
Scenario: Tentativa de excluir a conta de outro utilizador 
    Given que eu estou autenticado com o ID "99999"
    When eu tento solicitar a remoção da conta do utilizador "12345"
    Then o sistema deve bloquear a operação por falta de permissão
    And a conta do utilizador "12345" deve continuar ativa no sistema