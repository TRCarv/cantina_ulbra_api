# Cantina ULBRA API

API RESTful desenvolvida para o gerenciamento de produtos, pedidos e relatórios de vendas da cantina universitária do campus ULBRA. O sistema implementa controle transacional de estoque, integridade referencial e validações de regras de negócio.

## Desenvolvido por

- **Thiago Carvalho**

---

## Tecnologias Utilizadas

- **Node.js** — Ambiente de execução JavaScript server-side
- **Express** — Framework web para roteamento modularizado (`express.Router()`) e middlewares
- **Knex.js** — SQL Query Builder para migrations, seeds, transações e consultas parametrizadas
- **SQLite3** — Banco de dados relacional embutido com `PRAGMA foreign_keys = ON` para verificação de chaves estrangeiras

---

## Estrutura do Projeto

```text
cantina_ulbra_api/
├── src/
│   ├── controllers/
│   │   ├── pedidosController.js
│   │   ├── produtosController.js
│   │   └── relatoriosController.js
│   ├── database/
│   │   ├── migrations/
│   │   ├── seeds/
│   │   └── connection.js
│   ├── routes/
│   │   ├── pedidosRoutes.js
│   │   ├── produtosRoutes.js
│   │   └── relatoriosRoutes.js
│   └── server.js
├── .gitignore
├── knexfile.js
├── package.json
└── README.md
```

---

## Instalação e Execução

### 1. Clonar o repositório e instalar as dependências

```bash
git clone https://github.com/TRCarv/cantina_ulbra_api
cd cantina_ulbra_api
npm install
```

### 2. Criar as tabelas do banco de dados (Migrations)

```bash
npx knex migrate:latest
```

### 3. Popular o banco com dados iniciais (Seeds)

```bash
npx knex seed:run
```

### 4. Iniciar o servidor

```bash
# Modo produção
npm start

# Modo desenvolvimento (com reinicialização automática via nodemon)
npm run dev
```

O servidor iniciará por padrão em `http://localhost:3000`.

---

## Uso de Transações (`db.transaction()`)

Para garantir a consistência e a atomicidade dos dados (princípio ACID), o método `db.transaction()` do Knex.js foi aplicado em dois pontos críticos do `pedidosController.js`:

1. **Criação de Pedidos (`POST /api/pedidos`):** O registro de uma venda exige duas operações dependentes no banco: inserir o novo pedido na tabela `pedidos` e decrementar a quantidade comprada na coluna `estoque` da tabela `produtos`. Ao envolver ambas as operações na mesma transação (`trx`), garantimos que, caso ocorra qualquer falha entre uma escrita e outra, o banco execute um `ROLLBACK` automático, impedindo que um pedido seja registrado sem a devida baixa no estoque.
2. **Cancelamento de Pedidos (`DELETE /api/pedidos/:id`):** Ao cancelar um pedido, o sistema precisa devolver a quantidade reservada ao estoque do produto correspondente e excluir o registro do pedido. A transação assegura que o estorno do estoque e a remoção do pedido ocorram de forma indivisível (tudo ou nada).

---

## Documentação dos Endpoints

### 1. Produtos (`/api/produtos`)

| Método   | Rota                | Descrição                                                                       | Status HTTP                       |
| :------- | :------------------ | :------------------------------------------------------------------------------ | :-------------------------------- |
| `GET`    | `/api/produtos`     | Lista todos os produtos (filtros opcionais: `?categoria=...&ativo=true\|false`) | `200`, `500`                      |
| `GET`    | `/api/produtos/:id` | Busca um produto específico pelo ID                                             | `200`, `404`, `500`               |
| `POST`   | `/api/produtos`     | Cadastra um novo produto (valida campos obrigatórios e nome único)              | `201`, `400`, `409`, `500`        |
| `PUT`    | `/api/produtos/:id` | Atualiza dados de um produto existente, incluindo status `ativo`                | `200`, `400`, `404`, `409`, `500` |
| `DELETE` | `/api/produtos/:id` | Remove um produto caso não possua pedidos vinculados                            | `204`, `404`, `409`, `500`        |

#### Exemplo — `POST /api/produtos`

**Requisição:**

```json
{
    "nome": "Empada de Palmito",
    "categoria": "Salgados",
    "preco": 7.0,
    "estoque": 20,
    "ativo": true
}
```

**Resposta (`201 Created`):**

```json
{
    "id": 8,
    "nome": "Empada de Palmito",
    "categoria": "Salgados",
    "preco": 7,
    "estoque": 20,
    "ativo": 1
}
```

---

### 2. Pedidos (`/api/pedidos`)

