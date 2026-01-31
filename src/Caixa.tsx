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
  const [metasAjustadas, setMetasAjustadas] = useState<{ diaria: number; semanal: number; mensal: number }>(() => {
    const data = localStorage.getItem('metasAjustadas');
    return data ? JSON.parse(data) : { diaria: 0, semanal: 0, mensal: 0 };
  });
  const [novaMetaDiaria, setNovaMetaDiaria] = useState('');
  const [novaMetaSemanal, setNovaMetaSemanal] = useState('');
  const [novaMetaMensal, setNovaMetaMensal] = useState('');

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

  useEffect(() => {
    localStorage.setItem('metasAjustadas', JSON.stringify(metasAjustadas));
  }, [metasAjustadas]);

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
    
    // Cabeçalho
    doc.setFillColor(33, 150, 243);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Extrato de Entradas e Saídas', 105, 18, { align: 'center' });
    
    // Data de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    y = 40;

    // Agrupar por data
    const todasDatas = Array.from(new Set([
      ...entradas.map((e: Entrada) => e.data),
      ...saidas.map((s: Entrada) => s.data)
    ])).sort();

    todasDatas.forEach((data: string) => {
      const entradasDia = entradas.filter((e: Entrada) => e.data === data);
      const saidasDia = saidas.filter((s: Entrada) => s.data === data);
      if (entradasDia.length === 0 && saidasDia.length === 0) return;
      
      // Cabeçalho da data
      doc.setFillColor(240, 240, 240);
      doc.roundedRect(10, y - 5, 190, 8, 2, 2, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.text(`Data: ${formatarDataBR(data)}`, 15, y);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      y += 10;
      
      if (entradasDia.length > 0) {
        doc.setTextColor(76, 175, 80);
        doc.setFont('helvetica', 'bold');
        doc.text('Entradas:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        y += 6;
        entradasDia.forEach((e: Entrada) => {
          const texto = `${e.nome} - ${e.servico || '-'} - R$ ${(parseFloat(e.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${e.formaPagamento})`;
          const linhas = doc.splitTextToSize(texto, 175);
          linhas.forEach((linha: string) => {
            doc.text(linha, 20, y);
            y += 5;
          });
        });
        y += 2;
      }
      
      if (saidasDia.length > 0) {
        doc.setTextColor(244, 67, 54);
        doc.setFont('helvetica', 'bold');
        doc.text('Saídas:', 15, y);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(0, 0, 0);
        y += 6;
        saidasDia.forEach((s: Entrada) => {
          const texto = `${s.nome} - R$ ${(parseFloat(s.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} (${s.formaPagamento})`;
          const linhas = doc.splitTextToSize(texto, 175);
          linhas.forEach((linha: string) => {
            doc.text(linha, 20, y);
            y += 5;
          });
        });
        y += 2;
      }
      
      y += 5;
      if (y > 270) { doc.addPage(); y = 20; }
    });

    // Resumo final
    if (y > 240) { doc.addPage(); y = 20; }
    y += 10;
    doc.setFillColor(33, 150, 243);
    doc.rect(10, y - 5, 190, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    
    const totalEntradas = entradas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const totalSaidas = saidas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const saldo = totalEntradas - totalSaidas;
    
    doc.text(`Total Entradas: R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y + 5);
    doc.text(`Total Saídas: R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y + 12);
    doc.text(`Saldo: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y + 19);

    doc.save('extrato-caixa.pdf');
  };

  // Função para exportar dados como PDF
  const exportarDados = () => {
    const doc = new jsPDF();
    let y = 20;
    
    // Cabeçalho
    doc.setFillColor(76, 175, 80);
    doc.rect(0, 0, 210, 30, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('Relatório de Entradas e Saídas', 105, 18, { align: 'center' });
    
    // Data de geração
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    const dataAtual = new Date().toLocaleDateString('pt-BR');
    doc.text(`Gerado em: ${dataAtual}`, 105, 25, { align: 'center' });
    
    doc.setTextColor(0, 0, 0);
    y = 45;

    // Seção Entradas
    doc.setFillColor(76, 175, 80);
    doc.rect(10, y - 7, 190, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Entradas', 15, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 10;
    
    if (entradas.length === 0) {
      doc.setTextColor(100, 100, 100);
      doc.text('Nenhuma entrada cadastrada.', 20, y);
      doc.setTextColor(0, 0, 0);
      y += 10;
    } else {
      entradas.forEach((e, idx) => {
        // Linha zebrada
        if (idx % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(10, y - 4, 190, 8, 'F');
        }
        
        const texto = `${formatarDataBR(e.data)} | ${e.nome} | ${e.servico} | R$ ${(parseFloat(e.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | ${e.formaPagamento}`;
        const linhas = doc.splitTextToSize(texto, 185);
        linhas.forEach((linha: string) => {
          doc.text(linha, 15, y);
          y += 5;
        });
        y += 3;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    y += 10;
    
    // Seção Saídas
    doc.setFillColor(244, 67, 54);
    doc.rect(10, y - 7, 190, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Saídas', 15, y);
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    y += 10;
    
    if (saidas.length === 0) {
      doc.setTextColor(100, 100, 100);
      doc.text('Nenhuma saída cadastrada.', 20, y);
      doc.setTextColor(0, 0, 0);
      y += 10;
    } else {
      saidas.forEach((s, idx) => {
        // Linha zebrada
        if (idx % 2 === 0) {
          doc.setFillColor(245, 245, 245);
          doc.rect(10, y - 4, 190, 8, 'F');
        }
        
        const texto = `${formatarDataBR(s.data)} | ${s.nome} | R$ ${(parseFloat(s.valor) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} | ${s.formaPagamento}`;
        const linhas = doc.splitTextToSize(texto, 185);
        linhas.forEach((linha: string) => {
          doc.text(linha, 15, y);
          y += 5;
        });
        y += 3;
        if (y > 270) { doc.addPage(); y = 20; }
      });
    }

    // Resumo/Totais
    if (y > 230) { doc.addPage(); y = 20; }
    y += 15;
    
    doc.setFillColor(33, 150, 243);
    doc.roundedRect(10, y - 7, 190, 35, 3, 3, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.text('Resumo Financeiro', 15, y);
    doc.setFontSize(11);
    y += 8;
    
    const totalEntradas = entradas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const totalSaidas = saidas.reduce((acc, item) => acc + (parseFloat(item.valor) || 0), 0);
    const saldo = totalEntradas - totalSaidas;
    
    doc.text(`Total de Entradas: R$ ${totalEntradas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y);
    y += 7;
    doc.text(`Total de Saídas: R$ ${totalSaidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y);
    y += 7;
    doc.setFontSize(13);
    doc.text(`Saldo Final: R$ ${saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 15, y);

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

  // Funções para calcular metas
  const calcularMetaDiaria = () => {
    const hoje = new Date().toISOString().split('T')[0];
    const entradaHoje = entradas
      .filter(e => e.data === hoje)
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    const saidaHoje = saidas
      .filter(e => e.data === hoje)
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    return entradaHoje - saidaHoje;
  };

  const calcularMetaSemanal = () => {
    const hoje = new Date();
    const primeiroDiaSemana = new Date(hoje);
    primeiroDiaSemana.setDate(hoje.getDate() - hoje.getDay());
    
    const primeiroDiaSemanaStr = primeiroDiaSemana.toISOString().split('T')[0];
    
    const entradaSemana = entradas
      .filter(e => e.data >= primeiroDiaSemanaStr)
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    const saidaSemana = saidas
      .filter(e => e.data >= primeiroDiaSemanaStr)
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    return entradaSemana - saidaSemana;
  };

  const calcularMetaMensal = () => {
    const hoje = new Date();
    const mesAtual = String(hoje.getMonth() + 1).padStart(2, '0');
    const anoAtual = hoje.getFullYear();
    
    const entradaMes = entradas
      .filter(e => e.data.startsWith(`${anoAtual}-${mesAtual}`))
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    const saidaMes = saidas
      .filter(e => e.data.startsWith(`${anoAtual}-${mesAtual}`))
      .reduce((acc, e) => acc + (parseFloat(e.valor) || 0), 0);
    return entradaMes - saidaMes;
  };

  const abrirModalAjusteMetas = () => {
    const overlay = document.createElement('div');
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.background = 'rgba(0, 0, 0, 0.5)';
    overlay.style.display = 'flex';
    overlay.style.alignItems = 'center';
    overlay.style.justifyContent = 'center';
    overlay.style.zIndex = '1000';

    const modal = document.createElement('div');
    modal.style.background = '#fff';
    modal.style.padding = '32px';
    modal.style.borderRadius = '8px';
    modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.15)';
    modal.style.width = '400px';
    modal.style.maxHeight = '80vh';
    modal.style.overflowY = 'auto';

    const titulo = document.createElement('h2');
    titulo.textContent = 'Ajustar Metas';
    titulo.style.marginTop = '0';
    modal.appendChild(titulo);

    // Campo Meta Diária
    const labelDiaria = document.createElement('label');
    labelDiaria.textContent = 'Meta Diária (R$):';
    labelDiaria.style.display = 'block';
    labelDiaria.style.marginBottom = '8px';
    labelDiaria.style.fontWeight = 'bold';
    modal.appendChild(labelDiaria);

    const inputDiaria = document.createElement('input');
    inputDiaria.type = 'number';
    inputDiaria.placeholder = '0.00';
    inputDiaria.value = metasAjustadas.diaria.toString();
    inputDiaria.style.width = '100%';
    inputDiaria.style.padding = '8px';
    inputDiaria.style.marginBottom = '16px';
    inputDiaria.style.border = '1px solid #ccc';
    inputDiaria.style.borderRadius = '4px';
    inputDiaria.style.boxSizing = 'border-box';
    modal.appendChild(inputDiaria);

    // Campo Meta Semanal
    const labelSemanal = document.createElement('label');
    labelSemanal.textContent = 'Meta Semanal (R$):';
    labelSemanal.style.display = 'block';
    labelSemanal.style.marginBottom = '8px';
    labelSemanal.style.fontWeight = 'bold';
    modal.appendChild(labelSemanal);

    const inputSemanal = document.createElement('input');
    inputSemanal.type = 'number';
    inputSemanal.placeholder = '0.00';
    inputSemanal.value = metasAjustadas.semanal.toString();
    inputSemanal.style.width = '100%';
    inputSemanal.style.padding = '8px';
    inputSemanal.style.marginBottom = '16px';
    inputSemanal.style.border = '1px solid #ccc';
    inputSemanal.style.borderRadius = '4px';
    inputSemanal.style.boxSizing = 'border-box';
    modal.appendChild(inputSemanal);

    // Campo Meta Mensal
    const labelMensal = document.createElement('label');
    labelMensal.textContent = 'Meta Mensal (R$):';
    labelMensal.style.display = 'block';
    labelMensal.style.marginBottom = '8px';
    labelMensal.style.fontWeight = 'bold';
    modal.appendChild(labelMensal);

    const inputMensal = document.createElement('input');
    inputMensal.type = 'number';
    inputMensal.placeholder = '0.00';
    inputMensal.value = metasAjustadas.mensal.toString();
    inputMensal.style.width = '100%';
    inputMensal.style.padding = '8px';
    inputMensal.style.marginBottom = '24px';
    inputMensal.style.border = '1px solid #ccc';
    inputMensal.style.borderRadius = '4px';
    inputMensal.style.boxSizing = 'border-box';
    modal.appendChild(inputMensal);

    // Botões
    const btns = document.createElement('div');
    btns.style.display = 'flex';
    btns.style.gap = '12px';
    btns.style.justifyContent = 'flex-end';

    const btnSalvar = document.createElement('button');
    btnSalvar.textContent = 'Salvar';
    btnSalvar.style.padding = '12px 32px';
    btnSalvar.style.fontSize = '16px';
    btnSalvar.style.background = '#4caf50';
    btnSalvar.style.color = '#fff';
    btnSalvar.style.border = 'none';
    btnSalvar.style.borderRadius = '4px';
    btnSalvar.style.cursor = 'pointer';
    btnSalvar.onclick = () => {
      setMetasAjustadas({
        diaria: parseFloat(inputDiaria.value) || 0,
        semanal: parseFloat(inputSemanal.value) || 0,
        mensal: parseFloat(inputMensal.value) || 0
      });
      document.body.removeChild(overlay);
    };
    btns.appendChild(btnSalvar);

    const btnCancelar = document.createElement('button');
    btnCancelar.textContent = 'Cancelar';
    btnCancelar.style.padding = '12px 32px';
    btnCancelar.style.fontSize = '16px';
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
      <h1 style={{ textAlign: 'left', marginBottom: 32, fontSize: '2.5rem', fontWeight: 'bold' }}>Controle de Caixa</h1>
      
      {/* Cards de Metas */}
      <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 40, marginTop: 32 }}>
        {/* Card Meta Diária */}
        <div style={{ 
          background: '#e3f2fd', 
          border: '2px solid #2196F3', 
          borderRadius: 8, 
          padding: 20, 
          width: '280px', 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#2196F3', marginTop: 0 }}>Meta Diária</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#2196F3', margin: '10px 0' }}>
            R$ {calcularMetaDiaria().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {metasAjustadas.diaria > 0 && (
            <>
              <p style={{ fontSize: 14, color: '#666', margin: '5px 0 0 0' }}>
                Meta: R$ {metasAjustadas.diaria.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div style={{ width: '100%', background: '#ddd', borderRadius: 10, height: 20, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((calcularMetaDiaria() / metasAjustadas.diaria) * 100, 100)}%`, 
                  background: '#2196F3', 
                  height: '100%', 
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 12,
                  transition: 'width 0.3s ease'
                }}>
                  {Math.round((calcularMetaDiaria() / metasAjustadas.diaria) * 100)}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card Meta Semanal */}
        <div style={{ 
          background: '#f3e5f5', 
          border: '2px solid #9c27b0', 
          borderRadius: 8, 
          padding: 20, 
          width: '280px', 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#9c27b0', marginTop: 0 }}>Meta Semanal</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#9c27b0', margin: '10px 0' }}>
            R$ {calcularMetaSemanal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {metasAjustadas.semanal > 0 && (
            <>
              <p style={{ fontSize: 14, color: '#666', margin: '5px 0 0 0' }}>
                Meta: R$ {metasAjustadas.semanal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div style={{ width: '100%', background: '#ddd', borderRadius: 10, height: 20, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((calcularMetaSemanal() / metasAjustadas.semanal) * 100, 100)}%`, 
                  background: '#9c27b0', 
                  height: '100%', 
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 12,
                  transition: 'width 0.3s ease'
                }}>
                  {Math.round((calcularMetaSemanal() / metasAjustadas.semanal) * 100)}%
                </div>
              </div>
            </>
          )}
        </div>

        {/* Card Meta Mensal */}
        <div style={{ 
          background: '#e8f5e9', 
          border: '2px solid #4caf50', 
          borderRadius: 8, 
          padding: 20, 
          width: '280px', 
          textAlign: 'center',
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }}>
          <h3 style={{ color: '#4caf50', marginTop: 0 }}>Meta Mensal</h3>
          <p style={{ fontSize: 28, fontWeight: 'bold', color: '#4caf50', margin: '10px 0' }}>
            R$ {calcularMetaMensal().toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
          {metasAjustadas.mensal > 0 && (
            <>
              <p style={{ fontSize: 14, color: '#666', margin: '5px 0 0 0' }}>
                Meta: R$ {metasAjustadas.mensal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </p>
              <div style={{ width: '100%', background: '#ddd', borderRadius: 10, height: 20, marginTop: 10, overflow: 'hidden' }}>
                <div style={{ 
                  width: `${Math.min((calcularMetaMensal() / metasAjustadas.mensal) * 100, 100)}%`, 
                  background: '#4caf50', 
                  height: '100%', 
                  borderRadius: 10,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#fff',
                  fontWeight: 'bold',
                  fontSize: 12,
                  transition: 'width 0.3s ease'
                }}>
                  {Math.round((calcularMetaMensal() / metasAjustadas.mensal) * 100)}%
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Botões de Ação */}
      <div style={{ 
        background: '#fff', 
        border: '2px solid #ddd', 
        borderRadius: 8, 
        padding: 24, 
        marginBottom: 24,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginTop: 0, marginBottom: 8, fontSize: '1.5rem', fontWeight: 'bold' }}>Movimentações</h2>
        <p style={{ marginTop: 0, marginBottom: 20, color: '#666', fontSize: '1rem' }}>Registre suas entradas e saídas de caixa.</p>
        <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap' }}>
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
        <button
          style={{ padding: '12px 32px', fontSize: 18, background: '#2196F3', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}
          onClick={abrirModalAjusteMetas}
        >
          Ajustar Metas
        </button>
        </div>
      </div>

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
