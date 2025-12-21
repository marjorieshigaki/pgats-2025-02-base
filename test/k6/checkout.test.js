
import http from 'k6/http';
import { check, group, sleep } from 'k6';
import { SharedArray } from 'k6/data';
import { Counter, Rate, Trend } from 'k6/metrics';
import { autenticarUsuario, montarHeaders } from './helpers/auth.js';
import { gerarItensAleatorios } from './helpers/faker.js';

const BASE_URL = __ENV.BASE_URL || 'http://localhost:3000';

const usuarios = new SharedArray('usuarios', () =>
        JSON.parse(open('data/users.json'))
);

const loginTrend = new Trend('login_duration');
const checkoutTrend = new Trend('checkout_duration');
const productListTrend = new Trend('product_list_duration');

const successfulLogins = new Rate('successful_logins');
const successfulCheckouts = new Rate('successful_checkouts');
const checkoutErrors = new Counter('checkout_errors');

let productIdsByVU = {};

export const options = {
    stages: [
        { duration: '30s', target: 5 },
        { duration: '1m', target: 10 },
        { duration: '2m', target: 10 },
        { duration: '30s', target: 20 },
        { duration: '1m', target: 20 },
        { duration: '30s', target: 0 },
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1000'],
        http_req_failed: ['rate<0.05'],
        login_duration: ['p(95)<800'],
        checkout_duration: ['p(95)<1000'],
        product_list_duration: ['avg<300'],
        successful_logins: ['rate>0.95'],
        successful_checkouts: ['rate>0.90'],
        checkout_errors: ['count<50'],
    },
};

export default function () {
        let token = null;
        const vuId = __VU;
        const usuario = usuarios[Math.floor(Math.random() * usuarios.length)];

        group('Login do usuário', function () {
                const inicio = Date.now();
                token = autenticarUsuario(usuario.email, usuario.password, BASE_URL);
                loginTrend.add(Date.now() - inicio);
                successfulLogins.add(!!token);
                check(token, {
                        'Token JWT recebido': (t) => !!t,
                });
                });

                sleep(1);

                group('Consulta de produtos', function () {
                        const inicio = Date.now();
                        const resposta = http.get(`${BASE_URL}/api/checkout/products`);
                        productListTrend.add(Date.now() - inicio);
                        let produtos = [];
                        let erroJson = false;
                        if (resposta.status === 200) {
                                try {
                                        produtos = resposta.json();
                                } catch (e) {
                                        erroJson = true;
                                }
                        }
                        check(resposta, {
                                'Status 200': (r) => r.status === 200,
                                'Retorna array': () => !erroJson && Array.isArray(produtos),
                                'Produtos têm ID': () =>
                                        !erroJson && produtos.every((p) => p && p.id !== undefined),
                                'Produtos têm preço': () =>
                                        !erroJson && produtos.every((p) => p && p.price !== undefined),
                                'Produtos têm estoque': () =>
                                        !erroJson && produtos.every((p) => p && p.stock !== undefined),
                        });
                        if (
                                resposta.status === 200 &&
                                !erroJson &&
                                Array.isArray(produtos) &&
                                produtos.length > 0
                        ) {
                                productIdsByVU[vuId] = produtos.map((p) => p.id);
                        } else {
                                productIdsByVU[vuId] = [];
                        }
                });

                sleep(2);

                group('Detalhe de produto', function () {
                        const ids = productIdsByVU[vuId] || [];
                        if (ids.length > 0) {
                                const idAleatorio = ids[Math.floor(Math.random() * ids.length)];
                                const resposta = http.get(`${BASE_URL}/api/checkout/products/${idAleatorio}`);
                                let produto = null;
                                let erroJson = false;
                                if (resposta.status === 200) {
                                        try {
                                                produto = resposta.json();
                                        } catch (e) {
                                                erroJson = true;
                                        }
                                }
                                check(resposta, {
                                        'Status 200': (r) => r.status === 200,
                                        'Produto tem nome': () => !erroJson && produto && produto.name,
                                        'Produto tem preço válido': () =>
                                                !erroJson && produto && produto.price > 0,
                                });
                        }
                });

                sleep(1);

                if (token) {
                        group('Checkout do pedido', function () {
                                const inicio = Date.now();
                                const ids = productIdsByVU[vuId] || [];
                                const itens =
                                        ids.length > 0
                                                ? gerarItensAleatorios(ids, 1, 3)
                                                : [{ productId: 1, quantity: 1 }];
                                const payload = JSON.stringify({ items: itens });
                                const params = montarHeaders(token);
                                const resposta = http.post(`${BASE_URL}/api/checkout`, payload, params);
                                checkoutTrend.add(Date.now() - inicio);
                                const sucesso = resposta.status === 201;
                                successfulCheckouts.add(sucesso);
                                if (!sucesso) checkoutErrors.add(1);
                                let pedido = null;
                                let erroJson = false;
                                if (resposta.status === 201) {
                                        try {
                                                pedido = resposta.json();
                                        } catch (e) {
                                                erroJson = true;
                                        }
                                }
                                check(resposta, {
                                        'Checkout status 201': (r) => r.status === 201,
                                        'Pedido tem ID': () =>
                                                !erroJson && pedido && pedido.order && pedido.order.id !== undefined,
                                        'Pedido tem total': () =>
                                                !erroJson && pedido && pedido.order && pedido.order.total !== undefined,
                                        'Pedido tem itens': () =>
                                                !erroJson && pedido && pedido.order && Array.isArray(pedido.order.items),
                                        'Status do pedido confirmado': () =>
                                                !erroJson && pedido && pedido.order && pedido.order.status === 'confirmed',
                                });
                        });

                        sleep(1);

                        group('Pedidos do usuário', function () {
                                const params = montarHeaders(token);
                                const resposta = http.get(`${BASE_URL}/api/checkout/orders`, params);
                                let pedidos = null;
                                let erroJson = false;
                                if (resposta.status === 200) {
                                        try {
                                                pedidos = resposta.json();
                                        } catch (e) {
                                                erroJson = true;
                                        }
                                }
                                check(resposta, {
                                        'Status 200': (r) => r.status === 200,
                                        'Retorna array de pedidos': () => !erroJson && Array.isArray(pedidos),
                                });
                        });
                }

                sleep(2);

}
