// Função para formatar data para padrão brasileiro
const formatarDataBR = (data: string) => {
  if (!data) return '';
  const [ano, mes, dia] = data.split('-');
  return `${dia}/${mes}/${ano}`;
};
import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import './App.css';
import Sidebar from './Sidebar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Caixa from './Caixa';

const tipos = [
  { value: 'barra', label: 'Barra' },
  { value: 'ajuste', label: 'Ajuste' },
  { value: 'confeccao', label: 'Confecção' },
  { value: 'aumento', label: 'Aumento de Tamanho' },
  { value: 'diminuicao', label: 'Diminuição de Tamanho' },
  { value: 'ziper', label: 'Troca de Zíper' },
  { value: 'reforco', label: 'Reforço de Costura' }
];

type Servico = {
  cliente: string;
  telefone: string;
  dataRecebimento: string;
  dataEntrega: string;
};
type Peca = {
  nome: string;
  servico: string;
  descricao: string;
  quantidade: number;
};

const App: React.FC = () => {
  const [servico, setServico] = useState<Servico>({
    cliente: '',
    telefone: '',
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

  const handleServicoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setServico({ ...servico, [e.target.name]: e.target.value });
  };
  const handlePecaChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setPecaAtual({ ...pecaAtual, [e.target.name]: e.target.value });
  };
  const adicionarPeca = () => {
    if (!pecaAtual.nome || !pecaAtual.servico) return;
    setPecas([...pecas, { ...pecaAtual, quantidade: Number(pecaAtual.quantidade) }]);
    setPecaAtual({ nome: '', servico: '', descricao: '', quantidade: 1 });
  };
  const limparFormulario = () => {
    setServico({ cliente: '', telefone: '', dataRecebimento: '', dataEntrega: '' });
    setPecas([]);
    setPecaAtual({ nome: '', servico: '', descricao: '', quantidade: 1 });
  };
  const imprimirPDF = () => {
    // Gerar o PDF com as informações do formulário e peças
    const doc = new jsPDF();

    // Adicionar logo no topo esquerdo
    const addLogoAndContinue = (logoBase64?: string) => {
      if (logoBase64) {
        doc.addImage(logoBase64, 'JPEG', 10, 8, 28, 18);
      }
      doc.setFontSize(16);
      doc.text('Ficha de Serviços de Costura', 105, 15, { align: 'center' });
      doc.setFontSize(12);

      // ...existing code...
      // Função auxiliar para desenhar uma via (sem título)
      const desenharVia = (doc: any, viaY: number) => {
        doc.setFontSize(12);
        // Informações do cliente (ajustado para ficar abaixo da imagem)
        const baseY = viaY < 20 ? 30 : viaY + 10; // Se for a primeira via, começa abaixo da imagem
  doc.text(`Cliente: ${servico.cliente}`, 15, baseY);
  doc.text(`Telefone: ${servico.telefone}`, 15, baseY + 8);
  doc.text(`Recebimento: ${formatarDataBR(servico.dataRecebimento)}`, 15, baseY + 16);
  doc.text(`Entrega: ${formatarDataBR(servico.dataEntrega)}`, 15, baseY + 24);
        // Caixa de informações das peças (borda arredondada)
        const pecasBoxY = baseY + 32;
        let pecasBoxHeight = Math.max(12, pecas.length * 10 + 10);
        doc.roundedRect(10, pecasBoxY, 190, pecasBoxHeight, 6, 6);
        doc.text('Peças:', 15, pecasBoxY + 10);
        let y = pecasBoxY + 18;
        pecas.forEach((peca, idx) => {
          doc.text(
            `${idx + 1}. ${peca.nome} - ${tipos.find(t => t.value === peca.servico)?.label || peca.servico} - ${peca.descricao} (Qtd: ${peca.quantidade})`,
            15,
            y
          );
          y += 10;
        });
        // Campo para assinatura
        const assinaturaY = pecasBoxY + pecasBoxHeight + 16;
        doc.text('Assinatura:', 15, assinaturaY);
        doc.line(40, assinaturaY, 110, assinaturaY);
      };


      // Calcular altura total de UMA via
      const baseY = 30;
      const pecasBoxY = baseY + 32;
      const pecasBoxHeight = Math.max(12, pecas.length * 10 + 10);
      const assinaturaY = pecasBoxY + pecasBoxHeight + 16;
      const viaHeight = assinaturaY + 20; // margem extra

      // Se as duas vias couberem na página (A4: altura ~297mm, mas jsPDF padrão é 210mm)
      // Função para desenhar logo e título
      const desenharLogoETitulo = (doc: any, logoBase64?: string) => {
        if (logoBase64) {
          doc.addImage(logoBase64, 'JPEG', 10, 8, 28, 18);
        }
        doc.setFontSize(16);
        doc.text('Ficha de Serviços de Costura', 105, 15, { align: 'center' });
        doc.setFontSize(12);
        // Valor Total no canto superior direito (preenchimento manual)
  doc.text('Valor Total: R$', 150, 15, { align: 'left' });
      };

      if (viaHeight * 2 <= 280) {
        desenharLogoETitulo(doc, logoBase64);
        desenharVia(doc, 15); // primeira via
        // Linha divisória
        doc.setDrawColor(150);
        doc.setLineWidth(0.5);
        doc.line(10, viaHeight, 200, viaHeight);
        doc.setFontSize(10);
        doc.text('---------------------------------------------- Recorte ----------------------------------------------', 105, viaHeight + 5, { align: 'center' });
        desenharLogoETitulo(doc, logoBase64);
        desenharVia(doc, viaHeight + 15); // segunda via
      } else {
        desenharLogoETitulo(doc, logoBase64);
        desenharVia(doc, 15); // primeira via
        doc.addPage();
        desenharLogoETitulo(doc, logoBase64);
        desenharVia(doc, 15); // segunda via
      }

      // Aciona a caixa de diálogo de impressão
      doc.autoPrint();
      // Abre o PDF em uma nova janela para imprimir
      window.open(doc.output('bloburl'), '_blank');
    };

    // Carregar logo.jpg como base64
  fetch('/logo.jpg')
      .then(response => response.blob())
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = function () {
          addLogoAndContinue(reader.result as string);
        };
        reader.readAsDataURL(blob);
      })
      .catch(() => {
        // Se falhar, gera PDF sem logo
        addLogoAndContinue();
      });
    // (Removido duplicidade da função desenharVia)

  // (Removido chamadas duplicadas de desenharVia e geração de PDF fora do addLogoAndContinue)
  };

  return (
    <Router>
      <div style={{ display: 'flex' }}>
        <Sidebar />
        <div style={{ marginLeft: 200, flex: 1 }}>
          <Routes>
            <Route path="/" element={
              <div className="App">
                <h1 style={{ textAlign: 'center', marginBottom: 32, color: '#222' }}>Ficha de Serviços de Costura</h1>
                <div style={{ border: '2px solid #ccc', borderRadius: 8, padding: 20, marginBottom: 24, background: '#fafbfc' }}>
                  <h2 style={{ marginTop: 0, color: '#007bff', fontSize: '1.1rem' }}>Informações do Cliente</h2>
                  <label>
                    Nome do Cliente:
                    <input
                      type="text"
                      name="cliente"
                      value={servico.cliente}
                      onChange={handleServicoChange}
                      placeholder="Digite o nome"
                    />
                  </label>
                  <br />
                  <label>
                    Telefone:
                    <input
                      type="tel"
                      name="telefone"
                      value={servico.telefone}
                      onChange={handleServicoChange}
                      placeholder="(99) 99999-9999"
                    />
                  </label>
                  <br />
                  <label>
                    Data de Recebimento:
                    <input
                      type="date"
                      name="dataRecebimento"
                      value={servico.dataRecebimento}
                      onChange={handleServicoChange}
                    />
                  </label>
                  <br />
                  <label>
                    Data de Entrega:
                    <input
                      type="date"
                      name="dataEntrega"
                      value={servico.dataEntrega}
                      onChange={handleServicoChange}
                    />
                  </label>
                </div>
                <div style={{ border: '2px solid #ccc', borderRadius: 8, padding: 20, marginBottom: 24, background: '#fafbfc' }}>
                  <h2 style={{ marginTop: 0, color: '#007bff', fontSize: '1.1rem' }}>Informações do Serviço</h2>
                  <label>
                    Nome da Peça:
                    <input
                      type="text"
                      name="nome"
                      value={pecaAtual.nome}
                      onChange={handlePecaChange}
                      placeholder="Ex: Calça, Camisa..."
                    />
                  </label>
                  <br />
                  <label>
                    Serviço:
                    <select
                      name="servico"
                      value={pecaAtual.servico}
                      onChange={handlePecaChange}
                    >
                      <option value="">Selecione</option>
                      {tipos.map(tipo => (
                        <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                      ))}
                    </select>
                  </label>
                  <br />
                  <label>
                    Descrição:
                    <textarea
                      name="descricao"
                      value={pecaAtual.descricao}
                      onChange={handlePecaChange}
                      rows={2}
                      placeholder="Detalhes do serviço"
                    />
                  </label>
                  <br />
                  <label>
                    Quantidade:
                    <input
                      type="number"
                      name="quantidade"
                      value={pecaAtual.quantidade}
                      min={1}
                      onChange={handlePecaChange}
                    />
                  </label>
                </div>
                <button
                  type="button"
                  onClick={adicionarPeca}
                  style={{ padding: '10px 20px', fontSize: 16, marginRight: 10 }}
                >
                  Adicionar Peça
                </button>
                <button
                  type="button"
                  onClick={limparFormulario}
                  style={{ padding: '10px 20px', fontSize: 16, marginRight: 10, backgroundColor: '#f44336', color: '#fff' }}
                >
                  Limpar Formulário
                </button>
                <button
                  type="button"
                  onClick={imprimirPDF}
                  style={{ padding: '10px 20px', fontSize: 16, backgroundColor: '#4caf50', color: '#fff' }}
                >
                  Imprimir PDF
                </button>
                <hr style={{ margin: '32px 0' }} />
                <h3>Peças adicionadas</h3>
                {pecas.length === 0 ? (
                  <p>Nenhuma peça adicionada.</p>
                ) : (
                  <ul>
                    {pecas.map((peca, idx) => (
                      <li key={idx}>
                        <strong>{peca.nome}</strong> - {tipos.find(t => t.value === peca.servico)?.label || peca.servico} - {peca.descricao} (Qtd: {peca.quantidade})
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            } />
            <Route path="/caixa" element={<Caixa />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};



export default App;
