Feature: Edição de perfil
  Como um usuário da plataforma
  Eu desejo ter a opção de editar as informações do meu perfil (nome, foto, bio)
  Para que eu possa manter atualizar e personalizar meus dados 

Scenario: Visualizar perfil do usuário

Given o usuário está logado
When acessa a tela de perfil
Then o sistema exibe os dados cadastrados do usuário

Scenario: Editar perfil com sucesso

Given o usuário está logado
And está na tela de perfil
When altera seu nome ou email
And seleciona a opção "Salvar"
Then o sistema atualiza os dados do perfil
And exibe uma mensagem de sucesso

Scenario: Falha ao editar perfil com email já utilizado

Given o usuário está na tela de edição de perfil
When tenta alterar seu email para um email já usado por outra conta
Then o sistema exibe uma mensagem de erro
And os dados antigos são mantidos

Scenario: Editar perfil sem alterar dados

Given o usuário está na tela de edição de perfil
When seleciona "Salvar" sem modificar nenhum campo
Then o sistema mantém os dados atuais
And exibe uma mensagem informando que não houve alterações

Scenario: Falha ao editar perfil com email inválido

Given o usuário está na tela de edição de perfil
When insere um email em formato inválido
And tenta salvar
Then o sistema exibe mensagem de erro de validação
And não atualiza os dados

Scenario: Alterar nome do usuário com sucesso

Given o usuário está logado
And está na tela de perfil
When altera apenas o nome
And salva as alterações
Then o sistema atualiza o nome do usuário corretamente

Scenario: Cancelar edição de perfil

Given o usuário está editando seu perfil
When seleciona a opção "Cancelar"
Then o sistema descarta as alterações feitas
And mantém os dados originais
And exibe uma mensagem informando que não houve alterações

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
