# Referência da API

A API é um backend Express que usa PostgreSQL/Supabase como fonte de verdade do catálogo.
A vitrine faz apenas leitura pública; as operações de estoque exigem sessão do painel.

## Banco e configuração

A conexão é definida por `DATABASE_URL` no ambiente. A aplicação não cria tabelas ao iniciar.
Para preparar um banco novo ou migrar uma tabela existente, use:

```bash
npm run db:setup
```

O schema de referência está em `db/schema.sql` e os índices em `db/indexes.sql`.

## `GET /`

Confirma que a API está no ar. Não verifica o banco.

```text
Calçados Mariano API
```

## `GET /health`

Verifica a tabela `produtos` diretamente no PostgreSQL.

```json
{
  "status": "ok",
  "banco": "conectado",
  "produtos": 13
}
```

Se o banco não responder, a API devolve `503` sem expor detalhes internos do PostgreSQL.

## `GET /produtos`

Lista produtos com filtro, ordenação e paginação.

Parâmetros opcionais:

| Parâmetro | Valores |
| --- | --- |
| `publico` | `Masculino`, `Feminino`, `Infantil`, `Unissex` |
| `categoria` | categoria exata |
| `ordenar` | `nome`, `nome_desc`, `quantidade`, `quantidade_desc`, `recentes` |
| `pagina` | inteiro a partir de 1 |
| `limite` | inteiro de 1 a 100; padrão 50 |

Exemplo:

```bash
curl "http://localhost:3000/produtos?publico=Masculino&ordenar=nome&pagina=1&limite=20"
```

Resposta:

```json
{
  "produtos": [
    {
      "id": 2,
      "nome": "Sapato Social Preto",
      "numeracao": "40",
      "categoria": "Sapato social",
      "publico": "Masculino",
      "subcategoria": null,
      "quantidade": 15,
      "status_estoque": "Em estoque",
      "marca": "Mariano",
      "cor": "Preto",
      "descricao": "Sapato social de couro.",
      "imagem_url": null,
      "nome_ordenacao": "sapato social preto"
    }
  ],
  "total": 1,
  "pagina": 1,
  "limite": 20,
  "paginas": 1
}
```

A vitrine usa esse envelope para saber quantos produtos existem sem carregar o catálogo inteiro em cada requisição.

## `GET /produtos/buscar`

Busca por nome, categoria ou numeração.

| Parâmetro | Obrigatório | Comportamento |
| --- | --- | --- |
| `tipo` | sim | `nome`, `categoria` ou `numeracao` |
| `termo` | sim | busca parcial em nome/categoria; exata em numeração |

```bash
curl "http://localhost:3000/produtos/buscar?tipo=nome&termo=bota"
```

A busca por texto usa `ILIKE` parametrizado no PostgreSQL. Valores fornecidos pelo cliente nunca são concatenados no SQL.

## `GET /produtos/categorias`

Retorna os valores existentes no banco para montar os filtros da vitrine.

```json
{
  "categorias": ["Bota", "Sandália", "Sapato social"],
  "publicos": ["Feminino", "Masculino", "Unissex"]
}
```

## `GET /produtos/:id`

Retorna um único produto.

```bash
curl http://localhost:3000/produtos/2
```

Retorna `404` se o produto não existir e `400` se o identificador não for um inteiro positivo.

## `POST /produtos`

Cria um produto. Requer sessão do painel.

```json
{
  "nome": "Tênis Casual Azul",
  "numeracao": "42",
  "categoria": "Tênis",
  "publico": "Masculino",
  "subcategoria": "Casual",
  "quantidade": 10,
  "marca": "Mariano",
  "cor": "Azul",
  "descricao": "Tênis casual para uso diário.",
  "imagem_url": "/imagens/tenis-azul.jpg"
}
```

`status_estoque` é opcional. Quando omitido, o backend deriva `Em estoque` para quantidade maior que zero e `Sem estoque` para zero.

Resposta:

```json
{
  "mensagem": "Produto adicionado com sucesso!",
  "id": 18
}
```

## `PUT /produtos/:id`

Substitui os dados do produto inteiro. Requer sessão.

## `DELETE /produtos/:id`

Remove um produto. Requer sessão.

## Autenticação

### `POST /auth/login`

Recebe:

```json
{ "senha": "senha-do-painel" }
```

Quando a senha está correta, a API cria um cookie `sessao_mariano` com `HttpOnly`. O hash da senha fica em `ADMIN_SENHA_HASH`; a senha em texto não é armazenada.

### `POST /auth/logout`

Invalida o cookie de sessão.

### `GET /auth/sessao`

Retorna se existe uma sessão válida e se a autenticação está configurada.

## Segurança das escritas

As rotas `POST`, `PUT` e `DELETE` passam por `exigirAutenticacao`. A vitrine não precisa de login para consultar produtos.

Os valores de entrada usados em SQL são sempre parâmetros PostgreSQL (`$1`, `$2`, ...). Nomes de colunas e expressões de ordenação usados dinamicamente vêm apenas de listas internas de valores permitidos.

## Schema de `produtos`

A tabela contém:

- `id`
- `nome`
- `numeracao`
- `categoria`
- `publico`
- `subcategoria`
- `quantidade`
- `status_estoque`
- `marca`
- `cor`
- `descricao`
- `imagem_url`
- `nome_ordenacao`

Não existe coluna de preço no modelo atual da vitrine.
