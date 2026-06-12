import { CSSProperties, useEffect, useMemo, useState } from 'react';
import {
  Team,
  User,
  fetchUsers,
  updateTeam,
  updateUserTeam,
} from '../../services/teamsApi';

interface EditTeamModalProps {
  team: Team;
  allUsers: User[];
  onClose: () => void;
  onSaved: () => void;
}

export default function EditTeamModal({ team, allUsers, onClose, onSaved }: EditTeamModalProps) {
  const [name, setName] = useState(team.name);
  const [users, setUsers] = useState<User[]>(allUsers);
  const [search, setSearch] = useState('');
  const [pendingChanges, setPendingChanges] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (allUsers.length === 0) {
      fetchUsers().then(setUsers).catch(() => setError('Não foi possível carregar usuários.'));
    }
  }, [allUsers.length]);

  const memberIds = useMemo(() => {
    const set = new Set<string>();
    users.forEach(u => {
      const currentlyMember = u.teamId === team.id;
      const pending = pendingChanges[u.id];
      const isMember = pending === undefined ? currentlyMember : pending;
      if (isMember) set.add(u.id);
    });
    return set;
  }, [users, pendingChanges, team.id]);

  const members = users.filter(u => memberIds.has(u.id));
  const nonMembers = users
    .filter(u => !memberIds.has(u.id))
    .filter(u => {
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    });

  function toggleMembership(userId: string, makeMember: boolean) {
    setPendingChanges(prev => ({ ...prev, [userId]: makeMember }));
  }

  async function handleSave() {
    setError('');
    setSaving(true);

    try {
      if (name.trim() && name !== team.name) {
        await updateTeam(team.id, name.trim());
      }

      const updates = Object.entries(pendingChanges).map(([userId, becomeMember]) => {
        const user = users.find(u => u.id === userId);
        if (!user) return null;
        const wasMember = user.teamId === team.id;
        if (wasMember === becomeMember) return null;
        return updateUserTeam(userId, becomeMember ? team.id : null);
      });

      await Promise.all(updates.filter(Boolean));

      onSaved();
      onClose();
    } catch {
      setError('Erro ao salvar alterações. Tente novamente.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={e => e.stopPropagation()}>
        <header style={headerStyle}>
          <div>
            <h2 style={titleStyle}>Editar equipe</h2>
            <p style={subtitleStyle}>Renomeie e gerencie os membros desta equipe.</p>
          </div>
          <button type="button" aria-label="Fechar" onClick={onClose} style={closeBtnStyle}>✕</button>
        </header>

        <div style={bodyStyle}>
          <label style={labelStyle}>
            <span style={labelTextStyle}>Nome da equipe</span>
            <input
              style={inputStyle}
              value={name}
              onChange={e => setName(e.target.value)}
              autoFocus
            />
          </label>

          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Membros</h3>
              <span style={countPillStyle}>{members.length}</span>
            </div>

            {members.length === 0 ? (
              <p style={emptyStyle}>Nenhum membro nesta equipe.</p>
            ) : (
              <ul style={listStyle}>
                {members.map(u => (
                  <li key={u.id} style={memberItemStyle}>
                    <div style={memberInfoStyle}>
                      <Avatar name={u.name} />
                      <div>
                        <div style={memberNameStyle}>{u.name}</div>
                        <div style={memberMetaStyle}>{u.email} · {u.role}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMembership(u.id, false)}
                      style={removeBtnStyle}
                    >
                      Remover
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>

          <section style={sectionStyle}>
            <div style={sectionHeaderStyle}>
              <h3 style={sectionTitleStyle}>Adicionar usuários</h3>
              <span style={countPillStyle}>{nonMembers.length}</span>
            </div>

            <input
              type="search"
              placeholder="Buscar por nome ou e-mail…"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{ ...inputStyle, marginBottom: 10 }}
            />

            {nonMembers.length === 0 ? (
              <p style={emptyStyle}>
                {search ? 'Nenhum usuário encontrado.' : 'Todos os usuários já fazem parte desta equipe.'}
              </p>
            ) : (
              <ul style={{ ...listStyle, maxHeight: 240, overflowY: 'auto' }}>
                {nonMembers.map(u => (
                  <li key={u.id} style={memberItemStyle}>
                    <div style={memberInfoStyle}>
                      <Avatar name={u.name} />
                      <div>
                        <div style={memberNameStyle}>{u.name}</div>
                        <div style={memberMetaStyle}>
                          {u.email} · {u.role}
                          {u.teamId && u.teamId !== team.id && <span style={otherTeamPillStyle}>em outra equipe</span>}
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => toggleMembership(u.id, true)}
                      style={addBtnStyle}
                    >
                      Adicionar
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        {error && <div style={errorStyle}>{error}</div>}

        <footer style={footerStyle}>
          <button type="button" onClick={onClose} style={secondaryButtonStyle}>Cancelar</button>
          <button type="button" onClick={handleSave} disabled={saving || !name.trim()} style={primaryButtonStyle}>
            {saving ? 'Salvando…' : 'Salvar alterações'}
          </button>
        </footer>
      </div>
    </div>
  );
}

function Avatar({ name }: { name: string }) {
  const palette = ['#2563eb', '#7c3aed', '#db2777', '#ea580c', '#059669', '#d97706', '#0891b2'];
  const color = palette[name.charCodeAt(0) % palette.length];
  const initials = name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div style={{ width: 36, height: 36, borderRadius: '50%', backgroundColor: color, color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 700, flexShrink: 0 }}>
      {initials}
    </div>
  );
}

const overlayStyle: CSSProperties = { position: 'fixed', inset: 0, background: 'rgba(15, 23, 42, 0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 };
const modalStyle: CSSProperties = { background: '#fff', borderRadius: 16, width: '100%', maxWidth: 620, maxHeight: '90vh', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)' };
const headerStyle: CSSProperties = { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', padding: '20px 24px 16px', borderBottom: '1px solid #f1f5f9' };
const titleStyle: CSSProperties = { margin: 0, fontSize: 18, fontWeight: 800, color: '#0f172a' };
const subtitleStyle: CSSProperties = { margin: '4px 0 0', fontSize: 13, color: '#64748b' };
const closeBtnStyle: CSSProperties = { border: 'none', background: 'transparent', fontSize: 18, cursor: 'pointer', color: '#64748b', padding: 6, borderRadius: 8, lineHeight: 1 };
const bodyStyle: CSSProperties = { padding: '20px 24px', overflowY: 'auto', flex: 1, display: 'flex', flexDirection: 'column', gap: 18 };
const labelStyle: CSSProperties = { display: 'block' };
const labelTextStyle: CSSProperties = { display: 'block', fontSize: 11, fontWeight: 800, color: '#475569', marginBottom: 6, textTransform: 'uppercase', letterSpacing: '0.05em' };
const inputStyle: CSSProperties = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1px solid #cbd5e1', fontSize: 14, color: '#0f172a', outline: 'none', boxSizing: 'border-box', background: '#f8fafc' };
const sectionStyle: CSSProperties = { display: 'flex', flexDirection: 'column' };
const sectionHeaderStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 };
const sectionTitleStyle: CSSProperties = { margin: 0, fontSize: 14, fontWeight: 800, color: '#0f172a' };
const countPillStyle: CSSProperties = { background: '#eff6ff', color: '#2563eb', borderRadius: 999, padding: '2px 10px', fontSize: 11, fontWeight: 800 };
const listStyle: CSSProperties = { listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 6 };
const memberItemStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, padding: '8px 10px', borderRadius: 10, border: '1px solid #e2e8f0', background: '#fff' };
const memberInfoStyle: CSSProperties = { display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 };
const memberNameStyle: CSSProperties = { fontSize: 14, fontWeight: 700, color: '#0f172a', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' };
const memberMetaStyle: CSSProperties = { fontSize: 12, color: '#64748b', display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' };
const otherTeamPillStyle: CSSProperties = { background: '#fef3c7', color: '#92400e', padding: '1px 8px', borderRadius: 999, fontSize: 10, fontWeight: 700 };
const removeBtnStyle: CSSProperties = { border: '1px solid #fecaca', background: '#fef2f2', color: '#b91c1c', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' };
const addBtnStyle: CSSProperties = { border: '1px solid #bbf7d0', background: '#f0fdf4', color: '#15803d', padding: '6px 12px', borderRadius: 8, fontSize: 12, fontWeight: 700, cursor: 'pointer' };
const emptyStyle: CSSProperties = { margin: 0, padding: '14px 12px', textAlign: 'center', color: '#64748b', fontSize: 13, background: '#f8fafc', borderRadius: 10, border: '1px dashed #e2e8f0' };
const errorStyle: CSSProperties = { margin: '0 24px', padding: '10px 12px', background: '#fef2f2', color: '#b91c1c', borderRadius: 10, fontSize: 13, fontWeight: 600 };
const footerStyle: CSSProperties = { display: 'flex', justifyContent: 'flex-end', gap: 10, padding: '16px 24px 20px', borderTop: '1px solid #f1f5f9' };
const primaryButtonStyle: CSSProperties = { border: 'none', background: '#2563eb', color: '#fff', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
const secondaryButtonStyle: CSSProperties = { border: '1px solid #cbd5e1', background: '#fff', color: '#475569', padding: '10px 18px', borderRadius: 10, fontWeight: 700, fontSize: 14, cursor: 'pointer' };
