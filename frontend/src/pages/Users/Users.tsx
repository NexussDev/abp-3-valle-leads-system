import { useEffect, useState, CSSProperties } from 'react';
import { client } from '../../services/leadsApi';

// ─── TIPOS ────────────────────────────────────────────────────────────────────
interface Team {
  id: string;
  name: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  teamId: string | null;
  storeId: string | null;
  team?: { id: string; name: string } | null;
}

interface UserForm {
  name: string;
  email: string;
  password: string;
  role: string;
  teamId: string;
}

const EMPTY_FORM: UserForm = {
  name: '',
  email: '',
  password: '',
  role: 'ATENDENTE',
  teamId: '',
};

// ─── MAPEAMENTO DE PAPÉIS ─────────────────────────────────────────────────────
const ROLES = [
  { value: 'ATENDENTE',     label: 'Atendente' },
  { value: 'LIDER_EQUIPE',  label: 'Líder de Equipe' },
  { value: 'GERENTE',       label: 'Gerente' },
  { value: 'GERENTE_GERAL', label: 'Gerente Geral' },
  { value: 'ADMIN',         label: 'Admin' },
];

const ROLE_COLORS: Record<string, { bg: string; color: string }> = {
  ADMIN:         { bg: '#fdecea', color: '#c0392b' },
  GERENTE_GERAL: { bg: '#fef3c7', color: '#d97706' },
  GERENTE:       { bg: '#ede9fe', color: '#7c3aed' },
  LIDER_EQUIPE:  { bg: '#dbeafe', color: '#1d4ed8' },
  ATENDENTE:     { bg: '#dcfce7', color: '#16a34a' },
};

function roleBadge(role: string) {
  const label = ROLES.find(r => r.value === role)?.label ?? role;
  const colors = ROLE_COLORS[role] ?? { bg: '#f1f5f9', color: '#475569' };
  return (
    <span style={{ ...badgeStyle, backgroundColor: colors.bg, color: colors.color }}>
      {label}
    </span>
  );
}

// ─── ÍCONES ───────────────────────────────────────────────────────────────────
const IconPlus = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M12 5v14M5 12h14" />
  </svg>
);
const IconEdit = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const IconTrash = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
    <path d="M10 11v6M14 11v6" />
    <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
  </svg>
);
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
    <path d="M18 6L6 18M6 6l12 12" />
  </svg>
);

