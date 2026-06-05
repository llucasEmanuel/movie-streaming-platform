Feature: Edição de perfil 
  As a usuário da plataforma 
  I want ter a opção de editar as informações do meu perfil (nome, foto, e-mail, senha) 
  so that eu possa atualizar e personalizar meus dados

Scenario: Visualizar perfil do usuário 
Given o usuário "Carlos" está logado com o e-mail "carlos@email.com" 
When faz uma requisição GET para buscar os dados do perfil 
Then o sistema exibe o nome "Carlos" e o e-mail "carlos@email.com" nos campos cadastrais

Scenario: Atualizar campo e-mail com valor válido
Given o usuário "Carlos" está na tela de edição de perfil com o e-mail atual "carlos@email.com"
When altera o e-mail para "teste@email.com" 
And envia a requisição para a API 
Then o sistema exibe a mensagem "Alterações salvas com sucesso" 
And o perfil de "Carlos" passa a exibir o e-mail "teste@email.com"

Scenario: Falha ao editar perfil com email inválido 
Given o usuário "Carlos" está na tela de edição de perfil com o e-mail atual "carlos@email.com" 
When altera o e-mail para "teste_sem_arroba" (formato inválido) 
And envia a requisição para a API 
Then o sistema exibe a mensagem "Falha ao salvar alterações. E-mail inválido" 
And o e-mail de "Carlos" permanece "carlos@email.com"

Scenario: Cancelar edição de e-mail
Given o usuário "Carlos" está na tela de edição de perfil com e-mail atual "carlos@email.com" 
When altera o e-mail para "teste@email.com" 
And cancela a requisição de atualização 
Then o sistema exibe a mensagem "Nenhuma alteração foi realizada" 
And o sistema mantém o e-mail original "carlos@email.com" no perfil

Scenario: Editar perfil sem alterar dados 
Given o usuário "Carlos" está na tela de edição de perfil
When envia a requisição para a API sem modificar nenhum dado cadastral 
Then o sistema mantém os dados atuais de "Carlos" 
And a resposta da API indica que não houve alterações

Scenario: Falha ao editar perfil com email já utilizado 
Given o usuário "Carlos" está na tela de edição de perfil 
And o sistema já possui a usuária "Maria" cadastrada com o e-mail "maria@email.com" 
When "Carlos" tenta alterar seu e-mail para "maria@email.com" 
And envia a requisição para a API 
Then a API retorna um erro indicando que o e-mail já está em uso
And os dados originais de "Carlos" são mantidos

Scenario: Alterar nome do usuário com sucesso 
Given o usuário "Carlos" está na tela de edição de perfil
When altera apenas o seu nome para "Carlos Silva" 
And envia a requisição para a API 
Then o sistema exibe a mensagem "Alterações salvas com sucesso"
And o perfil passa a exibir o nome atualizado "Carlos Silva"

Scenario: Persistência dos dados após atualização 
Given o usuário "Carlos" atualizou seu nome para "Carlos Silva" com sucesso 
When faz uma nova requisição GET para buscar os dados do perfil após a atualização 
Then o sistema continua exibindo o nome atualizado "Carlos Silva"

Scenario: Falha ao salvar devido a erro interno 
Given o usuário "Carlos" está na tela de edição de perfil 
When altera o seu nome para "Carlos Silva" 
And ocorre uma falha no servidor ao processar a requisição de atualização 
Then a API retorna um erro interno do servidor 
And o nome "Carlos" não é alterado no banco de dados

Scenario: Atualizar múltiplos campos simultaneamente 
Given o usuário "Carlos" está na tela de edição de perfil com o e-mail "carlos@email.com" 
When altera o nome para "Carlos Silva" e o e-mail para "carlos.silva@email.com" simultaneamente 
And envia a requisição para a API 
Then a API retorna uma mensagem indicando sucesso 
And o perfil passa a exibir o nome "Carlos Silva" e o e-mail "carlos.silva@email.com"

Scenario: Atualizar foto de perfil com sucesso 
Given o usuário "Carlos" está na tela de edição de perfil 
When altera a sua foto enviando o arquivo válido "foto_perfil.png" 
And envia a requisição para a API 
Then a API retorna uma mensagem indicando sucesso
And atualiza a foto exibida no perfil para a imagem de "foto_perfil.png"

Scenario: Falha ao atualizar foto enviando arquivo inválido 
Given o usuário "Carlos" está na tela de edição de perfil 
When tenta alterar sua foto enviando o arquivo "curriculo.pdf" (formato inválido) 
And envia a requisição para a API 
Then a API retorna um erro de arquivo inválido 
And a foto original de "Carlos" é mantida

Scenario: Atualizar senha de perfil com senha válida 
Given o usuário "Carlos" está na tela de edição de perfil com a senha "SenhaAntiga123" 
When altera a sua senha informando a nova senha "NovaSenha@2026" 
And envia a requisição para a API 
Then a API retorna uma mensagem indicando sucesso 
And a senha de "Carlos" é atualizada no sistema

Scenario: Atualizar senha com senha inválida 
Given o usuário "Carlos" está na tela de edição de perfil 
When altera a sua senha informando "123" (senha fora do padrão exigido) 
And envia a requisição para a API 
Then a API retorna um erro de validação do padrão da senha 
And a senha original de "Carlos" é mantida intacta

Scenario: Atualizar senha igual à senha atual 
Given o usuário "Carlos" está na tela de edição de perfil com a senha atual "Senha@123" 
When tenta alterar sua senha inserindo "Senha@123" (valor igual à senha atual) 
And envia a requisição para a API 
Then o sistema exibe a mensagem "A nova senha deve ser diferente da atual" 
And a senha original de "Carlos" é mantida intacta no sistema

Scenario: Atualizar e-mail mantendo o mesmo valor 
Given o usuário "Carlos" está na tela de edição de perfil com o e-mail "carlos@email.com" 
When mantém o e-mail "carlos@email.com" sem alterações 
And envia a requisição para a API 
Then o banco de dados mantém os valores originais 
And a resposta da API indica que não houve alterações 

Scenario: Atualizar nome com caracteres inválidos 
Given o usuário "Carlos" está na tela de edição de perfil 
When altera o nome para "Carlos123!@" (contendo caracteres especiais e números inválidos) 
And envia a requisição para a API 
Then o sistema exibe a mensagem "Nome inválido" 
And o nome do perfil permanece "Carlos"

Scenario: Atualizar foto com arquivo muito grande 
Given o usuário "Carlos" está na tela de edição de perfil 
When tenta alterar sua foto enviando o arquivo "foto_alta_resolucao.png" de 15MB (tamanho superior ao limite permitido) 
And envia a requisição para a API 
Then o sistema exibe a mensagem "Arquivo excede o tamanho permitido" 
And a foto original do perfil de "Carlos" não é alterada

Scenario: Interrupção durante atualização de perfil 
Given o usuário "Carlos" está na tela de edição de perfil 
When altera o seu e-mail para "carlos_novo@email.com" 
And a requisição falha simulando erro de conexão 
Then o sistema exibe a mensagem "Erro de conexão. Tente novamente" 
And o e-mail cadastrado permanece o anterior "carlos@email.com"

Scenario: Sessão expirada durante edição de perfil 
Given o usuário "Carlos" está na tela de edição de perfil 
And o token de autenticação expira 
When "Carlos" tenta salvar alterações no seu nome 
Then a API bloqueia a ação e retorna status HTTP 401 Não Autorizado 
And exibe a mensagem "Sessão expirada" 
And nenhum registro do usuário é modificado no banco de dados
