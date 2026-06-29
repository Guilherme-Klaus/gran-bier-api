import { useState, useEffect } from 'react'

function App() {
  const [clientes, setClientes] = useState([])
  
  // Guardando o que o usuário digita no formulário
  const [nome, setNome] = useState('')
  const [cpf, setCpf] = useState('')
  const [endereco, setEndereco] = useState('')

  // Busca inicial dos clientes ao abrir a tela
  useEffect(() => {
    fetch('http://localhost:5249/api/Clientes')
      .then(resposta => resposta.json())
      .then(dados => setClientes(dados))
      .catch(erro => console.error("Erro ao buscar clientes:", erro))
  }, [])

  // Função que dispara quando clicamos no botão "Salvar Cliente"
  const handleCadastrar = async (evento) => {
    evento.preventDefault() // Evita que a página pisque/recarregue

    const novoCliente = {
      nomeCompleto: nome,
      cpf: cpf,
      endereco: endereco,
      dataNascimento: new Date().toISOString(), // Coloquei a data de hoje por padrão para agilizar o teste
      observacoes: "Cadastrado direto pela interface!"
    }

    try {
      const resposta = await fetch('http://localhost:5249/api/Clientes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(novoCliente)
      })

      if (resposta.ok) {
        const clienteSalvo = await resposta.json()
        // Adiciona o novo cliente na lista da tela na mesma hora
        setClientes([...clientes, clienteSalvo]) 
        
        // Limpa os campos do formulário
        setNome('')
        setCpf('')
        setEndereco('')
      }
    } catch (erro) {
      console.error("Erro ao salvar:", erro)
    }
  }

  // Visual da página (estilo minimalista)
  return (
    <div style={{ padding: '40px', fontFamily: 'sans-serif', backgroundColor: '#f4f4f5', minHeight: '100vh' }}>
      <h1 style={{ color: '#18181b', fontWeight: 'bold' }}>Gran Bier</h1>
      <h2 style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '24px' }}>Novo Cliente</h2>

      {/* CAIXA DO FORMULÁRIO */}
      <form onSubmit={handleCadastrar} style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)', marginBottom: '32px', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        <input 
          placeholder="Nome Completo" 
          value={nome} onChange={e => setNome(e.target.value)} required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', flex: '1 1 200px' }} 
        />
        <input 
          placeholder="CPF" 
          value={cpf} onChange={e => setCpf(e.target.value)} required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', flex: '1 1 150px' }} 
        />
        <input 
          placeholder="Endereço" 
          value={endereco} onChange={e => setEndereco(e.target.value)} required
          style={{ padding: '10px', borderRadius: '6px', border: '1px solid #d4d4d8', flex: '1 1 250px' }} 
        />
        <button type="submit" style={{ padding: '10px 24px', backgroundColor: '#18181b', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' }}>
          Salvar
        </button>
      </form>

      {/* LISTA DE CLIENTES */}
      <h2 style={{ color: '#52525b', fontSize: '1.2rem', marginBottom: '16px' }}>Clientes Cadastrados</h2>
      <div style={{ backgroundColor: '#ffffff', padding: '24px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
        {clientes.length === 0 ? (
          <p style={{ color: '#a1a1aa' }}>Nenhum cliente cadastrado ainda.</p>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {clientes.map(cliente => (
              <li key={cliente.id} style={{ padding: '16px 0', borderBottom: '1px solid #e4e4e7' }}>
                <strong style={{ display: 'block', color: '#27272a', fontSize: '1.1rem' }}>
                  {cliente.nomeCompleto}
                </strong>
                <span style={{ color: '#71717a', fontSize: '0.9rem' }}>
                  {cliente.endereco} | CPF: {cliente.cpf}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App