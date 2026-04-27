Feature: Playlists do usuário

Scenario Outline: Visualizar seções e playlists disponíveis na página principal
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
    And a playlist padrão "<playlist>" não pode ser removida
    And a playlist padrão "<playlist>" não pode ser editada
    And a playlist padrão "<playlist>" está inicialmente vazia
    When o usuário acessa a seção "Minhas playlists"
    Then o sistema exibe a playlist "<playlist>"
    And a playlist "<playlist>" aparece como uma playlist padrão
    And a playlist "<playlist>" não tem a opção de ser removida
    And a playlist "<playlist>" não tem a opção de ser editada
    And a playlist "<playlist>" não possui filmes adicionados

    Examples:
        | playlist        |
        | Favoritos       |
        | Assistir depois |


Scenario: Adicionar nova playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a opção "Adicionar playlist"
    And o usuário não possui uma playlist chamada "Maratonar nas férias"
    When o usuário solicita a opção "Adicionar playlist"
    And o sistema exibe o formulário de "Criação de playlist"
    And o usuário preenche o campo de nome da playlist com "Maratonar nas férias"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Salvar"
    Then o sistema cria a playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" aparece na seção "Minhas playlists"
    And o sistema exibe a mensagem "Playlist adicionada com sucesso!"


Scenario: Cancelar criação de nova playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a opção "Adicionar playlist"
    And o usuário não possui uma playlist chamada "Maratonar nas férias"
    When o usuário solicita a opção "Adicionar playlist"
    And o sistema exibe o formulário de "Criação de playlist"
    And o usuário preenche o campo de nome da playlist com "Maratonar nas férias"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Cancelar"
    Then o sistema não cria a playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" não aparece na seção "Minhas playlists"


Scenario: Adicionar playlist personalizada sem informar nome
    Given o usuário está na seção "Minhas playlists"
    And existe a opção "Adicionar playlist"
    When o usuário solicita a opção "Adicionar playlist"
    And o sistema exibe o formulário de "Criação de playlist"
    And o usuário não preenche o campo de nome da playlist
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Salvar"
    Then o sistema não cria uma nova playlist
    And o usuário permanece no formulário de "Criação de playlist"
    And o sistema exibe a mensagem "O nome da playlist é obrigatório!"


Scenario: Adicionar playlist personalizada com nome já existente
    Given o usuário está na seção "Minhas playlists"
    And existe a opção "Adicionar playlist"
    And o usuário já possui uma playlist chamada "Maratonar nas férias"
    When o usuário solicita a opção "Adicionar playlist"
    And o sistema exibe o formulário de "Criação de playlist"
    And o usuário preenche o campo de nome da playlist com "Maratonar nas férias"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Salvar"
    Then o sistema não cria uma nova playlist
    And a seção "Minhas playlists" mantém apenas uma playlist chamada "Maratonar nas férias"
    And o sistema exibe a mensagem "Já existe uma playlist com esse nome!"


Scenario: Remover uma playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada "Maratonar nas férias"
    And existe a opção "Remover playlist" na playlist "Maratonar nas férias"
    When o usuário solicita a opção "Remover playlist"
    Then o sistema remove a playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" não aparece na seção "Minhas playlists"


Scenario: Editar o nome de uma playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada de nome "Maratonar nas férias"
    And existe a opção "Editar playlist" para a playlist "Maratonar nas férias"
    And o usuário não possui uma playlist de nome "Maratonar no feriadão" na seção "Minhas playlists"
    When o usuário solicita a opção "Editar playlist" da playlist "Maratonar nas férias"
    And o sistema exibe o formulário de "Edição de playlist" da playlist "Maratonar nas férias"
    And o usuário altera o campo de nome de "Maratonar nas férias" para "Maratonar no feriadão"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Salvar"
    Then o sistema altera o campo de nome da playlist para "Maratonar no feriadão"
    And a playlist "Maratonar no feriadão" aparece na seção "Minhas playlists"
    And a playlist "Maratonar nas férias" não aparece na seção "Minhas playlists"


