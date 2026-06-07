Feature: MoviePlayerGUI

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

    Scenario: Link de reprodução corrompido ou inexistente
        Given o filme "A Noite dos Mortos Vivos" está cadastrado
        And o link de reprodução do filme "A Noite dos Mortos Vivos" está corrompido ou inexistente
        And eu estou na página "Página do filme" do filme "A Noite dos Mortos Vivos"
        When eu seleciono a opção "Assistir"
        Then eu visualizo a mensagem de erro "Este título não está disponível para reprodução no momento"
        And eu vejo a página "Página do filme" do filme "A Noite dos Mortos Vivos"

    Scenario: Exibir mensagem de erro quando o carregamento excede o tempo limite
        Given eu acesso o sistema como "usuário"
        And eu estou na página "Página do filme" do filme "The Rink"
        And o servidor de reprodução está instável ou inalcançável
        When eu seleciono a opção "Assistir"
        Then eu vejo um indicador de carregamento no player
        And o indicador de carregamento desaparece após "30 seg"
        And eu visualizo a mensagem de erro "Não foi possível carregar o filme. Verifique sua conexão ou tente novamente mais tarde"

    Scenario: Sair do player durante a reprodução
        Given eu acesso o sistema como "usuário"
        And o filme "Metropolis" está sendo reproduzido no player
        When eu seleciono a opção "Voltar"
        Then a reprodução é interrompida
        And eu retorno para a página "Página do filme" do filme "Metropolis"