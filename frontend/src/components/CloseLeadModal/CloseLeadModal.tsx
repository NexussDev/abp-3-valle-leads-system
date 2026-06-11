import { useState, CSSProperties } from 'react';
import { updateLead } from '../../services/leadsApi';

interface Props {
    leadId: string;
    leadName: string | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function CloseLeadModal({ leadId, leadName, onClose, onSuccess }: Props) {
    const [closingReason, setClosingReason] = useState('');
    const [converted, setConverted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [erro, setErro] = useState('');

    async function handleSubmit() {
        if (!closingReason.trim()) {
            setErro('Motivo de fechamento é obrigatório.');
            return;
        }
        setLoading(true);
        setErro('');
        try {
            await updateLead(leadId, {
                status: 'fechado',
                closingReason: closingReason.trim(),
                converted,
            });
            onSuccess();
        } catch (e: any) {
            console.log('Erro completo:', e?.response?.data);
            setErro(e?.response?.data?.message ?? 'Erro ao fechar lead.');
        } finally {
            setLoading(false);
        }
    }

    return (
        <div style={overlayStyle} onClick={onClose}>
            <div style={modalStyle} onClick={e => e.stopPropagation()}>
                <h2 style={titleStyle}>Fechar Lead</h2>
                <p style={subtitleStyle}>{leadName ?? 'Lead sem nome'}</p>

                <label style={labelStyle}>Motivo de fechamento *</label>
                <textarea
                    style={textareaStyle}
                    placeholder="Ex: Cliente não tinha interesse, comprou outro modelo..."
                    value={closingReason}
                    onChange={e => setClosingReason(e.target.value)}
                    rows={3}
                />

                <div style={toggleRowStyle}>
                    <div>
                        <span style={labelStyle}>Venda realizada?</span>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: '#94a3b8' }}>
                            Clique para alternar entre Sim e Não
                        </p>
                    </div>
                    <button
                        style={{
                            ...toggleStyle,
                            background: converted ? '#10b981' : '#fee2e2',
                            color: converted ? '#fff' : '#ef4444',
                            border: converted ? '2px solid #10b981' : '2px solid #fca5a5',
                            minWidth: 80,
                        }}
                        onClick={() => setConverted(v => !v)}
                        type="button"
                    >
                        {converted ? '✓ Sim' : '✗ Não'}
                    </button>
                </div>

                {erro && <p style={erroStyle}>{erro}</p>}

                <div style={actionsStyle}>
                    <button style={cancelStyle} onClick={onClose} disabled={loading}>Cancelar</button>
                    <button style={confirmStyle} onClick={handleSubmit} disabled={loading}>
                        {loading ? 'Salvando...' : 'Confirmar Fechamento'}
                    </button>
                </div>
            </div>
        </div>
    );
}

const overlayStyle: CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
};
const modalStyle: CSSProperties = {
    background: '#fff', borderRadius: 20, padding: 32, width: 440,
    maxWidth: '90vw', boxShadow: '0 24px 64px rgba(0,0,0,0.18)',
};
const titleStyle: CSSProperties = { margin: '0 0 4px', fontSize: 20, fontWeight: 800, color: '#1e293b' };
const subtitleStyle: CSSProperties = { margin: '0 0 20px', fontSize: 14, color: '#64748b' };
const labelStyle: CSSProperties = { display: 'block', fontSize: 13, fontWeight: 700, color: '#475569', marginBottom: 6 };
const textareaStyle: CSSProperties = {
    width: '100%', padding: '10px 14px', borderRadius: 10, border: '1px solid #cbd5e1',
    fontSize: 14, resize: 'vertical', outline: 'none', boxSizing: 'border-box', marginBottom: 16,
};
const toggleRowStyle: CSSProperties = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 };
const toggleStyle: CSSProperties = {
    padding: '8px 20px', borderRadius: 999, border: 'none', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', transition: 'all 0.2s',
};
const erroStyle: CSSProperties = { color: '#ef4444', fontSize: 13, marginBottom: 12 };
const actionsStyle: CSSProperties = { display: 'flex', gap: 10, justifyContent: 'flex-end' };
const cancelStyle: CSSProperties = {
    padding: '10px 20px', borderRadius: 10, border: '1px solid #e2e8f0',
    background: '#f8fafc', color: '#475569', fontWeight: 600, cursor: 'pointer', fontSize: 14,
};
const confirmStyle: CSSProperties = {
    padding: '10px 20px', borderRadius: 10, border: 'none',
    background: '#c0392b', color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: 14,
};