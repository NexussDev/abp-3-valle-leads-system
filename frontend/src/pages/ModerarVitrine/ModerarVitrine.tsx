import { useEffect, useMemo, useState } from 'react';
import {
  approveVehicleListing,
  listVehicleListings,
  markVehicleListingSold,
  rejectVehicleListing,
} from '../../services/vehicleListings';
import type { VehicleListing, ListingStatus } from '../../types/VehicleListing';
import './ModerarVitrine.css';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});
const KM_FMT = new Intl.NumberFormat('pt-BR');

const TABS: { key: ListingStatus; label: string }[] = [
  { key: 'PENDING',  label: 'Pendentes' },
  { key: 'APPROVED', label: 'Aprovadas' },
  { key: 'REJECTED', label: 'Rejeitadas' },
  { key: 'SOLD',     label: 'Vendidas' },
];

export default function ModerarVitrine() {
  const role = (localStorage.getItem('@LeadsCar:role') ?? '').toUpperCase();
  const canModerate = ['GERENTE', 'GERENTE_GERAL', 'ADMIN'].includes(role);

  const [tab, setTab] = useState<ListingStatus>('PENDING');
  const [items, setItems] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rejecting, setRejecting] = useState<VehicleListing | null>(null);
  const [toast, setToast] = useState('');

  useEffect(() => {
    if (!canModerate) return;
    setLoading(true);
    setError(null);
    listVehicleListings({ status: tab })
      .then(setItems)
      .catch(() => setError('Não foi possível carregar.'))
      .finally(() => setLoading(false));
  }, [tab, canModerate]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  if (!canModerate) {
    return (
      <div className="mv-page">
        <div className="mv-denied">
          <h1>Acesso negado</h1>
          <p>Apenas gerentes têm permissão para moderar a vitrine.</p>
        </div>
      </div>
    );
  }

  async function onApprove(l: VehicleListing) {
    try {
      await approveVehicleListing(l.id);
      setItems(prev => prev.filter(x => x.id !== l.id));
      setToast(`${l.brand} ${l.model} aprovado e publicado.`);
    } catch (err) {
      setToast(extractMsg(err, 'Falha ao aprovar.'));
    }
  }

  async function onMarkSold(l: VehicleListing) {
    if (!confirm(`Marcar ${l.brand} ${l.model} como vendido? Ele será removido do catálogo público.`)) return;
    try {
      await markVehicleListingSold(l.id);
      setItems(prev => prev.filter(x => x.id !== l.id));
      setToast('Marcado como vendido.');
    } catch (err) {
      setToast(extractMsg(err, 'Falha ao marcar como vendido.'));
    }
  }

  async function onConfirmReject(reason: string) {
    if (!rejecting) return;
    try {
      await rejectVehicleListing(rejecting.id, reason);
      const id = rejecting.id;
      setItems(prev => prev.filter(x => x.id !== id));
      setRejecting(null);
      setToast('Publicação rejeitada.');
    } catch (err) {
      setToast(extractMsg(err, 'Falha ao rejeitar.'));
    }
  }

  return (
    <div className="mv-page">
      <header className="mv-header">
        <div>
          <h1 className="mv-title">Moderar vitrine</h1>
          <p className="mv-subtitle">Aprove, rejeite ou marque publicações como vendidas.</p>
        </div>
      </header>

      <div className="mv-tabs">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`mv-tab ${tab === t.key ? 'mv-tab--active' : ''}`}
            onClick={() => setTab(t.key)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="mv-loading">Carregando…</div>
      ) : error ? (
        <div className="mv-empty">{error}</div>
      ) : items.length === 0 ? (
        <div className="mv-empty">Nada para mostrar.</div>
      ) : (
        <div className="mv-list">
          {items.map(l => (
            <ModerationCard
              key={l.id}
              listing={l}
              tab={tab}
              onApprove={() => onApprove(l)}
              onReject={() => setRejecting(l)}
              onMarkSold={() => onMarkSold(l)}
            />
          ))}
        </div>
      )}

      {rejecting && (
        <RejectModal
          listing={rejecting}
          onCancel={() => setRejecting(null)}
          onConfirm={onConfirmReject}
        />
      )}

      {toast && <div className="mv-toast">{toast}</div>}
    </div>
  );
}

