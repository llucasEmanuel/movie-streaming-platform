Feature: Login de Usuário
  Como um usuário cadastrado na plataforma
  Eu desejo realizar login com minhas credenciais
  Para que eu possa acessar minha conta e utilizar as funcionalidades da plataforma

  @gui @login
  Scenario: Acessar a tela de login a partir da tela inicial
    Given eu estou na tela inicial do CInema
    When eu seleciono a opção "Fazer Login"
    Then a tela de login deve ser exibida

  @gui @login
  Scenario: Login realizado com sucesso
    Given eu estou na tela de login
    And existe uma conta ativa cadastrada com o e-mail "alvaro@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When eu preencho o campo de login "e-mail" com "alvaro@teste.com"
    And eu preencho o campo de login "senha" com "Senha@123"
    And eu seleciono a opção de login "Entrar"
    Then a página principal da plataforma deve ser exibida
    And a sessão do usuário deve permanecer ativa

  @gui @login
  Scenario: Tentar realizar login com senha incorreta
    Given eu estou na tela de login
    And existe uma conta ativa cadastrada com o e-mail "recife@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When eu preencho o campo de login "e-mail" com "recife@teste.com"
    And eu preencho o campo de login "senha" com "senha_incorreta"
    And eu seleciono a opção de login "Entrar"
    Then deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  @gui @login
  Scenario: Tentar realizar login com e-mail não cadastrado
    Given eu estou na tela de login
    And não existe uma conta cadastrada com o e-mail "usuario_inexistente@teste.com"
    When eu preencho o campo de login "e-mail" com "usuario_inexistente@teste.com"
    And eu preencho o campo de login "senha" com "Senha@123"
    And eu seleciono a opção de login "Entrar"
    Then deve exibir a mensagem "E-mail ou senha inválidos"
    And a tela de login deve continuar sendo exibida

  @gui @login
  Scenario: Tentar realizar login com campos obrigatórios vazios
    Given eu estou na tela de login
    When eu preencho o campo de login "e-mail" com ""
    And eu preencho o campo de login "senha" com ""
    And eu seleciono a opção de login "Entrar"
    Then deve exibir a mensagem "Preencha todos os campos obrigatórios"
    And a tela de login deve continuar sendo exibida

  @gui @login
  Scenario: Usuários diferentes acessam suas próprias playlists após login
    Given eu estou na tela de login
    And existe uma conta ativa cadastrada com o e-mail "alvaro@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When eu preencho o campo de login "e-mail" com "alvaro@teste.com"
    And eu preencho o campo de login "senha" com "Senha@123"
    And eu seleciono a opção de login "Entrar"
    And eu acesso a página "Minhas Playlists"
    Then as playlists exibidas devem pertencer ao usuário logado