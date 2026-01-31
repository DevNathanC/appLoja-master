import React, { useState, useEffect } from 'react';
import './Clientes.css';

type Cliente = {
  numero: number;
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  dataCadastro: string;
};

type Entrada = {
  data: string;
  nome: string;
  servico: string;
  valor: string;
  formaPagamento: string;
};

const Clientes: React.FC = () => {
  const [cliente, setCliente] = useState<Cliente>({
    numero: 0,
    nome: '',
    telefone: '',
    email: '',
    endereco: '',
    dataCadastro: new Date().toISOString().split('T')[0]
  });
  
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const data = localStorage.getItem('clientes');
    return data ? JSON.parse(data) : [];
  });
  
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [editandoCliente, setEditandoCliente] = useState<number | null>(null);
  const [busca, setBusca] = useState('');
  const [clienteSelecionado, setClienteSelecionado] = useState<string | null>(null);
  const [historico, setHistorico] = useState<Entrada[]>([]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setCliente(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!cliente.nome || !cliente.telefone) {
      alert('Nome e telefone são obrigatórios!');
      return;
    }

    if (editandoCliente !== null) {
      // Editar cliente existente
      setClientes(prev => {
        const novos = [...prev];
        novos[editandoCliente] = cliente;
        localStorage.setItem('clientes', JSON.stringify(novos));
        return novos;
      });
      setEditandoCliente(null);
    } else {
      // Adicionar novo cliente com número sequencial
      const proximoNumero = clientes.length > 0 
        ? Math.max(...clientes.map(c => c.numero || 0)) + 1 
        : 1;
      
      const novoCliente = { ...cliente, numero: proximoNumero };
      
      setClientes(prev => {
        const novos = [...prev, novoCliente];
        localStorage.setItem('clientes', JSON.stringify(novos));
        return novos;
      });
    }
    
    setCliente({
      numero: 0,
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      dataCadastro: new Date().toISOString().split('T')[0]
    });
    setMostrarFormulario(false);
  };

  const handleEditar = (index: number) => {
    setCliente(clientes[index]);
    setEditandoCliente(index);
    setMostrarFormulario(true);
  };

  const handleExcluir = (index: number) => {
    if (window.confirm('Deseja realmente excluir este cliente?')) {
      setClientes(prev => {
        const novos = prev.filter((_, i) => i !== index);
        localStorage.setItem('clientes', JSON.stringify(novos));
        return novos;
      });
    }
  };

  const handleCancelar = () => {
    setCliente({
      numero: 0,
      nome: '',
      telefone: '',
      email: '',
      endereco: '',
      dataCadastro: new Date().toISOString().split('T')[0]
    });
    setEditandoCliente(null);
    setMostrarFormulario(false);
  };

  const handleVerHistorico = (nomeCliente: string) => {
    // Buscar entradas do cliente no localStorage
    const entradas = localStorage.getItem('entradas');
    const listaEntradas: Entrada[] = entradas ? JSON.parse(entradas) : [];
    
    // Filtrar apenas as entradas desse cliente
    const historicoCliente = listaEntradas.filter(
      entrada => entrada.nome.toLowerCase() === nomeCliente.toLowerCase()
    );
    
    setHistorico(historicoCliente);
    setClienteSelecionado(nomeCliente);
  };

  const fecharHistorico = () => {
    setClienteSelecionado(null);
    setHistorico([]);
  };

  const clientesFiltrados = clientes.filter(c => 
    c.nome.toLowerCase().includes(busca.toLowerCase()) ||
    c.telefone.includes(busca) ||
    c.email.toLowerCase().includes(busca.toLowerCase())
  );

  return (
    <div className="clientes-container">
      <h1>Cadastro de Clientes</h1>
      
      <div className="clientes-header">
        <button 
          className="btn-adicionar"
          onClick={() => setMostrarFormulario(!mostrarFormulario)}
        >
          {mostrarFormulario ? 'Cancelar' : '+ Novo Cliente'}
        </button>
        
        <input
          type="text"
          placeholder="Buscar cliente..."
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          className="input-busca"
        />
      </div>

      {mostrarFormulario && (
        <form className="form-cliente" onSubmit={handleSubmit}>
          <h2>{editandoCliente !== null ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Nome *</label>
              <input
                type="text"
                name="nome"
                value={cliente.nome}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label>Telefone *</label>
              <input
                type="tel"
                name="telefone"
                value={cliente.telefone}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-actions">
            <button type="submit" className="btn-salvar">
              {editandoCliente !== null ? 'Atualizar' : 'Salvar'}
            </button>
            <button type="button" className="btn-cancelar" onClick={handleCancelar}>
              Cancelar
            </button>
          </div>
        </form>
      )}

      <div className="clientes-lista">
        <h2>Clientes Cadastrados ({clientesFiltrados.length})</h2>
        
        {clientesFiltrados.length === 0 ? (
          <p className="sem-clientes">Nenhum cliente cadastrado.</p>
        ) : (
          <div className="tabela-container">
            <table>
              <thead>
                <tr>
                  <th>Nº</th>
                  <th>Nome</th>
                  <th>Telefone</th>
                  <th>Email</th>
                  <th>Data Cadastro</th>
                  <th>Ações</th>
                </tr>
              </thead>
              <tbody>
                {clientesFiltrados.map((c, index) => (
                  <tr key={index}>
                    <td><strong>#{c.numero || '-'}</strong></td>
                    <td>
                      <span 
                        className="nome-clicavel"
                        onClick={() => handleVerHistorico(c.nome)}
                      >
                        {c.nome}
                      </span>
                    </td>
                    <td>{c.telefone}</td>
                    <td>{c.email || '-'}</td>
                    <td>{new Date(c.dataCadastro).toLocaleDateString('pt-BR')}</td>
                    <td className="acoes">
                      <button 
                        className="btn-editar"
                        onClick={() => handleEditar(clientes.indexOf(c))}
                      >
                        Editar
                      </button>
                      <button 
                        className="btn-excluir"
                        onClick={() => handleExcluir(clientes.indexOf(c))}
                      >
                        Excluir
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {clienteSelecionado && (
        <div className="modal-overlay" onClick={fecharHistorico}>
          <div className="modal-historico" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>Histórico de Serviços - {clienteSelecionado}</h2>
              <button className="btn-fechar" onClick={fecharHistorico}>✕</button>
            </div>
            <div className="modal-body">
              {historico.length === 0 ? (
                <p className="sem-historico">Nenhum serviço encontrado para este cliente.</p>
              ) : (
                <table className="tabela-historico">
                  <thead>
                    <tr>
                      <th>Data</th>
                      <th>Serviço</th>
                      <th>Valor</th>
                      <th>Forma de Pagamento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historico.map((entrada, index) => (
                      <tr key={index}>
                        <td>{new Date(entrada.data).toLocaleDateString('pt-BR')}</td>
                        <td>{entrada.servico}</td>
                        <td>R$ {parseFloat(entrada.valor).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</td>
                        <td>{entrada.formaPagamento}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
              <div className="modal-footer">
                <p><strong>Total de serviços:</strong> {historico.length}</p>
                <p><strong>Valor total:</strong> R$ {historico.reduce((acc, e) => acc + parseFloat(e.valor || '0'), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
