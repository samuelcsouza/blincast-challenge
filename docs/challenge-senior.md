## Desafio Blincast — Backend Pleno (DevOps)

Um servidor `HTTP` deve ser criado, expondo uma rota `/document`. A rota aceita um `POST` no seguinte formato:
```json
{
    "action": "create | update | delete",
    "key": "name",
    "value": "string"
}
```

O campo `action` define que ação deve ser realizada:
- `"create"`: o servidor deve salvar no banco o campo `"value"` e utilizar como chave para resgatar o valor o campo `"key"`.
Se a chave já existir, o sistema deve retornar um erro de chave já existente.
- `"update"`: o servidor deve atualizar no banco o valor referente à chave especificada pelo campo `"key"` com o valor do campo `"value"`.
Se a chave não existir, o sistema deve retornar um erro de chave não existente.
- `"delete"`: o servidor deve deletar do banco a chave especificada pelo campo `"key"` e seu valor atual.
Se a chave não existir, o sistema deve retornar um erro de chave não existente.

O servidor deve responder com
```json
{
    "status": "ok | error",
    "code": int
}
```
Onde `status` é `"ok"` caso a operação tenha sido bem-sucedida e `"error"` caso o conteúdo da requisição tenha algum problema.
O campo `code` é um inteiro representando um código de erro. Caso `status="ok"` seu valor deve ser 0.

A rota também deve aceitar um `GET` no formato `/document/{key}`, que deve retornar o valor armazenado para a chave especificada.
A resposta deve seguir o formato:
```json
{
    "status": "ok | error",
    "code": int,
    "value": "string"
}
```
Caso a chave não exista, o servidor deve retornar `status="error"` com o código de erro correspondente, e o campo `value` pode ser omitido ou retornado vazio.

## Requisitos
- A linguagem de implementação é livre.
- O armazenamento dos dados deve ser feito em PostgreSQL.
- A aplicação deve ser containerizada com Docker.
- O repositório deve conter um `docker-compose.yml` que suba a aplicação junto com o Postgres.
- Deve haver um pipeline de CI/CD no GitHub Actions que, a cada push na branch principal, faça o build da imagem da aplicação e a publique no Docker Hub.

## Entrega
A entrega deve ser dada como um link para um repositório público do Github. Além do código, este repositório deve conter um README com instruções de:
- Como fazer o build da aplicação localmente.
- Como dar pull da imagem publicada no Docker Hub e como rodá-la (junto com o Postgres).
