Scenario Outline: Visualização de seções e playlists disponíveis na página principal
    Given o usuário está logado na plataforma
    And o usuário está na página principal
    And o elemento "<item>" do tipo "<tipo>" está disponível na página principal
    When o usuário seleciona a opção "<item>"
    Then o sistema exibe o elemento "<item>"
    And os conteúdos relacionados a "<item>" são exibidos

    Examples:
      | tipo     | item                 |
      | seção    | Recomendados         |
      | seção    | Minhas playlists     |
      | seção    | Gêneros              |
      | playlist | Catálogo             |
      | playlist | Continuar assistindo |


Scenario Outline: Visualizar playlists padrão na seção Minhas playlists
    Given o usuário está logado na plataforma
    And o usuário está na página principal
    And a seção "Minhas playlists" está disponível
    And a playlist padrão "<playlist>" existe
    And a playlist padrão "<playlist>" está inicialmente vazia
    When o usuário acessa a seção "Minhas playlists"
    Then o sistema exibe a playlist "<playlist>"
    And a playlist "<playlist>" aparece como uma playlist padrão
    And a playlist "<playlist>" não possui filmes adicionados

    Examples:
        | playlist        |
        | Favoritos       |
        | Assistir depois |

