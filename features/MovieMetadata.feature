Feature: MovieMetadata

    Como um usuário do sistema
    Eu desejo poder visualizar os metadados de um filme
    Para que eu saiba detalhes do filme antes de iniciar a reprodução 

    Scenario Outline: Validar exibição de metadados
        Given eu acesso o sistema como "usuário"
        When eu seleciono o filme "<filme_selecionado>"
        Then a tela "Página do Filme" é exibida
        And os campos devem estar preenchidos adequadamente:
            | campo   | valor     |
            | título  | <título>  |
            | sinopse | <sinopse> |
            | gêneros | <gêneros> |
            | duração | <duração> |
            | diretor | <diretor> |
            | elenco  | <elenco>  |
        And eu visualizo a opção de "Assistir"

        Examples:
            | filme_selecionado | título     | sinopse                    | gêneros                  | duração | diretor    | elenco                                       |
            | Metropolis        | Metropolis | Numa cidade futurística... | Drama, Ficção Científica | 153 min | Fritz Lang | Brigitte Helm, Alfred Abel, Gustav Fröhlich  |
            | The Rink          | The Rink   | N/A                        | N/A                      | N/A     | N/A        | N/A                                          |
            | Filme Sem Título  | N/A        | N/A                        | N/A                      | N/A     | N/A        | N/A                                          |

    Scenario: Timeout da requisição de metadados do filme
        Given o servidor de metadados está instável ou inalcançável
        When eu seleciono o filme "A Noite dos Mortos Vivos"
        And o tempo de carregamento excede "10" "segundos"
        Then o carregamento é interrompido
        And a mensagem de erro "Não foi possível carregar a página do filme. Verifique sua conexão ou tente novamente mais tarde" é exibida
        And eu continuo na tela "Página do filme"
