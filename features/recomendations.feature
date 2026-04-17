Feature: Recomendações 

    Como um usuário da plataforma 
    Eu desejo que me seja recomendado os conteúdos que mais se adequam ao meu gosto 
    Para que eu consiga escolher aquele que mais me agrada

    Scenario: Pesquisar  um filme por título parcial 
        Given que o sistema possui os filmes "Toy Story 1", "Toy Story 2", "Toy Story 3", "Exemplo ToyKid" e "Batman"
        And eu estou na página inicial 
        When eu pesquiso pelo título “Toy” 
        Then eu vejo os filmes "Toy Story 1", "Toy Story 2", "Toy Story 3" e "Exemplo ToyKid"
        And eu não vejo o filme "Batman" nos resultados 

    Scenario: Pesquisar um filme que não está no catálogo 
        Given que o sistema possui os filmes “Toy Story 1”, “Toy Story 2”, “Toy Story 3”, “Exemplo Toy Kid” e “Batman”
        And eu estou na página inicial 
        When eu pesquiso pelo título “Toy Story 4” 
        Then eu vejo a mensagem de erro “Não encontramos esse conteúdo”
        And eu vejo os filmes “Toy Story 1”, “Toy Story 2” e “Toy Story 3” como sugestões.
