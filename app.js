const express = require('express');
const path = require('path');
const fs = require('fs');
const app = express();
const PORT = 3000;

// Middleware para servir arquivos estáticos da pasta "public"
app.use(express.static(path.join(__dirname, 'public')));

// Middleware para processar dados enviados via formulário
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Rota para exibir a página de cadastro (cadastro.html)
app.get('/cadastro', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cadastro.html'));
});

// Rota para exibir a página de login (login.html)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Rota POST para o cadastro
app.post('/api/cadastrar', (req, res) => {
    const { nome, email, senha } = req.body;

    if (!nome || !email || !senha) {
        return res.status(400).json({ success: false, message: 'Todos os campos são obrigatórios.' });
    }

    const filePath = path.join(__dirname, 'data', 'registros.json');

    fs.readFile(filePath, 'utf8', (err, data) => {
        let registros = [];
        if (!err && data) {
            registros = JSON.parse(data);
        }

        const novoRegistro = {
            id: registros.length + 1,
            nome,
            email,
            senha
        };

        registros.push(novoRegistro);

        fs.writeFile(filePath, JSON.stringify(registros, null, 2), (err) => {
            if (err) {
                console.error('Erro ao salvar o registro:', err);
                return res.status(500).json({ success: false, message: 'Erro ao salvar o cadastro.' });
            }

            return res.status(200).json({ success: true, message: 'Cadastro realizado com sucesso!' });
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
                return res.status(200).json({ success: true, message: 'Login realizado com sucesso!' });
            } else {
                return res.status(401).json({ success: false, message: 'Email ou senha incorretos.' });
            }
        } catch (parseError) {
            console.error('Erro ao fazer o parsing do JSON de registros:', parseError);
            return res.status(500).json({ success: false, message: 'Erro ao processar o login.' });
        }
    });
});

// Iniciar o servidor
app.listen(PORT, () => {
    console.log(`Servidor rodando em http://localhost:${PORT}`);
});