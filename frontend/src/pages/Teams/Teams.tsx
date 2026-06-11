import { useEffect, useState, CSSProperties } from 'react';
import {
  fetchTeams,
  createTeam,
  updateTeam,
  deleteTeam,
  fetchUsers,
  updateUserTeam,
  Team,
  User,
} from '../../services/teamsApi';

export default function Teams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [teamName, setTeamName] = useState('');
  const [editingTeam, setEditingTeam] = useState<Team | null>(null);
  const [loading, setLoading] = useState(true);
  const [erro, setErro] = useState('');

  async function loadData() {
    setLoading(true);
    setErro('');

    try {
      const [teamsData, usersData] = await Promise.all([
        fetchTeams(),
        fetchUsers(),
      ]);

      setTeams(teamsData);
      setUsers(usersData);
    } catch {
      setErro('Erro ao carregar equipes.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function handleSaveTeam() {
    if (!teamName.trim()) {
      setErro('Informe o nome da equipe.');
      return;
    }

    try {
      if (editingTeam) {
        await updateTeam(editingTeam.id, teamName);
      } else {
        await createTeam(teamName);
      }

      setTeamName('');
      setEditingTeam(null);
      await loadData();
    } catch {
      setErro('Erro ao salvar equipe.');
    }
  }

  async function handleDeleteTeam(team: Team) {
    const confirmDelete = window.confirm(`Deseja excluir a equipe "${team.name}"?`);

    if (!confirmDelete) return;

    try {
      await deleteTeam(team.id);
      if (selectedTeamId === team.id) setSelectedTeamId('');
      await loadData();
    } catch {
      setErro('Não foi possível excluir a equipe. Verifique se ela possui usuários ou leads vinculados.');
    }
  }

  async function handleUserTeamChange(userId: string, teamId: string) {
    try {
      await updateUserTeam(userId, teamId || null);
      await loadData();
    } catch {
      setErro('Erro ao atualizar equipe do usuário.');
    }
  }

  const selectedTeam = teams.find(team => team.id === selectedTeamId);
  const filteredUsers = selectedTeamId
    ? users.filter(user => user.teamId === selectedTeamId)
    : users;

  if (loading) {
    return <div style={centerStyle}>Carregando equipes...</div>;
  }

  return (
    <div style={pageStyle}>
      <div style={headerStyle}>
        <div>
          <h1 style={titleStyle}>Gerenciamento de Equipes</h1>
          <p style={subtitleStyle}>Crie, edite, exclua equipes e associe usuários.</p>
        </div>
      </div>

      {erro && <div style={errorStyle}>{erro}</div>}

      <div style={gridStyle}>
        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>Equipes</h2>

          <div style={formRowStyle}>
            <input
              style={inputStyle}
              placeholder="Nome da equipe"
              value={teamName}
              onChange={e => setTeamName(e.target.value)}
            />

            <button style={primaryButtonStyle} onClick={handleSaveTeam}>
              {editingTeam ? 'Salvar' : 'Criar'}
            </button>

            {editingTeam && (
              <button
                style={secondaryButtonStyle}
                onClick={() => {
                  setEditingTeam(null);
                  setTeamName('');
                }}
              >
                Cancelar
              </button>
            )}
          </div>

          <div style={listStyle}>
            {teams.map(team => (
              <div
                key={team.id}
                style={{
                  ...teamItemStyle,
                  borderColor: selectedTeamId === team.id ? '#3b82f6' : '#e2e8f0',
                  background: selectedTeamId === team.id ? '#eff6ff' : '#fff',
                }}
                onClick={() => setSelectedTeamId(team.id)}
              >
                <div>
                  <strong style={{ color: '#1e293b' }}>{team.name}</strong>
                  <p style={mutedStyle}>
                    {team._count?.users ?? 0} usuário(s) · {team._count?.leads ?? 0} lead(s)
                  </p>
                </div>

                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    style={smallButtonStyle}
                    onClick={e => {
                      e.stopPropagation();
                      setEditingTeam(team);
                      setTeamName(team.name);
                    }}
                  >
                    Editar
                  </button>

                  <button
                    style={dangerButtonStyle}
                    onClick={e => {
                      e.stopPropagation();
                      handleDeleteTeam(team);
                    }}
                  >
                    Excluir
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={cardStyle}>
          <h2 style={sectionTitleStyle}>
            {selectedTeam ? `Usuários da equipe: ${selectedTeam.name}` : 'Usuários'}
          </h2>

          <div style={listStyle}>
            {filteredUsers.map(user => (
              <div key={user.id} style={userItemStyle}>
                <div>
                  <strong style={{ color: '#1e293b' }}>{user.name}</strong>
                  <p style={mutedStyle}>{user.email} · {user.role}</p>
                </div>

                <select
                  style={selectStyle}
                  value={user.teamId ?? ''}
                  onChange={e => handleUserTeamChange(user.id, e.target.value)}
                >
                  <option value="">Sem equipe</option>
                  {teams.map(team => (
                    <option key={team.id} value={team.id}>
                      {team.name}
                    </option>
                  ))}
                </select>
              </div>
            ))}

            {filteredUsers.length === 0 && (
              <p style={{ ...mutedStyle, textAlign: 'center', padding: 24 }}>
                Nenhum usuário encontrado.
              </p>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}

const pageStyle: CSSProperties = {
  padding: 24,
  background: '#f8fafc',
  minHeight: '100%',
};

const headerStyle: CSSProperties = {
  marginBottom: 20,
};

const titleStyle: CSSProperties = {
  margin: 0,
  fontSize: 24,
  fontWeight: 800,
  color: '#0f172a',
};

const subtitleStyle: CSSProperties = {
  margin: '6px 0 0',
  color: '#64748b',
  fontSize: 14,
};

const gridStyle: CSSProperties = {
  display: 'grid',
  gridTemplateColumns: '1fr 1.2fr',
  gap: 20,
};

const cardStyle: CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  padding: 20,
  border: '1px solid #e2e8f0',
  boxShadow: '0 4px 12px rgba(15, 23, 42, 0.04)',
};

const sectionTitleStyle: CSSProperties = {
  margin: '0 0 16px',
  fontSize: 18,
  fontWeight: 800,
  color: '#1e293b',
};

const formRowStyle: CSSProperties = {
  display: 'flex',
  gap: 10,
  marginBottom: 16,
};

const inputStyle: CSSProperties = {
  flex: 1,
  padding: '10px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  outline: 'none',
  fontSize: 14,
};

const primaryButtonStyle: CSSProperties = {
  border: 'none',
  background: '#3b82f6',
  color: '#fff',
  padding: '10px 14px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

const secondaryButtonStyle: CSSProperties = {
  border: '1px solid #cbd5e1',
  background: '#fff',
  color: '#475569',
  padding: '10px 14px',
  borderRadius: 10,
  fontWeight: 700,
  cursor: 'pointer',
};

const smallButtonStyle: CSSProperties = {
  border: 'none',
  background: '#f1f5f9',
  color: '#475569',
  padding: '7px 10px',
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
};

const dangerButtonStyle: CSSProperties = {
  border: 'none',
  background: '#fee2e2',
  color: '#dc2626',
  padding: '7px 10px',
  borderRadius: 8,
  fontWeight: 700,
  cursor: 'pointer',
};

const listStyle: CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 10,
};

const teamItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 14,
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  cursor: 'pointer',
};

const userItemStyle: CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 14,
  borderRadius: 12,
  border: '1px solid #e2e8f0',
  background: '#fff',
  gap: 12,
};

const selectStyle: CSSProperties = {
  padding: '9px 12px',
  borderRadius: 10,
  border: '1px solid #cbd5e1',
  outline: 'none',
  minWidth: 170,
};

const mutedStyle: CSSProperties = {
  margin: '4px 0 0',
  color: '#64748b',
  fontSize: 12,
};

const errorStyle: CSSProperties = {
  background: '#fee2e2',
  color: '#b91c1c',
  borderRadius: 10,
  padding: 12,
  marginBottom: 16,
  fontSize: 14,
  fontWeight: 600,
};

const centerStyle: CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  height: 240,
  color: '#64748b',
};