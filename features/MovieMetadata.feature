Feature: MovieMetadata

    Como um usuário do sistema
    Eu desejo poder visualizar os metadados de um filme
    Para que eu saiba detalhes do filme antes de iniciar a reprodução 

    Scenario Outline: Validar exibição de metadados
        Given eu acesso o sistema como "usuário"
        When eu seleciono o filme "<filme_selecionado>"
        Then eu vejo a página "Página do Filme" do filme "<filme_selecionado>"
        And os campos devem estar preenchidos adequadamente:
            | campo   | valor     |
            | título  | <título>  |
            | sinopse | <sinopse> |
            | gêneros | <gêneros> |
            | duração | <duração> |
            | diretor | <diretor> |
            | elenco  | <elenco>  |
        And eu vejo a opção "Assistir"

        Examples:
            | filme_selecionado | título     | sinopse                    | gêneros                  | duração     | diretor    | elenco                                       |
            | Metropolis        | Metropolis | Numa cidade futurística... | Drama, Ficção Científica | 153 minutos | Fritz Lang | Brigitte Helm, Alfred Abel, Gustav Fröhlich  |
            | The Rink          | The Rink   | N/A                        | N/A                      | N/A         | N/A        | N/A                                          |
            | Filme Sem Título  | N/A        | N/A                        | N/A                      | N/A         | N/A        | N/A                                          |

    Scenario: Timeout da requisição de metadados do filme
        Given o servidor de metadados está instável ou inalcançável
        When eu seleciono o filme "A Noite dos Mortos Vivos"
        And o tempo de carregamento excede "10 segundos"
        Then o carregamento de metadados é interrompido
        And eu vejo a mensagem de erro "Não foi possível carregar a página do filme. Verifique sua conexão ou tente novamente mais tarde"
        And eu continuo na página "Página do filme" do filme "A Noite dos Mortos Vivos"
