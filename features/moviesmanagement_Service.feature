Feature: Gerenciamento de Filmes no Catálogo (Service)
  As an administrador da plataforma de streaming
  I want to gerenciar os filmes do catálogo (cadastrar, editar e remover)
  So that os usuários tenham conteúdo atualizado para assistir

  Scenario: Tentativa de cadastro de filme já existente no sistema - Service
    Given eu acesso o sistema como "administrador"
    And que o sistema já possui o filme "O Senhor dos Anéis"
    When eu tento adicionar o filme "O Senhor dos Anéis" com sinopse "A jornada do anel" e duração "178 minutos"
    Then o sistema deve retornar a mensagem de erro "Este filme já existe na base de dados"
  
  Scenario: Cadastro de um novo filme com sucesso - Service 
    Given eu acesso o sistema como "administrador"
    When eu adiciono o filme "O Auto da Compadecida" com sinopse "A saga de João Grilo" e duração "104 minutos"
    Then o filme "O Auto da Compadecida" deve ser incluído no "catálogo" do sistema
    And o sistema salva o filme "O Auto da Compadecida" com sinopse "A saga de João Grilo" e duração "104 minutos"

  Scenario: Tentativa de gerenciamento por usuário não autorizado - Service 
    Given eu acesso o sistema como "usuário"
    When eu tento executar a ação de "cadastrar" filme
    Then o sistema deve retornar a mensagem de erro "Acesso negado. Privilégios de administrador necessários."

  Scenario: Tentativa de exclusão de filme inexistente - Service 
    Given eu acesso o sistema como "administrador"
    And que o filme com ID "999" não existe no sistema
    When eu tento excluir o filme com ID "999"
    Then o sistema deve retornar a mensagem de erro "Impossível excluir! Não existe esse filme na base de dados"
