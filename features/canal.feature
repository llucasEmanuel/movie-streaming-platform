Feature: Canais (YouTube)
  Como um criador de conteúdo na plataforma
  Eu desejo gerenciar meu canal e meus vídeos
  Para que eu possa compartilhar conteúdo com diferentes níveis de visibilidade e acompanhar meu engajamento

Scenario: publicar vídeo com sucesso

Given o usuário “João” está na página de gerenciamento do canal
And “João” preenche título, descrição e seleciona um arquivo de vídeo válido
When “João” solicita a publicação do vídeo
Then o sistema exibe a mensagem "Vídeo publicado com sucesso!"
And o sistema exibe o vídeo na lista de vídeos do canal


Scenario: falha ao publicar vídeo com formato inválido

Given o usuário “João” está na página de gerenciamento do canal
And “João” seleciona um arquivo de vídeo em formato não suportado
When “João” solicita a publicação do vídeo
Then o sistema exibe a mensagem "Formato de vídeo não suportado!"
And o sistema não adiciona o vídeo à lista do canal 

Scenario: atualizar informações do canal com sucesso

Given o usuário “João” está na página de edição do canal
And o sistema exibe os dados atuais do canal
When “João” altera o nome e/ou a descrição do canal
And “João” solicita salvar as alterações
Then o sistema exibe a mensagem "Dados do canal atualizados com sucesso"
And o sistema exibe os novos dados atualizados do canal

Scenario: visualizar estatísticas do canal

Given o usuário “João” está na página do canal
And o canal possui vídeos publicados
When “João” solicita a visualização das estatísticas
Then o sistema exibe o número total de visualizações
And o sistema exibe o número de inscritos
And o sistema exibe a quantidade de vídeos do canal

Scenario: publicação do vídeo 

Given o usuário “João” está cadastrado no sistema
And o usuário possui um canal ativo
And o sistema suporta o formato de vídeo enviado
And o arquivo de vídeo atende aos limites de tamanho permitidos
When o sistema recebe a solicitação de publicação de vídeo com seus metadados
Then o sistema armazena os metadados do vídeo com status "processando"
And o sistema envia o arquivo para o serviço de processamento de mídia
And o sistema retorna uma confirmação de recebimento da solicitação
And o sistema atualiza o status do vídeo para "publicado" após o processamento ser concluído com sucesso

Scenario: rejeitar publicação de vídeo por limite de armazenamento excedido

Given o usuário “João” está cadastrado no sistema
And o usuário possui um canal ativo
And o arquivo de vídeo enviado não atende aos limites de tamanho permitidos
When o sistema recebe a solicitação de upload de um novo vídeo
Then o sistema rejeita a solicitação de publicação
And o sistema não armazena o vídeo nem seus metadados
And o sistema retorna uma mensagem informando que o limite de armazenamento do vídeo foi excedido

