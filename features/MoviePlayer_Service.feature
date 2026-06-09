Feature: MoviePlayerService

    Como um usuário do sistema
    Eu desejo ter controle sobre a reprodução de filmes
    Para que eu consiga assistir, pausar, retroceder e avançar a reprodução

    Scenario: Timeout no carregamento do filme
        Given o player de vídeo foi inicializado
        And o filme "The Rink" iniciou seu carregamento
        When o tempo de carregamento excede "30 seg"
        Then o carregamento do filme é interrompido
        And o sistema retorna a mensagem de erro "Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde"

    Scenario: Carregar filme com sucesso
        Given o filme "Metropolis" com id "1" está cadastrado no sistema
        And o filme possui uma URL de reprodução válida
        When eu requisito o carregamento do filme com id "1"
        Then o filme é carregado com sucesso
        And a reprodução é iniciada automaticamente

    Scenario: Falha ao carregar filme com URL inválida
        Given o filme "Metropolis" com id "1" está cadastrado no sistema
        And o filme possui uma URL de reprodução inválida
        When eu requisito o carregamento do filme com id "1"
        Then o carregamento do filme é interrompido
        And o sistema retorna a mensagem de erro "URL de reprodução inválida"

    Scenario: Falha ao carregar filme inexistente
        Given não existe filme com id "9999" cadastrado no sistema
        When eu requisito o carregamento do filme com id "9999"
        Then o carregamento do filme é interrompido
        And o sistema retorna a mensagem de erro "Filme não encontrado"
