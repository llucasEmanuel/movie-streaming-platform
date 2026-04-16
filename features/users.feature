Feature: Users

    Como um usuário da plataforma
    Eu desejo gerenciar minha conta, autenticar-me e acessar meus dados personalizados
    Para que eu possa utilizar a plataforma com segurança e ter uma experiência personalizada

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
    And Preencho senha com "123"
    And Preencho email com "lluukkaass62@gmail.com"
    And Seleciono "Cadastrar"
    Then Eu devo ver uma mensagem de erro "Erro ao criar conta: Senha deve ter no mínimo 8 dígitos"

Scenario: Atualização da conta
    Given eu estou logado como "abobrinha" e acesso a tela "Editar perfil"
    When eu altero o meu "Nickname" para "REPOLHOROXO"
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
    And ao acessar minha página pública, todos os usuários devem ver as informações do perfil antes da tentativa de atualização

Scenario: Realizar login com e-mail e senha válidos
    Given eu estou na tela "Login"
    And possuo uma conta verificada com email "alvaroooo@email.com" e senha "Pass@12345678"
    When eu preencho email com "alvaro@email.com"
    And preencho senha com "Pass@12345678"
    And seleciono "Entrar"
    Then eu devo ser autenticado no sistema
    And devo ser redirecionado para a tela "Página inicial"

Scenario: Encerrar sessão com sucesso
    Given eu estou logado como "alvaro@email.com"
    And estou na tela "Página inicial"
    When eu seleciono "Sair"
    Then o sistema deve encerrar minha sessão
    And eu devo ser redirecionado para a tela "Login"

Scenario: Erro ao realizar login com senha incorreta
    Given eu estou na tela "Login"
    And possuo uma conta verificada com email "alvaro@email.com"
    When eu preencho email com "alvaro@email.com"
    And preencho senha com "SenhaErrada123"
    And seleciono "Entrar"
    Then eu devo ver uma mensagem de erro "Email ou senha inválidos"
    And devo continuar na tela "Login"

Scenario: Erro ao redefinir senha com código de verificação inválido
    Given eu possuo uma conta cadastrada com email "alvaro@email.com"
    And solicitei recuperação de senha para o email "alvaro@email.com"
    And o código de verificação válido enviado foi "834921"
    When eu informo o código "111111"
    And informo a nova senha "NovaSenha@123"
    And seleciono "Redefinir senha"
    Then eu devo ver uma mensagem de erro "Código de verificação inválido"
    And a senha da conta não deve ser atualizada
    
Scenario: Realizar login com conta Google com sucesso
    Given eu estou na tela "Login"
    And possuo uma conta vinculada ao Google com email "victoria@gmail.com"
    When eu seleciono "Entrar com Google"
    And escolho a conta "victoria@gmail.com"
    Then eu devo ser autenticado no sistema
    And devo ser redirecionado para a tela "Página inicial"
