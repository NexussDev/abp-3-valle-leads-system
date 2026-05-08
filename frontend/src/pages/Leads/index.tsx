import { useEffect, useState } from 'react';
import { useKanbanBoard } from './hooks/useKanbanBoard';
import { fetchLeads } from '../../services/leadsApi';
import { apiLeadsToColumns } from './data/leadsAdapter';
import { Lead, KanbanCol } from './types';

// MOCK
const MOCK_DATA: KanbanCol[] = [
  {
    id: 'novo_lead',
    title: 'Novo Lead',
    totalValue: 0,
    headerColor: '#c53030',
    leads: [],
  },
];

// CARD
function LeadCard({ lead }: { lead: Lead }) {
  return (
    <div style={{ background: '#fff', padding: 10, borderRadius: 8, marginBottom: 8 }}>
      <strong>{lead.name}</strong>
      <p>{lead.car}</p>

      {/* BOTÃO DA SUA TASK 👇 */}
      <button onClick={() => alert(`Interesse em ${lead.car}`)}>
        Demonstrar Interesse
      </button>
    </div>
  );
}

// COLUMN
function KanbanColumn({ col }: { col: KanbanCol }) {
  return (
    <div style={{ width: 250 }}>
      <h3>{col.title}</h3>
      {col.leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}

// PAGE
export default function LeadsPage() {
  const { columns, setColumns } = useKanbanBoard<KanbanCol>(MOCK_DATA);

  useEffect(() => {
    fetchLeads()
      .then((data) => setColumns(apiLeadsToColumns(data, MOCK_DATA)))
      .catch(() => {});
  }, [setColumns]);

  return (
    <div style={{ display: 'flex', gap: 16 }}>
      {columns.map((col) => (
        <KanbanColumn key={col.id} col={col} />
      ))}
    </div>
  );
}