function ModerationCard({
  listing,
  tab,
  onApprove,
  onReject,
  onMarkSold,
}: {
  listing: VehicleListing;
  tab: ListingStatus;
  onApprove: () => void;
  onReject: () => void;
  onMarkSold: () => void;
}) {
  const price = listing.price !== null ? BRL.format(Number(listing.price)) : '—';
  return (
    <article className="mv-card">
      <div className="mv-card__img">
        {listing.photoUrl ? (
          <img src={listing.photoUrl} alt="" />
        ) : (
          <div className="mv-card__img-fallback">Sem foto</div>
        )}
      </div>
      <div className="mv-card__info">
        <div className="mv-card__meta">
          <span>{listing.brand}</span>
          <span>·</span>
          <span>{listing.year}</span>
          {listing.category && <><span>·</span><span>{listing.category}</span></>}
        </div>
        <h3 className="mv-card__model">{listing.model}</h3>
        <div className="mv-card__specs">
          <span>{listing.km !== null ? `${KM_FMT.format(listing.km)} km` : '— km'}</span>
          {listing.fuel && <><span>·</span><span>{listing.fuel}</span></>}
          {listing.transmission && <><span>·</span><span>{listing.transmission}</span></>}
          {listing.color && <><span>·</span><span>{listing.color}</span></>}
        </div>
        <div className="mv-card__author">
          Publicado por <strong>{listing.publishedBy?.name ?? '—'}</strong>
          {' '}({listing.publishedBy?.role ?? '—'})
          {' · '}{listing.publishedTeam?.name ?? '—'}
        </div>
        {listing.description && (
          <p className="mv-card__desc">{listing.description}</p>
        )}
        {tab === 'REJECTED' && listing.rejectionReason && (
          <div className="mv-rejection">
            <strong>Motivo:</strong> {listing.rejectionReason}
          </div>
        )}
      </div>
      <div className="mv-card__side">
        <div className="mv-card__price">{price}</div>
        <div className="mv-card__actions">
          {tab === 'PENDING' && (
            <>
              <button className="mv-btn mv-btn--approve" onClick={onApprove}>Aprovar</button>
              <button className="mv-btn mv-btn--reject"  onClick={onReject}>Rejeitar</button>
            </>
          )}
          {tab === 'APPROVED' && (
            <button className="mv-btn mv-btn--sold" onClick={onMarkSold}>Marcar vendido</button>
          )}
        </div>
      </div>
    </article>
  );
}

function RejectModal({
  listing,
  onCancel,
  onConfirm,
}: {
  listing: VehicleListing;
  onCancel: () => void;
  onConfirm: (reason: string) => void;
}) {
  const [reason, setReason] = useState('');
  const valid = useMemo(() => reason.trim().length > 0 && reason.length <= 255, [reason]);

  return (
    <div className="mv-modal-overlay" onClick={onCancel}>
      <div className="mv-modal" onClick={e => e.stopPropagation()}>
        <h2>Rejeitar publicação</h2>
        <p className="mv-modal__sub">
          {listing.brand} {listing.model} ({listing.year})
        </p>
        <label className="mv-modal__field">
          <span>Motivo da rejeição *</span>
          <textarea
            value={reason}
            onChange={e => setReason(e.target.value.slice(0, 255))}
            rows={4}
            autoFocus
            placeholder="Ex.: Preço acima da média de mercado, fotos de baixa qualidade…"
          />
          <small>{reason.length}/255</small>
        </label>
        <div className="mv-modal__actions">
          <button className="mv-btn mv-btn--ghost" onClick={onCancel}>Cancelar</button>
          <button className="mv-btn mv-btn--reject" disabled={!valid} onClick={() => onConfirm(reason)}>
            Confirmar rejeição
          </button>
        </div>
      </div>
    </div>
  );
}

function extractMsg(err: unknown, fallback: string): string {
  return (
    (err as { response?: { data?: { message?: string } } })?.response?.data?.message ?? fallback
  );
}
