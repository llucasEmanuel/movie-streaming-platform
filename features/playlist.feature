Feature: Playlist

    As a usuário registrado
    I want to criar e gerenciar minhas playlists
    So que eu possa organizar meus filmes/séries favoritas e poder achar facilmente ou compartilhar

Scenario: Alterar visibilidade de playlist pública para privada
    Given eu estou logado como "Júlio"
    And eu estou na página "Minhas playlists"
    And a playlist "Filmes Nerds" está definida como "Pública"
    And a playlist "Filmes Nerds" aparece nos resultados de busca
    When eu altero a visibilidade da playlist "Filmes Nerds" para "Privada"
    Then a playlist "Filmes Nerds" não aparece mais nos resultados de busca
    And a playlist "Filmes Nerds" não está acessível publicamente
    And eu consigo visualizar a playlist "Filmes Nerds" no meu painel

Scenario: Acessar playlist privada via link direto
    Given a playlist "Filmes de Romance" está definida como "Privada"
    And o usuário "Maria" não é o proprietário da playlist
    When a usuária "Maria" tenta acessar a playlist "Filmes de Romance" por um link direto
    Then o sistema nega o acesso à playlist "Filmes de Romance"
    And o sistema exibe a mensagem "Este conteúdo não está mais disponível"

Scenario: Usuário não autorizado tenta alterar visibilidade da playlist
    Given o usuário "Maria" está logado no sistema
    And a playlist "Filmes Nerds" pertence ao usuário "Júlio"
    And a playlist "Filmes Nerds" está definida como "Pública"
    When a usuária "Maria" tenta alterar a visibilidade da playlist "Filmes Nerds" para "Privada"
    Then o sistema nega a alteração de visibilidade
    And a playlist "Filmes Nerds" permanece como "Pública"

Scenario: Falha ao alterar visibilidade da playlist
    Given eu estou logado como "Júlio"
    And a playlist "Filmes de ação" está definida como "Pública"
    When eu tento alterar a visibilidade para "Privada"
    And ocorre um erro interno no sistema
    Then o sistema exibe uma mensagem de erro
    And a playlist "Filmes de ação" permanece como "Pública"


Scenario: Alterar visibilidade de playlist privada para pública
    Given eu estou logado como "Júlio"
    And eu estou na página "Minhas playlists"
    And a playlist "Filmes Nerds" está definida como "Privada"
    And a playlist "Filmes Nerds" não aparece nos resultados de busca
    When eu altero a visibilidade da playlist "Filmes Nerds" para "Pública"
    Then a playlist "Filmes Nerds" aparece nos resultados de busca
    And a playlist "Filmes Nerds" está acessível publicamente