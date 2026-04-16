Scenario: Contabilização de visualização após 50% de reprodução 
    Given o usuário "Iago" assiste ao vídeo "Aprenda C++"  com “1000” visualizações
    And "Iago" ainda não gerou uma visualização para este vídeo 
    When o sistema recebe o aviso de que o progresso ultrapassou “50%”
    Then o sistema atualiza o tempo atual no histórico de "Iago" 
    And incrementa os views totais do vídeo para “1001” 
    And registra a visualização de "Iago" para evitar contagens duplicadas no futuro

Scenario: Exclusão de conta com deleção em cascata 
    Given a usuária "Ana Clara" tem um canal chamado “Canal da Ana” com vídeos no servidor 
    And o usuário "Pedro" possui um vídeo de “Ana Clara” em sua lista "Assistir Mais Tarde" 
    When o sistema valida o pedido de exclusão permanente da conta de "Ana Clara" 
    Then o sistema apaga permanentemente o perfil, o canal e os vídeos de “Ana Clara”
    And remove o vídeo deletado da lista do usuário “Pedro”
    And encerra a sessão retornando um estado de sucesso

Scenario: Falha na recuperação de conta com e-mail não cadastrado
    Given que um visitante acessa a tela de recuperação de senha
    When ele solicita a recuperação inserindo o e-mail "usuario_inexistente@email.com"
    Then o sistema exibe a mensagem de erro "E-mail não encontrado na nossa base de dados"
    And não envia nenhum e-mail com link de redefinição de senha

Scenario: Falha ao tentar se inscrever em um canal sem estar logado
    Given que um visitante está assistindo a um vídeo anonimamente (sem login)
    When ele clica no botão "Inscrever-se" no canal "Aprenda C++"
    Then o sistema não registra a inscrição
    And redireciona o visitante para a tela de login com a mensagem "Faça login para se inscrever neste canal"
    And oferece a opção de realizar o login simplificado via Google SSO para agilizar a inscrição