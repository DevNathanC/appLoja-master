import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';

const tipos = [
  { value: 'barra', label: 'Barra' }, // Substituído "Conserto" por "Barra"
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'confeccao', label: 'Confecção' },
  { value: 'aumento', label: 'Aumento de Tamanho' },
  { value: 'diminuicao', label: 'Diminuição de Tamanho' },
  { value: 'ziper', label: 'Troca de Zíper' },
  { value: 'reforco', label: 'Reforço de Costura' }
];

// Função para formatar a data no padrão brasileiro
const formatarDataBR = (data: string) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};

// Base64 da imagem do logo (exemplo)
const logoBase64 = "data:image/jpeg;base64,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";

type Peca = {
  nome: string;
  servico: string;
  descricao: string;
  quantidade: number;
};

export default function App() {
  const [servico, setServico] = useState({
    cliente: '',
    telefone: '', // Novo campo
    dataRecebimento: '',
    dataEntrega: '',
  });

  const [pecas, setPecas] = useState<Peca[]>([]);
  const [pecaAtual, setPecaAtual] = useState<Peca>({
    nome: '',
    servico: '',
    descricao: '',
    quantidade: 1,
  });

  // Função para lidar com a mudança dos inputs de serviço
  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setServico(prev => ({ ...prev, [name]: value }));
  };

  // Função para lidar com a mudança dos campos das peças
  const handlePecaChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setPecaAtual(prev => ({
      ...prev,
      [name]: name === 'quantidade' ? Number(value) : value,
    }));
  };

  // Adicionar peça ao array de peças
  const adicionarPeca = () => {
    if (
      pecaAtual.nome.trim() === '' ||
      pecaAtual.servico.trim() === '' ||
      pecaAtual.descricao.trim() === '' ||
      pecaAtual.quantidade <= 0
    ) {
      alert('Preencha todos os campos da peça corretamente.');
      return;
    }
    setPecas(prev => [...prev, pecaAtual]);
    setPecaAtual({ nome: '', servico: '', descricao: '', quantidade: 1 });
  };

  // Gerar PDF
  // Atualizando apenas o trecho da função gerarPDF() para melhorar o estilo e separação:

  // Atualizando para gerar duas vias do PDF na mesma página

  // Atualizando para gerar duas vias do PDF na mesma página

  // Atualizando para gerar duas vias do PDF na mesma página com logo à esquerda e valor total à direita

  // Atualizando para gerar duas vias do PDF na mesma página com logo à esquerda e valor total à direita

  const gerarPDF = () => {
  const doc = new jsPDF();
  const pdfWidth = doc.internal.pageSize.getWidth();
  const pdfHeight = doc.internal.pageSize.getHeight();

  const renderFicha = (offsetY: number) => {
    let y = offsetY;

    // Logo na extremidade esquerda
    const imgProps = doc.getImageProperties(logoBase64);
    const logoWidth = 40;
    const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
    const logoX = 10;
    doc.addImage(logoBase64, 'JPEG', logoX, y, logoWidth, logoHeight);

    // Informações do Cliente ao lado da logo
    const infoX = logoX + logoWidth + 5;
    const infoYStart = y;

    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Nome: ${servico.cliente}`, infoX, infoYStart + 5);
    doc.text(`Telefone: ${servico.telefone}`, infoX, infoYStart + 11); // Adicionado telefone
    doc.text(`Recebimento: ${formatarDataBR(servico.dataRecebimento)}`, infoX, infoYStart + 17);
    doc.text(`Entrega: ${formatarDataBR(servico.dataEntrega)}`, infoX, infoYStart + 23);

    // Valor Total na extremidade direita
    doc.setFontSize(12);
    doc.setFont('bold');
    doc.text('Valor Total: R$ ________', pdfWidth - 60, infoYStart + 5);

    y += logoHeight + 10;
    doc.setFontSize(18);
    doc.text('Ficha de Serviços de Costura', pdfWidth / 2, y, { align: 'center' });
    y += 10;

    // Caixa dos serviços
    const caixaX = 10;
    const caixaY = y;
    const caixaLargura = pdfWidth - 20;
    let alturaServicos = 0;

    doc.setFontSize(14);
    doc.setTextColor(40);
    doc.text('Serviços Solicitados', caixaX + 2, caixaY + 6);
    y = caixaY + 14;

    if (pecas.length === 0) {
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text('Nenhuma peça adicionada.', caixaX + 2, y);
      alturaServicos = y - caixaY + 4;
    } else {
      doc.setFontSize(11);
      doc.setTextColor(0);
      pecas.forEach((peca, index) => {
        const servicoLabel = tipos.find(t => t.value === peca.servico)?.label || peca.servico;
        const texto = `Peça ${index + 1} | Nome: ${peca.nome} | S: ${servicoLabel} | D: ${peca.descricao} | Q: ${peca.quantidade}`;
        doc.text(texto, caixaX + 2, y);
        y += 7;
      });
      alturaServicos = y - caixaY + 2;
    }

    doc.setDrawColor(100);
    doc.setLineWidth(0.3);
    doc.roundedRect(caixaX, caixaY, caixaLargura, alturaServicos, 3, 3);

    // Campo para assinatura do cliente
    const assinaturaY = caixaY + alturaServicos + 20;
    doc.setFontSize(12);
    doc.setTextColor(80);
    doc.text('Assinatura do Cliente:', caixaX + 2, assinaturaY);
    doc.setLineWidth(0.5);
    doc.line(caixaX + 50, assinaturaY + 1, caixaX + 150, assinaturaY + 1);
  };

  // Gera as duas vias na mesma página
  renderFicha(10); // Primeira via no topo
  renderFicha(pdfHeight / 2 + 5); // Segunda via na metade inferior

  // Linha separadora
  doc.setLineWidth(0.2);
  doc.setDrawColor(150);
  doc.line(10, pdfHeight / 2, pdfWidth - 10, pdfHeight / 2);

  doc.save(`Ficha_${servico.cliente || 'servico'}.pdf`);
};


  const imprimirPDF = () => {
    const doc = new jsPDF();
    const pdfWidth = doc.internal.pageSize.getWidth();
    const pdfHeight = doc.internal.pageSize.getHeight();

    const renderFicha = (offsetY: number) => {
      let y = offsetY;

      const imgProps = doc.getImageProperties(logoBase64);
      const logoWidth = 40;
      const logoHeight = (imgProps.height * logoWidth) / imgProps.width;
      const logoX = 10;
      doc.addImage(logoBase64, 'JPEG', logoX, y, logoWidth, logoHeight);

      const infoX = logoX + logoWidth + 5;
      const infoYStart = y;
      doc.setFontSize(12);
      doc.setTextColor(0);
      doc.text(`Nome: ${servico.cliente}`, infoX, infoYStart + 5);
      doc.text(`Telefone: ${servico.telefone}`, infoX, infoYStart + 11); // Adicionado telefone
      doc.text(`Recebimento: ${formatarDataBR(servico.dataRecebimento)}`, infoX, infoYStart + 17);
      doc.text(`Entrega: ${formatarDataBR(servico.dataEntrega)}`, infoX, infoYStart + 23);
      doc.setFont('bold');
      doc.text('Valor Total: R$ ________', pdfWidth - 60, infoYStart + 5);

      y += logoHeight + 10;
      doc.setFontSize(18);
      doc.text('Ficha de Serviços de Costura', pdfWidth / 2, y, { align: 'center' });
      y += 10;

      doc.setFontSize(14);
      doc.setTextColor(40);
      doc.text('Serviços Solicitados', 10, y);
      doc.setLineWidth(0.5);
      doc.line(10, y + 1, pdfWidth - 10, y + 1);
      y += 8;

      if (pecas.length === 0) {
        doc.setFontSize(12);
        doc.text('Nenhuma peça adicionada.', 10, y);
      } else {
        pecas.forEach((peca, index) => {
          doc.setFontSize(12);
          doc.setTextColor(0);
          doc.setFont('bold');
          doc.text(`Peça ${index + 1}:`, 10, y);
          y += 6;
          doc.setFont('normal');
          doc.text(`Nome: ${peca.nome}`, 14, y);
          y += 6;
          const servicoLabel = tipos.find(t => t.value === peca.servico)?.label || peca.servico;
          doc.text(`S: ${servicoLabel}`, 14, y);
          doc.text(`D: ${peca.descricao}`, 80, y);
          doc.text(`Q: ${peca.quantidade}`, 160, y);
          y += 8;
        });
      }
    };

    renderFicha(10);
    renderFicha(pdfHeight / 2 + 5);
    doc.setLineWidth(0.2);
    doc.setDrawColor(150);
    doc.line(10, pdfHeight / 2, pdfWidth - 10, pdfHeight / 2);

    // Imprimir: abre em uma nova aba com modo de impressão
    const blob = doc.output('blob');
    const url = URL.createObjectURL(blob);
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.src = url;
    document.body.appendChild(iframe);
    iframe.onload = () => {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
      URL.revokeObjectURL(url);
    };
  };


  const limparFormulario = () => {
    setServico({
      cliente: '',
      telefone: '',
      dataRecebimento: '',
      dataEntrega: '',
    });
    setPecaAtual({
      nome: '',
      servico: '',
      descricao: '',
      quantidade: 1,
    });
    setPecas([]);
  };

  return (
    <div className="App">
      <h1>Ficha de Serviços de Costura</h1>

      <fieldset style={{ marginBottom: 20 }}>
        <legend>Informações do Serviço</legend>

        <label>
          Nome do Cliente:<br />
          <input
            type="text"
            name="cliente"
            value={servico.cliente}
            onChange={handleServicoChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Telefone:<br />
          <input
            type="tel"
            name="telefone"
            value={servico.telefone}
            onChange={handleServicoChange}
            required
            placeholder="(99) 99999-9999"
          />
        </label>
        <br /><br />

        <label>
          Data de Recebimento:<br />
          <input
            type="date"
            name="dataRecebimento"
            value={servico.dataRecebimento}
            onChange={handleServicoChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Data de Entrega:<br />
          <input
            type="date"
            name="dataEntrega"
            value={servico.dataEntrega}
            onChange={handleServicoChange}
            required
          />
        </label>
      </fieldset>

      <fieldset style={{ marginBottom: 20 }}>
        <legend>Adicionar Peça</legend>

        <label>
          Nome da Peça:<br />
          <input
            type="text"
            name="nome"
            value={pecaAtual.nome}
            onChange={handlePecaChange}
            required
          />
        </label>
        <br /><br />

        <label>
          Serviço:<br />
          <select
            name="servico"
            value={pecaAtual.servico}
            onChange={handlePecaChange}
            required
          >
            <option value="">Selecione</option>
            {tipos.map(tipo => (
              <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
            ))}
          </select>
        </label>
        <br /><br />

        <label>
          Descrição:<br />
          <textarea
            name="descricao"
            value={pecaAtual.descricao}
            onChange={handlePecaChange}
            rows={3}
            required
          />
        </label>
        <br /><br />

        <label>
          Quantidade:<br />
          <input
            type="number"
            name="quantidade"
            value={pecaAtual.quantidade}
            onChange={handlePecaChange}
            min={1}
            required
          />
        </label>
        <br /><br />

        <button type="button" onClick={adicionarPeca}>Adicionar Peça</button>
      </fieldset>

      <fieldset style={{ marginBottom: 20 }}>
        <legend>Peças adicionadas</legend>
        {pecas.length === 0 ? (
          <p>Nenhuma peça adicionada.</p>
        ) : (
          <ul>
            {pecas.map((peca, index) => (
              <li key={index}>
                <strong>{peca.nome}</strong> - {tipos.find(t => t.value === peca.servico)?.label || peca.servico} - {peca.descricao} (Qtd: {peca.quantidade})
              </li>
            ))}
          </ul>
        )}
      </fieldset>

      <button type="button" onClick={gerarPDF} style={{ padding: '10px 20px', fontSize: 16 }}>
        Gerar PDF
      </button>
      <button
        type="button"
        onClick={limparFormulario}
        style={{ padding: '10px 20px', fontSize: 16, marginLeft: 10, backgroundColor: '#f44336', color: '#fff' }}
      >
        Limpar Formulário
      </button>
      <button
        type="button"
        onClick={imprimirPDF}
        style={{ padding: '10px 20px', fontSize: 16, marginLeft: 10, backgroundColor: '#4caf50', color: '#fff' }}
      >
        Imprimir PDF
      </button>
    </div>
  );
}
