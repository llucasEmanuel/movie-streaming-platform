Feature: Histórico de Conteúdos Assistidos
    As a usuário do sistema
    I want to acessar uma página que liste, em ordem cronológica inversa, todos os vídeos que assisti anteriormente, exibindo a data e a porcentagem assistida
    So that eu possa ter um registro organizado do meu consumo e encontrar facilmente conteúdos para rever ou recomendar.

# Cenários de Serviços

Scenario: Salvar progresso de um filme assistido
   Given que o usuário "user-123" está logado
   And o filme de id "789" está disponível no catálogo
   When uma requisição "POST" for enviada para "/history/progress" com o filme de id "789" e tempo assistido 60 minutos
   Then o status da resposta deve ser "200"
   And o registro de progresso para o filme de id "789" deve ser atualizado para 60 minutos

Scenario: Obter o histórico do usuário
   Given que o usuário "user-123" está cadastrado no sistema
   And o usuário assistiu ao filme de id "789" no dia "23/12/2025"
   And o usuário não assistiu nenhum outro filme
   When uma requisição "GET" for enviada para o endpoint de histórico do usuário "user-123"
   Then o status da resposta deve ser "200"
   And o registro do filme de id "789" deve constar na lista
   And nenhum outro filme deve constar na lista

Scenario: Registrar novo filme no histórico
    Given que o usuário está logado
    And não possui nenhum registro de histórico para o filme "Cidadão Kane" no dia "26/04/2026" para o usuário
    When é enviada uma requisição para salvar o progresso do filme "Cidadão Kane" com tempo assistido de "120" minutos no dia "26/04/2026"
    Then deve existir um novo registro para o filme "Cidadão Kane" no dia "26/04/2026"
    And ele deve ter o tempo assistido de "120" minutos

Scenario: Atualizar progresso de filme reassistido no mesmo dia
    Given que o usuário está logado 
    And possui um registro de histórico para o filme "Casablanca" no dia "25/04/2026" com tempo assistido de "20" minutos
    When é enviada uma requisição para salvar o progresso do filme "Casablanca" com tempo assistido de "80" minutos no dia "25/04/2026"
    Then deve existir apenas um registro para o filme "Casablanca" no dia "25/04/2026"
    And deve ter o tempo assistido atualizado de "80" minutos

Scenario: Registrar múltiplas visualizações do mesmo filme em dias diferentes
    Given que o usuário está logado
    And possui um registro de histórico para o filme "Casablanca" no dia "25/04/2026" com tempo assistido de "100" minutos
    When é enviada uma requisição para salvar o progresso do filme "Casablanca" com tempo assistido de "50" minutos no dia "26/04/2026" do usuário
    Then deve existir um novo registro para o filme "Casablanca" no dia "26/04/2026" com tempo assistido de "50" minutos
    And o registro do filme "Casablanca" no dia "25/04/2026" deve permanecer com o tempo assistido de "100" minutos

Scenario: Ocultar um registro específico do histórico
    Given que o usuário está logado
    And possui um registro de histórico para o filme "Casablanca" no dia "20/04/2026"
    When é enviada uma requisição para esconder o registro do filme "Casablanca" do dia "20/04/2026" do usuário
    Then o registro do filme "Casablanca" no dia "20/04/2026" para o usuário passa a constar internamente como oculto no sistema

Scenario: Ocultar todo o histórico quando existem registros
    Given que o usuário está logado
    And possui um registro de histórico para o filme "Casablanca" no dia "20/04/2026"
    And possui um registro de histórico para o filme "Tempos Modernos" no dia "25/04/2026"
    When é enviada uma requisição para ocultar todo o histórico do usuário
    Then os registros de "Casablanca" e "Tempos Modernos" para o usuário passam a constar internamente como ocultos no sistema

Scenario: Ocultar todo o histórico quando não existem registros 
    Given que o usuário está logado
    And o histórico do usuário está completamente vazio no sistema
    When eu solicito esconder todo o histórico do usuário
    Then o servidor retorna uma resposta de erro notificando que a operação é inválida
    And o histórico do usuário permanece completamente vazio no sistema
