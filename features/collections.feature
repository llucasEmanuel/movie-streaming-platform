Feature: Gerenciar listas (coleções) personalizadas 
    As a Usuário do sistema 
    I want to criar e gerenciar listas de filmes e séries 
    So that eu possa organizar meus conteúdos favoritos para assistir depois.

Scenario: Criar uma lista com sucesso
    Given eu estou na página “Listas”.
    And não existe uma lista chamada “Filmes para as férias”.
    When eu crio a lista “Filmes para as férias”.
    Then eu devo ver a mensagem de confirmação “Lista criada com sucesso!”.
    And a lista “Filmes para as férias” deve estar visível na minha coleção de listas.

Scenario: Adicionar um filme a uma lista com sucesso
    Given eu estou na página do filme “Interstellar”.
    And eu possuo a lista “Filmes para as férias” criada.
    When eu adiciono “Interstellar” à minha lista “Filmes para as férias”.
    Then eu devo ver a mensagem de confirmação “Filme adicionado com sucesso!”.
    And ao acessar a página “Filmes para as férias”, eu devo ver “Interstellar” na lista.

