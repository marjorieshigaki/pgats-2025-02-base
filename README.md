

# Projeto Final - Teste de Performance com K6

Este projeto apresenta um teste de performance automatizado para uma API REST, utilizando o K6 para simular cenários reais e validar requisitos de desempenho. O teste cobre desde autenticação até o fluxo de checkout, aplicando práticas modernas de automação.



## Instalação e Execução

1. Instale as dependências do projeto:
  ```bash
  npm install
  ```
2. Inicie a API em um terminal:
  ```bash
  npm start
  ```
3. Em outro terminal, execute o teste de performance:
  ```bash
  npm run test:k6:html
  ```
  O relatório será salvo como `summary.html`.



## Documentação da API
Acesse a interface Swagger em [http://localhost:3000/api-docs](http://localhost:3000/api-docs)



## Estrutura dos Testes

O diretório `test/k6/` contém:

- `checkout.test.js`: script principal do teste de performance
- `helpers/auth.js`: funções para login e headers de autenticação
- `helpers/faker.js`: geração de itens aleatórios para o carrinho
- `data/users.json`: usuários de teste

## Principais Conceitos Aplicados

### 1. Thresholds
Limites de desempenho são definidos para garantir SLA:
```js
thresholds: {
  'http_req_duration': ['p(95)<500', 'p(99)<1000'],
  'http_req_failed': ['rate<0.05'],
  'login_duration': ['p(95)<800'],
  'checkout_duration': ['p(95)<1000'],
  'successful_checkouts': ['rate>0.90'],
  'checkout_errors': ['count<50'],
}
```

### 2. Checks
Validações automáticas para garantir respostas corretas:
```js
check(resposta, {
  'Status 200': (r) => r.status === 200,
  'Retorna array': (r) => Array.isArray(r.json()),
  'Produtos têm ID': (r) => r.json().every((p) => p.id !== undefined),
});
```

### 3. Helpers
Funções utilitárias para login e geração de dados:
```js
import { autenticarUsuario, montarHeaders } from './helpers/auth.js';
import { gerarItensAleatorios } from './helpers/faker.js';
```

### 4. Trends
Métricas customizadas para medir tempos de etapas específicas:
```js
const loginTrend = new Trend('login_duration');
const checkoutTrend = new Trend('checkout_duration');
loginTrend.add(Date.now() - inicioLogin);
```

### 5. Faker
Geração de itens aleatórios para simular compras reais:
```js
const itens = gerarItensAleatorios(idsProdutos, 1, 3);
```

### 6. Variáveis de Ambiente
Permite customizar a URL da API e quantidade de usuários:
```js
const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';
```
Execute com:
```bash
k6 run -e BASE_URL=http://localhost:3000 test/k6/checkout.test.js
```

### 7. Stages
Define a variação de carga ao longo do tempo:
```js
stages: [
  { duration: '30s', target: 5 },
  { duration: '1m', target: 10 },
  { duration: '2m', target: 10 },
  { duration: '30s', target: 20 },
  { duration: '1m', target: 20 },
  { duration: '30s', target: 0 },
]
```

### 8. Reaproveitamento de Resposta
IDs de produtos e tokens são capturados e usados em etapas seguintes:
```js
idsProdutos = resposta.json().map((p) => p.id);
const token = autenticarUsuario(email, senha, BASE_URL);
```

### 9. Token de Autenticação
O token JWT é obtido no login e utilizado em endpoints protegidos:
```js
const params = montarHeaders(token);
http.post(`${BASE_URL}/checkout`, payload, params);
```

### 10. Data-Driven Testing
Usuários de teste são carregados de arquivo externo:
```js
const usuarios = new SharedArray('usuarios', () => JSON.parse(open('./test/k6/data/users.json')));
```

### 11. Groups
Organiza o teste em blocos lógicos para facilitar análise:
```js
group('01 - Login Usuário', ...);
group('02 - Listar Produtos', ...);
group('03 - Detalhes Produto', ...);
group('04 - Checkout', ...);
group('05 - Pedidos do Usuário', ...);
```

---



## Endpoints REST
- POST `/auth/register` — Cadastro de usuário
- POST `/auth/login` — Login (retorna token JWT)
- GET `/products` — Lista de produtos
- GET `/products/:id` — Detalhes de produto
- POST `/checkout` — Realiza compra (autenticado)
- GET `/orders` — Pedidos do usuário (autenticado)

## Observações
- O banco de dados é em memória, reiniciado a cada execução.
- O teste pode ser customizado facilmente alterando os arquivos em `test/k6/`.


