import { useEffect, useState } from 'react';
import { listLogs, type SystemLogEntry } from '../../services/logs';
import './Logs.css';

const PAGE_SIZE = 25;

const ACTION_LABEL: Record<string, string> = {
  CREATE:  'Criou',
  UPDATE:  'Atualizou',
  DELETE:  'Excluiu',
  APPROVE: 'Aprovou',
  REJECT:  'Rejeitou',
  SOLD:    'Marcou como vendido',
  LOGIN:   'Login',
};

const ENTITY_LABEL: Record<string, string> = {
  VEHICLE_LISTING: 'Publicação',
  Lead:    'Lead',
  User:    'Usuário',
  Client:  'Cliente',
};

export default function Logs() {
  const role = (localStorage.getItem('@LeadsCar:role') ?? '').toUpperCase();
  const canViewLogs = role === 'ADMIN' || role === 'GERENTE_GERAL' || role === 'GERENTE';
  const isRestricted = role === 'GERENTE'; // vê só a própria loja

  const [logs, setLogs] = useState<SystemLogEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [filterAction, setFilterAction] = useState('');
  const [filterEntity, setFilterEntity] = useState('');
  const [filterEntityId, setFilterEntityId] = useState('');
  const [filterStart, setFilterStart] = useState('');
  const [filterEnd, setFilterEnd] = useState('');

  useEffect(() => {
    if (!canViewLogs) return;
    setLoading(true);
    setError(null);
    listLogs({
      action:    filterAction || undefined,
      entity:    filterEntity || undefined,
      entityId:  filterEntityId || undefined,
      startDate: filterStart ? new Date(filterStart).toISOString() : undefined,
      endDate:   filterEnd ? new Date(filterEnd).toISOString() : undefined,
      limit:     PAGE_SIZE,
      offset:    page * PAGE_SIZE,
    })
      .then(res => {
        setLogs(res.logs);
        setTotal(res.total);
      })
      .catch(() => setError('Não foi possível carregar os logs.'))
      .finally(() => setLoading(false));
  }, [canViewLogs, page, filterAction, filterEntity, filterEntityId, filterStart, filterEnd]);

  if (!canViewLogs) {
    return (
      <div className="logs-page">
        <div className="logs-denied">
          <h1>Acesso negado</h1>
          <p>Você não tem permissão para visualizar os logs do sistema.</p>
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  function resetPage<T>(setter: (v: T) => void) {
    return (v: T) => {
      setter(v);
      setPage(0);
    };
  }

  return (
    <div className="logs-page">
      <header className="logs-header">
        <div>
          <h1 className="logs-title">Logs do sistema</h1>
          <p className="logs-subtitle">
            {isRestricted
              ? 'Auditoria das ações realizadas pelos usuários da sua loja.'
              : 'Auditoria de todas as ações realizadas pelos usuários.'}
          </p>
        </div>
      </header>

      <div className="logs-filters">
        <label>
          <span>Ação</span>
          <select value={filterAction} onChange={e => resetPage(setFilterAction)(e.target.value)}>
            <option value="">Todas</option>
            <option value="CREATE">Criou</option>
            <option value="UPDATE">Atualizou</option>
            <option value="DELETE">Excluiu</option>
            <option value="APPROVE">Aprovou</option>
            <option value="REJECT">Rejeitou</option>
            <option value="SOLD">Vendido</option>
            <option value="LOGIN">Login</option>
          </select>
        </label>
        <label>
          <span>Entidade</span>
          <select value={filterEntity} onChange={e => resetPage(setFilterEntity)(e.target.value)}>
            <option value="">Todas</option>
            <option value="VEHICLE_LISTING">Publicação</option>
            <option value="Lead">Lead</option>
            <option value="User">Usuário</option>
            <option value="Client">Cliente</option>
          </select>
        </label>
        <label>
          <span>ID da entidade</span>
          <input
            type="text"
            placeholder="UUID"
            value={filterEntityId}
            onChange={e => resetPage(setFilterEntityId)(e.target.value)}
          />
        </label>
        <label>
          <span>De</span>
          <input type="date" value={filterStart} onChange={e => resetPage(setFilterStart)(e.target.value)} />
        </label>
        <label>
          <span>Até</span>
          <input type="date" value={filterEnd} onChange={e => resetPage(setFilterEnd)(e.target.value)} />
        </label>
      </div>

      {loading ? (
        <div className="logs-empty">Carregando…</div>
      ) : error ? (
        <div className="logs-empty">{error}</div>
      ) : logs.length === 0 ? (
        <div className="logs-empty">Nenhum log encontrado para os filtros aplicados.</div>
      ) : (
        <>
          <div className="logs-table">
            <div className="logs-table__head">
              <div>Data/Hora</div>
              <div>Usuário</div>
              <div>Ação</div>
              <div>Entidade</div>
              <div>ID</div>
            </div>
            {logs.map(l => (
              <div key={l.id} className="logs-row">
                <div className="logs-cell logs-cell--time">
                  {new Date(l.createdAt).toLocaleString('pt-BR')}
                </div>
                <div className="logs-cell">
                  <strong>{l.user?.name ?? '—'}</strong>
                  <small>{l.user?.role ?? '—'}</small>
                </div>
                <div className="logs-cell">
                  <span className={`logs-tag logs-tag--${l.action.toLowerCase()}`}>
                    {ACTION_LABEL[l.action] ?? l.action}
                  </span>
                </div>
                <div className="logs-cell">{ENTITY_LABEL[l.entity] ?? l.entity}</div>
                <div className="logs-cell logs-cell--mono">{l.entityId ?? '—'}</div>
              </div>
            ))}
          </div>

          <div className="logs-pagination">
            <button disabled={page === 0} onClick={() => setPage(p => p - 1)}>← Anterior</button>
            <span>Página {page + 1} de {totalPages} · {total} registros</span>
            <button disabled={page + 1 >= totalPages} onClick={() => setPage(p => p + 1)}>Próxima →</button>
          </div>
        </>
      )}
    </div>
  );
}