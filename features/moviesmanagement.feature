Feature: Gerenciamento de Filmes no Catálogo
  As an administrador da plataforma de streaming
  I want to gerenciar os filmes do catálogo (cadastrar, editar e remover)
  So that os usuários tenham conteúdo atualizado para assistir

  Scenario: Cadastro de um novo filme com sucesso
    Given eu acesso o sistema como "administrador"
    And eu estou na página "Adicionar novo filme"
    When eu adiciono o filme "O Auto da Compadecida" com sinopse "A saga de João Grilo" e duração "104 minutos"
    Then eu vejo o filme "O Auto da Compadecida" no "Catálogo de Filmes"
    And eu vejo que o filme "O Auto da Compadecida" possui a sinopse "A saga de João Grilo" e possui duração de "104 minutos"

 Scenario: Tentativa de cadastro sem campos obrigatórios
    Given eu acesso o sistema como "administrador"
    And eu estou na página "Adicionar novo filme"
    When eu tento adicionar um filme deixando o título "" e com sinopse "Um filme qualquer"
    Then eu vejo a mensagem de erro "O título é obrigatório"
    And eu continuo na página "Adicionar novo filme"

 Scenario: Edição de metadados de um filme já existente
    Given que o sistema possui o filme "O Auto da Compadecida" com sinopse "Sinopse antiga"
    And eu acesso o sistema como "administrador"
    And eu estou na página de "edição" do filme "O Auto da Compadecida"
    When eu altero a sinopse para "A saga de João Grilo e Chicó"
    Then eu vejo a sinopse "A saga de João Grilo e Chicó" nos "detalhes" do filme "O Auto da Compadecida"

 Scenario: Remoção de um filme do catálogo
    Given que o sistema possui os filmes "Shrek" e "Toy Story" no catálogo
    And eu acesso o sistema como "administrador"
    And eu estou na página de "Catálogo de Filmes"
    When eu removo o filme "Shrek"
    Then eu não vejo o filme "Shrek" no "Catálogo de Filmes"
    And eu continuo vendo o filme "Toy Story" no "Catálogo de Filmes"

 Scenario: Tentativa de cadastrar um filme que já existe no catálogo
    Given que o sistema já possui o filme "O Senhor dos Anéis"
    And eu acesso o sistema como "administrador"
    And eu estou na página "Adicionar novo filme"
    When eu tento adicionar o filme "O Senhor dos Anéis" com sinopse "A jornada do anel" e duração "178 minutos"
    Then eu vejo a mensagem de erro "Este filme já está cadastrado no catálogo"
    And o sistema não cria uma cópia duplicada do filme "O Senhor dos Anéis"

 Scenario: Tentativa de remover o título na edição de um filme
    Given que o sistema possui o filme "Gladiador" com sinopse "Filme épico"
    And eu acesso o sistema como "administrador"
    And eu estou na página de "edição" do filme "Gladiador"
    When eu altero o título para ""
    Then eu vejo a mensagem de erro "O título é obrigatório"
    And eu vejo que o título do filme continua sendo "Gladiador" no "Catálogo de Filmes"

 Scenario: Tentativa de gerenciamento por usuário não autorizado
    Given que acesso o sistema como "usuário"
    And eu estou na página "Página Inicial"
    When eu tento acessar a página "Adicionar novo filme"
    Then eu vejo a mensagem de erro "Acesso negado. Privilégios de administrador necessários."
    And eu continuo na página "Página Inicial"
