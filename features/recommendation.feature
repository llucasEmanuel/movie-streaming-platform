Feature: Recomendações e Seções Personalizadas
    As a usuário da plataforma 
    I want receber sugestões de conteúdo baseadas no meu histórico e preferências
    So that eu possa descobrir novos filmes de forma rápida e personalizada

Scenario: Exibir recomendações padrão para novo usuário
    Given eu acesso o sistema como "usuário"
    And eu não possuo histórico de visualização
    And eu estou na página "Principal"
    When eu acesso a página "Recomendados"
    Then a página "Recomendados" deve exibir a playlist "Lançamentos e Populares" em destaque na página 
    And não deve ser exibida nenhuma seção de recomendações baseada em gostos pessoais

Scenario Outline: Priorizar recomendações com base no gênero mais assistido
    Given eu acesso o sistema como "usuário"
    And eu assisti a "6" filmes do gênero "<tipo>" nos últimos "7" dias
    And eu estou na pagina "Principal"
    When eu acesso a página "Recomendados"
    Then a página "Recomendados" exibe a playlist "<recomendacao>" entre as 3 primeiras seções
    And a playlist "<recomendacao>" contém os filmes do gênero "<tipo>"

    Examples:
    |tipo    |recomendacao            |   
    |Comédia |Recomendações de Comédia| 
    |Terror  |Recomendações de Terror |  
    |Ação    |Recomendações de Ação   |          

Scenario: Atualizar recomendações após nova interação do usuário
    Given eu acesso o sistema como "usuário"
    And eu assisti a "2" filmes do gênero "Ação" nos últimos "7" dias
    And eu assisti a "4" filmes do gênero "Documentário" nos últimos "7" dias
    When eu assistir a um novo filme do gênero "Documentário"
    And eu acessar a seção "Recomendados"
    Then a página "Recomendados" exibe a playlist "Recomendações de Documentários" acima da playlist "Ação"
    And a playlist "Recomendações de Documentários" contém os filmes do gênero "Documentário"

Scenario: Remover personalização após limpeza do histórico
    Given eu acesso o sistema como "usuário"
    And possuo no histórico o filme "Vingadores"
    And o página "Recomendados" exibe a playlist "Porque você assistiu Vingadores"
    When eu seleciono a opção "Apagar histórico completo"
    And eu acesso a página "Recomendados"
    Then o página "Recomendados" não exibe a playlist "Porque você assistiu Vingadores"
    And a página "Recomendados" exibe a playlist "Lançamentos e Populares"
    And a página "Recomendados" não exibe seções personalizadas baseadas em histórico

Scenario: Não exibir recomendações de gênero quando não há dados suficientes
    Given eu acesso o sistema como "usuário"
    And eu assisti a "1" filme do gênero "Terror"
    And a regra de negócio exige no mínimo "3" filmes do mesmo gênero para gerar recomendações
    When eu acesso a página "Recomendados"
    Then a página "Recomendados" não exibe a playlist "Recomendações de Terror"
    And a página "Recomendados" exibe a mensagem "Assista mais conteúdos para melhorar suas recomendações"

Scenario Outline: Gerar recomendações baseadas em filme específico assistido
    Given eu acesso o sistema como "usuário"
    And eu possuo no histórico o filme "<filme_visto>"
    And eu estou na página "Principal"
    When eu acesso a página "Recomendados"
    Then a página "Recomendados" exibe a playlist "Porque você assistiu <filme_visto>"
    And a playlist "Porque você assistiu <filme_visto>" contém o filme "<filme_recomendado>"

    Examples:
    |filme_visto     |filme_recomendado|
    |Cabras da peste |Superbad         |
    |Vingadores      |Liga da Justiça  | 
    |Círculo de Fogo |Matrix           |

Scenario: Atualizar seções após remoção parcial do histórico
    Given eu acesso o sistema como "usuário"
    And eu estou na página "Recomendados"
    And eu possuo no histórico os filmes "Vingadores" e "Titanic"
    And a playlist "Porque você assistiu Vingadores" está disponível
    And a playlist "Porque você assistiu Titanic" está disponível
    When eu removo o filme "Vingadores" do histórico
    And eu atualizo a página "Recomendados"
    Then a página "Recomendados" não exibe a playlist "Porque você assistiu Vingadores"
    And a página "Recomendados" exibe a playlist "Porque você assistiu Titanic"

Scenario: Restringir acesso para usuário não autenticado
    Given eu não está logado na plataforma
    When eu acesso a página "Principal"
    Then o sistema exibe a mensagem "Faça login para acessar o conteúdo"
    And o sistema não exibe "Páginas"
    And o sistema não exibe "Playlists"

Scenario: Gerar recomendações após atingir o mínimo de filmes no gênero
    Given eu acesso o sistema como "usuário"
    And eu assisti a "2" filmes do gênero "Terror"
    And a regra de negócio exige no mínimo "3" filmes do mesmo gênero para gerar recomendações
    When eu assisto ao filme "Invocação do Mal"
    And eu acesso a página "Recomendados"
    Then a página "Recomendados" exibe a playlist "Recomendações de Terror"
    And a playlist "Recomendações de Terror" contém os filmes do gênero "Terror"
