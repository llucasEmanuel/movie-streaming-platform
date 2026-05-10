Feature: Minhas Playlists

As a usuário do sistema,
I want to gerenciar minhas playlists, podendo criar, editar e remover playlists personalizadas, além de adicionar e remover filmes de playlists padrão e personalizadas,
So that I possa organizar os filmes disponíveis na plataforma de acordo com minhas preferências.


Scenario: Visualizar playlists na página Minhas Playlists
Given eu acesso o sistema como "usuário"
And a página "Minhas Playlists" está disponível
And existem as playlists padrão "Favoritos" e "Assistir depois" no sistema
And existem as playlists personalizadas "Maratonar nas férias" e "Filmes clássicos" no sistema
When eu acesso a página "Minhas Playlists"
Then as playlists padrão "Favoritos" e "Assistir depois" são exibidas
And as playlists personalizadas "Maratonar nas férias" e "Filmes clássicos" são exibidas


Scenario Outline: Visualizar playlists padrão na página Minhas Playlists
Given eu acesso o sistema como "usuário" pela primeira vez
And a página "Minhas Playlists" está disponível
And "<playlist>" é uma playlist padrão
When eu acesso a página "Minhas Playlists"
Then o sistema exibe a playlist "<playlist>"
And a playlist "<playlist>" aparece como uma playlist padrão
And a playlist "<playlist>" não tem filmes adicionados
And a playlist "<playlist>" não tem a opção de ser removida
And a playlist "<playlist>" não tem a opção de ser editada

Examples:
    | playlist        |
    | Favoritos       |
    | Assistir depois |


Scenario: Criar nova playlist personalizada
Given eu estou na página "Minhas Playlists"
And o sistema não tem a playlist personalizada "Maratonar nas férias"
And o sistema possui a playlist personalizada "Filmes clássicos"
And o sistema possui a playlist padrão "Favoritos"
And existe a opção de criar playlists
When eu tento criar a playlist personalizada "Maratonar nas férias"
Then o sistema cria a playlist personalizada "Maratonar nas férias"
And a playlist personalizada "Maratonar nas férias" aparece na página "Minhas Playlists"
And a playlist personalizada "Filmes clássicos" permanece aparecendo na página "Minhas Playlists"
And a playlist padrão "Favoritos" permanece aparecendo na página "Minhas Playlists"
And o sistema exibe uma mensagem de sucesso


Scenario: Erro ao criar playlist personalizada com nome já existente
Given eu estou na página "Minhas Playlists"
And o sistema possui a playlist personalizada "Filmes clássicos"
And existe a opção de criar playlists
When eu tento criar a playlist personalizada "Filmes clássicos"
Then o sistema não cria a nova playlist personalizada
And o sistema exibe uma mensagem de erro


Scenario: Erro ao criar playlist personalizada sem informar nome
Given eu estou na página "Minhas Playlists"
And existe a opção de criar playlists
When eu tento criar uma playlist personalizada sem informar nome
Then o sistema não cria a playlist personalizada
And nenhuma nova playlist aparece na página "Minhas Playlists"
And o sistema exibe uma mensagem de erro


Scenario: Remover uma playlist personalizada
Given eu estou na página "Minhas Playlists"
And existe a playlist personalizada "Maratonar nas férias"
And existe a opção de remover a playlist personalizada "Maratonar nas férias"
And existe a playlist padrão "Favoritos" na página "Minhas Playlists"
And existe a playlist personalizada "Filmes clássicos"
When eu tento remover a playlist personalizada "Maratonar nas férias"
Then o sistema remove a playlist personalizada "Maratonar nas férias"
And a playlist personalizada "Maratonar nas férias" não aparece na página "Minhas Playlists"
And a playlist padrão "Favoritos" aparece na página "Minhas Playlists"
And a playlist personalizada "Filmes clássicos" aparece na página "Minhas Playlists"


Scenario: Editar o nome de uma playlist personalizada
Given eu estou na página "Minhas Playlists"
And existe a playlist personalizada "Maratonar nas férias"
And existe a opção de editar o nome da playlist personalizada "Maratonar nas férias"
And não existe a playlist personalizada "Maratonar no feriadão" na página "Minhas Playlists"
When eu tento mudar o nome da playlist personalizada "Maratonar nas férias" para "Maratonar no feriadão"
Then o sistema altera o nome da playlist personalizada "Maratonar nas férias" para "Maratonar no feriadão"
And a playlist personalizada "Maratonar no feriadão" aparece na página "Minhas Playlists"
And a playlist personalizada "Maratonar nas férias" não aparece na página "Minhas Playlists"