| Método   | Rota               | Descrição                                                                                       | Status HTTP                       |
| :------- | :----------------- | :---------------------------------------------------------------------------------------------- | :-------------------------------- |
| `GET`    | `/api/pedidos`     | Lista pedidos com paginação (`?limit=10&offset=0`) e filtro opcional (`?aluno_nome=...`)        | `200`, `400`, `500`               |
| `GET`    | `/api/pedidos/:id` | Retorna detalhes do pedido incluindo o nome do produto via `JOIN`                               | `200`, `404`, `500`               |
| `POST`   | `/api/pedidos`     | Cria pedido validando produto ativo, estoque, cálculo de total no servidor e baixa transacional | `201`, `400`, `404`, `409`, `500` |
| `DELETE` | `/api/pedidos/:id` | Cancela o pedido e devolve a quantidade ao estoque de forma transacional                        | `204`, `404`, `500`               |

#### Exemplo — `POST /api/pedidos`

**Requisição:**

```json
{
    "aluno_nome": "Thiago",
    "produto_id": 3,
    "quantidade": 2
}
```

**Resposta (`201 Created`):**

```json
{
    "id": 7,
    "aluno_nome": "Thiago",
    "produto_id": 3,
    "quantidade": 2,
    "valor_total": 10,
    "created_at": "2026-11-15 11:24:32",
    "updated_at": "2026-11-15 11:24:32"
}
```

---

### 3. Relatórios (`/api/relatorios`)

| Método | Rota                                   | Descrição                                                                    | Status HTTP         |
| :----- | :------------------------------------- | :--------------------------------------------------------------------------- | :------------------ |
| `GET`  | `/api/relatorios/vendas-por-categoria` | Total vendido (R$), itens e pedidos agrupados por categoria                  | `200`, `500`        |
| `GET`  | `/api/relatorios/top-produtos`         | Ranking dos 5 produtos mais vendidos                                         | `200`, `500`        |
| `GET`  | `/api/relatorios/faturamento`          | Faturamento total no período (`?data_inicio=YYYY-MM-DD&data_fim=YYYY-MM-DD`) | `200`, `400`, `500` |

#### Exemplo — `GET /api/relatorios/faturamento?data_inicio=2026-11-10&data_fim=2026-11-12`

**Resposta (`200 OK`):**

```json
{
    "data_inicio": "2026-11-10",
    "data_fim": "2026-11-12",
    "faturamento_total": 56.5,
    "total_pedidos": 4
}
```

---

## Exemplos de testes via `cURL`

Com o servidor em execução (`npm run dev`), utilize os comandos abaixo em outro terminal para testar os endpoints:

### Produtos

```bash
# Listar todos os produtos
curl -i http://localhost:3000/api/produtos

# Filtrar produtos ativos por categoria
curl -i "http://localhost:3000/api/produtos?categoria=Salgados&ativo=true"

# Buscar produto por ID
curl -i http://localhost:3000/api/produtos/1

# Cadastrar novo produto
curl -i -X POST http://localhost:3000/api/produtos \
  -H "Content-Type: application/json" \
  -d '{"nome":"Empada de Palmito","categoria":"Salgados","preco":7.00,"estoque":20}'

# Atualizar produto existente
curl -i -X PUT http://localhost:3000/api/produtos/8 \
  -H "Content-Type: application/json" \
  -d '{"preco":7.50,"estoque":18,"ativo":true}'

# Remover produto sem pedidos vinculados
curl -i -X DELETE http://localhost:3000/api/produtos/8
```

### Pedidos

```bash
# Listar pedidos com paginação e filtro por nome do aluno
curl -i "http://localhost:3000/api/pedidos?limit=5&offset=0&aluno_nome=Lucas"

# Buscar pedido específico com nome do produto
curl -i http://localhost:3000/api/pedidos/1

# Registrar novo pedido (calcula valor_total no servidor e debita estoque)
curl -i -X POST http://localhost:3000/api/pedidos \
  -H "Content-Type: application/json" \
  -d '{"aluno_nome":"Thiago","produto_id":3,"quantidade":2}'

# Cancelar pedido (estorna a quantidade para o estoque)
curl -i -X DELETE http://localhost:3000/api/pedidos/7
```

### Relatórios

```bash
# Vendas agrupadas por categoria
curl -i http://localhost:3000/api/relatorios/vendas-por-categoria

# Ranking dos 5 produtos mais vendidos
curl -i http://localhost:3000/api/relatorios/top-produtos

# Faturamento total por período
curl -i "http://localhost:3000/api/relatorios/faturamento?data_inicio=2026-11-10&data_fim=2026-11-12"
```
