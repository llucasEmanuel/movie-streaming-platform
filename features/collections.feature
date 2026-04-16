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

Scenario: Excluir uma lista personalizada com sucesso
    Given eu estou na página “Listas”.
    And eu visualizo a lista “Filmes para as férias” na minha coleção.
    When eu seleciono a opção de excluir a lista “Filmes para as férias”.
    And confirmo a exclusão no alerta do sistema.
    Then eu devo ver a mensagem de confirmação “Lista removida com sucesso!”.
    And a lista “Filmes para as férias” não deve mais estar visível na minha coleção de listas.

Scenario: Adicionar um filme a uma lista com sucesso
    Given eu estou na página do filme “Interstellar”.
    And eu possuo a lista “Filmes para as férias” criada.
    When eu adiciono “Interstellar” à minha lista “Filmes para as férias”.
    Then eu devo ver a mensagem de confirmação “Filme adicionado com sucesso!”.
    And ao acessar a página “Filmes para as férias”, eu devo ver “Interstellar” na lista.

Scenario: Remover um filme de uma lista com sucesso
    Given a lista “Filmes para as férias” contém o filme “Interstellar”.
    And eu estou visualizando a página da lista “Filmes para as férias”.
    When eu removo o filme “Interstellar” desta lista.
    Then eu devo ver a mensagem de confirmação “Filme removido com sucesso!”.
    And o filme “Interstellar” não deve mais constar na lista “Filmes para as férias”.
    And a lista “Filmes para as férias” deve continuar disponível para visualização.

Scenario: Impedir a criação de listas com nomes duplicados
    Given eu estou na página “Listas”.
    And eu já possuo uma lista chamada “Filmes para as férias”.
    When eu tento criar uma nova lista com o nome “Filmes para as férias”.
    Then eu devo ver a mensagem de erro “Você já possui uma lista com este nome”.
    And uma nova lista não deve ser criada na minha coleção.
