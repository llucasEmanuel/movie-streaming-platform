Feature: Login de Usuário
  Como um usuário cadastrado na plataforma
  Eu desejo realizar login com minhas credenciais (email e senha) ou com uma conta google vinculada
  Para que eu possa acessar minha conta e utilizar as funcionalidades da plataforma

  Scenario: Login realizado com sucesso
    Given o usuário está na tela de login
    And existe uma conta ativa cadastrada com o e-mail "alvaro@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When o usuário informa o e-mail "alvaro@teste.com"
    And informa a senha "Senha@123"
    And seleciona a opção "Entrar"
    Then o sistema deve autenticar o usuário
    And a página principal da plataforma deve ser exibida
    And a sessão do usuário deve permanecer ativa

  Scenario: Tentar realizar login com senha incorreta
    Given o usuário está na tela de login
    And existe uma conta ativa cadastrada com o e-mail "recife@teste.com"
    When o usuário informa o e-mail "recife@teste.com"
    And informa uma senha incorreta
    And seleciona a opção "Entrar"
    Then o sistema não deve autenticar o usuário
    And deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  Scenario: Tentar realizar login com e-mail não cadastrado
    Given o usuário está na tela de login
    And não existe uma conta cadastrada com o e-mail "usuario_inexistente@teste.com"
    When o usuário informa o e-mail "usuario_inexistente@teste.com"
    And informa uma senha qualquer
    And seleciona a opção "Entrar"
    Then o sistema não deve autenticar o usuário
    And deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  Scenario: Tentar realizar login com campos obrigatórios vazios
    Given o usuário está na tela de login
    When o usuário deixa o campo de e-mail vazio
    And deixa o campo de senha vazio
    And seleciona a opção "Entrar"
    Then o sistema não deve enviar a tentativa de autenticação
    And deve exibir a mensagem "Preencha todos os campos obrigatórios"
    And a tela de login deve continuar sendo exibida

  Scenario: Login bem-sucedido via Google SSO
    Given o usuário está na tela de login
    And existe uma conta ativa vinculada ao e-mail "alvaro@teste.com"
    And o e-mail "alvaro@teste.com" está associado a uma conta Google válida
    When o usuário seleciona a opção "Entrar com Google"
    And conclui a autenticação pela conta Google
    Then o sistema deve autenticar o usuário
    And a página principal da plataforma deve ser exibida
    And a sessão do usuário deve permanecer ativa