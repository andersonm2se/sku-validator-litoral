// Dados da aplicação
let dadosCompletos = {};
let dadosCarregados = false;
let paginaAtual = {
  'validados': 1,
  'sem-trib': 1,
  'desativados': 1,
  'sem-preco': 1,
  'nao-cadastrados': 1
};
let itensPorPagina = 30; // Novo padrão (pode ser alterado pelo select)

// Dados simulados para não cadastrados
const naoCadastrados = [
  "7899999999001", "7899999999002", "7899999999003", "7899999999004", "7899999999005",
  "7899999999006", "7899999999007", "7899999999008", "7899999999009", "7899999999010"
];

// Inicializar a aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function () {
  inicializarAbas();
  carregarDadosIniciais();

  // Evento do select de itens por página
  const selectItens = document.getElementById('itensPorPaginaSelect');
  if (selectItens) {
    selectItens.value = itensPorPagina; // garantir valor inicial igual ao default
    selectItens.addEventListener('change', function () {
      itensPorPagina = parseInt(this.value, 10);
      // Recarrega aba ativa na página 1
      const abaAtiva = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'validados';
      paginaAtual[abaAtiva] = 1;
      carregarDadosTabela(abaAtiva);
    });
  }
});

// Carregar dados iniciais (fallback primeiro, depois tentar API)
function carregarDadosIniciais() {
  // Dados fallback para garantir que a aplicação funcione
  dadosCompletos = {
    'validados': [],
    'sem-trib': [],
    'desativados': [],
    'sem-preco': [],
    'nao-cadastrados': naoCadastrados
  };

  // Gerar dados de exemplo para cada categoria
  for (let i = 1; i <= 25; i++) {
    dadosCompletos.validados.push({
      "Codigo": 1000000 + i,
      "CodBarras": `789629207005${i}`,
      "TipoCodigo": "Principal",
      "Descricao": `Produto Validado ${i} - Descrição do produto`,
      "NCM": "19053100",
      "PrVenda": (Math.random() * 50).toFixed(2),
      "Estoque": Math.floor(Math.random() * 100),
      "Emb": "UN",
      "Ativo": "Sim",
      "CodTrib": "1921",
      "ICMS": "Substituição Tributária",
      "PisCofins": "Tributado"
    });
  }
  for (let i = 1; i <= 8; i++) {
    dadosCompletos['sem-trib'].push({
      "Codigo": 2000000 + i,
      "CodBarras": `789602063254${i}`,
      "TipoCodigo": "Principal",
      "Descricao": `Produto Sem Tributação ${i}`,
      "NCM": "16025000",
      "PrVenda": (Math.random() * 40).toFixed(2),
      "Estoque": Math.floor(Math.random() * 50),
      "Emb": "UN",
      "Ativo": "Sim",
      "CodTrib": "999",
      "ICMS": "",
      "PisCofins": ""
    });
  }
  for (let i = 1; i <= 30; i++) {
    dadosCompletos.desativados.push({
      "Codigo": 3000000 + i,
      "CodBarras": `789602063101${i}`,
      "TipoCodigo": "Principal",
      "Descricao": `Produto Desativado ${i}`,
      "NCM": "73239900",
      "PrVenda": (Math.random() * 30).toFixed(2),
      "Estoque": 0,
      "Emb": "UN",
      "Ativo": "Não",
      "CodTrib": "999",
      "ICMS": "",
      "PisCofins": ""
    });
  }
  for (let i = 1; i <= 5; i++) {
    dadosCompletos['sem-preco'].push({
      "Codigo": 4000000 + i,
      "CodBarras": `000000100627${i}`,
      "TipoCodigo": "Principal",
      "Descricao": `Produto Sem Preço ${i}`,
      "NCM": "33059000",
      "PrVenda": 0.0,
      "Estoque": 0,
      "Emb": "UN",
      "Ativo": "Sim",
      "CodTrib": "3316",
      "ICMS": "Tributado 20%",
      "PisCofins": "Não Tributado"
    });
  }
  dadosCarregados = true;
  carregarDadosTabela('validados');
  carregarDadosAPI();
}

// Tentar carregar dados reais da API
async function carregarDadosAPI() {
  try {
    const response = await fetch('https://ppl-ai-code-interpreter-files.s3.amazonaws.com/web/direct-files/e11201f1abd292e54c049eb66dcc5292/aa41899c-489a-4305-84b6-612d258ac281/9026008d.json');
    if (response.ok) {
      const dados = await response.json();
      dadosCompletos = {
        'validados': dados.dados_completos.Log_Validados || dadosCompletos.validados,
        'sem-trib': dados.dados_completos.Log_SemTrib || dadosCompletos['sem-trib'],
        'desativados': dados.dados_completos.Log_Desativados || dadosCompletos.desativados,
        'sem-preco': dados.dados_completos.Log_Sem_PrVenda || dadosCompletos['sem-preco'],
        'nao-cadastrados': naoCadastrados
      };
      const abaAtiva = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'validados';
      carregarDadosTabela(abaAtiva);
    }
  } catch (error) {
    // Backup já carregado
  }
}

