Feature: Continuar Assistindo
    As a usuário do sistema
    I want to visualizar os vídeos que não terminei de assistir em uma seção de destaque com a indicação do progresso atual
    So that eu possa continuar assistindo de onde parei com facilidade.
    Scenario: Visualizar progresso de um vídeo não finalizado

Given que o usuário está logado
    And assistiu "40%" do filme "Tempos Modernos"
    When o usuário acessa a seção "Assistidos Recentemente" na página inicial
    Then o usuário deve ver o filme "Tempos Modernos" como o primeiro item da seção
    And o card do filme deve indicar o progresso "40%"

Scenario: Retomar filmes não finalizados
    Given que o usuário está logado
    And o usuário possui um histórico de visualização de "40%" do filme "Tempos Modernos"
    When o usuário seleciona o filme "Tempos Modernos" na seção "Assistidos Recentemente"
    Then a reprodução do filme "Tempos Modernos" deve iniciar a partir de "40%"
    And o progresso assistido deve continuar sendo atualizado durante a reprodução

Scenario: Esvaziar "Assistidos Recentemente" ao apagar histórico
    Given que o usuário está logado
    And o usuário possui um histórico de visualização de "40%" do filme "Tempos Modernos"
    When o usuário solicita a exclusão de todo o histórico
    And acessa a seção "Assistidos Recentemente" na página inicial
    Then a seção "Assistidos Recentemente" deve estar vazia
    And o filme "Tempos Modernos" não deve estar visível na seção "Assistidos Recentemente"

Scenario: Remover filme da lista
    Given que o usuário está logado
    And o usuário possui um histórico de visualização de "40%" do filme "Tempos Modernos"
    When o usuário solicita a remoção do filme "Tempos Modernos" da seção "Assistidos Recentemente"
    Then eu devo ver uma mensagem de confirmação de sucesso
    And o filme "Tempos Modernos" não deve mais estar visível na seção "Assistidos Recentemente"

