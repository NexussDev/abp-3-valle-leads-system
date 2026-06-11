import React from 'react';
import { HistoryLog } from '../../types/Lead';

interface LeadHistoryProps {
  history?: HistoryLog[];
}

export default function LeadHistory({ history = [] }: LeadHistoryProps) {
  if (history.length === 0) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: '#94a3b8', fontSize: '13px' }}>
        ℹ️ Nenhuma alteração registrada para esta negociação ainda.
      </div>
    );
  }

  return (
    <div style={{ fontFamily: 'sans-serif', padding: '16px', maxWidth: '500px' }}>
      <h4 style={{ margin: '0 0 20px 0', color: '#1e293b', fontSize: '15px', fontWeight: 600 }}>
        Histórico da Negociação
      </h4>

      {/* Container da Linha do Tempo */}
      <div style={{ position: 'relative', paddingLeft: '20px', borderLeft: '2px solid #e2e8f0' }}>
        {history.map((log) => (
          <div key={log.id} style={{ position: 'relative', marginBottom: '24px' }}>
            
            {/* Indicador visual na linha vertical */}
            <span style={{
              position: 'absolute',
              left: '-27px',
              top: '2px',
              width: '12px',
              height: '12px',
              borderRadius: '50%',
              backgroundColor: log.field === 'create' ? '#22c55e' : '#3b82f6',
              border: '2px solid #fff',
              boxShadow: '0 0 0 2px #e2e8f0'
            }} />

            {/* Conteúdo do Log */}
            <div style={{ fontSize: '13px', color: '#334155' }}>
              <span style={{ fontWeight: 600, color: '#1e293b' }}>
                {log.responsibleName}
              </span>{' '}
              {log.field === 'create' && <>criou a negociação do carro <strong>{log.newValue}</strong>.</>}
              {log.field === 'stage' && <>moveu o lead de <s>{log.oldValue}</s> para <strong>{log.newValue}</strong>.</>}
              {log.field === 'status' && <>alterou o status para <span style={{ textTransform: 'uppercase', fontWeight: 700 }}>{log.newValue}</span>.</>}
            </div>

            {/* Data/Hora do Evento */}
            <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '4px' }}>
              📅 {log.updatedAt}
            </div>

          </div>
        ))}
      </div>
    </div>
  );
}