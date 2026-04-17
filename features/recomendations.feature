Feature: Recomendações 

    Como um usuário da plataforma 
    Eu desejo que me seja recomendado os conteúdos que mais se adequam ao meu gosto 
    Para que eu consiga escolher aquele que mais me agrada

    Scenario: Pesquisar  um filme por título parcial 
        Given que o sistema possui os filmes "Toy Story 1", "Toy Story 2", "Toy Story 3", "Exemplo ToyKid" e "Batman"
        And eu estou na página inicial 
        When eu pesquiso pelo título "Toy" 
        Then eu vejo os filmes "Toy Story 1", "Toy Story 2", "Toy Story 3" e "Exemplo ToyKid"
        And eu não vejo o filme "Batman" nos resultados 

    Scenario: Pesquisar um filme que não está no catálogo 
        Given que o sistema possui os filmes "Toy Story 1", "Toy Story 2", "Toy Story 3", "Exemplo ToyKid" e "Batman"
        And eu estou na página inicial 
        When eu pesquiso pelo título "Toy Story 4" 
        Then eu vejo a mensagem de erro "Não encontramos esse conteúdo"
        And eu vejo os filmes "Toy Story 1", "Toy Story 2" e "Toy Story 3" como sugestões.

    Scenario: Não recomendar esse conteúdo 
        Given que o sistema exibe a séries "Lost" como recomendação
        And eu estou na página principal	
        When eu indico que não quero recomendações da série "Lost"
        Then eu não vejo a série "Lost" na tela     

    Scenario: Seleção de um conteúdo 
        Given que o sistema possui a série “Peaky Blinders” com a descrição “Série sobre uma gangue…” 
        And eu estou na página principal 
        When eu escolho o conteúdo “Peaky blinders”
        Then eu vejo o título “Peaky Blinders” 
        And eu vejo a descrição “Série sobre uma gangue…” 
        And eu vejo a opção “Play