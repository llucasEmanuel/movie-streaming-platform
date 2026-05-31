Feature: Gerenciar filmes nas minhas playlists

As a usuário da plataforma
I want adicionar e remover filmes das minhas playlists
So that eu possa organizar os filmes de acordo com minhas preferências


Scenario: Adicionar filme a uma playlist

Given eu estou na página "Catálogo"
And eu vejo o filme "Top Gun"
And eu possuo a playlist "Filmes clássicos"
And eu possuo a playlist "Maratonar nas férias"
And o filme "Top Gun" possui a opção de ser adicionado a uma playlist
When eu tento adicionar o filme "Top Gun" à playlist "Filmes clássicos"
Then o sistema adiciona o filme "Top Gun" à playlist "Filmes clássicos"
And o sistema não adiciona o filme "Top Gun" à playlist "Maratonar nas férias"
And o sistema exibe uma mensagem de sucesso


Scenario: Erro ao adicionar filme já existente em uma playlist

Given eu estou na página "Catálogo"
And eu vejo o filme "Top Gun"
And eu possuo a playlist "Filmes clássicos"
And o filme "Top Gun" já existe na playlist "Filmes clássicos"
And o filme "Top Gun" possui a opção de ser adicionado a uma playlist
When eu tento adicionar o filme "Top Gun" à playlist "Filmes clássicos"
Then o sistema não adiciona novamente o filme "Top Gun" à playlist "Filmes clássicos"
And a playlist "Filmes clássicos" guarda apenas uma cópia do filme "Top Gun"
And o sistema exibe uma mensagem de erro


Scenario: Remover filme de uma playlist

Given eu estou na playlist "Filmes clássicos"
And a playlist "Filmes clássicos" possui o filme "Top Gun"
And a playlist "Filmes clássicos" possui o filme "Star Wars"
And o filme "Top Gun" possui a opção de ser removido da playlist "Filmes clássicos"
When eu tento remover o filme "Top Gun" da playlist "Filmes clássicos"
Then o sistema remove o filme "Top Gun" da playlist "Filmes clássicos"
And a playlist "Filmes clássicos" não exibe o filme "Top Gun"
And a playlist "Filmes clássicos" exibe o filme "Star Wars"


Scenario: Erro ao adicionar filme quando não existem playlists criadas

Given eu estou na página "Catálogo"
And eu vejo o filme "Gran Torino"
And eu não possuo playlists criadas
When eu clico na opção de adicionar o filme "Gran Torino" a uma playlist
Then o sistema não exibe playlists disponíveis
And o sistema não adiciona o filme "Gran Torino" a nenhuma playlist





