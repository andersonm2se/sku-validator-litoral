// Base da API centralizada
const API_BASE = "https://validator.cavaleiroexpress.com.br";

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
const itensPorPagina = 30;

// Dados simulados para não cadastrados
const naoCadastrados = [
    "7899999999001", "7899999999002", "7899999999003", "7899999999004", "7899999999005",
    "7899999999006", "7899999999007", "7899999999008", "7899999999009", "7899999999010"
];

// Inicializar a aplicação quando DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM carregado - Iniciando aplicação...');
    inicializarAbas();
    carregarDadosIniciais();
});

// Carregar dados iniciais (fallback primeiro, depois tentar API)
function carregarDadosIniciais() {
    console.log('Carregando dados iniciais...');
    
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
    console.log('Dados carregados:', dadosCompletos);
    
    // Carregar primeira aba
    carregarDadosTabela('validados');
    
    // Tentar carregar dados reais da API
    carregarDadosAPI();
}

// Tentar carregar dados reais da API
async function carregarDadosAPI() {
    try {
        console.log('Tentando carregar dados da API...');

        // 🔹 Carrega todas as rotas em paralelo já usando o domínio HTTPS
        const [validados, semTrib, desativados, semPreco, naoCadastrados] = await Promise.all([
            fetch(`${API_BASE}/logs/validados`).then(r => r.json()),
            fetch(`${API_BASE}/logs/sem-tributacao`).then(r => r.json()),
            fetch(`${API_BASE}/logs/desativados`).then(r => r.json()),
            fetch(`${API_BASE}/logs/sem-prvenda`).then(r => r.json()),
            fetch(`${API_BASE}/logs/sem-cadastro`).then(r => r.json())
        ]);

        // 🔹 Ajusta para o formato esperado pelas tabelas
        dadosCompletos = {
            'validados': validados.map(l => l.produto || {}),
            'sem-trib': semTrib.map(l => l.produto || {}),
            'desativados': desativados.map(l => l.produto || {}),
            'sem-preco': semPreco.map(l => l.produto || {}),
            'nao-cadastrados': naoCadastrados.map(l => l.codigo || '')
        };

        dadosCarregados = true;

        // 🔹 Atualiza os contadores do Dashboard Geral
        document.getElementById("validados-count").textContent = dadosCompletos['validados'].length;
        document.getElementById("sem-trib-count").textContent = dadosCompletos['sem-trib'].length;
        document.getElementById("desativados-count").textContent = dadosCompletos['desativados'].length;
        document.getElementById("sem-preco-count").textContent = dadosCompletos['sem-preco'].length;
        document.getElementById("nao-cadastrados-count").textContent = dadosCompletos['nao-cadastrados'].length;

        // Total
        const total = dadosCompletos['validados'].length +
                      dadosCompletos['sem-trib'].length +
                      dadosCompletos['desativados'].length +
                      dadosCompletos['sem-preco'].length +
                      dadosCompletos['nao-cadastrados'].length;
        document.getElementById("total-count").textContent = total;

        // 🔹 Recarregar a aba ativa
        const abaAtiva = document.querySelector('.tab-button.active')?.getAttribute('data-tab') || 'validados';
        carregarDadosTabela(abaAtiva);

        console.log('✅ Dados reais carregados e exibidos');

    } catch (error) {
        console.error('❌ Erro ao carregar dados da API:', error);
        console.log('Mantendo dados de fallback...');
    }
}

// Inicializar sistema de abas
function inicializarAbas() {
    console.log('Inicializando sistema de abas...');
    const botoes = document.querySelectorAll('.tab-button');
    
    botoes.forEach(botao => {
        const tabId = botao.getAttribute('data-tab');
        console.log('Configurando botão para aba:', tabId);
        
        botao.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            console.log('=== CLIQUE NA ABA:', tabId, '===');
            ativarAba(tabId);
        });
    });
    
    console.log('Sistema de abas inicializado');
}

