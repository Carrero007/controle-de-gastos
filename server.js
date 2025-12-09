/* server.js - Backend Node.js + Express
 * 
 * ATENÇÃO: Este sistema usa armazenamento em arquivo texto (dados.txt) e é
 * adequado APENAS para uso local/educacional. NÃO USE EM PRODUÇÃO.
 * Para produção, use um banco de dados real (PostgreSQL, MongoDB, etc).
 */

const express = require('express');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = 3000;
const DATA_FILE = path.join(__dirname, 'dados.txt');

// Middleware para parsear JSON e servir arquivos estáticos
app.use(express.json());
app.use(express.static(__dirname));

// Função auxiliar: lê dados.txt e retorna objeto JS
function lerDados() {
  try {
    // Verifica se o arquivo existe
    if (!fs.existsSync(DATA_FILE)) {
      // Cria arquivo com estrutura inicial
      const dadosIniciais = { saldo: 0, lancamentos: [] };
      fs.writeFileSync(DATA_FILE, JSON.stringify(dadosIniciais, null, 2));
      return dadosIniciais;
    }
    
    // Lê e parseia o arquivo
    const conteudo = fs.readFileSync(DATA_FILE, 'utf-8');
    return JSON.parse(conteudo);
  } catch (erro) {
    console.error('Erro ao ler dados:', erro);
    return { saldo: 0, lancamentos: [] };
  }
}

// Função auxiliar: escreve objeto JS em dados.txt
function salvarDados(dados) {
  try {
    // Escreve de forma atômica (substitui o arquivo inteiro)
    fs.writeFileSync(DATA_FILE, JSON.stringify(dados, null, 2));
    return true;
  } catch (erro) {
    console.error('Erro ao salvar dados:', erro);
    return false;
  }
}

// Função auxiliar: gera ID único baseado em timestamp
function gerarId() {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

// Função auxiliar: valida data no formato YYYY-MM-DD
function validarData(data) {
  const regex = /^\d{4}-\d{2}-\d{2}$/;
  if (!regex.test(data)) return false;
  const d = new Date(data);
  return d instanceof Date && !isNaN(d);
}

/* ============================================
   ROTAS DA API
   ============================================ */

// GET /api/dados - Retorna todos os dados
app.get('/api/dados', (req, res) => {
  try {
    const dados = lerDados();
    res.json(dados);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao buscar dados' });
  }
});

// POST /api/saldo - Atualiza o saldo inicial
app.post('/api/saldo', (req, res) => {
  try {
    const { saldo } = req.body;
    
    // Validação
    if (typeof saldo !== 'number' || isNaN(saldo)) {
      return res.status(400).json({ erro: 'Saldo deve ser um número válido' });
    }
    
    // Lê dados atuais, atualiza saldo, salva
    const dados = lerDados();
    dados.saldo = saldo;
    
    if (!salvarDados(dados)) {
      return res.status(500).json({ erro: 'Erro ao salvar saldo' });
    }
    
    res.json({ saldo: dados.saldo });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar saldo' });
  }
});

// POST /api/lancamentos - Cria novo lançamento
app.post('/api/lancamentos', (req, res) => {
  try {
    const { tipo, valor, categoria, descricao, data } = req.body;
    
    // Validações
    if (!tipo || !['gasto', 'receita'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo deve ser "gasto" ou "receita"' });
    }
    
    if (typeof valor !== 'number' || valor <= 0) {
      return res.status(400).json({ erro: 'Valor deve ser maior que zero' });
    }
    
    if (!categoria || categoria.trim() === '') {
      return res.status(400).json({ erro: 'Categoria é obrigatória' });
    }
    
    if (!data || !validarData(data)) {
      return res.status(400).json({ erro: 'Data inválida (use YYYY-MM-DD)' });
    }
    
    // Cria o lançamento com ID único
    const novoLancamento = {
      id: gerarId(),
      tipo,
      valor: parseFloat(valor.toFixed(2)),
      categoria: categoria.trim(),
      descricao: (descricao || '').trim(),
      data
    };
    
    // Adiciona aos dados e salva
    const dados = lerDados();
    dados.lancamentos.push(novoLancamento);
    
    if (!salvarDados(dados)) {
      return res.status(500).json({ erro: 'Erro ao salvar lançamento' });
    }
    
    res.status(201).json(novoLancamento);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao criar lançamento' });
  }
});

// PUT /api/lancamentos/:id - Atualiza lançamento existente
app.put('/api/lancamentos/:id', (req, res) => {
  try {
    const { id } = req.params;
    const { tipo, valor, categoria, descricao, data } = req.body;
    
    // Validações
    if (tipo && !['gasto', 'receita'].includes(tipo)) {
      return res.status(400).json({ erro: 'Tipo deve ser "gasto" ou "receita"' });
    }
    
    if (valor !== undefined && (typeof valor !== 'number' || valor <= 0)) {
      return res.status(400).json({ erro: 'Valor deve ser maior que zero' });
    }
    
    if (data && !validarData(data)) {
      return res.status(400).json({ erro: 'Data inválida (use YYYY-MM-DD)' });
    }
    
    // Busca o lançamento
    const dados = lerDados();
    const indice = dados.lancamentos.findIndex(l => l.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Lançamento não encontrado' });
    }
    
    // Atualiza apenas campos fornecidos
    if (tipo) dados.lancamentos[indice].tipo = tipo;
    if (valor) dados.lancamentos[indice].valor = parseFloat(valor.toFixed(2));
    if (categoria) dados.lancamentos[indice].categoria = categoria.trim();
    if (descricao !== undefined) dados.lancamentos[indice].descricao = descricao.trim();
    if (data) dados.lancamentos[indice].data = data;
    
    if (!salvarDados(dados)) {
      return res.status(500).json({ erro: 'Erro ao atualizar lançamento' });
    }
    
    res.json(dados.lancamentos[indice]);
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao atualizar lançamento' });
  }
});

// DELETE /api/lancamentos/:id - Deleta lançamento
app.delete('/api/lancamentos/:id', (req, res) => {
  try {
    const { id } = req.params;
    
    const dados = lerDados();
    const indice = dados.lancamentos.findIndex(l => l.id === id);
    
    if (indice === -1) {
      return res.status(404).json({ erro: 'Lançamento não encontrado' });
    }
    
    // Remove o lançamento
    dados.lancamentos.splice(indice, 1);
    
    if (!salvarDados(dados)) {
      return res.status(500).json({ erro: 'Erro ao deletar lançamento' });
    }
    
    res.json({ mensagem: 'Lançamento deletado com sucesso' });
  } catch (erro) {
    res.status(500).json({ erro: 'Erro ao deletar lançamento' });
  }
});

// Inicia o servidor
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log('Pressione Ctrl+C para encerrar');
});