@test-signup-service
Feature: Registo de Novos Utilizadores
    Como um visitante da plataforma
    Desejo poder escolher como realizarei o meu registo, via formulário padrão ou SSO do Google
    Para que eu tenha controlo sobre os dados associados à minha conta e flexibilidade no futuro login

@validacao @interface
Scenario Outline: Validação combinada de dados inválidos ou incompletos
    Given que eu sou um visitante tentando criar uma conta
    And eu estou a visualizar o formulário de novos utilizadores
    When eu tento registar-me fornecendo os dados de teste:
        | Campo | Valor     |
        | Nome  | <nome>    |
        | Email | <email>   |
        | Senha | <senha>   |
    Then o meu registo deve ser rejeitado pelo sistema
    And a mensagem de erro deve indicar "<mensagem_esperada>"

    Examples:
        | nome | email               | senha      | mensagem_esperada                          |
        | Luiz | luiz_sem_arroba.com | senha12345 | formato de email inválido                  |
        |      | luiz@exemplo.com    |            | Todos os campos são obrigatórios           |
        | Luiz | luiz@exemplo.com    | longa_1000 | tamanho de senha excede o limite permitido |

@seguranca @api
Scenario: Proteção contra Injeção de NoSQL/SQL nos campos
    Given que a plataforma está com as defesas de segurança activas
    And o sistema valida rigorosamente todas as entradas de dados contra ameaças
    When um utilizador malicioso tenta registar-se preenchendo o campo de e-mail com o seguinte código:
        """
        {"$gt": ""}
        """
    Then o sistema deve bloquear a tentativa imediatamente com segurança
    And nenhuma informação ou estrutura interna da base de dados deve ser exposta

@sso @google @resiliencia
Scenario: Falha de comunicação com a API do Google
    Given que o serviço externo do "Google" está temporariamente indisponível
    And eu sou um utilizador que prefere a autenticação social
    When eu tento enviar uma solicitação de login com o token "token_valido" do provedor "Google"
    Then a aplicação deve lidar com a falha externa de forma resiliente
    And eu devo ver a mensagem de erro "Erro ao autenticar com o Google"

@sso @google @seguranca
Scenario: Tentativa de login com token do Google expirado ou forjado
    Given que a plataforma valida rigorosamente os tokens de provedores externos
    And eu sou um utilizador tentando aceder a uma área restrita
    When eu tento enviar uma solicitação de login com o token "token_manipulado" do provedor "Google"
    Then o sistema deve negar o meu acesso imediatamente
    And o erro apresentado deve indicar que o "Token do Google inválido"

@validacao @happy-path
Scenario: Ativação de conta com sucesso 
    Given que eu realizei o pré-registo com o e-mail "novo@exemplo.com"
    And os meus dados estão na tabela temporária com o código "123456"
    When eu envio a solicitação de ativação com o e-mail "novo@exemplo.com" e o código "123456"
    Then o sistema deve aprovar a verificação com sucesso
    And a minha conta deve ser criada na base de dados principal como verificada
    And o registo temporário associado a "novo@exemplo.com" deve ser apagado
    And eu devo receber a mensagem "Conta ativada com sucesso! Você já pode fazer login."

@validacao @erro
Scenario: Tentativa de ativação com código incorreto
    Given que eu realizei o pré-registo com o e-mail "novo@exemplo.com"
    And os meus dados estão na tabela temporária com o código "123456"
    When eu envio a solicitação de ativação com o e-mail "novo@exemplo.com" e o código "999999"
    Then o sistema deve rejeitar a tentativa de ativação
    And o erro apresentado deve indicar "Código de verificação inválido."
    And a minha conta não deve ser criada na base de dados principal

@seguranca @tempo @resiliencia
Scenario: Tentativa de ativação com código expirado ou inexistente
    Given que eu realizei o pré-registo com o e-mail "lento@exemplo.com"
    And o tempo limite da tabela temporária expirou e o meu registo foi limpo
    When eu envio a solicitação de ativação com o e-mail "lento@exemplo.com" e o código "123456"
    Then o sistema deve negar a ativação
    And o erro apresentado deve indicar "Pedido de cadastro expirou ou não foi encontrado."

@seguranca @duplicidade
Scenario: Tentativa de reativar uma conta que já está ativa
    Given que a minha conta com o e-mail "ativo@exemplo.com" já se encontra na base de dados principal
    And o status da minha conta já está marcado como verificado
    When eu envio uma nova solicitação de ativação com o e-mail "ativo@exemplo.com" e o código "123456"
    Then o sistema deve bloquear a ação imediatamente
    And o erro apresentado deve indicar "Esta conta já está ativada."

@validacao @fluxo
Scenario: Sobrescrita de pré-registo abandonado
    Given que eu iniciei um pré-registo com o e-mail "indeciso@exemplo.com"
    And eu abandonei o processo antes de inserir o código de verificação
    When eu tento registar-me novamente com o mesmo e-mail "indeciso@exemplo.com"
    Then o sistema deve apagar o meu pré-registo antigo
    And um novo código de verificação deve ser gerado e enviado para mim