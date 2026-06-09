Feature: MovieMetadataService

    Como um usuário do sistema
    Eu desejo poder visualizar os metadados de um filme
    Para que eu saiba detalhes do filme antes de iniciar a reprodução 

    Scenario: Carregar metadados com sucesso
        Given o filme "Nosferatu" com id "1" está cadastrado no sistema
        And o filme possui os seguintes metadados:
        | campo   | valor                                                                |
        | título  | Nosferatu                                                            |
        | sinopse | Um conde vampiro viaja para uma pequena cidade alemã causando terror |
        | duração | 92                                                                   |
        | gêneros | Horror, Clássico                                                     |
        | ano     | 1922                                                                 |
        | diretor | Friedrich Wilhelm Murnau                                             |
        | elenco  | Max Schreck, Gustav von Wangenheim, Greta Schröder                  |
        When eu requisito os metadados do filme com id "1"
        Then os metadados são retornados com sucesso
        And os dados contêm "título" "Nosferatu"
        And os dados contêm "sinopse" "Um conde vampiro viaja para uma pequena cidade alemã causando terror"
        And os dados contêm "duração" "92 min"
        And os dados contêm "gêneros" "Horror, Clássico"
        And os dados contêm "ano" "1922"
        And os dados contêm "elenco" "Max Schreck, Gustav von Wangenheim, Greta Schröder"

    Scenario: Filme não encontrado ao requisitar metadados
        Given não existe filme com id "9999" cadastrado no sistema
        When eu requisito os metadados do filme com id "9999"
        Then a requisição retorna um erro
        And a mensagem de erro é "Filme não encontrado"

    Scenario: Metadados com campos parciais
        Given o filme "O Gabinete do Dr. Caligari" com id "2" está cadastrado no sistema
        And o filme possui os seguintes metadados incompletos:
            | campo          | valor                                      |
            | título         | O Gabinete do Dr. Caligari                 |
            | sinopse        | Um filme de horror expressionista clássico |
            | duração        | 76                                         |
            | gêneros        |                                            |
            | ano            | 1920                                       |
            | diretor        |                                            |
            | elenco         |                                            |
        When eu requisito os metadados do filme com id "2"
        Then os metadados são retornados com sucesso
        And os dados contém "título" "O Gabinete do Dr. Caligari"
        And os dados contém "sinopse" "Um filme de horror expressionista clássico"
        And os dados contém "duração" "76 min"
        And os dados contém "ano" "1920"
        And os campos vazios retornam "N/A"

    Scenario: Timeout da requisição de metadados do filme
        Given o servidor de metadados está instável ou inalcançável
        And o filme "A Noite dos Mortos Vivos" está cadastrado no sistema
        When eu seleciono o filme "A Noite dos Mortos Vivos"
        And o tempo de carregamento excede "10 seg"
        Then o carregamento de metadados é interrompido
        And eu vejo a mensagem de erro "Não foi possível carregar a página do filme. Verifique sua conexão ou tente novamente mais tarde"