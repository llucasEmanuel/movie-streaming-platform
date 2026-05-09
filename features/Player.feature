Feature: Player

    Como um usuário do sistema
    Eu desejo ter controle sobre a reprodução de filmes
    Para que eu consiga assistir, pausar, retroceder e avançar a reprodução

    Scenario: Reproduzir filme com sucesso
        Given eu acesso o sistema como "usuário"
        And eu estou na página "Página do filme" do filme "Metropolis"
        When eu seleciono a opção "Assistir"
        Then o player de vídeo é inicializado
        And o filme é carregado
        And o filme começa a ser reproduzido

    Scenario: Timeout no carregamento do filme
        Given o player de vídeo foi inicializado
        And o filme "The Rink" iniciou seu carregamento
        When o tempo de carregamento excede "30 segundos"
        Then o carregamento do filme é interrompido
        And eu vejo a mensagem de erro "Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde"
        And eu vejo a página "Página do filme" do filme "The Rink"

    Scenario: Reprodução do filme é pausada
        Given o filme "Nosferatu" está sendo reproduzido
        When eu aciono a interrupção de reprodução
        Then a reprodução do filme "Nosferatu" é pausada
        And a barra de progresso do filme fica visível

    Scenario: Fim da reprodução do filme
        Given o filme "Metropolis" está sendo reproduzido
        When o filme termina a sua reprodução
        Then o player é fechado automaticamente
        And eu vejo a página "Página do filme" do filme "Metropolis"

    Scenario: Adiantamento na reprodução do filme
        Given o filme "A Noite dos Mortos Vivos" está sendo reproduzido
        When eu adianto a posição da barra de progresso
        Then o novo trecho do filme deve ser carregado
        And a reprodução deve ser retomada do novo trecho

    Scenario: Link de reprodução corrompido ou inexistente
        Given o link de reprodução do filme "A Noite dos Mortos Vivos" está corrompido ou inexistente
        And eu estou na página "Página do filme" do filme "A Noite dos Mortos Vivos"
        When eu seleciono a opção "Assistir"
        Then eu vejo a mensagem de erro "Este título não está disponível para reprodução no momento"
        And eu vejo a página "Página do filme" do filme "A Noite dos Mortos Vivos"
