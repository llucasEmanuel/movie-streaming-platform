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