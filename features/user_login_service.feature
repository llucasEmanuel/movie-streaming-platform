Feature: Login de Usuário
  Como serviço de autenticação da plataforma
  Eu desejo validar credenciais de usuários cadastrados
  Para permitir acesso seguro às funcionalidades da aplicação

  Scenario: Login realizado com sucesso
    Given existe uma conta ativa cadastrada com o e-mail "alvaro@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When uma tentativa de login for realizada com o e-mail "alvaro@teste.com" e senha "Senha@123"
    Then o serviço deve autenticar o usuário
    And o serviço deve manter a sessão do usuário ativa
    And o serviço deve liberar o acesso à plataforma

  Scenario: Tentar realizar login com senha incorreta
    Given existe uma conta ativa cadastrada com o e-mail "recife@teste.com"
    And a senha cadastrada para essa conta é "Senha@123"
    When uma tentativa de login for realizada com o e-mail "recife@teste.com" e senha "senha_incorreta"
    Then o serviço não deve autenticar o usuário
    And o serviço deve informar a mensagem "E-mail ou senha inválidos"

  Scenario: Tentar realizar login com e-mail não cadastrado
    Given não existe uma conta cadastrada com o e-mail "usuario_inexistente@teste.com"
    When uma tentativa de login for realizada com o e-mail "usuario_inexistente@teste.com" e senha "Senha@123"
    Then o serviço não deve autenticar o usuário
    And o serviço deve informar a mensagem "E-mail ou senha inválidos"

  Scenario: Tentar realizar login com campos obrigatórios vazios
    When uma tentativa de login for realizada com e-mail vazio e senha vazia
    Then o serviço não deve processar a autenticação
    And o serviço deve informar a mensagem "Preencha todos os campos obrigatórios"

  Scenario: Login bem-sucedido via Google SSO
    Given existe uma conta ativa vinculada ao e-mail "alvaro@teste.com"
    And o e-mail "alvaro@teste.com" está associado a uma conta Google válida
    When uma tentativa de login via Google for realizada para o e-mail "alvaro@teste.com"
    Then o serviço deve autenticar o usuário
    And o serviço deve manter a sessão do usuário ativa
    And o serviço deve liberar o acesso à plataforma

  Scenario: Tentar realizar login com senha em conta criada via Google
    Given existe uma conta ativa vinculada ao e-mail "alvaro@teste.com"
    When uma tentativa de login for realizada com o e-mail "alvaro@teste.com" e senha "Senha@123"
    Then o serviço não deve autenticar o usuário
    And o serviço deve informar a mensagem "E-mail ou senha inválidos"