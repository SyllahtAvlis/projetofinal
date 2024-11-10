document.addEventListener("DOMContentLoaded", () => {
    // Função para carregar o carrinho
    const carregarCarrinho = () => {
        fetch('/api/carrinho')
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    const produtos = data.carrinho;
                    const carrinhoContainer = document.getElementById('carrinho');

                    // Limpa o conteúdo atual do carrinho para evitar duplicatas
                    carrinhoContainer.innerHTML = '';

                    produtos.forEach(produto => {
                        // Verifica o nome do produto e define a imagem correta
                        let imagemProduto;
                        switch (produto.nome.trim()) {
                            case "Espada Ninja":
                                imagemProduto = "https://reidacutelaria.vteximg.com.br/arquivos/ids/171991-654-654/ZS-597.jpg?v=637298292764670000";
                                break;
                            case "Espada Samurai":
                                imagemProduto = "https://reidacutelaria.vteximg.com.br/arquivos/ids/176023-2000-2000/ZS-610.jpg?v=637565932701630000";
                                break;
                            case "Espada Medieval":
                                imagemProduto = "https://reidacutelaria.vteximg.com.br/arquivos/ids/190353-654-654/SB-053-S_3.jpg?v=638530231012300000";
                                break;
                            default:
                                imagemProduto = produto.imagem || ""; // Imagem padrão ou vazia
                        }

                        console.log(`Produto: ${produto.nome}, Imagem: ${imagemProduto}`); // Verifica a URL de cada produto

                        const row = document.createElement('tr');
                        row.innerHTML = `
                            <td>${produto.nome}</td>
                            <td><img src="${imagemProduto}" alt="${produto.nome}" width="50"></td>
                            <td><input type="number" class="quantidade" value="${produto.quantidade}" min="1" data-id="${produto.id}"></td>
                            <td class="preco-unitario">R$ ${produto.preco.toFixed(2)}</td>
                            <td class="preco-total">R$ ${(produto.preco * produto.quantidade).toFixed(2)}</td>
                            <td><button class="remover-produto" data-id="${produto.id}">Remover</button></td>
                        `;

                        carrinhoContainer.appendChild(row);

                        // Atualizar o preço total ao alterar a quantidade
                        const quantidadeInput = row.querySelector('.quantidade');
                        quantidadeInput.addEventListener('input', () => {
                            atualizarPrecoTotal(row);
                            calcularTotalFinal();
                        });

                        // Adiciona o evento de clique para remover produto
                        const removerButton = row.querySelector('.remover-produto');
                        removerButton.addEventListener('click', () => {
                            removerProdutoCarrinho(produto.id);
                        });
                    });

                    // Calcula o total final ao carregar o carrinho
                    calcularTotalFinal();
                } else {
                    console.error('Erro ao carregar produtos do carrinho:', data.message);
                }
            })
            .catch(error => {
                console.error('Erro ao fazer a requisição:', error);
            });
    };

    // Função para atualizar o preço total de cada produto baseado na quantidade
    function atualizarPrecoTotal(produtoLinha) {
        const quantidade = produtoLinha.querySelector('.quantidade').value;
        const precoUnitario = parseFloat(produtoLinha.querySelector('.preco-unitario').innerText.replace('R$', '').replace(',', '.'));
        const precoTotal = quantidade * precoUnitario;

        // Atualiza o valor total do produto na linha
        produtoLinha.querySelector('.preco-total').innerText = `R$ ${precoTotal.toFixed(2).replace('.', ',')}`;
    }

    // Função para calcular o total final do carrinho
    function calcularTotalFinal() {
        let totalFinal = 0;
        const produtos = document.querySelectorAll('tbody tr');

        produtos.forEach(produtoLinha => {
            const precoTotal = parseFloat(produtoLinha.querySelector('.preco-total').innerText.replace('R$', '').replace(',', '.'));
            totalFinal += precoTotal;
        });

        // Atualiza o valor total final no HTML
        document.getElementById('total-final').innerText = `R$ ${totalFinal.toFixed(2).replace('.', ',')}`;
    }

    // Função para remover um produto do carrinho
    const removerProdutoCarrinho = (produtoId) => {
        fetch(`/api/carrinho/${produtoId}`, {
            method: 'DELETE',
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Recarrega o carrinho após a remoção
                carregarCarrinho();
            } else {
                console.error('Erro ao remover produto do carrinho:', data.message);
            }
        })
        .catch(error => {
            console.error('Erro ao fazer a requisição para remover produto:', error);
        });
    };

    // Carrega o carrinho ao inicializar a página
    carregarCarrinho();
});
