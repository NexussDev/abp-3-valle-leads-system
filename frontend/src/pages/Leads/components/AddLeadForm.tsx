import React, { useState, CSSProperties } from 'react';

// Definindo a interface baseada no que você já usa no LeadCard
interface NewLead {
  nome: string;
  contato: string;
  origem: string;
  status: string;
  carro: string;
  preco: string;
}

export default function AddLeadForm({ onAddLead }: { onAddLead: (lead: NewLead) => void }) {
  const [formData, setFormData] = useState<NewLead>({
    nome: '',
    contato: '',
    origem: 'Instagram',
    status: 'Novo',
    carro: '',
    preco: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validação básica
    if (!formData.nome || !formData.contato) {
      alert("Nome e Contato são obrigatórios!");
      return;
    }

    onAddLead(formData); // Envia para o componente pai
    
    // Reseta o formulário
    setFormData({ nome: '', contato: '', origem: 'Instagram', status: 'Novo', carro: '', preco: '' });
  };

  return (
    <div style={containerStyle}>
      <h3 style={{ marginBottom: 20, color: '#1e293b' }}>Novo Lead</h3>
      <form onSubmit={handleSubmit} style={formStyle}>
        <input 
          placeholder="Nome do Cliente" 
          style={inputStyle}
          value={formData.nome}
          onChange={e => setFormData({...formData, nome: e.target.value})}
        />
        <input 
          placeholder="Email ou Telefone" 
          style={inputStyle}
          value={formData.contato}
          onChange={e => setFormData({...formData, contato: e.target.value})}
        />
        <input 
          placeholder="Modelo do Carro de Interesse" 
          style={inputStyle}
          value={formData.carro}
          onChange={e => setFormData({...formData, carro: e.target.value})}
        />
        
        <div style={{ display: 'flex', gap: 10 }}>
          <select 
            style={{ ...inputStyle, flex: 1 }}
            value={formData.origem}
            onChange={e => setFormData({...formData, origem: e.target.value})}
          >
            <option value="Instagram">Instagram</option>
            <option value="Facebook">Facebook</option>
            <option value="WhatsApp">WhatsApp</option>
            <option value="Site">Site</option>
          </select>

          <select 
            style={{ ...inputStyle, flex: 1 }}
            value={formData.status}
            onChange={e => setFormData({...formData, status: e.target.value})}
          >
            <option value="Novo">Novo</option>
            <option value="Em Contato">Em Contato</option>
            <option value="Negociação">Negociação</option>
          </select>
        </div>

        <button type="submit" style={buttonStyle}>Adicionar Lead</button>
      </form>
    </div>
  );
}

// Estilos seguindo o seu padrão visual
const containerStyle: CSSProperties = {
  background: '#fff',
  padding: 24,
  borderRadius: 16,
  border: '1px solid #e2e8f0',
  marginBottom: 30,
  boxShadow: '0 4px 6px -1px rgba(0,0,0,0.05)'
};

const formStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 12
};

const inputStyle: CSSProperties = {
  padding: '12px 16px',
  borderRadius: 8,
  border: '1px solid #cbd5e1',
  fontSize: 14,
  outline: 'none'
};

const buttonStyle: CSSProperties = {
  backgroundColor: '#3b82f6',
  color: '#fff',
  padding: 12,
  borderRadius: 8,
  border: 'none',
  fontWeight: 600,
  cursor: 'pointer',
  marginTop: 8
};