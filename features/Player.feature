Feature: Player

    Como um usuário do sistema
    Eu desejo ter controle sobre a reprodução de filmes
    Para que eu consiga assistir, pausar, retroceder e avançar a reprodução

    Scenario: Reproduzir filme com sucesso
        Given eu sou "Usuário" do sistema
        And eu estou na tela "Página do filme"
        When eu seleciono a opção "Assistir"
        Then o player de vídeo é inicializado
        And o filme é carregado
        And o filme começa a ser reproduzido

    Scenario: Timeout no carregamento do filme
        Given o player de vídeo foi inicializado
        And um filme iniciou seu carregamento
        When o tempo de carregamento excede "30" "segundos"
        Then o carregamento do filme é interrompido
        And a mensagem de erro "Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde" é exibida
        And a tela de "Página do filme" é exibida novamente

    Scenario: Reprodução do filme é pausada
        Given o filme "Nosferatu" está sendo reproduzido
        When eu aciono a interrupção de reprodução
        Then a reprodução do filme é pausada
        And um ícone de pausa aparece no centro do player de vídeo
        And a barra de progresso do filme fica visível

    Scenario: Fim da reprodução do filme
        Given o filme "Metropolis" está sendo reproduzido
        When o filme termina a sua reprodução
        Then o player é fechado automaticamente
        And a tela de "Página do filme" é exibida novamente

    Scenario: Saída da reprodução do filme
        Given o filme "The Floorwalker" está sendo reproduzido
        When eu saio do player de vídeo
        And o filme não foi encerrado
        Then a barra de progresso do filme "The Floorwalker" é salva
        And a tela de "Página do filme" é exibida novamente

    Scenario: Retomada da reprodução do filme
        Given o filme "The Floorwalker" foi reproduzido anteriormente
        And o filme não foi reproduzido até o final
        And eu estou na tela "Página do filme"
        When eu seleciono a opção "Assistir"
        Then o player de vídeo é inicializado
        And o filme é carregado a partir de onde sua reprodução foi interrompida
        And o filme começa a ser reproduzido

    Scenario: Adiantamento na reprodução do filme
        Given o filme "A Noite dos Mortos Vivos" está sendo reproduzido
        When eu adianto a posição da barra de progresso
        Then o novo trecho do filme deve ser carregado
        And a reprodução deve ser retomada do novo trecho

    Scenario: Link de reprodução corrompido ou inexistente
        Given o link de reprodução do filme está corrompido ou inexistente
        And eu estou na tela "Página do filme"
        When eu seleciono a opção "Assistir"
        Then a mensagem de erro "Este título não está disponível no momento" é exibida
        And a tela de "Página do filme" é exibida novamente