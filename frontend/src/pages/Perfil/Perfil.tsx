import { useState, CSSProperties } from 'react';

const API = import.meta.env.VITE_API_URL ?? 'http://localhost:3000/api';

export default function Perfil() {
  const rawName = localStorage.getItem('@LeadsCar:userName') || '';
  const role = localStorage.getItem('@LeadsCar:role') || '';

  const [form, setForm] = useState({
    name: rawName,
    email: '',
    current_password: '',
    new_password: '',
    confirm_password: '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');

  const initial = rawName.charAt(0).toUpperCase();

  const ROLE_LABELS: Record<string, string> = {
    ADMIN:        'Administrador',
    GERENTE_GERAL:'Gerente Geral',
    GERENTE:      'Gerente',
    LIDER_EQUIPE: 'Líder de Equipe',
    ATENDENTE:    'Atendente',
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setError('');
    setSuccess('');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (form.new_password && form.new_password !== form.confirm_password) {
      setError('As senhas não coincidem.');
      return;
    }

    const token = localStorage.getItem('token');
    if (!token) { setError('Sessão expirada. Faça login novamente.'); return; }

    const body: Record<string, string> = {};
    if (form.name.trim())         body.name = form.name.trim();
    if (form.email.trim())        body.email = form.email.trim();
    if (form.new_password.trim()) {
      body.new_password = form.new_password;
      body.current_password = form.current_password;
    }

    if (Object.keys(body).length === 0) {
      setError('Nenhuma alteração para salvar.');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API}/users/me`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Erro ao salvar.');

      if (form.name.trim()) {
        localStorage.setItem('@LeadsCar:userName', form.name.trim().split(' ')[0]);
      }

      setSuccess('Perfil atualizado com sucesso!');
      setForm(f => ({ ...f, current_password: '', new_password: '', confirm_password: '' }));
    } catch (err: any) {
      setError(err.message || 'Erro ao atualizar perfil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={pageStyle}>
      <div style={maxWidth}>
        {/* Avatar + Info */}
        <div style={cardStyle}>
          <div style={avatarLarge}>{initial}</div>
          <div>
            <h2 style={nameStyle}>{rawName || 'Usuário'}</h2>
            <span style={roleBadge}>{ROLE_LABELS[role] || role}</span>
          </div>
        </div>

        {/* Formulário */}
        <form onSubmit={handleSave} style={formCard}>
          <h3 style={sectionTitle}>Dados do perfil</h3>

          <div style={fieldGrid}>
            <Field label="Nome de exibição" name="name" value={form.name} onChange={handleChange} placeholder="Seu nome" />
            <Field label="Novo e-mail" name="email" value={form.email} onChange={handleChange} placeholder="Deixe em branco para não alterar" type="email" />
          </div>

          <h3 style={{ ...sectionTitle, marginTop: 28 }}>Alterar senha</h3>

          <div style={fieldGrid}>
            <Field label="Senha atual" name="current_password" value={form.current_password} onChange={handleChange} placeholder="••••••••" type="password" />
            <Field label="Nova senha" name="new_password" value={form.new_password} onChange={handleChange} placeholder="••••••••" type="password" />
            <Field label="Confirmar nova senha" name="confirm_password" value={form.confirm_password} onChange={handleChange} placeholder="••••••••" type="password" />
          </div>

          {error   && <p style={errorMsg}>{error}</p>}
          {success && <p style={successMsg}>{success}</p>}

          <button type="submit" style={saveBtn} disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </form>
      </div>
    </div>
  );
}

function Field({ label, name, value, onChange, placeholder, type = 'text' }: {
  label: string; name: string; value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string; type?: string;
}) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        type={type}
        autoComplete="off"
        style={inputStyle}
      />
    </div>
  );
}

const pageStyle: CSSProperties = {
  flex: 1,
  overflowY: 'auto',
  padding: '32px 24px',
};

const maxWidth: CSSProperties = {
  maxWidth: 640,
  margin: '0 auto',
  display: 'flex',
  flexDirection: 'column',
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: '24px 28px',
  display: 'flex',
  alignItems: 'center',
  gap: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const avatarLarge: CSSProperties = {
  width: 64,
  height: 64,
  borderRadius: '50%',
  background: '#c0392b',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontSize: 26,
  fontWeight: 700,
  flexShrink: 0,
};

const nameStyle: CSSProperties = {
  margin: 0,
  fontSize: 20,
  fontWeight: 700,
  color: '#1e293b',
};

const roleBadge: CSSProperties = {
  display: 'inline-block',
  marginTop: 4,
  fontSize: 12,
  fontWeight: 600,
  color: '#c0392b',
  background: '#fef2f2',
  borderRadius: 20,
  padding: '2px 10px',
};

const formCard: CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: '28px',
  border: '1px solid #e2e8f0',
  boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
};

const sectionTitle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: 15,
  fontWeight: 700,
  color: '#1e293b',
};

const fieldGrid: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1fr',
  gap: '14px 20px',
};

const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  fontWeight: 600,
  color: '#64748b',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.5px',
};

const inputStyle: CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #e2e8f0',
  fontSize: 14,
  color: '#1e293b',
  outline: 'none',
  boxSizing: 'border-box',
  background: '#f8fafc',
};

const saveBtn: CSSProperties = {
  marginTop: 24,
  padding: '11px 28px',
  borderRadius: 10,
  border: 'none',
  background: '#c0392b',
  color: '#fff',
  fontSize: 14,
  fontWeight: 700,
  cursor: 'pointer',
};

const errorMsg: CSSProperties = { color: '#ef4444', fontSize: 13, marginTop: 12 };
const successMsg: CSSProperties = { color: '#10b981', fontSize: 13, marginTop: 12 };
