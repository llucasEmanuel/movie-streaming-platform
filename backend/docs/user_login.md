# User Login

## Objetivo

Implementar a autenticação de usuários cadastrados na plataforma por meio de e-mail e senha, além de preparar o contrato para login via Google SSO.

## Endpoint de login com e-mail e senha

POST /login

## Request body

```json
{
  "email": "alvaro@teste.com",
  "password": "Senha@123"
}
```

## Resposta de sucesso

Status: 200

```json
{
  "authenticated": true,
  "message": "Login realizado com sucesso",
  "redirect": "home",
  "session": {
    "active": true
  },
  "user": {
    "id": "user-id",
    "name": "Usuário de Teste",
    "email": "alvaro@teste.com"
  }
}
```

## Campos obrigatórios vazios

Status: 400

```json
{
  "authenticated": false,
  "error": "Preencha todos os campos obrigatórios"
}
```

## E-mail não cadastrado ou senha incorreta

Status: 401

```json
{
  "authenticated": false,
  "error": "E-mail ou senha inválidos"
}
```

## Endpoint de login via Google SSO

POST /login/google

## Request body

```json
{
  "email": "alvaro@teste.com",
  "googleId": "google-alvaro@teste.com"
}
```

## Resposta de sucesso via Google

Status: 200

```json
{
  "authenticated": true,
  "message": "Login com Google realizado com sucesso",
  "redirect": "home",
  "session": {
    "active": true
  },
  "user": {
    "id": "user-id",
    "name": "Usuário de Teste",
    "email": "alvaro@teste.com"
  }
}
```

## Regras de negócio

- O sistema deve autenticar o usuário quando o e-mail existir e a senha estiver correta.
- O sistema não deve autenticar o usuário quando a senha estiver incorreta.
- O sistema não deve autenticar o usuário quando o e-mail não estiver cadastrado.
- O sistema não deve consultar autenticação caso os campos obrigatórios estejam vazios.
- A mensagem para e-mail inexistente e senha incorreta deve ser a mesma: `"E-mail ou senha inválidos"`.
- O login via Google SSO deve verificar se existe uma conta vinculada ao e-mail e ao identificador Google.git status