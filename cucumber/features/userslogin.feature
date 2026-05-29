Feature: Login de Usuário
  Como um usuário cadastrado na plataforma
  Eu desejo realizar login com minhas credenciais ou com uma conta Google vinculada
  Para que eu possa acessar minha conta e utilizar as funcionalidades da plataforma

  Scenario: Login realizado com sucesso
    Given eu estou na tela de login
    And existe uma conta ativa cadastrada com o e-mail "alvaro@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When eu preencho o campo "e-mail" com "alvaro@teste.com"
    And eu preencho o campo "senha" com "Senha@123"
    And eu seleciono a opção "Entrar"
    Then o sistema deve autenticar o usuário
    And a página principal da plataforma deve ser exibida
    And a sessão do usuário deve permanecer ativa

  Scenario: Tentar realizar login com senha incorreta
    Given eu estou na tela de login
    And existe uma conta ativa cadastrada com o e-mail "recife@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When eu preencho o campo "e-mail" com "recife@teste.com"
    And eu preencho o campo "senha" com "senha_incorreta"
    And eu seleciono a opção "Entrar"
    Then o sistema não deve autenticar o usuário
    And deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  Scenario: Tentar realizar login com e-mail não cadastrado
    Given eu estou na tela de login
    And não existe uma conta cadastrada com o e-mail "usuario_inexistente@teste.com"
    When eu preencho o campo "e-mail" com "usuario_inexistente@teste.com"
    And eu preencho o campo "senha" com "Senha@123"
    And eu seleciono a opção "Entrar"
    Then o sistema não deve autenticar o usuário
    And deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  Scenario: Tentar realizar login com campos obrigatórios vazios
    Given eu estou na tela de login
    When eu preencho o campo "e-mail" com ""
    And eu preencho o campo "senha" com ""
    And eu seleciono a opção "Entrar"
    Then o sistema não deve enviar a tentativa de autenticação
    And deve exibir a mensagem "Preencha todos os campos obrigatórios"
    And a tela de login deve continuar sendo exibida

  Scenario: Login bem-sucedido via Google SSO
    Given eu estou na tela de login
    And existe uma conta ativa vinculada ao e-mail "alvaro@teste.com"
    And o e-mail "alvaro@teste.com" está associado a uma conta Google válida
    When eu seleciono a opção "Entrar com Google"
    And concluo a autenticação pela conta Google
    Then o sistema deve autenticar o usuário
    And a página principal da plataforma deve ser exibida
    And a sessão do usuário deve permanecer ativa