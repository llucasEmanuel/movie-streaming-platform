Scenario: Realizar login com sucesso
Given eu estou na página “Login”
And existe uma conta ativa cadastrada com o e-mail “alvaro@teste.com”
And a senha cadastrada para essa conta é “Senha@123”
When eu informo o e-mail “alvaro@teste.com”
And informo a senha “Senha@123”
And seleciono a opção “Entrar”
Then o sistema autentica o usuário
And a página principal da plataforma é exibida
And a sessão do usuário permanece ativa

Scenario: Tentar realizar login com senha incorreta
Given eu estou na página “Login”
And existe uma conta ativa cadastrada com o e-mail “recife@teste.com”
And a senha cadastrada para essa conta é “Senha@123”
When eu informo o e-mail “recife@teste.com”
And informo a senha “SenhaErrada@123”
And seleciono a opção “Entrar”
Then o sistema não autentica o usuário
And o sistema exibe a mensagem “E-mail ou senha inválidos”
And a página “Login” continua sendo exibida