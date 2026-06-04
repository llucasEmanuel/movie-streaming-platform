Feature: Histórico de Conteúdos Assistidos
    As a usuário do sistema
    I want to acessar uma página que liste, em ordem cronológica inversa, todos os vídeos que assisti anteriormente, exibindo a data e a porcentagem assistida
    So that eu possa ter um registro organizado do meu consumo e encontrar facilmente conteúdos para rever ou recomendar.

# Cenários de Serviços

Scenario: Registrar novo filme no histórico
    Given que o usuário está logado
    And o sistema não possui nenhum registro de histórico para o filme "Cidadão Kane" no dia "26/04/2026"
    When eu envio uma requisição para salvar o progresso do filme "Cidadão Kane" com tempo assistido de "120" minutos e duração de "120" minutos no dia "26/04/2026"
    Then deve existir um novo registro para o filme "Cidadão Kane" no dia "26/04/2026"
    And ele deve ter o tempo assistido de "120" minutos e duração de "120" minutos

Scenario: Atualizar progresso de filme reassistido no mesmo dia
    Given que o usuário está logado 
    And o sistema possui um registro de histórico para o filme "Casablanca" no dia "25/04/2026" com tempo assistido de "20" minutos
    When eu envio uma requisição para salvar o progresso do filme "Casablanca" com tempo assistido de "80" minutos no dia "25/04/2026"
    Then deve existir apenas um registro para o filme "Casablanca" no dia "25/04/2026"
    And deve ter o tempo assistido atualizado de "80" minutos

Scenario: Registrar múltiplas visualizações do mesmo filme em dias diferentes
    Given que o usuário está logado
    And o sistema possui um registro de histórico para o filme "Casablanca" no dia "25/04/2026" com tempo assistido de "100" minutos
    When eu envio uma requisição para salvar o progresso do filme "Casablanca" com tempo assistido de "50" minutos no dia "26/04/2026"
    Then deve existir um novo registro para o filme "Casablanca" no dia "26/04/2026" com tempo assistido de "50" minutos
    And o registro do filme "Casablanca" no dia "25/04/2026" deve permanecer com o tempo assistido de "100" minutos

Scenario: Ocultar um registro específico do histórico
    Given que o usuário está logado
    And o sistema possui um registro de histórico para o filme "Casablanca" no dia "20/04/2026"
    When eu solicito esconder o registro do filme "Casablanca" do dia "20/04/2026"
    Then o registro do filme "Casablanca" no dia "20/04/2026" passa a constar internamente como oculto no sistema

Scenario: Ocultar todo o histórico quando existem registros
    Given que o usuário está logado
    And o sistema possui um registro de histórico para o filme "Casablanca" no dia "20/04/2026"
    And o sistema possui um registro de histórico para o filme "Tempos Modernos" no dia "25/04/2026"
    When eu solicito esconder todo o histórico do usuário
    Then os registros de "Casablanca" e "Tempos Modernos" passam a constar internamente como ocultos no sistema

Scenario: Ocultar todo o histórico quando não existem registros 
    Given que o usuário está logado
    And o histórico do usuário está completamente vazio no sistema
    When eu solicito esconder todo o histórico do usuário
    Then o servidor retorna uma resposta de erro notificando que a operação é inválida
    And o histórico do usuário permanece completamente vazio no sistema

#Cenários GUI

Scenario: Visualizar Histórico Completo
    Given que o usuário está logado
    And assistiu ao filme "Casablanca" no dia "20/04/2026"
    And o progresso assistido do filme "Casablanca" é "100%"
    And assistiu ao filme "Tempos Modernos" no dia "25/04/2026"
    And o progresso assistido do filme "Tempos Modernos" é "40%"
    When o usuário acessa a página "Meu Histórico"
    Then o usuário vê os títulos "Tempos Modernos" e "Casablanca" do mais recente para o mais antigo
    And e deve ver a data "25/04/2026" associada ao filme "Tempos Modernos"
    And e deve ver o progresso "40%" associado ao filme "Tempos Modernos"
    And e deve ver a data "20/04/2026" associada ao filme "Casablanca"
    And e deve ver o progresso "100%" associado ao filme "Casablanca"

Scenario: Registrar múltiplas visualizações do mesmo filme
    Given que o usuário está logado
    And assistiu ao filme "Casablanca" no dia "25/04/2026"
    And o progresso assistido do filme "Casablanca" é "100%"
    And assistiu ao filme "Casablanca" no dia "26/04/2026"
    And o progresso assistido do filme "Casablanca" é "50%"
    When o usuário acessa a página "Meu Histórico"
    Then o usuário vê o filme "Casablanca" duas vezes no histórico
    And deve ver a data "26/04/2026" e o progresso "50%" associados a um registro do filme "Casablanca"
    And deve ver a data "25/04/2026" e o progresso "100%" associados a um registro do filme "Casablanca"

Scenario: Adicionar novo filme ao histórico
    Given que o usuário está logado
    And já possui os filmes "Casablanca" e "Tempos Modernos" no seu histórico de filmes assistidos
    And o progresso assistido do filme "Casablanca" é "100%"
    And o progresso assistido do filme "Tempos Modernos" é "40%"
    When o usuário assiste ao filme "Cidadão Kane" no dia "26/04/2026"
    And acessa a página "Meu Histórico"
    Then o usuário vê os títulos "Cidadão Kane", "Tempos Modernos" e "Casablanca" do mais recente para o mais antigo
    And deve ver a data "26/04/2026" associada ao filme "Cidadão Kane"
    And deve ver o progresso "100%" associado ao filme "Cidadão Kane"
    And deve ver a data "25/04/2026" associada ao filme "Tempos Modernos"
    And deve ver o progresso "40%" associado ao filme "Tempos Modernos"
    And deve ver a data "20/04/2026" associada ao filme "Casablanca"
    And deve ver o progresso "100%" associado ao filme "Casablanca"

Scenario: Ocultar filme do histórico
    Given que o usuário está logado
    And tem os filmes "Casablanca" e "Tempos Modernos" no seu histórico de filmes assistidos
    When o usuário solicita esconder o filme "Casablanca" do seu histórico
    Then o usuário deve ver uma mensagem de confirmação de sucesso
    And o filme "Casablanca" não deve mais estar visível na página "Meu Histórico"
    And o filme "Tempos Modernos" deve permanecer listado como conteúdo assistido

Scenario: Esconder histórico Completo
    Given que o usuário está logado
    And tem os filmes "Casablanca" e "Tempos Modernos" no seu histórico de filmes assistidos
    When o usuário solicita esconder todos os filmes do histórico
    Then o usuário deve ver uma mensagem de confirmação de sucesso
    And nenhum filme deve estar visível na página "Meu Histórico"

Scenario: Esconder histórico completo quando histórico está vazio
    Given que o usuário está logado
    And não possui nenhum filme no histórico de filmes assistidos
    When o usuário solicita esconder todos os filmes do histórico
    Then o usuário deve ver uma mensagem de erro

Scenario: Histórico Vazio
    Given que o usuário está logado
    And não possui nenhum filme no histórico de filmes assistidos
    When o usuário acessa a página "Meu Histórico"
    Then o usuário não deve ver nenhum título de filme listado
    And o usuário deve ver uma mensagem informando que o histórico está vazio 

