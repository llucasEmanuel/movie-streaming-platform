Feature: MovieMetadataGUI

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
        | ano     | <ano>     |
        | diretor | <diretor> |
        | elenco  | <elenco>  |
        And eu vejo a opção "Assistir"
        Examples:
        | filme_selecionado | título     | sinopse                    | gêneros                  | duração     | ano  | diretor    | elenco                                      |
        | Metropolis        | Metropolis | Numa cidade futurística... | Drama, Ficção Científica | 153 minutos | 1927 | Fritz Lang | Brigitte Helm, Alfred Abel, Gustav Fröhlich |
        | The Rink          | The Rink   | N/A                        | N/A                      | N/A         | N/A  | N/A        | N/A                                         |
        | Filme Sem Título  | N/A        | N/A                        | N/A                      | N/A         | N/A  | N/A        | N/A                                         |

    Scenario: Exibir mensagem de erro ao acessar filme inexistente
        Given eu acesso o sistema como "usuário"
        And não existe filme com id "9999" cadastrado
        When eu acesso diretamente a página do filme com id "9999"
        Then eu vejo a mensagem de erro "Filme não encontrado"
        And eu não vejo a opção "Assistir"
        And eu não vejo campos de metadados na tela

    Scenario: Voltar para a tela anterior a partir da página do filme
        Given eu acesso o sistema como "usuário"
        And eu estava na página "Página inicial"
        When eu seleciono o filme "Metropolis"
        And eu seleciono a opção "Voltar"
        Then eu retorno para a página "Página inicial"

    Scenario: Exibir mensagem de erro quando os metadados demoram para carregar
        Given eu acesso o sistema como "usuário"
        And o servidor de metadados está instável ou inalcançável
        When eu seleciono o filme "Metropolis"
        Then eu vejo um indicador de carregamento na "Página do Filme"
        And o indicador de carregamento desaparece após "10 seg"
        And eu vejo a mensagem de erro "Não foi possível carregar a página do filme. Verifique sua conexão ou tente novamente mais tarde"
        And eu não vejo todos os campos de metadados com o valor "N/A"