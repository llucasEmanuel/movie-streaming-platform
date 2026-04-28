Feature: Gerenciamento de Filmes no Catálogo
  As an administrador da plataforma de streaming
  I want to gerenciar os filmes do catálogo (cadastrar, editar e remover)
  So that os usuários tenham conteúdo atualizado para assistir

  Scenario: Cadastro de um novo filme com sucesso
    Given que eu estou autenticado como administrador
    And eu estou na página de catálogo de filmes
    When eu adiciono o filme "O Auto da Compadecida" com sinopse "A saga de João Grilo" e duração "104 minutos"
    Then eu vejo o filme "O Auto da Compadecida" no catálogo
    And eu vejo que este filme possui a sinopse "A saga de João Grilo"

 Scenario: Tentativa de cadastro sem campos obrigatórios
    Given que eu estou autenticado como administrador
    And eu estou na página de adicionar novo filme
    When eu tento adicionar um filme deixando o título em branco e com sinopse "Um filme qualquer"
    Then eu vejo a mensagem de erro "O título é obrigatório"
    And eu continuo na página de adicionar novo filme

 Scenario: Edição de metadados de um filme já existente
    Given que o sistema possui o filme "O Auto da Compadecida" com sinopse "Sinopse antiga"
    And eu estou autenticado como administrador
    And eu estou na página de edição do filme "O Auto da Compadecida"
    When eu altero a sinopse para "A saga de João Grilo e Chicó"
    And eu confirmo a alteração
    Then eu vejo a sinopse "A saga de João Grilo e Chicó" nos detalhes do filme

 Scenario: Remoção de um filme do catálogo
    Given que o sistema possui os filmes "Shrek" e "Toy Story" no catálogo
    And eu estou autenticado como administrador
    And eu estou na página de catálogo de filmes
    When eu removo o filme "Shrek"
    Then eu não vejo o filme "Shrek" na listagem do catálogo
    And eu continuo vendo o filme "Toy Story" na listagem do catálogo

 Scenario: Tentativa de cadastrar um filme que já existe no catálogo
    Given que o sistema já possui o filme "O Senhor dos Anéis"
    And eu estou autenticado como administrador
    And eu estou na página de adicionar novo filme
    When eu tento adicionar o filme "O Senhor dos Anéis" com sinopse "A jornada do anel" e duração "178 minutos"
    Then eu vejo a mensagem de erro "Este filme já está cadastrado no catálogo"
    And o sistema não cria uma cópia duplicada do filme "O Senhor dos Anéis"

 Scenario: Tentativa de remover o título na edição de um filme
    Given que o sistema possui o filme "Gladiador" com o título "Gladiador" e sinopse "Filme épico"
    And eu estou autenticado como administrador
    And eu estou na página de edição do filme "Gladiador"
    When eu altero o título para em branco
    And eu confirmo a alteração
    Then eu vejo a mensagem de erro "O título é obrigatório"
    And eu vejo que o título do filme continua sendo "Gladiador" no catálogo