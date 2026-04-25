Feature: MovieMetadata

    Como um usuário do sistema
    Eu desejo poder visualizar os metadados de um filme
    Para que eu saiba detalhes do filme antes de iniciar a reprodução 

    Scenario: Visualização de metadados na página do filme
        Given eu sou "Usuário" do sistema
        When eu seleciono o filme "Metropolis"
        Then a tela de "Página do filme" é exibida
        And eu visualizo "título", "sinopse", "gêneros", "duração", "diretor" e "elenco" preenchidos
        And eu visualizo a opção de "Assistir"

    Scenario: Ausência de metadados do filme
        Given o filme "The Rink" possui apenas o metadado "título" preenchido
        When eu seleciono o filme "The Rink"
        Then eu visualizo "título" preenchido
        And os campos de metadados vazios exibem o texto "N/A"
        And eu visualizo a opção de "Assistir"

    Scenario: Ausência de título do filme
        Given o filme não possui o metadado "título"
        When o filme é selecionado
        Then a tela de "Página do filme" é exibida
        And eu visualizo "título" como o nome do arquivo de vídeo do filme

    Scenario: Timeout da requisição de metadados do filme
        Given o servidor de metadados está instável ou inalcançável
        When eu seleciono o filme "A Noite dos Mortos Vivos"
        And o tempo de carregamento excede "10" "segundos"
        Then o carregamento é interrompido
        And a mensagem de erro "Não foi possível carregar a página do filme. Verifique sua conexão ou tente novamente mais tarde" é exibida
        And eu continuo na tela "Página do filme"
