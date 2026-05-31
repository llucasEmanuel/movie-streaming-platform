Feature: Gerenciar minhas playlists

As a usuário da plataforma  
I want criar, visualizar, editar e remover minhas playlists  
So that eu possa organizar filmes de acordo com minhas preferências


Scenario: Visualizar playlists na página Minhas Playlists

Given eu acesso o sistema como "usuário"  
And a página "Minhas Playlists" está disponível  
And eu possuo as playlists "Maratonar nas férias" e "Filmes clássicos"  
When eu acesso a página "Minhas Playlists"  
Then as playlists "Maratonar nas férias" e "Filmes clássicos" são exibidas


Scenario: Visualizar página Minhas Playlists sem playlists criadas

Given eu acesso o sistema como "usuário"  
And a página "Minhas Playlists" está disponível  
And eu não possuo playlists criadas  
When eu acesso a página "Minhas Playlists"  
Then nenhuma playlist é exibida  
And o sistema informa que ainda não existem playlists criadas


Scenario: Criar nova playlist

Given eu estou na página "Minhas Playlists"  
And eu não possuo a playlist "Maratonar nas férias"  
And existe a opção de criar playlists  
When eu tento criar a playlist "Maratonar nas férias"  
Then o sistema cria a playlist "Maratonar nas férias"  
And a playlist "Maratonar nas férias" aparece na página "Minhas Playlists"  
And o sistema exibe uma mensagem de sucesso


Scenario: Erro ao criar playlist com nome já existente

Given eu estou na página "Minhas Playlists"  
And eu possuo a playlist "Filmes clássicos"  
And existe a opção de criar playlists  
When eu tento criar a playlist "Filmes clássicos"  
Then o sistema não cria uma nova playlist  
And a playlist "Filmes clássicos" permanece aparecendo uma única vez na página "Minhas Playlists"  
And o sistema exibe uma mensagem de erro


Scenario: Erro ao criar playlist sem informar nome

Given eu estou na página "Minhas Playlists"  
And existe a opção de criar playlists  
When eu tento criar uma playlist sem informar nome  
Then o sistema não cria a playlist  
And nenhuma nova playlist aparece na página "Minhas Playlists"  
And o sistema exibe uma mensagem de erro


Scenario: Remover uma playlist

Given eu estou na página "Minhas Playlists"  
And eu possuo a playlist "Maratonar nas férias"  
And eu possuo a playlist "Filmes clássicos"  
And existe a opção de remover a playlist "Maratonar nas férias"  
When eu tento remover a playlist "Maratonar nas férias"  
Then o sistema remove a playlist "Maratonar nas férias"  
And a playlist "Maratonar nas férias" não aparece na página "Minhas Playlists"  
And a playlist "Filmes clássicos" permanece aparecendo na página "Minhas Playlists"


Scenario: Editar o nome de uma playlist

Given eu estou na página "Minhas Playlists"  
And eu possuo a playlist "Maratonar nas férias"  
And eu não possuo a playlist "Maratonar no feriadão"  
And existe a opção de editar a playlist "Maratonar nas férias"  
When eu tento mudar o nome da playlist "Maratonar nas férias" para "Maratonar no feriadão"  
Then o sistema altera o nome da playlist para "Maratonar no feriadão"  
And a playlist "Maratonar no feriadão" aparece na página "Minhas Playlists"  
And a playlist "Maratonar nas férias" não aparece na página "Minhas Playlists"


Scenario: Erro ao editar o nome de uma playlist para um nome já existente

Given eu estou na página "Minhas Playlists"  
And eu possuo a playlist "Maratonar nas férias"  
And eu possuo a playlist "Maratonar no feriadão"  
And existe a opção de editar a playlist "Maratonar nas férias"  
When eu tento mudar o nome da playlist "Maratonar nas férias" para "Maratonar no feriadão"  
Then o sistema não altera o nome da playlist "Maratonar nas férias"  
And a playlist "Maratonar nas férias" permanece aparecendo na página "Minhas Playlists"  
And a playlist "Maratonar no feriadão" permanece aparecendo na página "Minhas Playlists"  
And o sistema exibe uma mensagem de erro

