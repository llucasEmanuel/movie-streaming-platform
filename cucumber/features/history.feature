Feature: Histórico de Conteúdos Assistidos
    As a usuário do sistema
    I want to acessar uma página que liste, em ordem cronológica inversa, todos os vídeos que assisti anteriormente, exibindo a data e a % assistida
    So that eu possa ter um registro organizado do meu consumo e encontrar facilmente conteúdos para rever ou recomendar.

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

Scenario: Bloquear acesso ao histórico sem estar logado
    Given que o usuário não está logado
    When o usuário tenta acessar a página "Meu Histórico"
    Then o usuário deve ser ver a mensagem "Não é possível visualizar o histórico sem estar logado"
    And o usuário deve ser redirecionado para a página "Login"

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

Scenario: Remover filme do histórico
    Given que o usuário está logado
    And tem os filmes "Casablanca" e "Tempos Modernos" no seu histórico de filmes assistidos
    When o usuário solicita a remoção do filme "Casablanca" do seu histórico
    Then ele deve ver uma mensagem de confirmação "Filme removido com sucesso"
    And o filme "Casablanca" não deve mais estar visível na página "Meu Histórico"
    And o filme "Tempos Modernos" deve permanecer listado como conteúdo assistido

Scenario: Remover filme inexistente do histórico
    Given que o usuário está logado
    And tem apenas o filme "Tempos Modernos" no seu histórico de filmes assistidos
    When o usuário solicita a remoção do filme "Casablanca" do seu histórico
    Then ele deve ver uma mensagem de erro

Scenario: Apagar histórico Completo
    Given que o usuário está logado
    And tem os filmes "Casablanca" e "Tempos Modernos" no seu histórico de filmes assistidos
    When o usuário solicita a exclusão de todo o histórico
    Then o usuário deve ver uma mensagem de confirmação de sucesso
    And nenhum filme deve estar visível na página "Meu Histórico"

Scenario: Histórico Vazio
    Given que o usuário está logado
    And não possui nenhum filme no histórico de filmes assistidos
    When o usuário acessa a página "Meu Histórico"
    Then o usuário não deve ver nenhum título de filme listado
    And o usuário deve ver uma mensagem informando que o histórico está vazio 


