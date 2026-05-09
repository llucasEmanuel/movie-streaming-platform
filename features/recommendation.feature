Feature: Recomendações e Seções Personalizadas
    As a usuário da plataforma 
    I want receber sugestões de conteúdo baseadas no meu histórico e preferências
    So that eu possa descobrir novos filmes de forma rápida e personalizada

Scenario: Exibir recomendações padrão para novo usuário
    Given o usuário está logado na plataforma
    And o usuário não possui histórico de visualização
    And o usuário está na página inicial
    When o usuário acessar a seção "Recomendados"
    Then o sistema deve exibir a playlist "Lançamentos e Populares" na primeira posição da página 
    And não deve ser exibida nenhuma seção de recomendações baseada em gostos pessoais

Scenario Outline: Priorizar recomendações com base no gênero mais assistido
    Given o usuário está logado na plataforma
    And o usuário assistiu a 6 filmes do gênero <tipo> nos últimos 7 dias
    And o usuário está na pagina inicial
    When o usuário acessa a seção "Recomendados"
    Then o sistema exibe a playlist <recomendacao> entre as 3 primeiras seções
    And a playlist <recomendacao> contém os filmes do gênero <tipo>

    Examples:
    |tipo    |recomendacao            |   
    |Comédia |Recomendações de Comédia| 
    |Terror  |Recomendações de Terror |  
    |Ação    |Recomendações de Ação   |          

Scenario: Atualizar recomendações após nova interação do usuário
    Given que o usuário assistiu a 2 filmes do gênero "Ação" nos últimos 7 dias
    And o usuário assistiu a 4 filmes do gênero "Documentário" nos últimos 7 dias
    When o usuário assiste a um novo filme do gênero "Documentário"
    And o usuário acessa a seção "Recomendados"
    Then o sistema exibe a playlist "Recomendações de Documentários" acima da playlist "Ação"
    And a playlist "Recomendações de Documentários" contém os filmes do gênero "Documentário"

Scenario: Remover personalização após limpeza do histórico
    Given que o usuário está logado
    And que o usuário possui no histórico o filme "Vingadores"
    And o sistema exibe a playlist "Porque você assistiu Vingadores"
    When o usuário seleciona a opção "Apagar histórico completo"
    And o usuário acessa a seção "Recomedados"
    Then o sistema não exibe a playlist "Porque você assistiu Vingadores"
    And o sistema exibe a playlist "Lançamentos e Populares"
    And o sistema não exibe seções personalizadas baseadas em histórico

Scenario: Não exibir recomendações de gênero quando não há dados suficientes
    Given que o usuário está logado
    And que o usuário assistiu a 1 filme do gênero "Terror"
    And a regra de negócio exige no mínimo 3 filmes do mesmo gênero para gerar recomendações
    When o usuário acessa a seção "Recomedados"
    Then o sistema não exibe a playlist "Recomendações de Terror"
    And o sistema exibe a mensagem "Assista mais conteúdos para melhorar suas recomendações"

Scenario Outline: Gerar recomendações baseadas em filme específico assistido
    Given que o usuário está logado
    And o usuário possui no histórico o filme <filme_visto>
    And o usuário está na pagina inicial
    When o usuário acessa a seção "Recomedados"
    Then o sistema exibe a playlist "Porque você assistiu <filme_visto>"
    And a playlist "Porque você assistiu <filme_visto>" contém o filme <filme_recomendado>

    Examples:
    |filme_visto     |filme_recomendado|
    |Cabras da peste |Superbad         |
    |Vingadores      |Liga da Justiça  | 
    |Círculo de Fogo |Matrix           |

Scenario: Atualizar seções após remoção parcial do histórico
    Given o usuário está logado na plataforma
    And o usuário está na página principal
    And o usuário possui no histórico os filmes "Vingadores" e "Titanic"
    And a playlist "Porque você assistiu Vingadores" está disponível
    And a playlist "Porque você assistiu Titanic" está disponível
    When o usuário remove o filme "Vingadores" do histórico
    And o usuário atualiza a seção "Recomendados"
    Then o sistema não exibe a playlist "Porque você assistiu Vingadores"
    And o sistema exibe a playlist "Porque você assistiu Titanic"

Scenario: Restringir acesso para usuário não autenticado
    Given o usuário não está logado na plataforma
    When o usuário acessa a página principal
    Then o sistema exibe a mensagem "Faça login para acessar o conteúdo"
    And o sistema não exibe seções
    And o sistema não exibe playlists

Scenario: Gerar recomendações após atingir o mínimo de filmes no gênero
    Given o usuário está logado na plataforma
    And o usuário assistiu a 2 filmes do gênero "Terror"
    And a regra de negócio exige no mínimo 3 filmes do mesmo gênero para gerar recomendações
    When o usuário assiste ao filme "Invocação do Mal"
    And o usuário acessa a seção "Recomendados"
    Then o sistema exibe a playlist "Recomendações de Terror"
    And a playlist "Recomendações de Terror" contém os filmes do gênero "Terror"