// Ativar aba específica
function ativarAba(tabId) {
    console.log('--- Ativando aba:', tabId, '---');
    
    try {
        // 1. Remover todas as classes active
        const todosBotoes = document.querySelectorAll('.tab-button');
        const todosPaineis = document.querySelectorAll('.tab-panel');
        
        console.log('Encontrados', todosBotoes.length, 'botões e', todosPaineis.length, 'painéis');
        
        todosBotoes.forEach(btn => {
            btn.classList.remove('active');
            console.log('Removido active de botão:', btn.getAttribute('data-tab'));
        });
        
        todosPaineis.forEach(panel => {
            panel.classList.remove('active');
            console.log('Removido active de painel:', panel.id);
        });
        
        // 2. Adicionar classe active aos elementos corretos
        const botaoAtivo = document.querySelector(`[data-tab="${tabId}"]`);
        const painelAtivo = document.getElementById(`tab-${tabId}`);
        
        console.log('Botão encontrado:', botaoAtivo ? 'SIM' : 'NÃO');
        console.log('Painel encontrado:', painelAtivo ? 'SIM' : 'NÃO');
        
        if (botaoAtivo) {
            botaoAtivo.classList.add('active');
            console.log('Adicionado active ao botão:', tabId);
        }
        
        if (painelAtivo) {
            painelAtivo.classList.add('active');
            console.log('Adicionado active ao painel:', tabId);
        }
        
        // 3. Resetar página e carregar dados
        paginaAtual[tabId] = 1;
        carregarDadosTabela(tabId);
        
        console.log('--- Aba ativada com sucesso:', tabId, '---');
        
    } catch (error) {
        console.error('Erro ao ativar aba:', error);
    }
}

// Carregar dados na tabela da aba específica
function carregarDadosTabela(tabId) {
    console.log('>>> Carregando dados para aba:', tabId);
    
    if (!dadosCarregados) {
        console.log('Dados ainda não carregados, aguardando...');
        return;
    }
    
    const dados = dadosCompletos[tabId] || [];
    console.log('Dados encontrados para', tabId, ':', dados.length, 'itens');
    
    const tbody = document.getElementById(`tbody-${tabId}`);
    if (!tbody) {
        console.error('ERRO: tbody não encontrado para:', tabId);
        return;
    }
    
    // Limpar tabela
    tbody.innerHTML = '';
    
    // Calcular paginação
    const paginaAtualAba = paginaAtual[tabId] || 1;
    const inicio = (paginaAtualAba - 1) * itensPorPagina;
    const fim = inicio + itensPorPagina;
    const dadosPagina = dados.slice(inicio, fim);
    
    console.log(`Exibindo página ${paginaAtualAba}: itens ${inicio} a ${fim-1} (${dadosPagina.length} itens)`);
    
    // Preencher tabela
    if (tabId === 'nao-cadastrados') {
        preencherTabelaNaoCadastrados(tbody, dadosPagina);
    } else {
        preencherTabelaProdutos(tbody, dadosPagina);
    }
    
    // Atualizar controles de paginação
    atualizarPaginacao(tabId, dados.length);
    
    console.log('<<< Dados carregados com sucesso para aba:', tabId);
}

