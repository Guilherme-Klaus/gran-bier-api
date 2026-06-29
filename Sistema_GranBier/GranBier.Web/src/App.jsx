import { useState, useEffect } from 'react'

function App() {
  // Controle de qual tela estamos vendo (Menu)
  const [abaAtual, setAbaAtual] = useState('clientes')

  // Estados dos Clientes
  const [clientes, setClientes] = useState([])
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [endereco, setEndereco] = useState('')
  const [clienteEditandoId, setClienteEditandoId] = useState(null)

  // Estados dos Equipamentos
  const [equipamentos, setEquipamentos] = useState([])

  // ==========================================
  // FUNÇÕES DE CLIENTES
  // ==========================================
  const buscarClientes = () => {
    fetch('http://localhost:5249/api/Clientes')
      .then(res => res.json())
      .then(dados => setClientes(dados))
      .catch(erro => console.error(erro))
  }

  const handleSalvarCliente = async (evento) => {
    evento.preventDefault()
    const dadosCliente = { id: clienteEditandoId || 0, nomeCompleto: nome, cpf: cpf, endereco: endereco, dataNascimento: new Date().toISOString(), observacoes: "Interface" }
    const url = clienteEditandoId ? `http://localhost:5249/api/Clientes/${clienteEditandoId}` : 'http://localhost:5249/api/Clientes'
    const metodo = clienteEditandoId ? 'PUT' : 'POST'

    try {
      const res = await fetch(url, { method: metodo, headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(dadosCliente) })
      
      if (res.ok) {
        buscarClientes()
        setNome(''); setCpf(''); setEndereco(''); setClienteEditandoId(null)
      } else if (res.status === 400) {
        // LÊ O ERRO DA API E MOSTRA NA TELA SE O CPF FOR REPETIDO
        const erroDaApi = await res.json()
        alert("⚠️ Atenção: " + erroDaApi.mensagem)
      }
    } catch (erro) { console.error(erro) }
  }

  const handleExcluirCliente = async (id) => {
    if (window.confirm("Certeza que quer excluir?")) {
      const res = await fetch(`http://localhost:5249/api/Clientes/${id}`, { method: 'DELETE' })
      if (res.ok) setClientes(clientes.filter(c => c.id !== id))
    }
  }

  const handleEditarCliente = (cliente) => {
    setNome(cliente.nomeCompleto); setCpf(cliente.cpf); setEndereco(cliente.endereco); setClienteEditandoId(cliente.id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // ==========================================
  // FUNÇÕES DE EQUIPAMENTOS
  // ==========================================
  const buscarEquipamentos = () => {
    fetch('http://localhost:5249/api/Equipamentos/disponiveis')
      .then(res => res.json())
      .then(dados => setEquipamentos(dados))
      .catch(erro => console.error(erro))
  }

  useEffect(() => { 
    if (abaAtual === 'clientes') buscarClientes()
    if (abaAtual === 'equipamentos') buscarEquipamentos()
  }, [abaAtual])

  // ==========================================
  // VISUAL (ESTILOS)
  // ==========================================
  const estilos = {
    pagina: { padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center' },
    header: { textAlign: 'center', marginBottom: '24px' },
    menu: { display: 'flex', gap: '16px', marginBottom: '32px', backgroundColor: '#e4e4e7', padding: '8px', borderRadius: '8px' },
    botaoMenu: (ativo) => ({ padding: '10px 24px', backgroundColor: ativo ? '#ffffff' : 'transparent', color: ativo ? '#18181b' : '#71717a', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', boxShadow: ativo ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }),
    formCard: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center', width: '100%', maxWidth: '800px', alignItems: 'center' },
    input: { padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', flex: '1 1 200px' },
    botaoSalvar: { padding: '10px 24px', backgroundColor: clienteEditandoId ? '#2563eb' : '#18181b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' },
    listaContainer: { backgroundColor: '#ffffff', padding: '12px 24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', width: '100%', maxWidth: '900px' },
    cardItem: { padding: '16px 20px', borderBottom: '1px solid #e4e4e7', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '20px' },
    areaBotoes: { display: 'flex', gap: '8px' },
    botaoIcone: { padding: '6px 12px', borderRadius: '6px', display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', border: 'none', fontWeight: 'bold' }
  }

  return (
    <div style={estilos.pagina}>
      <div style={estilos.header}>
        <h1 style={{ color: '#18181b', fontWeight: 'bold' }}>Gran Bier</h1>
      </div>

      <div style={estilos.menu}>
        <button style={estilos.botaoMenu(abaAtual === 'clientes')} onClick={() => setAbaAtual('clientes')}>
          👥 Clientes
        </button>
        <button style={estilos.botaoMenu(abaAtual === 'equipamentos')} onClick={() => setAbaAtual('equipamentos')}>
          🍺 Equipamentos
        </button>
      </div>

      {abaAtual === 'clientes' && (
        <>
          <h2 style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '16px' }}>{clienteEditandoId ? 'Editando Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSalvarCliente} style={estilos.formCard}>
            <input placeholder="Nome Completo" value={nome} onChange={e => setNome(e.target.value)} required style={estilos.input} />
            <input placeholder="CPF" value={cpf} onChange={e => setCpf(e.target.value)} required style={estilos.input} />
            <input placeholder="Endereço" value={endereco} onChange={e => setEndereco(e.target.value)} required style={estilos.input} />
            <button type="submit" style={estilos.botaoSalvar}>{clienteEditandoId ? 'Atualizar' : 'Salvar'}</button>
            {clienteEditandoId && <button type="button" onClick={() => {setNome(''); setCpf(''); setEndereco(''); setClienteEditandoId(null)}} style={{...estilos.botaoSalvar, backgroundColor: '#f4f4f5', color: '#18181b'}}>Cancelar</button>}
          </form>

          <div style={estilos.listaContainer}>
            {clientes.length === 0 ? <p style={{textAlign: 'center', color: '#a1a1aa'}}>Nenhum cliente.</p> : clientes.map(cliente => (
              <li key={cliente.id} style={estilos.cardItem}>
                <div style={{ flex: '1' }}>
                  <strong style={{ display: 'block', color: '#27272a', fontSize: '1.1rem' }}>{cliente.nomeCompleto}</strong>
                  <span style={{ color: '#71717a', fontSize: '0.9rem' }}>{cliente.endereco} | CPF: {cliente.cpf}</span>
                </div>
                <div style={estilos.areaBotoes}>
                  <button onClick={() => handleEditarCliente(cliente)} style={{ ...estilos.botaoIcone, backgroundColor: '#f4f4f5', color: '#52525b' }}>✎ Editar</button>
                  <button onClick={() => handleExcluirCliente(cliente.id)} style={{ ...estilos.botaoIcone, backgroundColor: '#fef2f2', color: '#b91c1c' }}>🗑 Excluir</button>
                </div>
              </li>
            ))}
          </div>
        </>
      )}

      {abaAtual === 'equipamentos' && (
        <>
          <h2 style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '16px' }}>Estoque Disponível</h2>
          <div style={estilos.listaContainer}>
            {equipamentos.length === 0 ? (
              <p style={{textAlign: 'center', color: '#a1a1aa', padding: '20px'}}>Nenhum equipamento livre no galpão.</p>
            ) : equipamentos.map(equipamento => (
              <li key={equipamento.id} style={estilos.cardItem}>
                <div style={{ flex: '1' }}>
                  <strong style={{ display: 'block', color: '#27272a', fontSize: '1.1rem' }}>{equipamento.descricao}</strong>
                  <span style={{ color: '#16a34a', fontSize: '0.9rem', fontWeight: 'bold' }}>🟢 Pronto para aluguel</span>
                </div>
              </li>
            ))}
          </div>
        </>
      )}

    </div>
  )
}

export default App