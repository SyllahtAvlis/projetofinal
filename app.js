const express = require('express'); 
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware para servir arquivos estáticos e processar dados
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Função auxiliar para leitura de JSON com tratamento de erros
function readJSONFile(filePath, res, callback) {
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            console.error(`Erro ao ler o arquivo: ${filePath}`, err);
            return res.status(500).json({ success: false, message: 'Erro ao processar a solicitação.' });
        }
        try {
            const jsonData = JSON.parse(data || '[]');
            callback(jsonData);
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do JSON:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar o arquivo JSON.' });
        }
    });
}

// Rota para exibir páginas
app.get('/cadastro', (req, res) => res.sendFile(path.join(__dirname, 'public', 'cadastro.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));

// Rota POST para o cadastro
app.post('/api/cadastrar', (req, res) => {
    const { nome, email, senha } = req.body;
    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }
    const filePath = path.join(__dirname, 'data', 'registros.json');
    readJSONFile(filePath, res, (registros) => {
        const novoRegistro = { id: registros.length + 1, nome, email, senha };
        registros.push(novoRegistro);
        fs.writeFile(filePath, JSON.stringify(registros, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o registro:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar o cadastro.' });
            }
            res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso!' });
        });
    });
});

// Rota POST para o login
app.post('/login', (req, res) => {
    const { email, senha } = req.body;

    const registrosPath = path.join(__dirname, 'data', 'registros.json');

    fs.readFile(registrosPath, 'utf8', (err, data) => {
        if (err) {
            console.error('Erro ao ler o arquivo de registros:', err);
            return res.status(500).json({ success: false, message: 'Erro ao processar o login.' });
        }

        try {
            const usuarios = JSON.parse(data);
            const usuarioEncontrado = usuarios.find(
                usuario => usuario.email === email && usuario.senha === senha
            );

            if (usuarioEncontrado) {
                // Redireciona para a página index.html em caso de sucesso no login
                return res.redirect('/index.html');
            } else {
                return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
            }
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do JSON de registros:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar o login.' });
        }
    });
});

// Rota POST para adicionar ao carrinho
app.post('/api/carrinho', (req, res) => {
    const { id, nome, descricao, preco, quantidade } = req.body;
    const carrinhoPath = path.join(__dirname, 'data', 'carrinho.json');
    readJSONFile(carrinhoPath, res, (carrinho) => {
        const novoProduto = { id, nome, descricao, preco, quantidade };
        carrinho.push(novoProduto);
        fs.writeFile(carrinhoPath, JSON.stringify(carrinho, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o produto no carrinho:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar o produto no carrinho.' });
            }
            res.status(200).json({ success: true, message: 'Produto adicionado ao carrinho com sucesso!' });
        });
    });
});

// Rota GET para obter o carrinho
app.get('/api/carrinho', (req, res) => {
    const carrinhoPath = path.join(__dirname, 'data', 'carrinho.json');
    readJSONFile(carrinhoPath, res, (carrinho) => {
        res.status(200).json({ success: true, carrinho });
    });
});

// Rota DELETE para remover um item do carrinho pelo ID
app.delete('/api/carrinho/:id', (req, res) => {
    const produtoId = parseInt(req.params.id);
    const carrinhoPath = path.join(__dirname, 'data', 'carrinho.json');

    readJSONFile(carrinhoPath, res, (carrinho) => {
        const novoCarrinho = carrinho.filter(item => item.id !== produtoId);

        // Salvar o carrinho atualizado após a remoção
        fs.writeFile(carrinhoPath, JSON.stringify(novoCarrinho, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o carrinho atualizado:', err);
                return res.status(500).json({ success: false, message: 'Erro ao atualizar o carrinho.' });
            }
            res.status(200).json({ success: true, message: 'Produto removido do carrinho com sucesso!' });
        });
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});