// Preencher tabela de produtos normais
function preencherTabelaProdutos(tbody, dados) {
    console.log('Preenchendo tabela de produtos com', dados.length, 'itens');
    
    if (dados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="13" style="text-align: center; padding: 20px;">Nenhum produto encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    dados.forEach(log => {
        const p = log.produto || {}; // produto dentro do log
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${p.Codigo || ''}</td>
            <td>${p.CodBarras || log.codigo || ''}</td>
            <td>${p.TipoCodigo || ''}</td>
            <td title="${p.Descricao || ''}">${p.Descricao || ''}</td>
            <td>${p.NCM || ''}</td>
            <td>R$ ${parseFloat(p.PrVenda || 0).toFixed(2)}</td>
            <td>${parseFloat(p.Estoque || 0).toFixed(1)}</td>
            <td>${p.Emb || ''}</td>
            <td>${p.Ativo || ''}</td>
            <td>${p.CodTrib || ''}</td>
            <td>${p.ICMS || ''}</td>
            <td>${p.PisCofins || ''}</td>
            <td style="font-size: 11px; color: gray;">
                ${log.status || ''}<br>
                <small>${log.timestamp ? new Date(log.timestamp).toLocaleString('pt-BR') : ''}</small>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// Preencher tabela de não cadastrados
function preencherTabelaNaoCadastrados(tbody, dados) {
    console.log('Preenchendo tabela de não cadastrados com', dados.length, 'códigos');
    
    if (dados.length === 0) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td style="text-align: center; padding: 20px;">Nenhum código encontrado</td>';
        tbody.appendChild(tr);
        return;
    }
    
    dados.forEach(codigo => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${codigo}</td>`;
        tbody.appendChild(tr);
    });
}

// Atualizar controles de paginação
function atualizarPaginacao(tabId, totalItens) {
    const totalPaginas = Math.ceil(totalItens / itensPorPagina) || 1;
    const container = document.getElementById(`pagination-${tabId}`);
    
    if (!container) {
        console.error('ERRO: Container de paginação não encontrado para:', tabId);
        return;
    }
    
    const paginaAtualAba = paginaAtual[tabId] || 1;
    
    // Limpar container
    container.innerHTML = '';
    
    console.log(`Criando paginação para ${tabId}: página ${paginaAtualAba} de ${totalPaginas}`);
    
    // Botão anterior
    const btnAnterior = document.createElement('button');
    btnAnterior.textContent = '← Anterior';
    btnAnterior.className = 'btn-pagination';
    btnAnterior.disabled = paginaAtualAba === 1;
    btnAnterior.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('CLIQUE: Página anterior para', tabId);
        if (paginaAtual[tabId] > 1) {
            paginaAtual[tabId]--;
            carregarDadosTabela(tabId);
        }
    });
    container.appendChild(btnAnterior);
    
    // Informação da página
    const info = document.createElement('span');
    info.className = 'pagination-info';
    info.textContent = `Página ${paginaAtualAba} de ${totalPaginas} (${totalItens} itens)`;
    container.appendChild(info);
    
    // Botão próximo
    const btnProximo = document.createElement('button');
    btnProximo.textContent = 'Próximo →';
    btnProximo.className = 'btn-pagination';
    btnProximo.disabled = paginaAtualAba >= totalPaginas;
    btnProximo.addEventListener('click', function(e) {
        e.preventDefault();
        console.log('CLIQUE: Próxima página para', tabId);
        if (paginaAtual[tabId] < totalPaginas) {
            paginaAtual[tabId]++;
            carregarDadosTabela(tabId);
        }
    });
    container.appendChild(btnProximo);
    
    console.log('Paginação criada com sucesso para', tabId);
}

// Função de impressão (global para uso no HTML)
window.imprimirLista = function(tabId) {
    console.log('=== INICIANDO IMPRESSÃO ===');
    console.log('Tab ID:', tabId);
    
    if (!dadosCarregados) {
        alert('Dados ainda não foram carregados. Tente novamente em alguns segundos.');
        return;
    }
    
    const titulosMapeamento = {
        'validados': 'Produtos Validados',
        'sem-trib': 'Produtos Sem Tributação',
        'desativados': 'Produtos Desativados',
        'sem-preco': 'Produtos Sem Preço de Venda',
        'nao-cadastrados': 'Códigos Não Cadastrados'
    };
    
    const dados = dadosCompletos[tabId] || [];
    const titulo = titulosMapeamento[tabId] || 'Lista de Produtos';
    
    console.log('Dados para impressão:', dados.length, 'itens');
    console.log('Título:', titulo);
    
    try {
        // Criar nova janela para impressão
        const janelaImpressao = window.open('', 'impressao', 'width=800,height=600,scrollbars=yes,resizable=yes');
        
        if (!janelaImpressao) {
            alert('Não foi possível abrir a janela de impressão.\n\nVerifique:\n- Se o bloqueador de pop-ups está desabilitado\n- Se há espaço suficiente na tela\n\nTente novamente.');
            return;
        }
        
        console.log('Janela de impressão criada com sucesso');
        
        let htmlImpressao = criarHTMLImpressao(titulo, dados, tabId);
        
        // Escrever HTML na janela
        janelaImpressao.document.write(htmlImpressao);
        janelaImpressao.document.close();
        
        // Aguardar carregamento e focar na janela
        setTimeout(() => {
            janelaImpressao.focus();
            console.log('Tentando iniciar impressão...');
            try {
                janelaImpressao.print();
                console.log('Impressão iniciada com sucesso');
            } catch (printError) {
                console.error('Erro ao iniciar impressão:', printError);
                alert('Erro ao iniciar impressão. Tente usar Ctrl+P na janela que se abriu.');
            }
        }, 1000);
        
    } catch (error) {
        console.error('Erro durante a impressão:', error);
        alert('Erro ao criar janela de impressão: ' + error.message);
    }
};

// Criar HTML para impressão
// Criar HTML para impressão
function criarHTMLImpressao(titulo, dados, tabId) {
    const agora = new Date().toLocaleString('pt-BR');
    
    let html = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>${titulo} - Impressão</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: Arial, sans-serif; 
            font-size: 11px; 
            line-height: 1.3;
            margin: 15mm;
            background: white;
            color: black;
        }
        .header { 
            text-align: center; 
            margin-bottom: 20px; 
            border-bottom: 2px solid #333;
            padding-bottom: 15px;
        }
        .header h1 { 
            font-size: 18px; 
            margin-bottom: 8px; 
            color: #333;
        }
        .header .info { 
            font-size: 10px; 
            color: #666; 
        }
        table { 
            width: 100%; 
            border-collapse: collapse; 
            margin: 20px 0;
        }
        th, td { 
            border: 1px solid #999; 
            padding: 6px 4px; 
            text-align: left;
            font-size: 9px;
            vertical-align: top;
        }
        th { 
            background: #f5f5f5; 
            font-weight: bold;
            color: #333;
        }
        tr:nth-child(even) { background: #fafafa; }
        .footer { 
            text-align: center; 
            margin-top: 30px; 
            font-size: 9px; 
            color: #666;
            border-top: 1px solid #ccc;
            padding-top: 10px;
        }
        
        /* Larguras específicas das colunas */
        .col-codigo { width: 6%; }
        .col-barras { width: 12%; }
        .col-tipo { width: 7%; }
        .col-desc { width: 25%; }
        .col-ncm { width: 7%; }
        .col-preco { width: 7%; }
        .col-estoque { width: 6%; }
        .col-emb { width: 4%; }
        .col-ativo { width: 5%; }
        .col-trib { width: 5%; }
        .col-icms { width: 7%; }
        .col-status { width: 9%; }

        .col-barras-full { width: 100%; }
        
        @media print {
            body { margin: 10mm; }
            .no-print { display: none; }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${titulo}</h1>
        <div class="info">Relatório gerado em: ${agora}</div>
    </div>
    
    <table>`;
    
    if (tabId === 'nao-cadastrados') {
        html += `
        <thead>
            <tr><th class="col-barras-full">Código de Barras Não Cadastrado</th></tr>
        </thead>
        <tbody>`;
        
        dados.forEach(codigo => {
            html += `<tr><td class="col-barras-full">${codigo}</td></tr>`;
        });
    } else {
        html += `
        <thead>
            <tr>
                <th class="col-codigo">Código</th>
                <th class="col-barras">Cód. Barras</th>
                <th class="col-tipo">Tipo</th>
                <th class="col-desc">Descrição</th>
                <th class="col-ncm">NCM</th>
                <th class="col-preco">Preço</th>
                <th class="col-estoque">Estoque</th>
                <th class="col-emb">Emb</th>
                <th class="col-ativo">Ativo</th>
                <th class="col-trib">Cód.Trib</th>
                <th class="col-icms">ICMS</th>
                <th class="col-icms">Pis/Cofins</th>
                <th class="col-status">Status / Data</th>
            </tr>
        </thead>
        <tbody>`;
        
        dados.forEach(item => {
            const preco = typeof item.PrVenda === 'number' ? 
                item.PrVenda.toFixed(2) : 
                (typeof item.PrVenda === 'string' ? parseFloat(item.PrVenda || 0).toFixed(2) : '0,00');
            const estoque = typeof item.Estoque === 'number' ? item.Estoque.toFixed(1) : '0,0';
            
            html += `
            <tr>
                <td class="col-codigo">${item.Codigo || ''}</td>
                <td class="col-barras">${item.CodBarras || ''}</td>
                <td class="col-tipo">${item.TipoCodigo || ''}</td>
                <td class="col-desc">${item.Descricao || ''}</td>
                <td class="col-ncm">${item.NCM || ''}</td>
                <td class="col-preco">R$ ${preco}</td>
                <td class="col-estoque">${estoque}</td>
                <td class="col-emb">${item.Emb || ''}</td>
                <td class="col-ativo">${item.Ativo || ''}</td>
                <td class="col-trib">${item.CodTrib || ''}</td>
                <td class="col-icms">${item.ICMS || ''}</td>
                <td class="col-icms">${item.PisCofins || ''}</td>
                <td class="col-status">
                    ${(item.status || '')}<br>
                    <small>${item.timestamp ? new Date(item.timestamp).toLocaleString('pt-BR') : ''}</small>
                </td>
            </tr>`;
        });
    }
    
    html += `
        </tbody>
    </table>
    
    <div class="footer">
        Total de registros: ${dados.length} | Gerado pelo Sistema de Gerenciamento de Produtos
    </div>
</body>
</html>`;
    
    return html;
}

console.log('Script carregado - aguardando DOM...');
