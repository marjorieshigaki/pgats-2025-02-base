// Geração de dados aleatórios para simular cenários reais

// Retorna um inteiro aleatório entre min e max (inclusive)
function numeroAleatorio(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

// Seleciona produtos aleatórios para o carrinho
export function gerarItensAleatorios(idsProdutos, min, max) {
    const quantidade = numeroAleatorio(min, max);
    const itens = [];
    for (let i = 0; i < quantidade; i++) {
        const idx = numeroAleatorio(0, idsProdutos.length - 1);
        itens.push({
            productId: idsProdutos[idx],
            quantity: numeroAleatorio(1, 5)
        });
    }
    return itens;
}
