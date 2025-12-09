/* script.js - Lógica do Frontend
 * Sistema de Controle de Gastos
 */

/* ============================================
   VARIÁVEIS GLOBAIS E ESTADO
   ============================================ */

let dados = {
  saldo: 0,
  lancamentos: []
};

let filtroMes = null;
let filtroAno = null;
let modoEdicao = false;
let idEdicao = null;

// Instâncias dos gráficos Chart.js
let graficoDias = null;
let graficoCategorias = null;

/* ============================================
   INICIALIZAÇÃO
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // Carrega tema salvo
  carregarTema();
  
  // Define data padrão como hoje
  document.getElementById('data').valueAsDate = new Date();
  
  // Define filtro de mês como mês atual
  const hoje = new Date();
  const mesAtual = `${hoje.getFullYear()}-${String(hoje.getMonth() + 1).padStart(2, '0')}`;
  document.getElementById('filtro-mes').value = mesAtual;
  document.getElementById('filtro-ano').value = hoje.getFullYear();
  
  // Carrega dados iniciais
  carregarDados();
  
  // Event Listeners
  configurarEventListeners();
});

/* ============================================
   CONFIGURAÇÃO DE EVENT LISTENERS
   ============================================ */

function configurarEventListeners() {
  // Saldo
  document.getElementById('btn-atualizar-saldo').addEventListener('click', atualizarSaldo);
  
  // Formulário de lançamento
  document.getElementById('form-lancamento').addEventListener('submit', salvarLancamento);
  document.getElementById('btn-cancelar').addEventListener('click', cancelarEdicao);
  
  // Tema
  document.getElementById('tema-select').addEventListener('change', alterarTema);
  
  // Filtros
  document.getElementById('btn-aplicar-filtros').addEventListener('click', aplicarFiltros);
  
  // Exportar CSV
  document.getElementById('btn-exportar-csv').addEventListener('click', exportarCSV);
}

/* ============================================
   COMUNICAÇÃO COM API
   ============================================ */

// Carrega todos os dados do servidor
async function carregarDados() {
  try {
    const resposta = await fetch('/api/dados');
    if (!resposta.ok) throw new Error('Erro ao carregar dados');
    
    dados = await resposta.json();
    atualizarInterface();
  } catch (erro) {
    console.error('Erro ao carregar dados:', erro);
    mostrarToast('Erro ao carregar dados', true);
  }
}

// Atualiza o saldo inicial no servidor
async function atualizarSaldo() {
  const inputSaldo = document.getElementById('input-saldo');
  const valor = parseFloat(inputSaldo.value);
  
  // Validação
  if (isNaN(valor)) {
    mostrarToast('Digite um valor válido', true);
    return;
  }
  
  try {
    const resposta = await fetch('/api/saldo', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ saldo: valor })
    });
    
    if (!resposta.ok) throw new Error('Erro ao atualizar saldo');
    
    const resultado = await resposta.json();
    dados.saldo = resultado.saldo;
    
    inputSaldo.value = '';
    atualizarInterface();
    mostrarToast('Saldo atualizado com sucesso!');
  } catch (erro) {
    console.error('Erro ao atualizar saldo:', erro);
    mostrarToast('Erro ao atualizar saldo', true);
  }
}

