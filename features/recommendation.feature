Feature: Recomendações e Seções Personalizadas
    As a usuário da plataforma 
    I want receber sugestões de conteúdo baseadas no meu histórico e preferências
    So that eu possa descobrir novos filmes do meu interesse de forma rápida e personalizada


Scenario: Exibir seção de filmes parecidos com um título assistido
    Given que o usuário está logado
    And assisti recentemente ao filme de ficção científica "Círculo de fogo" 
    When eu acesso a página inicial da plataforma 
    Then devo ver uma seção intitulada "Porque você assistiu Círculo de fogo" 
    And esta seção deve conter o filme "Matrix" na lista de sugestões 

Scenario: Exibir conteúdos populares para usuário sem histórico
    Given que o usuário "Usuario1" acabou de realizar o primeiro login
    And ainda não possui nenhum filme no histórico de visualização 
    When acessar a área de recomendações personalizadas
    Then o sistema deve exibir a seção "Lançamentos e Populares" no topo da página 
    And não deve ser exibida nenhuma seção de recomendações baseada em gostos pessoais

Scenario: Recomendar filmes de um gênero frequentemente assistido
    Given que o usuário assistiu a mais de 5 filmes do gênero "Comédia" na última semana 
    When o usuário acessa a seção "Recomendados" 
    Then a seção "Filmes do seu gênero favorito: Comédia" deve ser exibida 
    And o filme "Invocação do Mal" deve aparecer entre as primeiras opções desta seção

Scenario: Sugerir conteúdos de drama para entusiastas do gênero
    Given que o usuário assistiu a 10 filmes no último mês
    And 8 desses filmes pertencem ao gênero "Drama"
    When o usuário acessa a página principal da plataforma
    Then o sistema deve exibir uma seção chamada "Especialmente para você: Drama"
    And o filme "Oppenheimer" deve estar presente nesta seção

Scenario: Atualizar recomendações após assistir novo conteúdo
    Given que o usuário tinha "Ação" como seu gênero predominante
    And ele assiste a 3 novos filmes do gênero "Documentário" em uma única sessão
    When ele retorna à página inicial
    Then o sistema deve incluir uma nova seção de "Recomendações de Documentários"
    And a seção de "Ação" deve ser movida para uma posição inferior na página

Scenario: Limpeza de histórico remove personalização
    Given que o usuário tinha recomendações baseadas no filme "Vingadores"
    And ele utiliza a função "Apagar histórico completo"
    When ele volta para a página inicial
    Then a seção "Porque você assistiu Vingadores" deve ter sido removida
    And a conta deve voltar ao estado padrão de um usuário novo

Scenario: Ocultar seção de gênero quando não há dados suficientes
    Given que o usuário assistiu apenas 1 filme de "Terror"
    And a regra de negócio exige no mínimo 3 filmes para personalizar o gênero
    When ela visualiza a seção "Recomendados"
    Then o sistema não deve exibir a seção "Porque você assiste Terror"
    And deve sugerir que o usuário continue assistindo filmes para receber dicas melhores

Scenario Outline: Sugerir filmes conforme o gênero mais assistido
    Given que o usuário assistiu ao filme <filme_visto>
    And este filme pertence ao gênero <genero>
    When o usuário carrega a página inicial
    Then o sistema deve exibir a seção de recomendações de <genero>
    And o título <sugestao> deve estar presente

Examples:
filme_visto      |genero             |sugestao
"Interestelar"   |"Ficção Científica"|"A Chegada"
"O Exorcista"    |"Terror"           |"Invocação do Mal"
"Cabras da peste"|"Comédia"          |"Superbad"