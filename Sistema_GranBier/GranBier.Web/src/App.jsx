import { useState, useEffect } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function App() {
  const [abaAtual, setAbaAtual] = useState('clientes')

  // ==========================================
  // ESTADOS DE CLIENTES
  // ==========================================
  const [clientes, setClientes] = useState([])
  const [tipoCliente, setTipoCliente] = useState('PF')
  const [cnpj, setCnpj] = useState(''); const [razaoSocial, setRazaoSocial] = useState('')
  const [nome, setNome] = useState(''); const [cpf, setCpf] = useState(''); const [endereco, setEndereco] = useState(''); const [cep, setCep] = useState('')
  const [numero, setNumero] = useState(''); const [observacoes, setObservacoes] = useState('') 
  const [documentoAnexo, setDocumentoAnexo] = useState('') 
  const [clienteEditandoId, setClienteEditandoId] = useState(null)
  const [termoBuscaCliente, setTermoBuscaCliente] = useState('') 

  // ==========================================
  // ESTADOS DE EQUIPAMENTOS E PEDIDOS
  // ==========================================
  const [equipamentos, setEquipamentos] = useState([])
  const [categoriaEquipamento, setCategoriaEquipamento] = useState('Chopeiras') 
  const [descricaoEquipamento, setDescricaoEquipamento] = useState('') 
  const [categoriaExpandida, setCategoriaExpandida] = useState(null) 
  const [categoriaExpandidaPedido, setCategoriaExpandidaPedido] = useState(null) 

  const [pedidos, setPedidos] = useState([])
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState('')
  const [equipamentosSelecionadosIds, setEquipamentosSelecionadosIds] = useState([]) 
  const [dataEvento, setDataEvento] = useState('')
  const [marcaBarril, setMarcaBarril] = useState('')
  const [qtdBarril20L, setQtdBarril20L] = useState(0)
  const [qtdBarril30L, setQtdBarril30L] = useState(0)
  const [qtdBarril50L, setQtdBarril50L] = useState(0)
  const [valorTotal, setValorTotal] = useState(0)
  const [valorPagoReserva, setValorPagoReserva] = useState(0)
  const [formaPagamentoPedido, setFormaPagamentoPedido] = useState('PIX')
  const [buscaClienteNoPedido, setBuscaClienteNoPedido] = useState('')
  
  const [formaPagamentoSaldo, setFormaPagamentoSaldo] = useState({})

  // ==========================================
  // ESTADOS DE CAIXA
  // ==========================================
  const [movimentacoes, setMovimentacoes] = useState([])
  const [descricaoSaida, setDescricaoSaida] = useState('')
  const [valorSaida, setValorSaida] = useState('')
  const [dataSaida, setDataSaida] = useState('')
  const [formaPagamentoSaida, setFormaPagamentoSaida] = useState('Dinheiro')

  // ==========================================
  // BUSCAS
  // ==========================================
  const buscarClientes = () => fetch('http://localhost:5249/api/Clientes').then(res => res.json()).then(setClientes).catch(console.error)
  const buscarEquipamentos = () => fetch('http://localhost:5249/api/Equipamentos').then(res => res.json()).then(setEquipamentos).catch(console.error)
  const buscarPedidos = () => fetch('http://localhost:5249/api/Pedidos').then(res => res.json()).then(setPedidos).catch(console.error)
  const buscarMovimentacoes = () => fetch('http://localhost:5249/api/MovimentacaoCaixa').then(res => res.json()).then(setMovimentacoes).catch(console.error)

  useEffect(() => { 
    if (abaAtual === 'clientes') buscarClientes()
    if (abaAtual === 'equipamentos') buscarEquipamentos()
    if (abaAtual === 'pedidos') { buscarPedidos(); buscarClientes(); buscarEquipamentos(); } 
    if (abaAtual === 'caixa') { buscarPedidos(); buscarMovimentacoes(); } 
  }, [abaAtual])

  // ==========================================
  // LÓGICA E CÁLCULOS
  // ==========================================
  const handleCepChange = async (e) => {
    const cepDigitado = e.target.value.replace(/\D/g, '');
    setCep(cepDigitado);
    if (cepDigitado.length === 8) {
      try {
        const res = await fetch(`https://viacep.com.br/ws/${cepDigitado}/json/`);
        const dados = await res.json();
        if (!dados.erro) setEndereco(`${dados.logradouro}, Bairro ${dados.bairro}, ${dados.localidade} - ${dados.uf}`);
      } catch (erro) { console.error("Erro ao buscar CEP", erro); }
    }
  }

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setDocumentoAnexo(reader.result);
      reader.readAsDataURL(file);
    }
  }

  const clientesFiltrados = clientes.filter(c => c.nomeCompleto.toLowerCase().includes(termoBuscaCliente.toLowerCase()) || c.cpf.includes(termoBuscaCliente))
  const clientesDropdownFiltrados = clientes.filter(c => c.nomeCompleto.toLowerCase().includes(buscaClienteNoPedido.toLowerCase()) || c.cpf.includes(buscaClienteNoPedido))
  const categoriasDisponiveis = ['Chopeiras', 'Extratoras', 'Cilindros', 'Pingadeiras', 'Outros']

  const despesasTotal = movimentacoes.filter(m => m.tipo === 'Saida').reduce((soma, m) => soma + m.valor, 0)
  const receitasExtrasCaixa = movimentacoes.filter(m => m.tipo === 'Entrada').reduce((soma, m) => soma + m.valor, 0)
  const faturamentoTotal = pedidos.reduce((soma, p) => soma + p.valorPagoReserva, 0) + receitasExtrasCaixa
  const subtotalCaixa = faturamentoTotal - despesasTotal
  
  const saldoPendentePedidos = pedidos.reduce((soma, p) => soma + Math.max(0, p.saldoAPagar), 0)

  const historicoCaixaUnificado = [
    ...pedidos.map(p => ({ id: `p-${p.id}`, descricao: `Sinal Pedido ${p.numeroPedido}`, tipo: 'Entrada', valor: p.valorPagoReserva, data: p.dataEvento, formaPagamento: p.formaPagamento || 'PIX' })),
    ...movimentacoes.map(m => ({ id: `m-${m.id}`, descricao: m.descricao, tipo: m.tipo === 'Entrada' ? 'Entrada' : 'Saída', valor: m.valor, data: m.data, formaPagamento: m.formaPagamento || 'Dinheiro' }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data)).filter(i => i.valor > 0)

  const entradasPix = historicoCaixaUnificado.filter(i => i.tipo === 'Entrada' && i.formaPagamento === 'PIX').reduce((acc, i) => acc + i.valor, 0)
  const entradasCartao = historicoCaixaUnificado.filter(i => i.tipo === 'Entrada' && i.formaPagamento === 'Cartão').reduce((acc, i) => acc + i.valor, 0)
  const entradasDinheiro = historicoCaixaUnificado.filter(i => i.tipo === 'Entrada' && i.formaPagamento === 'Dinheiro').reduce((acc, i) => acc + i.valor, 0)

  const chartDataMap = {};
  historicoCaixaUnificado.forEach(item => {
    const dateKey = new Date(item.data).toLocaleDateString('pt-BR');
    if(!chartDataMap[dateKey]) chartDataMap[dateKey] = { data: dateKey, Entradas: 0, Saidas: 0 };
    if(item.tipo === 'Entrada') chartDataMap[dateKey].Entradas += item.valor;
    if(item.tipo === 'Saída') chartDataMap[dateKey].Saidas += item.valor;
  });
  const dadosGrafico = Object.values(chartDataMap).reverse();

  const hojeString = new Date().toLocaleDateString('pt-BR');
  const entregasDeHoje = pedidos.filter(p => !p.concluido && new Date(p.dataEvento).toLocaleDateString('pt-BR') === hojeString);

  // ==========================================
  // AÇÕES E SALVAMENTO
  // ==========================================
  const handleSalvarCliente = async (e) => {
    e.preventDefault()
    const url = clienteEditandoId ? `http://localhost:5249/api/Clientes/${clienteEditandoId}` : 'http://localhost:5249/api/Clientes'
    const metodo = clienteEditandoId ? 'PUT' : 'POST'
    try {
      const payload = { id: clienteEditandoId || 0, tipoCliente, cnpj, razaoSocial, nomeCompleto: nome, cpf, endereco, numero, cep, dataNascimento: new Date().toISOString(), observacoes, documentoAnexo };
      const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) })
      if (res.ok) { 
        buscarClientes(); 
        setNome(''); setCpf(''); setCnpj(''); setRazaoSocial(''); setEndereco(''); setNumero(''); setCep(''); setObservacoes(''); setDocumentoAnexo(''); setClienteEditandoId(null);
      } else if (res.status === 400) { const erro = await res.json(); alert("⚠️ " + erro.mensagem) }
    } catch (erro) { console.error(erro) }
  }

  const handleExcluirCliente = async (id) => {
    if (window.confirm("Excluir cliente?")) {
      const res = await fetch(`http://localhost:5249/api/Clientes/${id}`, { method: 'DELETE' })
      if (res.ok) setClientes(clientes.filter(c => c.id !== id))
    }
  }

  const handleEditarCliente = (cliente) => { 
    setTipoCliente(cliente.tipoCliente || 'PF'); setCnpj(cliente.cnpj || ''); setRazaoSocial(cliente.razaoSocial || '');
    setNome(cliente.nomeCompleto); setCpf(cliente.cpf); setEndereco(cliente.endereco); setNumero(cliente.numero || ''); 
    setCep(cliente.cep || ''); setObservacoes(cliente.observacoes || ''); setDocumentoAnexo(cliente.documentoAnexo || '');
    setClienteEditandoId(cliente.id); window.scrollTo({ top: 0, behavior: 'smooth' }) 
  }

  const handleSalvarEquipamento = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5249/api/Equipamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoria: categoriaEquipamento, descricao: descricaoEquipamento, disponivel: true }) })
      if (res.ok) { buscarEquipamentos(); setDescricaoEquipamento('') }
    } catch (erro) { console.error(erro) }
  }

  const handleExcluirEquipamento = async (id) => {
    if (window.confirm("Excluir este equipamento definitivamente do galpão?")) {
      const res = await fetch(`http://localhost:5249/api/Equipamentos/${id}`, { method: 'DELETE' })
      if (res.ok) setEquipamentos(equipamentos.filter(e => e.id !== id))
    }
  }

  const handleSalvarPedido = async (e) => {
    e.preventDefault()
    if (equipamentosSelecionadosIds.length === 0) { alert("Selecione ao menos um equipamento para o pedido!"); return; }
    
    let vTotal = parseFloat(valorTotal) || 0;
    let vReserva = parseFloat(valorPagoReserva) || 0;
    if (vReserva > vTotal) vTotal = vReserva;

    const novoPedido = { 
      clienteId: parseInt(clienteIdSelecionado), equipamentoIds: equipmentsSelecionadosIds.join(','), dataEvento: dataEvento, marcaBarril: marcaBarril, 
      qtdBarril20L: parseInt(qtdBarril20L), qtdBarril30L: parseInt(qtdBarril30L), qtdBarril50L: parseInt(qtdBarril50L), 
      valorTotal: vTotal, valorPagoReserva: vReserva, formaPagamento: formaPagamentoPedido, concluido: false 
    }
    try {
      const res = await fetch('http://localhost:5249/api/Pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoPedido) })
      if (res.ok) { 
        buscarPedidos(); setClienteIdSelecionado(''); setEquipamentosSelecionadosIds([]); setDataEvento(''); setMarcaBarril(''); 
        setQtdBarril20L(0); setQtdBarril30L(0); setQtdBarril50L(0); setValorTotal(0); setValorPagoReserva(0); setBuscaClienteNoPedido(''); setCategoriaExpandidaPedido(null) 
      }
    } catch (erro) { console.error(erro) }
  }

  const handleReceberSaldo = async (pedido) => {
    const formaPgtoSelecionada = formaPagamentoSaldo[pedido.id] || 'PIX';
    if (window.confirm(`Confirmar recebimento de R$ ${Math.max(0, pedido.saldoAPagar).toFixed(2)} via ${formaPgtoSelecionada}?`)) {
      try {
        const res = await fetch(`http://localhost:5249/api/Pedidos/${pedido.id}/receber-saldo`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ formaPagamento: formaPgtoSelecionada })
        });
        
        if (res.ok) {
          setPedidos(pedidos.map(p => 
            p.id === pedido.id 
            ? { ...p, saldoAPagar: 0, statusPagamento: 'Totalmente Pago', pagamentoAberto: false } 
            : p
          ));
          buscarMovimentacoes();
          alert("✅ Pagamento confirmado e Caixa atualizado!");
        } else {
          const erroTexto = await res.text();
          alert(`❌ A API recusou o pagamento! Detalhe: ${erroTexto}`);
        }
      } catch (erro) { 
        console.error(erro);
        alert("❌ Falha de Conexão com a API.");
      }
    }
  }

  const handleSalvarSaidaCaixa = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5249/api/MovimentacaoCaixa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descricao: descricaoSaida, tipo: 'Saida', valor: parseFloat(valorSaida), data: dataSaida, formaPagamento: formaPagamentoSaida }) })
      if (res.ok) { buscarMovimentacoes(); setDescricaoSaida(''); setValorSaida(''); setDataSaida(''); setFormaPagamentoSaida('Dinheiro') }
    } catch (erro) { console.error(erro) }
  }

  const handleConcluirPedido = async (id) => {
    if (window.confirm("O evento acabou e todos os equipamentos retornaram para o galpão?")) {
      const res = await fetch(`http://localhost:5249/api/Pedidos/${id}/concluir`, { method: 'PUT' })
      if (res.ok) { buscarPedidos(); buscarEquipamentos(); }
    }
  }

  const handleGerarRecibo = (pedido) => {
    const dataFmt = new Date(pedido.dataEvento).toLocaleDateString('pt-BR');
    const horaFmt = new Date(pedido.dataEvento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    
    let barrisTxt = '';
    if(pedido.qtdBarril20L > 0) barrisTxt += `\n   - ${pedido.qtdBarril20L}x Barril 20L`;
    if(pedido.qtdBarril30L > 0) barrisTxt += `\n   - ${pedido.qtdBarril30L}x Barril 30L`;
    if(pedido.qtdBarril50L > 0) barrisTxt += `\n   - ${pedido.qtdBarril50L}x Barril 50L`;

    const textoRecibo = `🍺 *GRAN BIER - ${pedido.numeroPedido}* 🍺\n\n👤 *Cliente:* ${pedido.cliente?.nomeCompleto}\n📍 *Endereço:* ${pedido.cliente?.endereco}, Nº ${pedido.cliente?.numero}\n📅 *Entrega:* ${dataFmt} às ${horaFmt}\n🍻 *Chopp:* ${pedido.marcaBarril} ${barrisTxt}\n\n💰 *FINANCEIRO*\nValor Total: R$ ${Math.max(pedido.valorTotal, pedido.valorPagoReserva).toFixed(2).replace('.', ',')}\nSinal Pago: R$ ${pedido.valorPagoReserva.toFixed(2).replace('.', ',')}\n*Saldo a Pagar: R$ ${Math.max(0, pedido.saldoAPagar).toFixed(2).replace('.', ',')}*\nStatus: ${pedido.statusPagamento}\n\nObrigado pela preferência! Equipe Gran Bier.`;
    navigator.clipboard.writeText(textoRecibo).then(() => alert("✅ Recibo logístico copiado!"));
  }

  const estilos = {
    pagina: { padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    menu: { display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#e4e4e7', padding: '6px', borderRadius: '8px', flexWrap: 'wrap', justifyContent: 'center' },
    botaoMenu: (ativo) => ({ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: ativo ? '#ffffff' : 'transparent', color: ativo ? '#18181b' : '#71717a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: ativo ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }),
    formCard: { backgroundColor: '#ffffff', padding: '20px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '12px', flexWrap: 'wrap', width: '100%', maxWidth: '900px' },
    input: { padding: '8px 12px', fontSize: '0.9rem', borderRadius: '4px', border: '1px solid #d4d4d8', flex: '1 1 200px', backgroundColor: '#ffffff', color: '#18181b' },
    botaoSalvar: { padding: '8px 20px', fontSize: '0.9rem', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold', width: '100%' },
    listaContainer: { backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '900px', marginBottom: '24px' },
    cardItem: { padding: '16px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
    
    // RESTAURADO: Estilos especiais para o painel de equipamentos
    categoriaHeader: { padding: '12px 16px', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '6px', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#27272a', width: '100%' },
    categoriaContent: { padding: '8px', borderLeft: '2px solid #e4e4e7', marginLeft: '8px', marginBottom: '16px' }
  }

  return (
    <div style={estilos.pagina}>
      <h1 style={{ color: '#18181b', fontWeight: 'bold', fontSize: '1.5rem', marginBottom: '16px' }}>Gran Bier</h1>

      <div style={estilos.menu}>
        <button style={estilos.botaoMenu(abaAtual === 'clientes')} onClick={() => setA7AAtual || setAbaAtual('clientes')}>👥 Clientes</button>
        <button style={estilos.botaoMenu(abaAtual === 'equipamentos')} onClick={() => setAbaAtual('equipamentos')}>🍺 Equipamentos</button>
        <button style={estilos.botaoMenu(abaAtual === 'pedidos')} onClick={() => setAbaAtual('pedidos')}>📦 Pedidos</button>
        <button style={estilos.botaoMenu(abaAtual === 'caixa')} onClick={() => setAbaAtual('caixa')}>💰 Caixa</button>
      </div>

      {abaAtual === 'clientes' && (
        <>
          <form onSubmit={handleSalvarCliente} style={estilos.formCard}>
            <div style={{ width: '100%', display: 'flex', gap: '16px', marginBottom: '8px', color: '#18181b' }}>
              <label><input type="radio" value="PF" checked={tipoCliente === 'PF'} onChange={(e) => setTipoCliente(e.target.value)} /> Pessoa Física (PF)</label>
              <label><input type="radio" value="PJ" checked={tipoCliente === 'PJ'} onChange={(e) => setTipoCliente(e.target.value)} /> Pessoa Jurídica (PJ)</label>
            </div>

            {tipoCliente === 'PJ' && (
              <>
                <input placeholder="CNPJ" value={cnpj} onChange={e => setCnpj(e.target.value)} style={estilos.input} />
                <input placeholder="Razão Social" value={razaoSocial} onChange={e => setRazaoSocial(e.target.value)} style={estilos.input} />
              </>
            )}

            <input placeholder="Nome Responsável" value={nome} onChange={e => setNome(e.target.value)} required style={estilos.input} />
            <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, ''))} style={estilos.input} maxLength={11} />
            <input placeholder="CEP" value={cep} onChange={handleCepChange} required style={{...estilos.input, flex: '1 1 100px'}} maxLength={8} />
            <input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required style={estilos.input} />
            <input placeholder="Número" value={numero} onChange={e => setNumero(e.target.value)} required style={{...estilos.input, flex: '1 1 80px'}} />
            <input placeholder="Observações" value={observacoes} onChange={e => setObservacoes(e.target.value)} style={estilos.input} />
            
            <div style={{ width: '100%', border: '1px dashed #d4d4d8', padding: '12px', borderRadius: '4px' }}>
              <span style={{ fontSize: '0.85rem', color: '#71717a', display: 'block', marginBottom: '4px' }}>Anexar Documento (PDF, JPG, PNG):</span>
              <input type="file" accept=".pdf, image/*" onChange={handleFileUpload} style={{ fontSize: '0.85rem', color: '#18181b' }} />
              {documentoAnexo && <span style={{ color: '#16a34a', fontSize: '0.8rem', marginLeft: '8px' }}>✓ Arquivo carregado</span>}
            </div>
            
            <button type="submit" style={{...estilos.botaoSalvar, backgroundColor: clienteEditandoId ? '#2563eb' : '#18181b'}}>{clienteEditandoId ? 'Atualizar' : 'Salvar Cliente'}</button>
          </form>

          <div style={{ width: '100%', maxWidth: '900px', marginBottom: '12px' }}>
            <input placeholder="🔍 Pesquisar cliente..." value={termoBuscaCliente} onChange={e => setTermoBuscaCliente(e.target.value)} style={{ ...estilos.input, width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={estilos.listaContainer}>
            {clientesFiltrados.map(cliente => (
              <li key={cliente.id} style={estilos.cardItem}>
                <div>
                  <strong style={{ display: 'block', color: '#27272a' }}>{cliente.nomeCompleto} {cliente.tipoCliente === 'PJ' ? `(Empresa)` : ''}</strong>
                  <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{cliente.endereco}, Nº {cliente.numero} | {cliente.tipoCliente === 'PJ' ? `CNPJ: ${cliente.cnpj}` : `CPF: ${cliente.cpf}`}</span>
                  {cliente.documentoAnexo && <span style={{ color: '#2563eb', fontSize: '0.8rem', display: 'block' }}>📎 Documento Anexado</span>}
                </div>
                <div style={{ display: 'flex', gap: '6px' }}>
                  <button onClick={() => handleEditarCliente(cliente)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#f4f4f5', color: '#52525b', fontWeight: 'bold' }}>✎ Editar</button>
                  <button onClick={() => handleExcluirCliente(cliente.id)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 'bold' }}>🗑 Excluir</button>
                </div>
              </li>
            ))}
          </div>
        </>
      )}

      {abaAtual === 'equipamentos' && (
        <>
          <form onSubmit={handleSalvarEquipamento} style={estilos.formCard}>
            <select value={categoriaEquipamento} onChange={e => setCategoriaEquipamento(e.target.value)} style={estilos.input}>
              {categoriasDisponiveis.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
            <input placeholder="Ex: Chopeira 1" value={descricaoEquipamento} onChange={e => setDescricaoEquipamento(e.target.value)} required style={estilos.input} />
            <button type="submit" style={estilos.botaoSalvar}>Adicionar ao Estoque</button>
          </form>

          {/* RESTAURADO: Lista completa de equipamentos categorizada em Sanfona */}
          <div style={{...estilos.listaContainer, padding: '16px'}}>
            {categoriasDisponiveis.map(cat => {
              const itensDestaCategoria = equipamentos.filter(e => e.categoria === cat);
              if (itensDestaCategoria.length === 0) return null;

              const total = itensDestaCategoria.length;
              const disponiveis = itensDestaCategoria.filter(e => e.disponivel).length;

              return (
                <div key={cat} style={{ width: '100%' }}>
                  <div style={estilos.categoriaHeader} onClick={() => setCategoriaExpandida(categoriaExpandida === cat ? null : cat)}>
                    <span>📂 {cat}</span>
                    <span style={{ color: disponiveis > 0 ? '#16a34a' : '#dc2626' }}>{disponiveis}/{total} Livres</span>
                  </div>

                  {categoriaExpandida === cat && (
                    <div style={estilos.categoriaContent}>
                      {itensDestaCategoria.map(eq => (
                        <div key={eq.id} style={{ padding: '10px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f4f4f5' }}>
                          <span style={{ fontSize: '0.95rem', color: '#18181b', fontWeight: '500' }}>{eq.descricao}</span>
                          <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                            <span style={{ color: eq.disponivel ? '#16a34a' : '#dc2626', fontSize: '0.85rem', fontWeight: 'bold' }}>
                              {eq.disponivel ? '🟢 No Galpão' : '🔴 Em Festa'}
                            </span>
                            <button onClick={() => handleExcluirEquipamento(eq.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 'bold' }}>
                              🗑️ Excluir
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {equipamentos.length === 0 && <p style={{textAlign: 'center', color: '#71717a', padding: '12px'}}>Nenhum equipamento cadastrado no galpão.</p>}
          </div>
        </>
      )}

      {abaAtual === 'pedidos' && (
        <>
          <form onSubmit={handleSalvarPedido} style={estilos.formCard}>
            <div style={{ display: 'flex', gap: '8px', flex: '1 1 100%' }}>
              <input placeholder="🔍 Buscar cliente..." value={buscaClienteNoPedido} onChange={e => setBuscaClienteNoPedido(e.target.value)} style={estilos.input} />
              <select value={clienteIdSelecionado} onChange={e => setClienteIdSelecionado(e.target.value)} required style={estilos.input}>
                <option value="" disabled>Selecione o Cliente</option>
                {clientesDropdownFiltrados.map(c => <option key={c.id} value={c.id}>{c.nomeCompleto}</option>)}
              </select>
            </div>

            <div style={{ width: '100%', border: '1px solid #e4e4e7', padding: '12px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#18181b', fontSize: '0.9rem' }}>1. Equipamentos Vinculados:</span>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {equipamentos.filter(e => e.disponivel).map(eq => (
                  <label key={eq.id} style={{ fontSize: '0.85rem', color: '#18181b', cursor: 'pointer', marginRight: '12px' }}>
                    <input type="checkbox" checked={equipamentosSelecionadosIds.includes(eq.id)} onChange={() => {
                      if (equipamentosSelecionadosIds.includes(eq.id)) setEquipamentosSelecionadosIds(equipamentosSelecionadosIds.filter(item => item !== eq.id))
                      else setEquipamentosSelecionadosIds([...equipamentosSelecionadosIds, eq.id])
                    }} /> {eq.descricao}
                  </label>
                ))}
              </div>
            </div>

            <div style={{ width: '100%', border: '1px solid #e4e4e7', padding: '12px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#18181b', fontSize: '0.9rem' }}>2. Logística de Barris:</span>
              <input placeholder="Marca do Chopp" value={marcaBarril} onChange={e => setMarcaBarril(e.target.value)} required style={{...estilos.input, width: '100%', marginBottom: '8px'}} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <label style={{ fontSize: '0.85rem', color: '#18181b', flex: 1 }}>Barris 20L: <input type="number" min="0" value={qtdBarril20L} onChange={e => setQtdBarril20L(e.target.value)} style={{...estilos.input, width: '100%'}} /></label>
                <label style={{ fontSize: '0.85rem', color: '#18181b', flex: 1 }}>Barris 30L: <input type="number" min="0" value={qtdBarril30L} onChange={e => setQtdBarril30L(e.target.value)} style={{...estilos.input, width: '100%'}} /></label>
                <label style={{ fontSize: '0.85rem', color: '#18181b', flex: 1 }}>Barris 50L: <input type="number" min="0" value={qtdBarril50L} onChange={e => setQtdBarril50L(e.target.value)} style={{...estilos.input, width: '100%'}} /></label>
              </div>
            </div>

            <div style={{ width: '100%', border: '1px solid #16a34a', padding: '12px', borderRadius: '6px', backgroundColor: '#f0fdf4' }}>
              <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#16a34a', fontSize: '0.9rem' }}>3. Financeiro & Reserva:</span>
              
              <div style={{ marginBottom: '12px' }}>
                <label style={{ fontSize: '0.85rem', color: '#18181b', marginRight: '8px' }}>Forma de Pagamento (Sinal):</label>
                <select value={formaPagamentoPedido} onChange={e => setFormaPagamentoPedido(e.target.value)} style={{...estilos.input, display: 'inline-block', width: '150px'}}>
                  <option value="PIX">PIX</option>
                  <option value="Cartão">Cartão</option>
                  <option value="Dinheiro">Dinheiro</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <label style={{ fontSize: '0.85rem', color: '#18181b', flex: 1 }}>Valor Total (R$): <input type="number" step="0.01" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required style={{...estilos.input, width: '100%'}} /></label>
                <label style={{ fontSize: '0.85rem', color: '#18181b', flex: 1 }}>Sinal/Pago Agora (R$): <input type="number" step="0.01" value={valorPagoReserva} onChange={e => setValorPagoReserva(e.target.value)} required style={{...estilos.input, width: '100%'}} /></label>
                <div style={{ flex: 1, padding: '8px', backgroundColor: '#dcfce7', borderRadius: '4px', textAlign: 'center' }}>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'block' }}>Saldo na Entrega</span>
                  <strong style={{ color: '#15803d', fontSize: '1.2rem' }}>R$ {Math.max(0, (parseFloat(valorTotal)||0) - (parseFloat(valorPagoReserva)||0)).toFixed(2).replace('.', ',')}</strong>
                </div>
              </div>
            </div>

            <input type="datetime-local" value={dataEvento} onChange={e => setDataEvento(e.target.value)} required style={estilos.input} />
            <button type="submit" style={estilos.botaoSalvar}>Gerar Pedido</button>
          </form>

          {entregasDeHoje.length > 0 && (
            <>
              <h2 style={{ color: '#d97706', fontSize: '1.1rem', marginBottom: '12px', textAlign: 'center' }}>🚚 Entregas de Hoje ({hojeString})</h2>
              <div style={{...estilos.listaContainer, borderLeft: '4px solid #f59e0b', backgroundColor: '#fffbeb'}}>
                {entregasDeHoje.map(pedido => (
                  <div key={`hoje-${pedido.id}`} style={{ padding: '8px 0', borderBottom: '1px solid #fde68a' }}>
                    <strong style={{ display: 'block', color: '#b45309' }}>{pedido.cliente?.nomeCompleto} - às {new Date(pedido.dataEvento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#92400e' }}>📍 {pedido.cliente?.endereco}, Nº {pedido.cliente?.numero || 'S/N'}</span>
                  </div>
                ))}
              </div>
            </>
          )}

          <h2 style={{ color: '#52525b', fontSize: '1.1rem', margin: '24px 0 12px 0' }}>Gestão de Eventos</h2>
          <div style={estilos.listaContainer}>
            {pedidos.map(pedido => (
              <li key={pedido.id} style={{...estilos.cardItem, borderLeft: pedido.saldoAPagar > 0 ? '4px solid #f59e0b' : '4px solid #16a34a', alignItems: 'flex-start'}}>
                <div style={{ flex: '1' }}>
                  <strong style={{ display: 'block', color: '#27272a', fontSize: '1.1rem' }}>{pedido.numeroPedido} - {pedido.cliente?.nomeCompleto}</strong>
                  <span style={{ color: '#71717a', fontSize: '0.85rem', display: 'block', margin: '4px 0' }}>🚚 Logística: {pedido.qtdBarril20L}x 20L | {pedido.qtdBarril30L}x 30L | {pedido.qtdBarril50L}x 50L</span>
                  <div style={{ display: 'inline-block', padding: '2px 8px', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: pedido.saldoAPagar > 0 ? '#fef3c7' : '#dcfce7', color: pedido.saldoAPagar > 0 ? '#d97706' : '#16a34a' }}>
                    {pedido.statusPagamento}
                  </div>
                  
                  {pedido.saldoAPagar > 0 && (
                    <div style={{ marginTop: '12px', padding: '12px', backgroundColor: '#fef3c7', borderRadius: '6px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '0.85rem', color: '#b45309', fontWeight: 'bold' }}>Receber Saldo:</span>
                      <select
                        value={formaPagamentoSaldo[pedido.id] || 'PIX'}
                        onChange={e => setFormaPagamentoSaldo({...formaPagamentoSaldo, [pedido.id]: e.target.value})}
                        style={{ padding: '6px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #d4d4d8', color: '#18181b', minWidth: '100px' }}
                      >
                        <option value="PIX">PIX</option>
                        <option value="Cartão">Cartão</option>
                        <option value="Dinheiro">Dinheiro</option>
                      </select>
                      <button onClick={() => handleReceberSaldo(pedido)} style={{ padding: '6px 12px', fontSize: '0.85rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#16a34a', color: 'white', fontWeight: 'bold' }}>
                        Confirmar Pagamento
                      </button>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '6px', marginTop: '12px' }}>
                    {!pedido.concluido && <button onClick={() => handleConcluirPedido(pedido.id)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: '1px solid #d4d4d8', backgroundColor: '#ffffff', color: '#18181b' }}>Baixa no Estoque</button>}
                    <button onClick={() => handleGerarRecibo(pedido)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#18181b', color: 'white' }}>Copiar Recibo</button>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '0.8rem', color: '#71717a', display: 'block' }}>Total: R$ {Math.max(pedido.valorTotal, pedido.valorPagoReserva).toFixed(2)}</span>
                  <span style={{ fontSize: '0.8rem', color: '#16a34a', display: 'block' }}>Pago ({pedido.formaPagamento}): R$ {pedido.valorPagoReserva.toFixed(2)}</span>
                  <strong style={{ color: pedido.saldoAPagar > 0 ? '#dc2626' : '#16a34a', fontSize: '1.1rem', display: 'block', marginTop: '4px' }}>Falta: R$ {Math.max(0, pedido.saldoAPagar).toFixed(2)}</strong>
                </div>
              </li>
            ))}
          </div>
        </>
      )}

      {abaAtual === 'caixa' && (
        <div style={{ width: '100%', maxWidth: '900px' }}>
          
          <form onSubmit={handleSalvarSaidaCaixa} style={estilos.formCard}>
            <input placeholder="Despesa (Ex: Fornecedor)" value={descricaoSaida} onChange={e => setDescricaoSaida(e.target.value)} required style={estilos.input} />
            <select value={formaPagamentoSaida} onChange={e => setFormaPagamentoSaida(e.target.value)} style={estilos.input}>
              <option value="Dinheiro">Dinheiro</option>
              <option value="PIX">PIX</option>
              <option value="Cartão">Cartão</option>
            </select>
            <input type="number" step="0.01" placeholder="R$ Valor" value={valorSaida} onChange={e => setValorSaida(e.target.value)} required style={estilos.input} />
            <input type="datetime-local" value={dataSaida} onChange={e => setDataSaida(e.target.value)} required style={estilos.input} />
            <button type="submit" style={{ ...estilos.botaoSalvar, backgroundColor: '#dc2626' }}>Lançar Saída</button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', marginBottom: '16px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', flex: '1', textAlign: 'center', border: '1px solid #e4e4e7' }}>
              <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Recebido via PIX</span>
              <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>R$ {entradasPix.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', flex: '1', textAlign: 'center', border: '1px solid #e4e4e7' }}>
              <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Recebido via Cartão</span>
              <strong style={{ color: '#2563eb', fontSize: '1.1rem' }}>R$ {entradasCartao.toFixed(2).replace('.', ',')}</strong>
            </div>
            <div style={{ backgroundColor: '#ffffff', padding: '12px', borderRadius: '6px', flex: '1', textAlign: 'center', border: '1px solid #e4e4e7' }}>
              <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block' }}>Recebido em Dinheiro</span>
              <strong style={{ color: '#d97706', fontSize: '1.1rem' }}>R$ {entradasDinheiro.toFixed(2).replace('.', ',')}</strong>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Entradas (Sinais + Saldos)</span><strong style={{ display: 'block', color: '#16a34a', fontSize: '1.4rem' }}>R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</strong></div>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Saídas (Despesas)</span><strong style={{ display: 'block', color: '#dc2626', fontSize: '1.4rem' }}>R$ {despesasTotal.toFixed(2).replace('.', ',')}</strong></div>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Subtotal no Caixa</span><strong style={{ display: 'block', color: '#2563eb', fontSize: '1.4rem' }}>R$ {subtotalCaixa.toFixed(2).replace('.', ',')}</strong></div>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #f59e0b', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>A Receber (Entregas)</span><strong style={{ display: 'block', color: '#f59e0b', fontSize: '1.4rem' }}>R$ {saldoPendentePedidos.toFixed(2).replace('.', ',')}</strong></div>
          </div>

          {dadosGrafico.length > 0 && (
            <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', marginBottom: '24px' }}>
              <h3 style={{ color: '#52525b', textAlign: 'center', marginBottom: '16px', fontSize: '1.1rem' }}>Evolução Diária do Caixa</h3>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <BarChart data={dadosGrafico} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="data" tick={{fontSize: 12}} />
                    <YAxis tick={{fontSize: 12}} />
                    <Tooltip cursor={{fill: '#f4f4f5'}} />
                    <Legend wrapperStyle={{fontSize: '12px'}} />
                    <Bar dataKey="Entradas" fill="#16a34a" radius={[4, 4, 0, 0]} />
                    <Bar dataKey="Saidas" name="Saídas" fill="#dc2626" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          <h2 style={{ color: '#52525b', fontSize: '1.1rem', marginBottom: '12px' }}>Extrato Detalhado</h2>
          <div style={estilos.listaContainer}>
            {historicoCaixaUnificado.map(item => (
              <div key={item.id} style={{ padding: '12px 16px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#27272a', fontSize: '0.9rem' }}>{item.descricao}</strong>
                  <span style={{ display: 'block', color: '#71717a', fontSize: '0.75rem' }}>{new Date(item.data).toLocaleString('pt-BR')} • {item.formaPagamento}</span>
                </div>
                <strong style={{ color: item.tipo === 'Entrada' ? '#16a34a' : '#dc2626', fontSize: '0.95rem' }}>{item.tipo === 'Entrada' ? '+' : '-'} R$ {item.valor.toFixed(2).replace('.', ',')}</strong>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App