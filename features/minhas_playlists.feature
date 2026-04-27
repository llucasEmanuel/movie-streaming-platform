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


Scenario Outline: Adicionar filme a uma playlist padrão 
    Given o usuário está na playlist "Catálogo"
    And o usuário está visualizando o filme "<filme>" 
    And a playlist padrão "<playlist>" existe na seção "Minhas playlists"
    And o filme "<filme>" possui a opção "<opcao>"
    And o filme "<filme>" ainda não está na playlist "<playlist>"
    When o usuário seleciona a opção "<opcao>"
    Then o sistema adiciona o filme "<filme>" à playlist "<playlist>"
    And o sistema exibe uma mensagem informando que o filme foi salvo na playlist "Maratonar nas férias"
    And o filme "<filme>" é salvo na playlist "<playlist>"

    Examples:
      | filme   | opcao                   | playlist        |
      | Top Gun | Adicionar aos favoritos | Favoritos       |
      | Top Gun | Assistir depois         | Assistir depois |


Scenario Outline: Adicionar filme já existente em uma playlist padrão
  Given o usuário está na playlist "Maratonar nas férias"
  And o usuário está visualizando o filme "<filme>"
  And a playlist padrão "<playlist>" existe na seção "Minhas playlists"
  And o filme "<filme>" possui a opção "<opcao>"
  And o filme "<filme>" já está salvo na playlist "<playlist>"
  When o usuário seleciona a opção "<opcao>"
  Then o sistema não adiciona uma nova cópia do filme "<filme>" à playlist "<playlist>"
  And o sistema exibe uma mensagem informando que o filme já está na playlist "<playlist>"
  And a playlist "<playlist>" mantém apenas um registro do filme "<filme>"

  Examples:
    | filme   | opcao                   | playlist        |
    | Top Gun | Adicionar aos favoritos | Favoritos       |
    | Top Gun | Assistir depois         | Assistir depois |


Scenario: Adicionar filme a uma playlist personalizada
    Given o usuário está na playlist "Catálogo"
    And o usuário está visualizando o filme "Gran Torino" 
    And o filme "Gran Torino" possui a opção "Adicionar à playlist"
    And a playlist personalizada "Maratonar nas férias" existe na seção "Minhas playlists"
    And o filme "Gran Torino" ainda não está na playlist "Maratonar nas férias"
    When o usuário seleciona a opção "Adicionar à playlist" do filme "Gran Torino"
    And o usuário vê as playlists personalizadas presentes na seção "Minhas Playlists"
    And o usuário escolhe a playlist "Maratonar nas férias"
    Then o sistema adiciona o filme "Gran Torino" à playlist "Maratonar nas férias"
    And o filme "Gran Torino" é salvo na playlist "Maratonar nas férias"
    And o sistema exibe uma mensagem informando que o filme foi salvo na playlist "Maratonar nas férias"


Scenario: Adicionar filme já existente em uma playlist personalizada
    Given o usuário está na playlist "Catálogo"
    And o usuário está visualizando o filme "Gran Torino"
    And o filme "Gran Torino" possui a opção "Adicionar à playlist"
    And a playlist personalizada "Maratonar nas férias" existe na seção "Minhas playlists"
    And o filme "Gran Torino" já está salvo na playlist "Maratonar nas férias"
    When o usuário seleciona a opção "Adicionar à playlist" do filme "Gran Torino"
    And o usuário vê as playlists personalizadas presentes na seção "Minhas playlists"
    And o usuário escolhe a playlist "Maratonar nas férias"
    Then o sistema não adiciona uma nova cópia do filme "Gran Torino" à playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" mantém apenas um registro do filme "Gran Torino"
    And o sistema exibe uma mensagem informando que o filme já está na playlist "Maratonar nas férias"





Scenario: Criação de uma nova playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a opção "Adicionar playlist"
    And o usuário não possui uma playlist chamada "Maratonar nas férias"
    When o usuário solicita a opção "Adicionar playlist"
    And o sistema exibe o formulário de "Criação de playlist"
    And o usuário preenche o campo de nome da playlist com "Maratonar nas férias"
    And o usuário confirma o cadastro da playlist
    Then o sistema cria a playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" aparece na seção "Minhas playlists"



  
  