// Inicializar sistema de abas
function inicializarAbas() {
  const botoes = document.querySelectorAll('.tab-button');
  botoes.forEach(botao => {
    const tabId = botao.getAttribute('data-tab');
    botao.addEventListener('click', function (e) {
      e.preventDefault();
      e.stopPropagation();
      ativarAba(tabId);
    });
  });
}

function ativarAba(tabId) {
  // Remover classes active de todos
  document.querySelectorAll('.tab-button').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
  // Ativar os certos
  const botaoAtivo = document.querySelector(`[data-tab="${tabId}"]`);
  const painelAtivo = document.getElementById(`tab-${tabId}`);
  if (botaoAtivo) botaoAtivo.classList.add('active');
  if (painelAtivo) painelAtivo.classList.add('active');
  paginaAtual[tabId] = 1;
  carregarDadosTabela(tabId);
}

// Carregar dados na tabela da aba específica
function carregarDadosTabela(tabId) {
  if (!dadosCarregados) return;
  const dados = dadosCompletos[tabId] || [];
  const tbody = document.getElementById(`tbody-${tabId}`);
  if (!tbody) return;

  tbody.innerHTML = '';
  // Paginação
  const paginaAtualAba = paginaAtual[tabId] || 1;
  const inicio = (paginaAtualAba - 1) * itensPorPagina;
  const fim = inicio + itensPorPagina;
  const dadosPagina = dados.slice(inicio, fim);

  if (tabId === 'nao-cadastrados') {
    preencherTabelaNaoCadastrados(tbody, dadosPagina);
  } else {
    preencherTabelaProdutos(tbody, dadosPagina);
  }
  atualizarPaginacao(tabId, dados.length);
}

function preencherTabelaProdutos(tbody, dados) {
  if (dados.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td colspan="12">Nenhum produto encontrado.</td>';
    tbody.appendChild(tr);
    return;
  }
  dados.forEach(item => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.Codigo || ''}</td>
      <td>${item.CodBarras || ''}</td>
      <td>${item.TipoCodigo || ''}</td>
      <td>${item.Descricao || ''}</td>
      <td>${item.NCM || ''}</td>
      <td>R$ ${item.PrVenda != null ? Number(item.PrVenda).toFixed(2) : ''}</td>
      <td>${item.Estoque != null ? item.Estoque : ''}</td>
      <td>${item.Emb || ''}</td>
      <td>${item.Ativo || ''}</td>
      <td>${item.CodTrib || ''}</td>
      <td>${item.ICMS || ''}</td>
      <td>${item.PisCofins || ''}</td>`;
    tbody.appendChild(tr);
  });
}

function preencherTabelaNaoCadastrados(tbody, dados) {
  if (dados.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = '<td>Nenhum código não cadastrado encontrado.</td>';
    tbody.appendChild(tr);
    return;
  }
  dados.forEach(codigo => {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${codigo}</td>`;
    tbody.appendChild(tr);
  });
}

// Paginação
function atualizarPaginacao(tabId, totalItens) {
  const paginacaoDiv = document.getElementById(`pagination-${tabId}`);
  if (!paginacaoDiv) return;
  paginacaoDiv.innerHTML = '';
  const totalPaginas = Math.ceil(totalItens / itensPorPagina);
  if (totalPaginas < 2) return;

  const pagAtual = paginaAtual[tabId];

  // Botão anterior
  const btnPrev = document.createElement('button');
  btnPrev.textContent = '<';
  btnPrev.disabled = pagAtual <= 1;
  btnPrev.onclick = function () {
    if (paginaAtual[tabId] > 1) {
      paginaAtual[tabId]--;
      carregarDadosTabela(tabId);
    }
  };
  paginacaoDiv.appendChild(btnPrev);

  // Páginas numeradas
  for (let i = 1; i <= totalPaginas; i++) {
    if (i > pagAtual + 2 || i < pagAtual - 2) {
      if (i === 1 || i === totalPaginas) {
        const el = document.createElement('button');
        el.textContent = i;
        if (i === pagAtual) el.classList.add('active');
        el.onclick = function () {
          paginaAtual[tabId] = i;
          carregarDadosTabela(tabId);
        };
        paginacaoDiv.appendChild(el);
        if (i === 1 && pagAtual > 4) paginacaoDiv.appendChild(document.createTextNode(' ... '));
        if (i === totalPaginas && pagAtual < totalPaginas - 3) paginacaoDiv.appendChild(document.createTextNode(' ... '));
      }
      continue;
    }
    const btn = document.createElement('button');
    btn.textContent = i;
    if (i === pagAtual) btn.classList.add('active');
    btn.onclick = function () {
      paginaAtual[tabId] = i;
      carregarDadosTabela(tabId);
    };
    paginacaoDiv.appendChild(btn);
  }

  // Botão próximo
  const btnNext = document.createElement('button');
  btnNext.textContent = '>';
  btnNext.disabled = pagAtual >= totalPaginas;
  btnNext.onclick = function () {
    if (paginaAtual[tabId] < totalPaginas) {
      paginaAtual[tabId]++;
      carregarDadosTabela(tabId);
    }
  };
  paginacaoDiv.appendChild(btnNext);
}
