import React, { CSSProperties } from 'react';

export interface HistoryLog { // Garanta que tem a palavra 'export'
  id: string;
  field: 'stage' | 'status' | 'create';
  oldValue?: string;
  newValue: string;
  updatedAt: string;
  responsibleName: string;
}

interface Props {
  history?: HistoryLog[];
}
// Função auxiliar para traduzir o tipo de alteração em um texto bonito
const formatLogMessage = (log: HistoryLog) => {
  switch (log.field) {
    case 'create':
      return (
        <span>
          Negociação criada para o veículo <strong>{log.newValue}</strong>
        </span>
      );
    case 'stage':
      return (
        <span>
          Alterou o estágio de <s>{log.oldValue || 'Nenhum'}</s> para <strong>{log.newValue}</strong>
        </span>
      );
    case 'status':
      return (
        <span>
          Alterou o status da negociação para <strong>{log.newValue.toUpperCase()}</strong>
        </span>
      );
    default:
      return <span>Alteração realizada</span>;
  }
};

// Função auxiliar para definir o ícone/emoji de cada tipo de ação
const getLogIcon = (field: string) => {
  if (field === 'create') return '🚀';
  if (field === 'stage') return '📍';
  return '🔄';
};

export default function LeadHistoryTimeline({ history = [] }: Props) {
  if (!history || history.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '20px', color: '#94a3b8', fontSize: '13px' }}>
        Nenhum histórico de alterações registrado para este lead.
      </div>
    );
  }

  return (
    <div style={{ padding: '8px 4px', maxHeight: '400px', overflowY: 'auto' }}>
      <h3 style={{ margin: '0 0 16px 0', fontSize: '14px', fontWeight: 700, color: '#1e293b' }}>
        Histórico de Alterações
      </h3>

      {/* Container da Timeline */}
      <div style={{ position: 'relative', paddingLeft: '24px', borderLeft: '2px solid #e2e8f0' }}>
        {history.map((log, index) => {
          const isLast = index === history.length - 1;
          
          return (
            <div 
              key={log.id} 
              style={{ 
                position: 'relative', 
                marginBottom: isLast ? '0' : '20px',
                fontSize: '13px' 
              }}
            >
              {/* Indicador Visual (Bolinha/Ícone na linha) */}
              <div style={{
                position: 'absolute',
                left: '-33px', // Alinha perfeitamente em cima da linha vertical esquerda
                top: '2px',
                width: '18px',
                height: '18px',
                borderRadius: '50%',
                background: '#fff',
                border: '2px solid #3b82f6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '10px',
                zIndex: 2
              }}>
                {getLogIcon(log.field)}
              </div>

              {/* Conteúdo do Log */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <div style={{ color: '#334155', lineHeight: '1.4' }}>
                  {formatLogMessage(log)}
                </div>
                
                {/* Metadados: Data e Responsável */}
                <div style={{ display: 'flex', gap: '8px', fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                  <span>📅 {log.updatedAt}</span>
                  <span>•</span>
                  <span>👤 Responsável: <strong style={{ color: '#64748b' }}>{log.responsibleName}</strong></span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}