// ─── COMPONENTE MODAL ─────────────────────────────────────────────────────────
function Modal({
  title, onClose, onSubmit, form, setForm, teams, editingId, loading, error,
}: {
  title: string;
  onClose: () => void;
  onSubmit: () => void;
  form: UserForm;
  setForm: (f: UserForm) => void;
  teams: Team[];
  editingId: string | null;
  loading: boolean;
  error: string;
}) {
  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <div style={modalHeaderStyle}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>{title}</h2>
          <button style={iconBtnStyle} onClick={onClose}><IconClose /></button>
        </div>

        {error && <div style={errorBannerStyle}>{error}</div>}

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <Field label="Nome completo">
            <input
              style={inputStyle}
              placeholder="Ex: João Silva"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
          </Field>

          <Field label="E-mail">
            <input
              style={inputStyle}
              type="email"
              placeholder="colaborador@1000valle.com"
              value={form.email}
              onChange={e => setForm({ ...form, email: e.target.value })}
            />
          </Field>

          <Field label={editingId ? 'Nova senha (deixe em branco para manter)' : 'Senha'}>
            <input
              style={inputStyle}
              type="password"
              placeholder={editingId ? 'Digite apenas se quiser alterar' : 'Mínimo 6 caracteres'}
              value={form.password}
              onChange={e => setForm({ ...form, password: e.target.value })}
            />
          </Field>

          <Field label="Papel">
            <select
              style={inputStyle}
              value={form.role}
              onChange={e => setForm({ ...form, role: e.target.value })}
            >
              {ROLES.map(r => (
                <option key={r.value} value={r.value}>{r.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Equipe (opcional)">
            <select
              style={inputStyle}
              value={form.teamId}
              onChange={e => setForm({ ...form, teamId: e.target.value })}
            >
              <option value="">— Sem equipe —</option>
              {teams.map(t => (
                <option key={t.id} value={t.id}>{t.name}</option>
              ))}
            </select>
          </Field>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 24 }}>
          <button style={cancelBtnStyle} onClick={onClose}>Cancelar</button>
          <button style={saveBtnStyle} onClick={onSubmit} disabled={loading}>
            {loading ? 'Salvando…' : editingId ? 'Salvar alterações' : 'Criar usuário'}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// ─── COMPONENTE PRINCIPAL ─────────────────────────────────────────────────────
export default function Users() {
  const [users,      setUsers]      = useState<User[]>([]);
  const [teams,      setTeams]      = useState<Team[]>([]);
  const [loading,    setLoading]    = useState(true);
  const [search,     setSearch]     = useState('');
  const [filterRole, setFilterRole] = useState('');

  const [modalOpen,  setModalOpen]  = useState(false);
  const [editingId,  setEditingId]  = useState<string | null>(null);
  const [form,       setForm]       = useState<UserForm>(EMPTY_FORM);
  const [saving,     setSaving]     = useState(false);
  const [formError,  setFormError]  = useState('');

  const [deleteId,   setDeleteId]   = useState<string | null>(null);
  const [deleting,   setDeleting]   = useState(false);

  const loadUsers = async () => {
    try {
      const { data } = await client.get<User[]>('/users');
      setUsers(data);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const loadTeams = async () => {
    try {
      const { data } = await client.get<Team[]>('/teams');
      setTeams(data);
    } catch {
      setTeams([]);
    }
  };

  useEffect(() => {
    loadUsers();
    loadTeams();
  }, []);

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) ||
                        u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = filterRole ? u.role === filterRole : true;
    return matchSearch && matchRole;
  });

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (user: User) => {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: '',
      role: user.role,
      teamId: user.teamId ?? '',
    });
    setFormError('');
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setEditingId(null);
    setFormError('');
  };

  const handleSubmit = async () => {
    if (!form.name.trim())  { setFormError('Nome é obrigatório.'); return; }
    if (!form.email.trim()) { setFormError('E-mail é obrigatório.'); return; }
    if (!editingId && !form.password.trim()) { setFormError('Senha é obrigatória.'); return; }

    setSaving(true);
    setFormError('');
    try {
      const payload: Record<string, string> = {
        name:  form.name,
        email: form.email,
        role:  form.role,
        ...(form.teamId && { teamId: form.teamId }),
        ...(form.password.trim() && { password: form.password }),
      };

      if (editingId) {
        await client.put(`/users/${editingId}`, payload);
      } else {
        await client.post('/users', payload);
      }

      closeModal();
      await loadUsers();
    } catch (err: any) {
      setFormError(err?.response?.data?.message ?? 'Erro ao salvar usuário.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    setDeleting(true);
    try {
      await client.delete(`/users/${deleteId}`);
      setDeleteId(null);
      await loadUsers();
    } catch {
      // silencioso
    } finally {
      setDeleting(false);
    }
  };

  const totalByRole = ROLES.map(r => ({
    ...r,
    count: users.filter(u => u.role === r.value).length,
  })).filter(r => r.count > 0);

  return (
    <div style={pageStyle}>

      <section style={heroStyle}>
        <div>
          <span style={heroBadgeStyle}>Administração</span>
          <h1 style={heroTitleStyle}>Gerenciamento de Usuários</h1>
          <p style={heroSubtitleStyle}>Gerencie contas, papéis e equipes de todos os colaboradores.</p>
        </div>
        <img src="/logo.png" alt="1000 Valle" style={heroLogoStyle} />
      </section>

      <div style={statsGridStyle}>
        <div style={statCardStyle}>
          <div style={{ ...statTopLineStyle, backgroundColor: '#c0392b' }} />
          <span style={statLabelStyle}>Total de Usuários</span>
          <strong style={statValueStyle}>{users.length}</strong>
        </div>
        {totalByRole.map(r => {
          const colors = ROLE_COLORS[r.value] ?? { bg: '#f1f5f9', color: '#475569' };
          return (
            <div key={r.value} style={statCardStyle}>
              <div style={{ ...statTopLineStyle, backgroundColor: colors.color }} />
              <span style={statLabelStyle}>{r.label}</span>
              <strong style={{ ...statValueStyle, color: colors.color }}>{r.count}</strong>
            </div>
          );
        })}
      </div>

      <div style={toolbarStyle}>
        <div style={{ display: 'flex', gap: 10, flex: 1 }}>
          <input
            style={searchStyle}
            placeholder="Buscar por nome ou e-mail…"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select
            style={{ ...searchStyle, maxWidth: 200 }}
            value={filterRole}
            onChange={e => setFilterRole(e.target.value)}
          >
            <option value="">Todos os papéis</option>
            {ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
          </select>
        </div>
        <button style={createBtnStyle} onClick={openCreate}>
          <IconPlus />
          Novo usuário
        </button>
      </div>

      <section style={tableCardStyle}>
        {loading ? (
          <div style={emptyStyle}>Carregando usuários…</div>
        ) : filtered.length === 0 ? (
          <div style={emptyStyle}>Nenhum usuário encontrado.</div>
        ) : (
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Colaborador</th>
                <th style={thStyle}>E-mail</th>
                <th style={thStyle}>Papel</th>
                <th style={thStyle}>Equipe</th>
                <th style={{ ...thStyle, textAlign: 'right' }}>Ações</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(user => (
                <tr key={user.id} style={trStyle}>
                  <td style={tdStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={avatarStyle}>
                        {user.name.charAt(0).toUpperCase()}
                      </div>
                      <span style={{ fontWeight: 600, color: '#1a1a2e', fontSize: 14 }}>{user.name}</span>
                    </div>
                  </td>
                  <td style={{ ...tdStyle, color: '#6b6b80', fontSize: 13 }}>{user.email}</td>
                  <td style={tdStyle}>{roleBadge(user.role)}</td>
                  <td style={{ ...tdStyle, color: '#6b6b80', fontSize: 13 }}>
                    {user.team?.name ?? <span style={{ color: '#cbd5e1' }}>—</span>}
                  </td>
                  <td style={{ ...tdStyle, textAlign: 'right' }}>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 6 }}>
                      <button style={editBtnStyle} onClick={() => openEdit(user)} title="Editar">
                        <IconEdit />
                      </button>
                      <button style={deleteBtnStyle} onClick={() => setDeleteId(user.id)} title="Excluir">
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      {modalOpen && (
        <Modal
          title={editingId ? 'Editar usuário' : 'Novo usuário'}
          onClose={closeModal}
          onSubmit={handleSubmit}
          form={form}
          setForm={setForm}
          teams={teams}
          editingId={editingId}
          loading={saving}
          error={formError}
        />
      )}

      {deleteId && (
        <div style={overlayStyle} onClick={() => setDeleteId(null)}>
          <div style={{ ...modalStyle, maxWidth: 420 }} onClick={e => e.stopPropagation()}>
            <div style={modalHeaderStyle}>
              <h2 style={{ margin: 0, fontSize: 18, fontWeight: 800, color: '#1a1a2e' }}>Excluir usuário</h2>
              <button style={iconBtnStyle} onClick={() => setDeleteId(null)}><IconClose /></button>
            </div>
            <p style={{ color: '#6b6b80', fontSize: 14, margin: '8px 0 24px' }}>
              Esta ação é permanente e não pode ser desfeita. Deseja continuar?
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button style={cancelBtnStyle} onClick={() => setDeleteId(null)}>Cancelar</button>
              <button
                style={{ ...saveBtnStyle, backgroundColor: '#c0392b' }}
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? 'Excluindo…' : 'Sim, excluir'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── ESTILOS ──────────────────────────────────────────────────────────────────
const pageStyle: CSSProperties = {
  minHeight: '100%',
  padding: '28px',
  background: '#f4f4f7',
  fontFamily: 'DM Sans, sans-serif',
};
const heroStyle: CSSProperties = {
  background: 'linear-gradient(135deg, #1a0a08 0%, #2c0f0a 48%, #0f0f14 100%)',
  borderRadius: 24,
  padding: '32px',
  marginBottom: 24,
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  color: '#fff',
  boxShadow: '0 24px 64px rgba(0,0,0,.12)',
};
const heroBadgeStyle: CSSProperties = {
  display: 'inline-block',
  background: '#fdecea',
  color: '#c0392b',
  fontSize: 11,
  fontWeight: 800,
  letterSpacing: '.08em',
  textTransform: 'uppercase',
  padding: '6px 12px',
  borderRadius: 999,
  marginBottom: 14,
};
const heroTitleStyle: CSSProperties = {
  margin: 0,
  fontSize: 34,
  fontWeight: 800,
  letterSpacing: '-.03em',
};
const heroSubtitleStyle: CSSProperties = {
  margin: '8px 0 0',
  color: 'rgba(255,255,255,.62)',
  fontSize: 15,
};
const heroLogoStyle: CSSProperties = {
  width: 140,
  filter: 'brightness(0) invert(1)',
};
const statsGridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
  gap: 16,
  marginBottom: 24,
};
const statCardStyle: CSSProperties = {
  position: 'relative',
  overflow: 'hidden',
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 18,
  padding: 20,
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
};
const statTopLineStyle: CSSProperties = {
  position: 'absolute',
  top: 0, left: 0, right: 0,
  height: 4,
};
const statLabelStyle: CSSProperties = {
  display: 'block',
  fontSize: 12,
  color: '#6b6b80',
  fontWeight: 700,
  marginBottom: 6,
};
const statValueStyle: CSSProperties = {
  display: 'block',
  fontSize: 30,
  color: '#1a1a2e',
  fontWeight: 800,
};
const toolbarStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  gap: 12,
  marginBottom: 18,
};
const searchStyle: CSSProperties = {
  flex: 1,
  height: 42,
  padding: '0 14px',
  border: '1px solid #e4e4ea',
  borderRadius: 12,
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  background: '#fff',
  outline: 'none',
  color: '#1a1a2e',
};
const createBtnStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 7,
  height: 42,
  padding: '0 20px',
  background: '#c0392b',
  color: '#fff',
  border: 'none',
  borderRadius: 12,
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'DM Sans, sans-serif',
  cursor: 'pointer',
  whiteSpace: 'nowrap',
};
const tableCardStyle: CSSProperties = {
  background: '#fff',
  border: '1px solid #e4e4ea',
  borderRadius: 20,
  overflow: 'hidden',
  boxShadow: '0 12px 30px rgba(15,15,20,.06)',
};
const tableStyle: CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
};
const thStyle: CSSProperties = {
  padding: '14px 18px',
  textAlign: 'left',
  fontSize: 12,
  fontWeight: 700,
  color: '#6b6b80',
  textTransform: 'uppercase',
  letterSpacing: '.06em',
  borderBottom: '1px solid #f1f1f5',
  background: '#fafafa',
};
const trStyle: CSSProperties = {
  borderBottom: '1px solid #f1f1f5',
};
const tdStyle: CSSProperties = {
  padding: '14px 18px',
  verticalAlign: 'middle',
};
const avatarStyle: CSSProperties = {
  width: 34,
  height: 34,
  borderRadius: '50%',
  background: 'linear-gradient(135deg, #c0392b, #e74c3c)',
  color: '#fff',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 800,
  fontSize: 14,
  flexShrink: 0,
};
const badgeStyle: CSSProperties = {
  display: 'inline-block',
  padding: '4px 10px',
  borderRadius: 999,
  fontSize: 12,
  fontWeight: 700,
};
const editBtnStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9',
  border: '1px solid #e4e4ea',
  borderRadius: 8,
  cursor: 'pointer',
  color: '#475569',
};
const deleteBtnStyle: CSSProperties = {
  ...editBtnStyle,
  background: '#fdecea',
  border: '1px solid #fca5a5',
  color: '#c0392b',
};
const emptyStyle: CSSProperties = {
  color: '#6b6b80',
  fontSize: 14,
  padding: 32,
  textAlign: 'center',
};
const overlayStyle: CSSProperties = {
  position: 'fixed',
  inset: 0,
  background: 'rgba(0,0,0,0.45)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 9999,
  padding: 20,
};
const modalStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 20,
  padding: 28,
  width: '100%',
  maxWidth: 520,
  boxShadow: '0 32px 80px rgba(0,0,0,.2)',
};
const modalHeaderStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginBottom: 20,
};
const iconBtnStyle: CSSProperties = {
  width: 32,
  height: 32,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  background: '#f1f5f9',
  border: 'none',
  borderRadius: 8,
  cursor: 'pointer',
  color: '#475569',
};
const labelStyle: CSSProperties = {
  display: 'block',
  fontSize: 13,
  fontWeight: 700,
  color: '#374151',
  marginBottom: 6,
};
const inputStyle: CSSProperties = {
  width: '100%',
  height: 42,
  padding: '0 14px',
  border: '1px solid #e4e4ea',
  borderRadius: 10,
  fontSize: 14,
  fontFamily: 'DM Sans, sans-serif',
  color: '#1a1a2e',
  background: '#fafafa',
  outline: 'none',
  boxSizing: 'border-box',
};
const errorBannerStyle: CSSProperties = {
  background: '#fdecea',
  color: '#c0392b',
  borderRadius: 10,
  padding: '10px 14px',
  fontSize: 13,
  fontWeight: 600,
  marginBottom: 16,
};
const cancelBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 18px',
  background: '#f1f5f9',
  border: '1px solid #e4e4ea',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 600,
  fontFamily: 'DM Sans, sans-serif',
  cursor: 'pointer',
  color: '#475569',
};
const saveBtnStyle: CSSProperties = {
  height: 40,
  padding: '0 20px',
  background: '#1a1a2e',
  color: '#fff',
  border: 'none',
  borderRadius: 10,
  fontSize: 14,
  fontWeight: 700,
  fontFamily: 'DM Sans, sans-serif',
  cursor: 'pointer',
};