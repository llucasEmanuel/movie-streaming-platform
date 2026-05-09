Feature: Busca e Filtro
Como um usuário 
Eu quero filtrar o catálogo por gêneros 
Para explorar só o determinado tipo de filme que desejo assistir

Feature: Busca e Filtro
Como um usuário 
Eu quero pesquisar por uma palavra-chave
Para achar o filme específico que desejo assistir.

Scenario: Busca por título bem-sucedida
Given o usuário está na página de pesquisa
When o usuário digita "metropolis" no campo de busca
And clica no botão de pesquisar
Then é exibido a capa e o título do filme "metropolis" como opção

Scenario: Busca por termo parcial
Given o usuário está na página de pesquisa
When o usuário digita "metro" no campo de busca
And clica no botão de pesquisar
Then é exibido a capa e o título de todos os filmes que contenham "metro"

Scenario: Busca sem resultado encontrado
Given o usuário está na página de pesquisa
When o usuário digita "aeurhdo" no campo de busca
And clica no botão de pesquisar
Then é exibido a mensagem "Opss... Nenhum resultado encontrado"

Scenario: Filtrar filmes por um único gênero
Given o usuário está na página com as opções de gênero
When o usuário seleciona o filtro "Ficção Científica"
Then o sistema exibe somente as capas e títulos dos filmes classificados como "Ficção Científica"

Scenario: Busca e Filtro juntos
Given que o usuário pesquisou "rei"
When seleciona o filtro "ação"
Then é exibido os filmes do filtro ação que contenham "rei" no título

Scenario: Limpar filtros aplicados
Given que o usuário está com o filtro "terror" ativado
When o usuário seleciona a opção "retirar filtros"
Then é exibido todos os filmes disponíveis da plataforma
