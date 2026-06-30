import { useState, useEffect } from 'react'

function App() {
  const [abaAtual, setAbaAtual] = useState('clientes')

  // ==========================================
  // ESTADOS
  // ==========================================
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState(''); const [cpf, setCpf] = useState(''); const [endereco, setEndereco] = useState(''); const [cep, setCep] = useState('')
  const [clienteEditandoId, setClienteEditandoId] = useState(null)
  const [termoBuscaCliente, setTermoBuscaCliente] = useState('') 

  const [equipamentos, setEquipamentos] = useState([])
  const [categoriaEquipamento, setCategoriaEquipamento] = useState('Chopeiras') // Nova seleção
  const [descricaoEquipamento, setDescricaoEquipamento] = useState('') 
  const [categoriaExpandida, setCategoriaExpandida] = useState(null) // Controle de sanfona no estoque
  const [categoriaExpandidaPedido, setCategoriaExpandidaPedido] = useState(null) // Controle de sanfona nos pedidos

  const [pedidos, setPedidos] = useState([])
  const [clienteIdSelecionado, setClienteIdSelecionado] = useState('')
  const [equipamentosSelecionadosIds, setEquipamentosSelecionadosIds] = useState([]) 
  const [dataEvento, setDataEvento] = useState('')
  const [marcaBarril, setMarcaBarril] = useState('')
  const [tamanhoBarrilLitros, setTamanhoBarrilLitros] = useState('')
  const [valorTotal, setValorTotal] = useState('')
  
  const [buscaClienteNoPedido, setBuscaClienteNoPedido] = useState('')
  const [movimentacoes, setMovimentacoes] = useState([])
  const [descricaoSaida, setDescricaoSaida] = useState('')
  const [valorSaida, setValorSaida] = useState('')
  const [dataSaida, setDataSaida] = useState('')

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
  const clientesFiltrados = clientes.filter(c => c.nomeCompleto.toLowerCase().includes(termoBuscaCliente.toLowerCase()) || c.cpf.includes(termoBuscaCliente))
  const clientesDropdownFiltrados = clientes.filter(c => c.nomeCompleto.toLowerCase().includes(buscaClienteNoPedido.toLowerCase()) || c.cpf.includes(buscaClienteNoPedido))

  const categoriasDisponiveis = ['Chopeiras', 'Extratoras', 'Cilindros', 'Pingadeiras', 'Outros']

  const faturamentoTotal = pedidos.reduce((soma, pedido) => soma + pedido.valorTotal, 0)
  const despesasTotal = movimentacoes.reduce((soma, m) => soma + m.valor, 0)
  const subtotalCaixa = faturamentoTotal - despesasTotal

  const historicoCaixaUnificado = [
    ...pedidos.map(p => ({ id: `p-${p.id}`, descricao: `Pedido - ${p.cliente?.nomeCompleto || 'Desconhecido'}`, tipo: 'Entrada', valor: p.valorTotal, data: p.dataEvento })),
    ...movimentacoes.map(m => ({ id: `m-${m.id}`, descricao: m.descricao, tipo: 'Saída', valor: m.valor, data: m.data }))
  ].sort((a, b) => new Date(b.data) - new Date(a.data))

  const handleToggleEquipamento = (id) => {
    if (equipamentosSelecionadosIds.includes(id)) setEquipamentosSelecionadosIds(equipamentosSelecionadosIds.filter(item => item !== id))
    else setEquipamentosSelecionadosIds([...equipamentosSelecionadosIds, id])
  }

  // ==========================================
  // AÇÕES E SALVAMENTO
  // ==========================================
  const handleSalvarCliente = async (e) => {
    e.preventDefault()
    const url = clienteEditandoId ? `http://localhost:5249/api/Clientes/${clienteEditandoId}` : 'http://localhost:5249/api/Clientes'
    const metodo = clienteEditandoId ? 'PUT' : 'POST'
    try {
      const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: clienteEditandoId || 0, nomeCompleto: nome, cpf, endereco, cep, dataNascimento: new Date().toISOString(), observacoes: "Interface" }) })
      if (res.ok) { buscarClientes(); setNome(''); setCpf(''); setEndereco(''); setCep(''); setClienteEditandoId(null) } 
      else if (res.status === 400) { const erro = await res.json(); alert("⚠️ " + erro.mensagem) }
    } catch (erro) { console.error(erro) }
  }

  const handleExcluirCliente = async (id) => {
    if (window.confirm("Excluir cliente?")) {
      const res = await fetch(`http://localhost:5249/api/Clientes/${id}`, { method: 'DELETE' })
      if (res.ok) setClientes(clientes.filter(c => c.id !== id))
    }
  }

  const handleEditarCliente = (cliente) => { setNome(cliente.nomeCompleto); setCpf(cliente.cpf); setEndereco(cliente.endereco); setCep(cliente.cep || ''); setClienteEditandoId(cliente.id); window.scrollTo({ top: 0, behavior: 'smooth' }) }

  const handleSalvarEquipamento = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5249/api/Equipamentos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ categoria: categoriaEquipamento, descricao: descricaoEquipamento, disponivel: true }) })
      if (res.ok) { buscarEquipamentos(); setDescricaoEquipamento('') }
    } catch (erro) { console.error(erro) }
  }

  const handleExcluirEquipamento = async (id) => {
    if (window.confirm("Excluir equipamento?")) {
      const res = await fetch(`http://localhost:5249/api/Equipamentos/${id}`, { method: 'DELETE' })
      if (res.ok) setEquipamentos(equipamentos.filter(e => e.id !== id))
    }
  }

  const handleSalvarPedido = async (e) => {
    e.preventDefault()
    if (equipamentosSelecionadosIds.length === 0) { alert("Selecione ao menos um equipamento para o pedido!"); return; }
    
    const novoPedido = { clienteId: parseInt(clienteIdSelecionado), equipamentoIds: equipamentosSelecionadosIds.join(','), dataEvento: dataEvento, marcaBarril: marcaBarril, tamanhoBarrilLitros: parseInt(tamanhoBarrilLitros), pagamentoAberto: true, valorTotal: parseFloat(valorTotal), concluido: false }
    try {
      const res = await fetch('http://localhost:5249/api/Pedidos', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(novoPedido) })
      if (res.ok) { buscarPedidos(); setClienteIdSelecionado(''); setEquipamentosSelecionadosIds([]); setDataEvento(''); setMarcaBarril(''); setTamanhoBarrilLitros(''); setValorTotal(''); setBuscaClienteNoPedido(''); setCategoriaExpandidaPedido(null) }
    } catch (erro) { console.error(erro) }
  }

  const handleSalvarSaidaCaixa = async (e) => {
    e.preventDefault()
    try {
      const res = await fetch('http://localhost:5249/api/MovimentacaoCaixa', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ descricao: descricaoSaida, tipo: 'Saida', valor: parseFloat(valorSaida), data: dataSaida }) })
      if (res.ok) { buscarMovimentacoes(); setDescricaoSaida(''); setValorSaida(''); setDataSaida('') }
    } catch (erro) { console.error(erro) }
  }

  const handleConcluirPedido = async (id) => {
    if (window.confirm("O evento acabou e todos os equipamentos retornaram para o galpão?")) {
      try {
        const res = await fetch(`http://localhost:5249/api/Pedidos/${id}/concluir`, { method: 'PUT' })
        if (res.ok) { buscarPedidos(); buscarEquipamentos(); }
      } catch (erro) { console.error(erro) }
    }
  }

  const handleGerarRecibo = (pedido) => {
    const dataFormatada = new Date(pedido.dataEvento).toLocaleDateString('pt-BR');
    const horaFormatada = new Date(pedido.dataEvento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'});
    const textoRecibo = `🍺 *GRAN BIER - Confirmação de Evento* 🍺\n\n👤 *Cliente:* ${pedido.cliente?.nomeCompleto || 'N/A'}\n📍 *Endereço:* ${pedido.cliente?.endereco || 'N/A'}\n📬 *CEP:* ${pedido.cliente?.cep || 'N/A'}\n📅 *Data da Entrega:* ${dataFormatada}\n⏰ *Horário da Entrega:* ${horaFormatada}\n🍻 *Chopp:* ${pedido.marcaBarril} (${pedido.tamanhoBarrilLitros} Litros)\n💰 *Valor Total:* R$ ${pedido.valorTotal.toFixed(2).replace('.', ',')}\n\nObrigado pela preferência! Equipe Gran Bier.`;
    navigator.clipboard.writeText(textoRecibo).then(() => alert("✅ Recibo copiado!")).catch(() => alert("Erro ao copiar o recibo."));
  }

  // ==========================================
  // ESTILOS AJUSTADOS (MENORES)
  // ==========================================
  const estilos = {
    pagina: { padding: '20px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { textAlign: 'center', marginBottom: '16px' },
    menu: { display: 'flex', gap: '8px', marginBottom: '24px', backgroundColor: '#e4e4e7', padding: '6px', borderRadius: '8px', flexWrap: 'wrap', justifyContent: 'center' },
    botaoMenu: (ativo) => ({ padding: '8px 16px', fontSize: '0.9rem', backgroundColor: ativo ? '#ffffff' : 'transparent', color: ativo ? '#18181b' : '#71717a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: ativo ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }),
    formCard: { backgroundColor: '#ffffff', padding: '16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '900px', alignItems: 'center' },
    
    // CAIXAS MENORES
    input: { padding: '6px 10px', fontSize: '0.85rem', borderRadius: '4px', border: '1px solid #d4d4d8', flex: '1 1 140px', backgroundColor: '#ffffff', color: '#18181b' },
    
    botaoSalvar: { padding: '6px 16px', fontSize: '0.85rem', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' },
    listaContainer: { backgroundColor: '#ffffff', padding: '8px 16px', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', width: '100%', maxWidth: '900px' },
    
    // CATEGORIAS (Sanfona)
    categoriaHeader: { padding: '12px 16px', backgroundColor: '#f4f4f5', border: '1px solid #e4e4e7', borderRadius: '6px', marginBottom: '8px', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', fontWeight: 'bold', color: '#27272a' },
    categoriaContent: { padding: '8px', borderLeft: '2px solid #e4e4e7', marginLeft: '8px', marginBottom: '16px' },
    
    cardItem: { padding: '12px 16px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '16px', flexWrap: 'wrap' },
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}><h1 style={{ color: '#18181b', fontWeight: 'bold', fontSize: '1.5rem', margin: 0 }}>Gran Bier</h1></div>

      <div style={estilos.menu}>
        <button style={estilos.botaoMenu(abaAtual === 'clientes')} onClick={() => setAbaAtual('clientes')}>👥 Clientes</button>
        <button style={estilos.botaoMenu(abaAtual === 'equipamentos')} onClick={() => setAbaAtual('equipamentos')}>🍺 Equipamentos</button>
        <button style={estilos.botaoMenu(abaAtual === 'pedidos')} onClick={() => setAbaAtual('pedidos')}>📦 Pedidos</button>
        <button style={estilos.botaoMenu(abaAtual === 'caixa')} onClick={() => setAbaAtual('caixa')}>💰 Caixa</button>
      </div>

      {abaAtual === 'clientes' && (
        <>
          <form onSubmit={handleSalvarCliente} style={estilos.formCard}>
            <input placeholder="Nome" value={nome} onChange={e => setNome(e.target.value.replace(/[^a-zA-ZÀ-ÿ\s]/g, ''))} required style={estilos.input} />
            <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value.replace(/\D/g, ''))} required style={estilos.input} maxLength={11} />
            <input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required style={estilos.input} />
            <input placeholder="CEP" value={cep} onChange={e => setCep(e.target.value.replace(/\D/g, ''))} required style={estilos.input} maxLength={8} />
            <button type="submit" style={{...estilos.botaoSalvar, backgroundColor: clienteEditandoId ? '#2563eb' : '#18181b'}}>{clienteEditandoId ? 'Atualizar' : 'Salvar'}</button>
            {clienteEditandoId && <button type="button" onClick={() => {setNome(''); setCpf(''); setEndereco(''); setCep(''); setClienteEditandoId(null)}} style={{...estilos.botaoSalvar, backgroundColor: '#f4f4f5', color: '#18181b'}}>Cancelar</button>}
          </form>
          
          <div style={{ width: '100%', maxWidth: '900px', marginBottom: '12px' }}>
            <input placeholder="🔍 Pesquisar cliente..." value={termoBuscaCliente} onChange={e => setTermoBuscaCliente(e.target.value)} style={{ ...estilos.input, width: '100%', boxSizing: 'border-box' }} />
          </div>

          <div style={estilos.listaContainer}>
            {clientesFiltrados.length === 0 ? <p style={{textAlign: 'center', color: '#a1a1aa'}}>Vazio.</p> : clientesFiltrados.map(cliente => (
              <li key={cliente.id} style={estilos.cardItem}>
                <div style={{ flex: '1' }}><strong style={{ display: 'block', color: '#27272a', fontSize: '1rem' }}>{cliente.nomeCompleto}</strong><span style={{ color: '#71717a', fontSize: '0.8rem' }}>{cliente.endereco} (CEP: {cliente.cep}) | CPF: {cliente.cpf}</span></div>
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
            <button type="submit" style={estilos.botaoSalvar}>Adicionar</button>
          </form>

          <div style={{...estilos.listaContainer, padding: '16px'}}>
            {categoriasDisponiveis.map(cat => {
              const itensDestaCategoria = equipamentos.filter(e => e.categoria === cat);
              if (itensDestaCategoria.length === 0) return null;
              
              const total = itensDestaCategoria.length;
              const disponiveis = itensDestaCategoria.filter(e => e.disponivel).length;

              return (
                <div key={cat}>
                  <div style={estilos.categoriaHeader} onClick={() => setCategoriaExpandida(categoriaExpandida === cat ? null : cat)}>
                    <span>📂 {cat}</span>
                    <span style={{ color: disponiveis > 0 ? '#16a34a' : '#dc2626' }}>{disponiveis}/{total} Disponíveis</span>
                  </div>
                  
                  {categoriaExpandida === cat && (
                    <div style={estilos.categoriaContent}>
                      {itensDestaCategoria.map(eq => (
                        <div key={eq.id} style={{ padding: '8px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f4f4f5' }}>
                          <span style={{ fontSize: '0.9rem', color: '#3f3f46', fontWeight: '500' }}>{eq.descricao}</span>
                          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                            {eq.disponivel ? <span style={{ color: '#16a34a', fontSize: '0.8rem', fontWeight: 'bold' }}>🟢 Livre</span> : <span style={{ color: '#dc2626', fontSize: '0.8rem', fontWeight: 'bold' }}>🔴 Alugada</span>}
                            <button onClick={() => handleExcluirEquipamento(eq.id)} style={{ padding: '4px 8px', fontSize: '0.75rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#fef2f2', color: '#b91c1c', fontWeight: 'bold' }}>🗑</button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )
            })}
            {equipamentos.length === 0 && <p style={{textAlign: 'center', color: '#a1a1aa'}}>Estoque vazio.</p>}
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

            {/* SELEÇÃO AGRUPADA DE EQUIPAMENTOS */}
            <div style={{ width: '100%', margin: '8px 0', border: '1px solid #e4e4e7', padding: '12px', borderRadius: '6px', backgroundColor: '#fafafa' }}>
              <span style={{ display: 'block', fontWeight: 'bold', marginBottom: '8px', color: '#27272a', fontSize: '0.9rem' }}>Vincular Equipamentos (Selecione):</span>
              
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                {categoriasDisponiveis.map(cat => {
                  const livres = equipamentos.filter(e => e.categoria === cat && e.disponivel);
                  if (livres.length === 0) return null;
                  return (
                    <div key={cat} style={{ flex: '1 1 200px', backgroundColor: '#fff', border: '1px solid #d4d4d8', borderRadius: '4px' }}>
                      <div onClick={() => setCategoriaExpandidaPedido(categoriaExpandidaPedido === cat ? null : cat)} style={{ padding: '6px 8px', backgroundColor: '#f4f4f5', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid #d4d4d8' }}>
                        {cat} ({livres.length}) ▾
                      </div>
                      {categoriaExpandidaPedido === cat && (
                        <div style={{ padding: '8px', maxHeight: '150px', overflowY: 'auto' }}>
                          {livres.map(eq => (
                            <label key={eq.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px', fontSize: '0.85rem', cursor: 'pointer' }}>
                              <input type="checkbox" checked={equipamentosSelecionadosIds.includes(eq.id)} onChange={() => handleToggleEquipamento(eq.id)} />
                              {eq.descricao}
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            <input type="datetime-local" value={dataEvento} onChange={e => setDataEvento(e.target.value)} required style={estilos.input} />
            <input placeholder="Marca Chopp" value={marcaBarril} onChange={e => setMarcaBarril(e.target.value)} required style={estilos.input} />
            <input type="number" placeholder="Litros" value={tamanhoBarrilLitros} onChange={e => setTamanhoBarrilLitros(e.target.value)} required style={estilos.input} />
            <input type="number" step="0.01" placeholder="R$ Total" value={valorTotal} onChange={e => setValorTotal(e.target.value)} required style={estilos.input} />
            <button type="submit" style={estilos.botaoSalvar}>Lançar Pedido</button>
          </form>

          <div style={estilos.listaContainer}>
            {pedidos.map(pedido => (
              <li key={pedido.id} style={{...estilos.cardItem, opacity: pedido.concluido ? 0.6 : 1}}>
                <div style={{ flex: '1' }}>
                  <strong style={{ display: 'block', color: '#27272a', fontSize: '1rem' }}>{pedido.cliente?.nomeCompleto || 'Desconhecido'} {pedido.concluido && '✅'}</strong>
                  <span style={{ color: '#71717a', fontSize: '0.8rem', display: 'block', margin: '2px 0' }}>📅 {new Date(pedido.dataEvento).toLocaleDateString('pt-BR')} às {new Date(pedido.dataEvento).toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit'})}</span>
                  <span style={{ color: '#71717a', fontSize: '0.8rem' }}>{pedido.marcaBarril} ({pedido.tamanhoBarrilLitros}L)</span>
                  <div style={{ display: 'flex', gap: '6px', marginTop: '8px' }}>
                    {!pedido.concluido && <button onClick={() => handleConcluirPedido(pedido.id)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#fef3c7', color: '#d97706', fontWeight: 'bold' }}>🔄 Devolver</button>}
                    <button onClick={() => handleGerarRecibo(pedido)} style={{ padding: '4px 10px', fontSize: '0.8rem', borderRadius: '4px', cursor: 'pointer', border: 'none', backgroundColor: '#dcfce7', color: '#16a34a', fontWeight: 'bold' }}>📱 WhatsApp</button>
                  </div>
                </div>
                <strong style={{ color: '#16a34a', fontSize: '1.1rem' }}>R$ {pedido.valorTotal.toFixed(2).replace('.', ',')}</strong>
              </li>
            ))}
          </div>
        </>
      )}

      {abaAtual === 'caixa' && (
        <>
          <form onSubmit={handleSalvarSaidaCaixa} style={estilos.formCard}>
            <input placeholder="Despesa (Ex: Fornecedor)" value={descricaoSaida} onChange={e => setDescricaoSaida(e.target.value)} required style={estilos.input} />
            <input type="number" step="0.01" placeholder="R$ Valor" value={valorSaida} onChange={e => setValorSaida(e.target.value)} required style={estilos.input} />
            <input type="datetime-local" value={dataSaida} onChange={e => setDataSaida(e.target.value)} required style={estilos.input} />
            <button type="submit" style={{ ...estilos.botaoSalvar, backgroundColor: '#dc2626' }}>Lançar Saída</button>
          </form>

          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', width: '100%', maxWidth: '900px', marginBottom: '24px' }}>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #16a34a', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Entradas</span><strong style={{ display: 'block', color: '#16a34a', fontSize: '1.4rem' }}>R$ {faturamentoTotal.toFixed(2).replace('.', ',')}</strong></div>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #dc2626', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Saídas</span><strong style={{ display: 'block', color: '#dc2626', fontSize: '1.4rem' }}>R$ {despesasTotal.toFixed(2).replace('.', ',')}</strong></div>
            <div style={{ backgroundColor: '#ffffff', padding: '16px', borderRadius: '6px', flex: '1', textAlign: 'center', borderTop: '4px solid #2563eb', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' }}><span style={{ color: '#71717a', fontSize: '0.85rem' }}>Subtotal</span><strong style={{ display: 'block', color: '#2563eb', fontSize: '1.4rem' }}>R$ {subtotalCaixa.toFixed(2).replace('.', ',')}</strong></div>
          </div>

          <div style={estilos.listaContainer}>
            {historicoCaixaUnificado.map(item => (
              <div key={item.id} style={{ padding: '12px 16px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong style={{ color: '#27272a', fontSize: '0.9rem' }}>{item.descricao}</strong>
                  <span style={{ display: 'block', color: '#71717a', fontSize: '0.75rem' }}>{new Date(item.data).toLocaleString('pt-BR')}</span>
                </div>
                <strong style={{ color: item.tipo === 'Entrada' ? '#16a34a' : '#dc2626', fontSize: '0.95rem' }}>{item.tipo === 'Entrada' ? '+' : '-'} R$ {item.valor.toFixed(2).replace('.', ',')}</strong>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export default App