Scenario: Editar o nome de uma playlist personalizada para um nome já existente na seção
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada "Maratonar nas férias"
    And existe a playlist "Filmes favoritos do mês"
    And existe a opção "Editar playlist" para a playlist "Maratonar nas férias"
    When o usuário solicita a opção "Editar playlist" da playlist "Maratonar nas férias"
    And o sistema exibe o formulário de "Edição de playlist" da playlist "Maratonar nas férias"
    And o usuário altera o campo de nome de "Maratonar nas férias" para "Filmes favoritos do mês"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Salvar"
    Then o sistema não altera o campo de nome da playlist "Maratonar nas férias" para "Filmes favoritos do mês"
    And a playlist "Maratonar nas férias" aparece na seção "Minhas playlists"
    And a playlist "Filmes favoritos do mês" aparece na seção "Minhas playlists"
    And o sistema exibe a mensagem "Já existe uma playlist com esse nome!"


Scenario: Cancelar edição do nome de uma playlist personalizada
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada de nome "Maratonar nas férias"
    And existe a opção "Editar playlist" para a playlist "Maratonar nas férias"
    And o usuário não possui uma playlist de nome "Maratonar no feriadão" na seção "Minhas playlists"
    When o usuário solicita a opção "Editar playlist" da playlist "Maratonar nas férias"
    And o sistema exibe o formulário de "Edição de playlist" da playlist "Maratonar nas férias"
    And o usuário altera o campo de nome de "Maratonar nas férias" para "Maratonar no feriadão"
    And o sistema exibe as opções "Salvar" e "Cancelar"
    And o usuário seleciona a opção "Cancelar"
    Then o sistema não altera o campo de nome da playlist
    And a playlist "Maratonar nas férias" continua aparecendo na seção "Minhas playlists"
    And a playlist "Maratonar no feriadão" não aparece na seção "Minhas playlists"


Scenario Outline: Adicionar filme a uma playlist padrão
    Given o usuário está na playlist "Catálogo"
    And o usuário está visualizando o filme "<filme>"
    And a playlist padrão "<playlist>" existe na seção "Minhas playlists"
    And o filme "<filme>" possui a opção "<opcao>"
    And o filme "<filme>" ainda não está na playlist "<playlist>"
    When o usuário seleciona a opção "<opcao>"
    Then o sistema adiciona o filme "<filme>" à playlist "<playlist>"
    And o filme "<filme>" é salvo na playlist "<playlist>"

    Examples:
      | filme   | opcao                   | playlist        |
      | Top Gun | Adicionar aos favoritos | Favoritos       |
      | Top Gun | Assistir depois         | Assistir depois |


Scenario Outline: Adicionar filme já existente em uma playlist padrão
    Given o usuário está na playlist "Catálogo"
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
    And o usuário vê as playlists personalizadas presentes na seção "Minhas playlists"
    And o usuário escolhe a playlist "Maratonar nas férias"
    Then o sistema adiciona o filme "Gran Torino" à playlist "Maratonar nas férias"
    And o filme "Gran Torino" é salvo na playlist "Maratonar nas férias"


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


Scenario: Remover filme de uma playlist
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada "Maratonar nas férias"
    And a playlist "Maratonar nas férias" possui o filme "Top Gun"
    And o filme "Top Gun" possui a opção "Remover da playlist"
    When o usuário acessa a playlist "Maratonar nas férias"
    And o usuário seleciona o filme "Top Gun"
    And o usuário seleciona a opção do filme "Remover da playlist"
    Then o sistema remove o filme "Top Gun" da playlist "Maratonar nas férias"
    And o filme "Top Gun" deixa de aparecer na playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" continua existindo


Scenario: Remover todos os filmes de uma playlist
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada "Maratonar nas férias"
    And a playlist "Maratonar nas férias" possui pelo menos um filme
    And existe a opção "Limpar playlist" na playlist "Maratonar nas férias"
    When o usuário solicita a opção "Limpar playlist"
    Then o sistema remove todos os filmes da playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" continua aparecendo na seção "Minhas playlists"
    And a playlist "Maratonar nas férias" fica vazia


Scenario: Remover todos os filmes de uma playlist vazia
    Given o usuário está na seção "Minhas playlists"
    And existe a playlist personalizada "Maratonar nas férias"
    And a playlist "Maratonar nas férias" não possui filmes salvos
    And existe a opção "Limpar playlist" na playlist "Maratonar nas férias"
    When o usuário solicita a opção "Limpar playlist"
    Then o sistema não remove nenhum filme da playlist "Maratonar nas férias"
    And a playlist "Maratonar nas férias" continua vazia
    And a playlist "Maratonar nas férias" continua aparecendo na seção "Minhas playlists"
    And o sistema exibe a mensagem "A playlist já está vazia!"