// Salva ou atualiza um lançamento
async function salvarLancamento(e) {
  e.preventDefault();
  
  // Coleta dados do formulário
  const tipo = document.getElementById('tipo').value;
  const valor = parseFloat(document.getElementById('valor').value);
  const categoria = document.getElementById('categoria').value;
  const descricao = document.getElementById('descricao').value;
  const data = document.getElementById('data').value;
  
  // Validação básica
  if (valor <= 0) {
    mostrarToast('Valor deve ser maior que zero', true);
    return;
  }
  
  const lancamento = { tipo, valor, categoria, descricao, data };
  
  try {
    let resposta;
    
    if (modoEdicao) {
      // Atualizar lançamento existente
      resposta = await fetch(`/api/lancamentos/${idEdicao}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lancamento)
      });
    } else {
      // Criar novo lançamento
      resposta = await fetch('/api/lancamentos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(lancamento)
      });
    }
    
    if (!resposta.ok) throw new Error('Erro ao salvar lançamento');
    
    // Recarrega dados e atualiza interface
    await carregarDados();
    
    // Limpa formulário e reseta modo edição
    document.getElementById('form-lancamento').reset();
    document.getElementById('data').valueAsDate = new Date();
    cancelarEdicao();
    
    mostrarToast(modoEdicao ? 'Lançamento atualizado!' : 'Lançamento adicionado!');
  } catch (erro) {
    console.error('Erro ao salvar lançamento:', erro);
    mostrarToast('Erro ao salvar lançamento', true);
  }
}

// Deleta um lançamento
async function deletarLancamento(id) {
  if (!confirm('Tem certeza que deseja excluir este lançamento?')) return;
  
  try {
    const resposta = await fetch(`/api/lancamentos/${id}`, {
      method: 'DELETE'
    });
    
    if (!resposta.ok) throw new Error('Erro ao deletar lançamento');
    
    await carregarDados();
    mostrarToast('Lançamento excluído!');
  } catch (erro) {
    console.error('Erro ao deletar lançamento:', erro);
    mostrarToast('Erro ao deletar lançamento', true);
  }
}

/* ============================================
   INTERFACE - EDIÇÃO DE LANÇAMENTOS
   ============================================ */

function editarLancamento(id) {
  const lancamento = dados.lancamentos.find(l => l.id === id);
  if (!lancamento) return;
  
  // Preenche o formulário
  document.getElementById('tipo').value = lancamento.tipo;
  document.getElementById('valor').value = lancamento.valor;
  document.getElementById('categoria').value = lancamento.categoria;
  document.getElementById('descricao').value = lancamento.descricao || '';
  document.getElementById('data').value = lancamento.data;
  
  // Ativa modo edição
  modoEdicao = true;
  idEdicao = id;
  
  // Atualiza botões
  document.getElementById('btn-salvar').textContent = 'Salvar Alterações';
  document.getElementById('btn-cancelar').style.display = 'inline-block';
  
  // Scroll para o formulário
  document.querySelector('.lancamento-form').scrollIntoView({ behavior: 'smooth' });
}

function cancelarEdicao() {
  modoEdicao = false;
  idEdicao = null;
  
  document.getElementById('form-lancamento').reset();
  document.getElementById('data').valueAsDate = new Date();
  document.getElementById('btn-salvar').textContent = 'Adicionar';
  document.getElementById('btn-cancelar').style.display = 'none';
}

/* ============================================
   ATUALIZAÇÃO DA INTERFACE
   ============================================ */

function atualizarInterface() {
  atualizarSaldoDisplay();
  atualizarResumos();
  renderizarLista();
  atualizarGraficos();
}

// Atualiza o display do saldo atual
function atualizarSaldoDisplay() {
  const totalGastos = dados.lancamentos
    .filter(l => l.tipo === 'gasto')
    .reduce((acc, l) => acc + l.valor, 0);
  
  const totalReceitas = dados.lancamentos
    .filter(l => l.tipo === 'receita')
    .reduce((acc, l) => acc + l.valor, 0);
  
  const saldoAtual = dados.saldo - totalGastos + totalReceitas;
  
  document.getElementById('saldo-atual').textContent = formatarMoeda(saldoAtual);
}

// Atualiza cards de resumo (hoje, mês, ano)
function atualizarResumos() {
  const hoje = new Date();
  const hojeFmt = formatarData(hoje);
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  
  // Gasto hoje
  const gastoHoje = dados.lancamentos
    .filter(l => l.tipo === 'gasto' && l.data === hojeFmt)
    .reduce((acc, l) => acc + l.valor, 0);
  
  // Gasto mês atual
  const gastoMes = dados.lancamentos
    .filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return l.tipo === 'gasto' && d.getMonth() === mesAtual && d.getFullYear() === anoAtual;
    })
    .reduce((acc, l) => acc + l.valor, 0);
  
  // Gasto ano atual
  const gastoAno = dados.lancamentos
    .filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return l.tipo === 'gasto' && d.getFullYear() === anoAtual;
    })
    .reduce((acc, l) => acc + l.valor, 0);
  
  // Total receitas
  const totalReceitas = dados.lancamentos
    .filter(l => l.tipo === 'receita')
    .reduce((acc, l) => acc + l.valor, 0);
  
  document.getElementById('gasto-hoje').textContent = formatarMoeda(gastoHoje);
  document.getElementById('gasto-mes').textContent = formatarMoeda(gastoMes);
  document.getElementById('gasto-ano').textContent = formatarMoeda(gastoAno);
  document.getElementById('total-receitas').textContent = formatarMoeda(totalReceitas);
}

// Renderiza a lista de lançamentos
function renderizarLista() {
  const container = document.getElementById('lista-container');
  
  // Filtra lançamentos se houver filtros ativos
  let lancamentosFiltrados = [...dados.lancamentos];
  
  if (filtroMes) {
    const [ano, mes] = filtroMes.split('-').map(Number);
    lancamentosFiltrados = lancamentosFiltrados.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() + 1 === mes && d.getFullYear() === ano;
    });
  } else if (filtroAno) {
    lancamentosFiltrados = lancamentosFiltrados.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getFullYear() === filtroAno;
    });
  }
  
  // Ordena por data (mais recente primeiro)
  lancamentosFiltrados.sort((a, b) => new Date(b.data) - new Date(a.data));
  
  if (lancamentosFiltrados.length === 0) {
    container.innerHTML = '<p class="lista-vazia">Nenhum lançamento encontrado.</p>';
    return;
  }
  
  // Cria cards para cada lançamento
  container.innerHTML = lancamentosFiltrados.map(l => `
    <div class="lancamento-card">
      <div class="lancamento-tipo ${l.tipo}"></div>
      <div class="lancamento-info">
        <div class="lancamento-header">
          <span class="lancamento-categoria">${l.categoria}</span>
          <span class="lancamento-valor ${l.tipo}">
            ${l.tipo === 'gasto' ? '-' : '+'} ${formatarMoeda(l.valor)}
          </span>
        </div>
        ${l.descricao ? `<p class="lancamento-descricao">${l.descricao}</p>` : ''}
        <p class="lancamento-data">${formatarDataLegivel(l.data)}</p>
      </div>
      <div class="lancamento-acoes">
        <button class="btn btn-edit" onclick="editarLancamento('${l.id}')">Editar</button>
        <button class="btn btn-danger" onclick="deletarLancamento('${l.id}')">Excluir</button>
      </div>
    </div>
  `).join('');
}

/* ============================================
   GRÁFICOS (Chart.js)
   ============================================ */

function atualizarGraficos() {
  atualizarGraficoDias();
  atualizarGraficoCategorias();
}

// Gráfico de gastos por dia do mês
function atualizarGraficoDias() {
  const ctx = document.getElementById('grafico-dias');
  
  // Determina o mês a ser exibido
  let mes, ano;
  if (filtroMes) {
    [ano, mes] = filtroMes.split('-').map(Number);
  } else {
    const hoje = new Date();
    mes = hoje.getMonth() + 1;
    ano = hoje.getFullYear();
  }
  
  // Filtra gastos do mês
  const gastosDoMes = dados.lancamentos.filter(l => {
    if (l.tipo !== 'gasto') return false;
    const d = new Date(l.data + 'T00:00:00');
    return d.getMonth() + 1 === mes && d.getFullYear() === ano;
  });
  
  // Agrupa por dia
  const diasDoMes = new Date(ano, mes, 0).getDate();
  const gastosPorDia = Array(diasDoMes).fill(0);
  
  gastosDoMes.forEach(l => {
    const dia = new Date(l.data + 'T00:00:00').getDate();
    gastosPorDia[dia - 1] += l.valor;
  });
  
  // Labels (dias do mês)
  const labels = Array.from({ length: diasDoMes }, (_, i) => i + 1);
  
  // Destrói gráfico anterior se existir
  if (graficoDias) graficoDias.destroy();
  
  // Cria novo gráfico
  graficoDias = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: labels,
      datasets: [{
        label: 'Gastos (R$)',
        data: gastosPorDia,
        backgroundColor: getComputedStyle(document.documentElement)
          .getPropertyValue('--accent-2').trim(),
        borderRadius: 8
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: { display: false }
      },
      scales: {
        y: { 
          beginAtZero: true,
          ticks: { color: '#b4b4b8' },
          grid: { color: 'rgba(255,255,255,0.1)' }
        },
        x: { 
          ticks: { color: '#b4b4b8' },
          grid: { display: false }
        }
      }
    }
  });
}

// Gráfico de distribuição por categoria
function atualizarGraficoCategorias() {
  const ctx = document.getElementById('grafico-categorias');
  
  // Determina o período
  let gastosParaGrafico = dados.lancamentos.filter(l => l.tipo === 'gasto');
  
  if (filtroMes) {
    const [ano, mes] = filtroMes.split('-').map(Number);
    gastosParaGrafico = gastosParaGrafico.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() + 1 === mes && d.getFullYear() === ano;
    });
  } else if (filtroAno) {
    gastosParaGrafico = gastosParaGrafico.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getFullYear() === filtroAno;
    });
  } else {
    // Mês atual por padrão
    const hoje = new Date();
    gastosParaGrafico = gastosParaGrafico.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() === hoje.getMonth() && d.getFullYear() === hoje.getFullYear();
    });
  }
  
  // Agrupa por categoria
  const porCategoria = {};
  gastosParaGrafico.forEach(l => {
    if (!porCategoria[l.categoria]) porCategoria[l.categoria] = 0;
    porCategoria[l.categoria] += l.valor;
  });
  
  const categorias = Object.keys(porCategoria);
  const valores = Object.values(porCategoria);
  
  // Cores pastéis para cada categoria
  const coresCategorias = [
    '#A3D2CA', '#F6C6EA', '#FDE68A', '#BFA5D9',
    '#A8E6CF', '#FFD3B6', '#FFAAA5', '#C7CEEA'
  ];
  
  // Destrói gráfico anterior
  if (graficoCategorias) graficoCategorias.destroy();
  
  // Cria gráfico de pizza
  graficoCategorias = new Chart(ctx, {
    type: 'pie',
    data: {
      labels: categorias,
      datasets: [{
        data: valores,
        backgroundColor: coresCategorias.slice(0, categorias.length),
        borderWidth: 2,
        borderColor: '#1a1d24'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        legend: {
          position: 'bottom',
          labels: { color: '#b4b4b8', padding: 15 }
        }
      }
    }
  });
}

/* ============================================
   FILTROS
   ============================================ */

function aplicarFiltros() {
  const mes = document.getElementById('filtro-mes').value;
  const ano = document.getElementById('filtro-ano').value;
  
  // Define filtros globais
  if (mes) {
    filtroMes = mes;
    filtroAno = null;
  } else if (ano) {
    filtroAno = parseInt(ano);
    filtroMes = null;
  } else {
    filtroMes = null;
    filtroAno = null;
  }
  
  atualizarInterface();
  mostrarToast('Filtros aplicados!');
}

/* ============================================
   EXPORTAÇÃO CSV
   ============================================ */

function exportarCSV() {
  // Filtra lançamentos conforme filtros ativos
  let lancamentosParaExportar = [...dados.lancamentos];
  
  if (filtroMes) {
    const [ano, mes] = filtroMes.split('-').map(Number);
    lancamentosParaExportar = lancamentosParaExportar.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getMonth() + 1 === mes && d.getFullYear() === ano;
    });
  } else if (filtroAno) {
    lancamentosParaExportar = lancamentosParaExportar.filter(l => {
      const d = new Date(l.data + 'T00:00:00');
      return d.getFullYear() === filtroAno;
    });
  }
  
  if (lancamentosParaExportar.length === 0) {
    mostrarToast('Nenhum lançamento para exportar', true);
    return;
  }
  
  // Cria CSV
  let csv = 'Data,Tipo,Categoria,Descrição,Valor\n';
  
  lancamentosParaExportar.forEach(l => {
    const linha = [
      l.data,
      l.tipo,
      l.categoria,
      `"${l.descricao || ''}"`,
      l.valor.toFixed(2)
    ].join(',');
    csv += linha + '\n';
  });
  
  // Download do arquivo
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  
  link.setAttribute('href', url);
  link.setAttribute('download', `gastos_${new Date().toISOString().split('T')[0]}.csv`);
  link.style.visibility = 'hidden';
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  
  mostrarToast('CSV exportado com sucesso!');
}

/* ============================================
   TEMAS
   ============================================ */

function carregarTema() {
  const temaSalvo = localStorage.getItem('tema') || 'tema1';
  document.body.className = temaSalvo;
  document.getElementById('tema-select').value = temaSalvo;
}

function alterarTema(e) {
  const tema = e.target.value;
  document.body.className = tema;
  localStorage.setItem('tema', tema);
  
  // Atualiza gráficos com novas cores
  atualizarGraficos();
}

/* ============================================
   UTILIDADES
   ============================================ */

// Formata número como moeda brasileira
function formatarMoeda(valor) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(valor);
}

// Formata data como YYYY-MM-DD
function formatarData(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

// Formata data para exibição (DD/MM/YYYY)
function formatarDataLegivel(dataISO) {
  const [ano, mes, dia] = dataISO.split('-');
  return `${dia}/${mes}/${ano}`;
}

// Exibe mensagem toast
function mostrarToast(mensagem, erro = false) {
  const toast = document.getElementById('toast');
  toast.textContent = mensagem;
  toast.className = 'toast show' + (erro ? ' error' : '');
  
  setTimeout(() => {
    toast.className = 'toast';
  }, 3000);
}