Feature: Edição de perfil
  Como um usuário da plataforma
  Eu desejo ter a opção de editar as informações do meu perfil (nome, foto, e-mail, senha)
  Para que eu possa atualizar e personalizar meus dados 

Scenario: Visualizar perfil do usuário

Given o usuário está logado
When o usuário acessa a tela de perfil
Then o sistema exibe os dados cadastrados do usuário

Scenario: Atualizar campo e-mail com valor válido

Given o usuário está na tela de edição de perfil
When o usuário altera o e-mail para "teste@email.com"
And seleciona "Salvar alterações"
Then o sistema atualiza o campo e-mail com "teste@email.com"
And o sistema exibe a mensagem "Alterações salvas com sucesso"

Scenario: Falha ao editar perfil com email inválido

Given o usuário está na tela de edição de perfil
When insere um email em formato inválido
And seleciona "Salvar alterações"
Then o sistema exibe a mensagem "Falha ao salvar alterações. E-mail inválido"
And não atualiza os dados

Scenario: Cancelar edição de e-mail

Given o usuário está na tela de edição de perfil
When altera o campo e-mail 
And seleciona a opção "Cancelar"
Then o sistema descarta as alterações feitas
And o sistema mantém o valor original do e-mail
And o sistema exibe a mensagem "Nenhuma alteração foi realizada"

Scenario: Editar perfil sem alterar dados

Given o usuário está na tela de edição de perfil
When seleciona "Salvar" sem modificar nenhum campo
Then o sistema mantém os dados atuais
And exibe uma mensagem informando que não houve alterações

Scenario: Falha ao editar perfil com email já utilizado

Given o usuário está na tela de edição de perfil
When tenta alterar seu email para um email já usado por outra conta
Then o sistema exibe uma mensagem de erro
And os dados antigos são mantidos

Scenario: Alterar nome do usuário com sucesso

Given o usuário está logado
And está na tela de perfil
When altera apenas o nome
And salva as alterações
Then o sistema atualiza o nome do usuário corretamente

Scenario: Persistência dos dados após atualização

Given o usuário alterou seus dados com sucesso
When sai e retorna à tela de perfil
Then o sistema exibe os dados atualizados

Scenario: Falha ao salvar devido a erro interno

Given o usuário está na tela de edição de perfil
When tenta salvar alterações
And ocorre um erro interno no sistema
Then o sistema exibe uma mensagem de erro
And os dados não são alterados

Scenario: Atualizar múltiplos campos simultaneamente

Given o usuário está na tela de edição de perfil
When altera nome e email simultaneamente
And salva
Then o sistema atualiza ambos os campos corretamente
And exibe uma mensagem de sucesso

Scenario: Atualizar foto de perfil

Given o usuário está na tela de edição de perfil
When altera a sua foto com um arquivo de imagem válido
And salva
Then o sistema atualiza o campo foto de perfil corretamente
And exibe uma mensagem de sucesso

Scenario: Atualizar foto de perfil enviando arquivo de imagem inválido

Given o usuário está na tela de edição de perfil
When altera a sua foto com um arquivo de imagem inválido
And salva
Then o sistema exibe uma mensagem de erro
And os dados não são alterados

Scenario: Atualizar senha de perfil com senha válida

Given o usuário está na tela de edição de perfil
When altera a sua senha com uma senha válida
And salva
Then o sistema atualiza o campo 'senha' corretamente
And exibe uma mensagem de sucesso

Scenario: Atualizar senha com senha inválida

Given o usuário está na tela de edição de perfil
When altera a sua senha com uma senha inválida
And salva
Then o sistema exibe uma mensagem de erro
And os dados não são alterados