Scenario: Erro ao editar o nome de uma playlist personalizada para um nome já existente
Given eu estou na página "Minhas Playlists"
And existe a playlist personalizada "Maratonar nas férias"
And existe a opção de editar o nome da playlist personalizada "Maratonar nas férias"
And existe a playlist personalizada "Maratonar no feriadão" na página "Minhas Playlists"
When eu tento mudar o nome da playlist personalizada "Maratonar nas férias" para "Maratonar no feriadão"
Then o sistema não altera o nome da playlist personalizada "Maratonar nas férias" para "Maratonar no feriadão"
And a playlist personalizada "Maratonar nas férias" aparece na página "Minhas Playlists"
And a playlist personalizada "Maratonar no feriadão" aparece na página "Minhas Playlists"
And o sistema exibe uma mensagem de erro


Scenario: Adicionar filme a uma playlist padrão
Given eu estou na página "Catálogo"
And eu vejo o filme "Top Gun"
And existe a playlist padrão "Favoritos"
And existe a playlist padrão "Assistir depois"
And o filme "Top Gun" possui a opção de ser adicionado a uma playlist padrão
When eu tento adicionar o filme "Top Gun" à playlist padrão "Favoritos"
Then o sistema adiciona o filme "Top Gun" à playlist padrão "Favoritos"
And o sistema não adiciona o filme "Top Gun" à playlist padrão "Assistir depois"
And o sistema exibe uma mensagem de sucesso


Scenario: Erro ao adicionar filme já existente em uma playlist padrão
Given eu estou na página "Catálogo"
And eu vejo o filme "Top Gun"
And existe a playlist padrão "Favoritos"
And existe a playlist padrão "Assistir depois"
And o filme "Top Gun" já existe na playlist padrão "Favoritos"
And o filme "Top Gun" possui a opção de ser adicionado a uma playlist padrão
When eu tento adicionar o filme "Top Gun" à playlist padrão "Favoritos"
Then o sistema não adiciona novamente o filme "Top Gun" à playlist padrão "Favoritos"
And a playlist padrão "Favoritos" guarda apenas uma cópia do filme "Top Gun"
And o sistema não adiciona o filme "Top Gun" à playlist padrão "Assistir depois"
And o sistema exibe uma mensagem de erro


Scenario: Adicionar filme a uma playlist personalizada
Given eu estou na página "Catálogo"
And eu vejo o filme "Gran Torino"
And existe a playlist personalizada "Assistir no final de semana"
And o filme "Gran Torino" possui a opção de ser adicionado a uma playlist personalizada
And a opção de adicionar o filme "Gran Torino" a uma playlist personalizada exibe as playlists personalizadas do sistema
When eu clico na opção de adicionar o filme "Gran Torino" a uma playlist personalizada
And eu escolho a playlist personalizada "Assistir no final de semana"
Then o sistema adiciona o filme "Gran Torino" à playlist personalizada "Assistir no final de semana"
And o sistema exibe uma mensagem de sucesso


Scenario: Erro ao adicionar filme quando não existem playlists personalizadas cadastradas
Given eu estou na página "Catálogo"
And eu vejo o filme "Gran Torino"
And o sistema não possui playlists personalizadas
And o filme "Gran Torino" possui a opção de ser adicionado a uma playlist personalizada
When eu clico na opção de adicionar o filme "Gran Torino" a uma playlist personalizada
Then o sistema não exibe playlists personalizadas
And o sistema não adiciona o filme "Gran Torino" a uma playlist personalizada
And o sistema exibe uma mensagem de erro


Scenario: Erro ao adicionar filme já existente a uma playlist personalizada
Given eu estou na página "Catálogo"
And eu vejo o filme "Gran Torino"
And existe a playlist personalizada "Assistir no final de semana"
And o filme "Gran Torino" já existe na playlist personalizada "Assistir no final de semana"
And o filme "Gran Torino" possui a opção de ser adicionado a uma playlist personalizada
And a opção de adicionar o filme "Gran Torino" a uma playlist personalizada exibe as playlists personalizadas do sistema
When eu tento adicionar o filme "Gran Torino" a uma playlist personalizada
And eu escolho a playlist personalizada "Assistir no final de semana"
Then o sistema não adiciona novamente o filme "Gran Torino" à playlist personalizada "Assistir no final de semana"
And a playlist personalizada "Assistir no final de semana" guarda apenas uma cópia do filme "Gran Torino"
And o sistema exibe uma mensagem de erro


Scenario: Remover filme de uma playlist
Given eu estou na playlist "Favoritos"
And a playlist "Favoritos" possui o filme "Top Gun"
And a playlist "Favoritos" possui o filme "Star Wars"
And o filme "Top Gun" possui a opção de ser removido da playlist "Favoritos"
When eu tento remover o filme "Top Gun" da playlist "Favoritos"
Then o sistema remove o filme "Top Gun" da playlist "Favoritos"
And a playlist "Favoritos" não exibe o filme "Top Gun"
And a playlist "Favoritos" exibe o filme "Star Wars"