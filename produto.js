function adicionarAoCarrinho(id, nome, descricao, preco, quantidade) {
    // Primeiro, busque o carrinho para pegar o último id.
    fetch('/api/carrinho')
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            // Verifica se há produtos no carrinho
            const produtos = data.carrinho;
            let novoId = 0; // Se não houver produtos, começamos com id 0

            if (produtos.length > 0) {
                // Se houver produtos, pegamos o id do último produto e somamos 1
                novoId = produtos[produtos.length - 1].id + 1;
            }

            // Agora, adicionamos o novo produto com o novo id gerado
            fetch('/api/carrinho', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    id: novoId, 
                    nome, 
                    descricao, 
                    preco, 
                    quantidade 
                })
            })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    alert(data.message);
                } else {
                    alert('Erro ao adicionar o produto.');
                }
            })
            .catch(error => console.error('Erro:', error));

        } else {
            alert('Erro ao carregar o carrinho para obter o ID do produto anterior.');
        }
    })
    .catch(error => console.error('Erro ao buscar o carrinho:', error));
}
