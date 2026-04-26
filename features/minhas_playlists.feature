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

