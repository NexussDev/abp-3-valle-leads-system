import { useState, useCallback } from 'react';
import { validateStageMove, LeadStage } from '../utils/leadStageValidator';

export type MoveResult =
  | { success: true }
  | { success: false; error: string };

type MinLead = { id: string; stage: LeadStage };
type MinColumn = { id: LeadStage; leads: MinLead[] };

export type MoveLeadFn = (
  leadId: string,
  from: LeadStage,
  to: LeadStage,
) => MoveResult;

export interface UseKanbanBoard<C> {
  columns: C[];
  moveLead: MoveLeadFn;
  setColumns: (next: C[]) => void;
}

export function useKanbanBoard<C extends MinColumn>(
  initial: C[],
): UseKanbanBoard<C> {
  const [columns, setColumns] = useState<C[]>(initial);
  const replaceColumns = useCallback((next: C[]) => setColumns(next), []);

  const moveLead = useCallback<MoveLeadFn>(
    (leadId: string, from: LeadStage, to: LeadStage): MoveResult => {
      const result = validateStageMove(from, to);
      if (!result.allowed) return { success: false, error: result.reason };

      setColumns(prev => {
        const lead = prev
          .find(c => c.id === from)
          ?.leads.find(l => l.id === leadId);
        if (!lead) return prev;

        const next = prev.map(col => {
          if (col.id === from) {
            return { ...col, leads: col.leads.filter(l => l.id !== leadId) };
          }
          if (col.id === to) {
            return { ...col, leads: [...col.leads, { ...lead, stage: to }] };
          }
          return col;
        });
        return next as C[];
      });

      return { success: true };
    },
    [],
  );

  return { columns, moveLead, setColumns: replaceColumns };
}
