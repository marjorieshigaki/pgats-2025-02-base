// Funções de autenticação para uso nos testes de performance
import http from 'k6/http';

// Realiza login e retorna o token JWT
export function autenticarUsuario(email, senha, baseUrl) {
    const payload = JSON.stringify({ email, password: senha });
    const headers = { 'Content-Type': 'application/json' };
    const resposta = http.post(`${baseUrl}/api/users/login`, payload, { headers });
    if (resposta.status === 200 && resposta.json('token')) {
        return resposta.json('token');
    }
    return null;
}

// Monta headers de autenticação para requisições protegidas
export function montarHeaders(token) {
    return {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };
}
