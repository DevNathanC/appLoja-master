import React, { useState, useEffect } from 'react';
import jsPDF from 'jspdf';

type Entrada = {
  data: string;
  nome: string;
  servico: string;
  valor: string;
  formaPagamento: string;
};

type Cliente = {
  nome: string;
  telefone: string;
  email: string;
  endereco: string;
  dataCadastro: string;
};

const Caixa: React.FC = () => {
  const [clientes, setClientes] = useState<Cliente[]>(() => {
    const data = localStorage.getItem('clientes');
    return data ? JSON.parse(data) : [];
  });
  const [entrada, setEntrada] = useState<Entrada>({
    data: '',
    nome: '',
    servico: '',
    valor: '',
    formaPagamento: ''
  });
  const [entradas, setEntradas] = useState<Entrada[]>(() => {
    const data = localStorage.getItem('entradas');
    return data ? JSON.parse(data) : [];
  });
  const [saida, setSaida] = useState<Entrada>({
    data: '',
    nome: '',
    servico: '',
    valor: '',
    formaPagamento: ''
  });
  const [saidas, setSaidas] = useState<Entrada[]>(() => {
    const data = localStorage.getItem('saidas');
    return data ? JSON.parse(data) : [];
  });
  const [mostrarFormulario, setMostrarFormulario] = useState<'entrada' | 'saida' | false>(false);
  const [editandoEntrada, setEditandoEntrada] = useState<number | null>(null);
  const [editandoSaida, setEditandoSaida] = useState<number | null>(null);

  const handleChangeEntrada = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEntrada(prev => ({ ...prev, [name]: value }));
  };

  const handleChangeSaida = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setSaida(prev => ({ ...prev, [name]: value }));
  };

  const handleAdicionarEntrada = (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoEntrada !== null) {
      // Editar entrada existente
      setEntradas(prev => {
        const novas = [...prev];
        novas[editandoEntrada] = entrada;
        localStorage.setItem('entradas', JSON.stringify(novas));
        return novas;
      });
      setEditandoEntrada(null);
    } else {
      // Adicionar nova entrada
      setEntradas(prev => {
        const novas = [...prev, entrada];
        localStorage.setItem('entradas', JSON.stringify(novas));
        return novas;
      });
    }
    setEntrada({ data: '', nome: '', servico: '', valor: '', formaPagamento: '' });
    setMostrarFormulario(false);
  };

  const handleAdicionarSaida = (e: React.FormEvent) => {
    e.preventDefault();
    if (editandoSaida !== null) {
      // Editar saída existente
      setSaidas(prev => {
        const novas = [...prev];
        novas[editandoSaida] = saida;
        localStorage.setItem('saidas', JSON.stringify(novas));
        return novas;
      });
      setEditandoSaida(null);
    } else {
      // Adicionar nova saída
      setSaidas(prev => {
        const novas = [...prev, saida];
        localStorage.setItem('saidas', JSON.stringify(novas));
        return novas;
      });
    }
    setSaida({ data: '', nome: '', servico: '', valor: '', formaPagamento: '' });
    setMostrarFormulario(false);
  };

  const handleExcluirEntrada = (index: number) => {
    if (window.confirm('Deseja realmente excluir esta entrada?')) {
      setEntradas(prev => {
        const novas = prev.filter((_, i) => i !== index);
        localStorage.setItem('entradas', JSON.stringify(novas));
        return novas;
      });
    }
  };

  const handleEditarEntrada = (index: number) => {
    setEntrada(entradas[index]);
    setEditandoEntrada(index);
    setMostrarFormulario('entrada');
  };

  const handleExcluirSaida = (index: number) => {
    if (window.confirm('Deseja realmente excluir esta saída?')) {
      setSaidas(prev => {
        const novas = prev.filter((_, i) => i !== index);
        localStorage.setItem('saidas', JSON.stringify(novas));
        return novas;
      });
    }
  };

  const handleEditarSaida = (index: number) => {
    setSaida(saidas[index]);
    setEditandoSaida(index);
    setMostrarFormulario('saida');
  };
  // Atualiza localStorage quando entradas ou saídas mudam (caso haja remoção futura)
  useEffect(() => {
    localStorage.setItem('entradas', JSON.stringify(entradas));
  }, [entradas]);

  useEffect(() => {
    localStorage.setItem('saidas', JSON.stringify(saidas));
  }, [saidas]);

  // Função para formatar data no formato brasileiro
  function formatarDataBR(data: string) {
    if (!data) return '';
    const [ano, mes, dia] = data.split('-');
    return `${dia}/${mes}/${ano}`;
  }

  // Função para gerar PDF do extrato (deve estar aqui, depois dos estados)
  const gerarExtratoPDF = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text('Extrato de Entradas e Saídas', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);

    // Agrupar por data
    const todasDatas = Array.from(new Set([
      ...entradas.map((e: Entrada) => e.data),
      ...saidas.map((s: Entrada) => s.data)
    ])).sort();

    todasDatas.forEach((data: string) => {
      const entradasDia = entradas.filter((e: Entrada) => e.data === data);
      const saidasDia = saidas.filter((s: Entrada) => s.data === data);
      if (entradasDia.length === 0 && saidasDia.length === 0) return;
      y += 8;
      doc.setFont('helvetica', 'bold');
      doc.text(`Data: ${formatarDataBR(data)}`, 15, y);
      doc.setFont('helvetica', 'normal');
      y += 6;
      if (entradasDia.length > 0) {
        doc.text('Entradas:', 20, y);
        y += 6;
        entradasDia.forEach((e: Entrada) => {
          doc.text(`Nome: ${e.nome}  Serviço: ${e.servico || '-'}  Valor: R$ ${(parseFloat(e.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}  Forma: ${e.formaPagamento}`, 25, y);
          y += 6;
        });
      }
      if (saidasDia.length > 0) {
        doc.text('Saídas:', 20, y);
        y += 6;
        saidasDia.forEach((s: Entrada) => {
          doc.text(`Nome: ${s.nome}  Valor: R$ ${(parseFloat(s.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}  Forma: ${s.formaPagamento}`, 25, y);
          y += 6;
        });
      }
      y += 2;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    doc.save('extrato-caixa.pdf');
  };

  // Função para exportar dados como PDF
  const exportarDados = () => {
    const doc = new jsPDF();
    let y = 20;
    doc.setFontSize(18);
    doc.text('Relatório de Entradas e Saídas', 105, y, { align: 'center' });
    y += 10;
    doc.setFontSize(12);

    // Entradas
    doc.setFont('helvetica', 'bold');
    doc.text('Entradas:', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    if (entradas.length === 0) {
      doc.text('Nenhuma entrada cadastrada.', 20, y);
      y += 8;
    } else {
      entradas.forEach((e, idx) => {
        doc.text(
          `Data: ${formatarDataBR(e.data)} | Nome: ${e.nome} | Serviço: ${e.servico} | Valor: R$ ${(parseFloat(e.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Forma: ${e.formaPagamento}`,
          20, y
        );
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Saídas:', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    if (saidas.length === 0) {
      doc.text('Nenhuma saída cadastrada.', 20, y);
      y += 8;
    } else {
      saidas.forEach((s, idx) => {
        doc.text(
          `Data: ${formatarDataBR(s.data)} | Nome: ${s.nome} | Valor: R$ ${(parseFloat(s.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | Forma: ${s.formaPagamento}`,
          20, y
        );
        y += 8;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    y += 8;
    doc.setFont('helvetica', 'bold');
    doc.text('Totais:', 15, y);
    doc.setFont('helvetica', 'normal');
    y += 8;
    const totalEntradas = entradas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const totalSaidas = saidas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const saldo = totalEntradas - totalSaidas;
    doc.text(`Total Entradas: R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, y);
    y += 8;
    doc.text(`Total Saídas: R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, y);
    y += 8;
    doc.text(`Saldo: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 20, y);

    doc.save('relatorio-caixa.pdf');
  };

  // Função para limpar dados com alerta customizado
  const limparDados = () => {
    // Cria um elemento de overlay
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.background = 'rgba(0,0,0,0.4)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '9999';

    // Cria o modal
    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '32px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 2px 16px rgba(0,0,0,0.2)';
    modal.style.minWidth = '320px';
    modal.style.display = 'flex';
    modal.style.flexDirection = 'column';
    modal.style.gap = '16px';
    modal.style.position = 'relative';

    // Mensagem
    const msg = document.createElement('div');
    msg.style.fontSize = '18px';
    msg.style.textAlign = 'center';
    msg.innerHTML = 'A limpeza deve ser feita somente ao final do mês.<br><b>Lembre sempre de exportar os dados antes!</b>';
    modal.appendChild(msg);

    // Botão Exportar
    const btnExportar = document.createElement('button');
    btnExportar.textContent = 'Exportar Dados';
    btnExportar.style.padding = '12px 32px';
    btnExportar.style.fontSize = '18px';
    btnExportar.style.background = '#2196f3';
    btnExportar.style.color = '#fff';
    btnExportar.style.border = 'none';
    btnExportar.style.borderRadius = '4px';
    btnExportar.style.cursor = 'pointer';
    btnExportar.onclick = () => {
      exportarDados();
    };
    modal.appendChild(btnExportar);

    // Botões de ação
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.justifyContent = 'center';
    btns.style.gap = '16px';
    btns.style.marginTop = '16px';

    // Botão Confirmar
    const btnConfirmar = document.createElement('button');
    btnConfirmar.textContent = 'Limpar Dados';
    btnConfirmar.style.padding = '12px 32px';
    btnConfirmar.style.fontSize = '18px';
    btnConfirmar.style.background = '#f44336';
    btnConfirmar.style.color = '#fff';
    btnConfirmar.style.border = 'none';
    btnConfirmar.style.borderRadius = '4px';
    btnConfirmar.style.cursor = 'pointer';
    btnConfirmar.onclick = () => {
      setEntradas([]);
      setSaidas([]);
      localStorage.removeItem('entradas');
      localStorage.removeItem('saidas');
      document.body.removeChild(overlay);
    };
    btns.appendChild(btnConfirmar);

    // Botão Cancelar
    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.padding = '12px 32px';
    btnCancelar.style.fontSize = '18px';
    btnCancelar.style.background = '#757575';
    btnCancelar.style.color = '#fff';
    btnCancelar.style.border = 'none';
    btnCancelar.style.borderRadius = '4px';
    btnCancelar.style.cursor = 'pointer';
    btnCancelar.onclick = () => {
      document.body.removeChild(overlay);
    };
    btns.appendChild(btnCancelar);

    modal.appendChild(btns);
    overlay.appendChild(modal);
    document.body.appendChild(overlay);
  };

  return (
    <div style={{ padding: 24 }}>
      <h1>Caixa</h1>
      <div style={{ marginTop: 32, marginBottom: 24, display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
        <button
          style={{ padding: '12px 32px', fontSize: 18, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => setMostrarFormulario('entrada')}
        >
          Entrada
        </button>
        <button
          style={{ padding: '12px 32px', fontSize: 18, background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={() => setMostrarFormulario('saida')}
        >
          Saída
        </button>
      </div>


      {/* Listas e totais */}
      <React.Fragment>
        {entradas.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2>Entradas cadastradas</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Data</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Nome</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Serviço</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Valor</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Forma de Pagamento</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {entradas.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{formatarDataBR(item.data)}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.nome}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.servico}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                      R$ {(parseFloat(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.formaPagamento}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditarEntrada(idx)}
                        style={{ padding: '6px 12px', fontSize: 14, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8 }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirEntrada(idx)}
                        style={{ padding: '6px 12px', fontSize: 14, background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
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

        {saidas.length > 0 && (
          <div style={{ marginTop: 40 }}>
            <h2>Saídas cadastradas</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: 16 }}>
              <thead>
                <tr style={{ background: '#f5f5f5' }}>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Data</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Nome</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Valor</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Forma de Pagamento</th>
                  <th style={{ border: '1px solid #ccc', padding: 8 }}>Ações</th>
                </tr>
              </thead>
              <tbody>
                {saidas.map((item, idx) => (
                  <tr key={idx}>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{formatarDataBR(item.data)}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.nome}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                      R$ {(parseFloat(item.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>{item.formaPagamento}</td>
                    <td style={{ border: '1px solid #ccc', padding: 8, textAlign: 'center' }}>
                      <button
                        onClick={() => handleEditarSaida(idx)}
                        style={{ padding: '6px 12px', fontSize: 14, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', marginRight: 8 }}
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleExcluirSaida(idx)}
                        style={{ padding: '6px 12px', fontSize: 14, background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
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

        {(entradas.length > 0 || saidas.length > 0) && (
          <div style={{ marginTop: 40, display: 'flex', justifyContent: 'center' }}>
            <table style={{ borderCollapse: 'collapse', minWidth: 600, fontWeight: 'bold', fontSize: 20, boxShadow: '0 2px 12px rgba(0,0,0,0.08)' }}>
              <tbody>
                <tr>
                  <td style={{ background: '#4caf50', color: '#fff', textAlign: 'center', padding: 24, border: '1px solid #fff', minWidth: 180 }}>
                    R$ {entradas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ background: '#f44336', color: '#fff', textAlign: 'center', padding: 24, border: '1px solid #fff', minWidth: 180 }}>
                    R$ {saidas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                  <td style={{ background: '#ff9800', color: '#fff', textAlign: 'center', padding: 24, border: '1px solid #fff', minWidth: 180 }}>
                    R$ {(entradas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0) - saidas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0)).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </React.Fragment>

      {/* Área de Gerenciamento de Dados */}
      <div style={{
        marginTop: 48,
        marginBottom: 24,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
        <div style={{
          border: '2px dashed #bbb',
          borderRadius: 12,
          padding: '32px 24px',
          background: '#fafafa',
          minWidth: 320,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 20,
          boxShadow: '0 2px 12px rgba(0,0,0,0.04)'
        }}>
          <div style={{ fontWeight: 600, color: '#444', marginBottom: 8, fontSize: 18 }}>Gerenciamento de Dados</div>
          <div style={{ display: 'flex', flexDirection: 'row', gap: 20, justifyContent: 'center', alignItems: 'center' }}>
            <button
              style={{ padding: '12px 32px', fontSize: 18, background: '#2196f3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              onClick={exportarDados}
            >
              Exportar Dados
            </button>
            <button
              style={{ padding: '12px 32px', fontSize: 18, background: '#757575', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
              onClick={limparDados}
            >
              Limpar Dados
            </button>
          </div>
        </div>
      </div>


      {/* Formulário de Entrada como popup */}
      {mostrarFormulario === 'entrada' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form onSubmit={handleAdicionarEntrada} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            <button type="button" onClick={() => { setMostrarFormulario(false); setEditandoEntrada(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
            <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{editandoEntrada !== null ? 'Editar Entrada' : 'Nova Entrada'}</h2>
            <input
              type="date"
              name="data"
              value={entrada.data}
              onChange={handleChangeEntrada}
              required
              placeholder="Data"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <input
              type="text"
              name="nome"
              value={entrada.nome}
              onChange={handleChangeEntrada}
              required
              placeholder="Nome"
              list="clientes-list"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <datalist id="clientes-list">
              {clientes.map((cliente, index) => (
                <option key={index} value={cliente.nome} />
              ))}
            </datalist>
            <input
              type="text"
              name="servico"
              value={entrada.servico}
              onChange={handleChangeEntrada}
              required
              placeholder="Serviço"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <input
              type="number"
              name="valor"
              value={entrada.valor}
              onChange={handleChangeEntrada}
              required
              placeholder="Valor"
              min="0"
              step="0.01"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <select
              name="formaPagamento"
              value={entrada.formaPagamento}
              onChange={handleChangeEntrada}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="">Forma de Pagamento</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">Pix</option>
            </select>
            <button
              type="submit"
              style={{ padding: '12px 32px', fontSize: 18, background: '#4caf50', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {editandoEntrada !== null ? 'Salvar' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      {/* Formulário de Saída como popup */}
      {mostrarFormulario === 'saida' && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'rgba(0,0,0,0.4)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <form onSubmit={handleAdicionarSaida} style={{ background: '#fff', padding: 32, borderRadius: 8, boxShadow: '0 2px 16px rgba(0,0,0,0.2)', minWidth: 320, display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
            <button type="button" onClick={() => { setMostrarFormulario(false); setEditandoSaida(null); }} style={{ position: 'absolute', top: 8, right: 8, background: 'transparent', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888' }}>&times;</button>
            <h2 style={{ textAlign: 'center', marginBottom: 8 }}>{editandoSaida !== null ? 'Editar Saída' : 'Nova Saída'}</h2>
            <input
              type="date"
              name="data"
              value={saida.data}
              onChange={handleChangeSaida}
              required
              placeholder="Data"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <input
              type="text"
              name="nome"
              value={saida.nome}
              onChange={handleChangeSaida}
              required
              placeholder="Nome"
              list="clientes-list-saida"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <datalist id="clientes-list-saida">
              {clientes.map((cliente, index) => (
                <option key={index} value={cliente.nome} />
              ))}
            </datalist>
            <input
              type="number"
              name="valor"
              value={saida.valor}
              onChange={handleChangeSaida}
              required
              placeholder="Valor"
              min="0"
              step="0.01"
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            />
            <select
              name="formaPagamento"
              value={saida.formaPagamento}
              onChange={handleChangeSaida}
              required
              style={{ padding: 10, fontSize: 16, borderRadius: 4, border: '1px solid #ccc' }}
            >
              <option value="">Forma de Pagamento</option>
              <option value="dinheiro">Dinheiro</option>
              <option value="cartao">Cartão</option>
              <option value="pix">Pix</option>
            </select>
            <button
              type="submit"
              style={{ padding: '12px 32px', fontSize: 18, background: '#f44336', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
            >
              {editandoSaida !== null ? 'Salvar' : 'Adicionar'}
            </button>
          </form>
        </div>
      )}

      {/* As listas e totais são renderizadas apenas acima da área de Gerenciamento de Dados */}
    </div>
  );
};

export default Caixa;
