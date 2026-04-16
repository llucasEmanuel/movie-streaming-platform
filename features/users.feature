Feature: Users

    Como um usuário da plataforma
    Eu desejo ter uma conta e personalizar livremente o meu perfil
    Para que eu seja único na plataforma e tenha uma experiência personalizada

Scenario: Criação de uma nova conta
    Given eu estou na tela "Página inicial"  
    When eu seleciono "Cadastrar nova conta"
    And Preencho username com "llucasEmanuel"
    And Preencho senha com "lukinhas#123"
    And Preencho email com "lluukkaass62@gmail.com"
    And Seleciono "Cadastrar"
    Then Eu devo ver uma mensagem de confirmação "Conta criada com sucesso"

Scenario: Erro ao criar uma nova conta
    Given eu estou na tela "Página inicial"
    When eu seleciono "Cadastrar nova conta"
    And Preencho username com "llucasEmanuel"
    And Preencho senha com "321"
    And Preencho email com "lluukkaass62@gmail.com"
    And Seleciono "Cadastrar"
    Then Eu devo ver uma mensagem de erro "Erro ao criar conta: Senha deve ter no mínimo 8 dígitos"

Scenario: Atualização da conta
    Given eu estou logado como "abobrinha" e acesso a tela "Editar perfil"
    When eu altero o meu "Nickname" para "pepino"
    And faço o upload de uma nova imagem para o "Banner" e para a "Foto de perfil" 
    And escrevo na descrição: "o maior fã de filmes do adam sandler" 
    And seleciono em "Salvar alterações" 
    Then o sistema deve exibir a mensagem "Perfil atualizado com sucesso!" 
    And ao acessar minha página pública, todos os usuários devem ver o novo nickname, as novas imagens e a descrição atualizada 

Scenario: Erro ao atualizar a perfil
    Given eu estou logado como "abobrinha" e acesso a tela "Editar perfil"
    When eu altero o meu "Nickname" para "admin"
    And faço o upload de uma nova imagem para o "Banner" e para a "Foto de perfil" 
    And escrevo na descrição: "o maior fã de filmes do adam sandler" 
    And seleciono em "Salvar alterações" 
    Then o sistema deve exibir a mensagem "Erro ao atualizar perfil: Já existe alguém com o Nickname 'admin'" 
    And o sistema deve exibir a mensagem "Tente novamente com outro nome de usuário"
    And ao acessar minha página pública, todos os usuários devem ver as informações do perfil antes da tentativa de atualização

Scenario: Login com perfil não cadastrado
    Given eu estou na tela "Página inicial" 
    And eu preencho username com "llucasEmanuel"
    And eu preencho senha com "lukinhas#123"
    And eu seleciono "Logar"
    Then eu recebo a mensagem "Conta não cadastrada. Impossível fazer login."

Scenario: Remoção de usuário
    Given eu estou logado como "llucasEmanuel"
    And eu estou na tela "Meu perfil"
    When eu seleciono "Remover conta"
    And eu confirmo a escolha com "Confirmo que quero remover a conta"
    Then o sistema deve mostrar a mensagem "Conta removida com sucesso"

Scenario: Recuperação de conta
    Given eu estou na tela "Página inicial"
    And eu seleciono "Esqueci minha senha"
    When eu preencho "piedrito123@gmail.com" como email de recuperação
    And eu recebo um email requisitando uma nova senha
    And eu preencho "piedrito456" como nova senha
    And eu seleciono "Confirmar"
    Then eu recebo uma mensagem de confirmação "Nova senha salva"
    And eu posso logar com a minha conta e com a nova senha