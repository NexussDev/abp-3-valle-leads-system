import { useEffect, useState, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  listVehicleListings,
  deleteVehicleListing,
} from '../../services/vehicleListings';
import type { VehicleListing, ListingStatus } from '../../types/VehicleListing';
import './MinhasPublicacoes.css';

const BRL = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
  maximumFractionDigits: 0,
});

const STATUS_LABEL: Record<ListingStatus, string> = {
  PENDING: 'Pendente',
  APPROVED: 'Aprovada',
  REJECTED: 'Rejeitada',
  SOLD: 'Vendida',
};

const FILTERS: { key: 'ALL' | ListingStatus; label: string }[] = [
  { key: 'ALL',      label: 'Todas' },
  { key: 'PENDING',  label: 'Pendentes' },
  { key: 'APPROVED', label: 'Aprovadas' },
  { key: 'REJECTED', label: 'Rejeitadas' },
  { key: 'SOLD',     label: 'Vendidas' },
];

export default function MinhasPublicacoes() {
  const navigate = useNavigate();
  const location = useLocation();
  const justCreated = (location.state as { justCreated?: boolean } | null)?.justCreated;

  const [listings, setListings] = useState<VehicleListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'ALL' | ListingStatus>('ALL');
  const [toast, setToast] = useState(justCreated ? 'Publicação enviada para aprovação.' : '');

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const load = () => {
    setLoading(true);
    setError(null);
    listVehicleListings({ mine: true })
      .then(setListings)
      .catch(() => setError('Não foi possível carregar suas publicações.'))
      .finally(() => setLoading(false));
  };

  useEffect(load, []);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return listings;
    return listings.filter(l => l.listingStatus === filter);
  }, [listings, filter]);

  async function onDelete(id: string) {
    if (!confirm('Excluir esta publicação? Esta ação não pode ser desfeita.')) return;
    try {
      await deleteVehicleListing(id);
      setListings(prev => prev.filter(l => l.id !== id));
      setToast('Publicação excluída.');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Não foi possível excluir.';
      setToast(msg);
    }
  }

  return (
    <div className="mp-page">
      <header className="mp-header">
        <div>
          <h1 className="mp-title">Minhas publicações</h1>
          <p className="mp-subtitle">Acompanhe o status dos veículos que você publicou.</p>
        </div>
        <button className="mp-btn mp-btn--primary" onClick={() => navigate('/publicar-veiculo')}>
          + Nova publicação
        </button>
      </header>

      <div className="mp-filters">
        {FILTERS.map(f => {
          const count = f.key === 'ALL'
            ? listings.length
            : listings.filter(l => l.listingStatus === f.key).length;
          return (
            <button
              key={f.key}
              className={`mp-filter ${filter === f.key ? 'mp-filter--active' : ''}`}
              onClick={() => setFilter(f.key)}
            >
              {f.label}
              <span className="mp-filter__count">{count}</span>
            </button>
          );
        })}
      </div>

      {loading ? (
        <div className="mp-loading">Carregando publicações…</div>
      ) : error ? (
        <div className="mp-empty">
          <p>{error}</p>
          <button className="mp-btn mp-btn--ghost" onClick={load}>Tentar novamente</button>
        </div>
      ) : filtered.length === 0 ? (
        <div className="mp-empty">
          <p>{filter === 'ALL' ? 'Você ainda não publicou nenhum veículo.' : 'Nenhuma publicação neste status.'}</p>
          {filter === 'ALL' && (
            <button className="mp-btn mp-btn--primary" onClick={() => navigate('/publicar-veiculo')}>
              Publicar agora
            </button>
          )}
        </div>
      ) : (
        <div className="mp-grid">
          {filtered.map(l => (
            <ListingCard key={l.id} listing={l} onDelete={onDelete} />
          ))}
        </div>
      )}

      {toast && <div className="mp-toast">{toast}</div>}
    </div>
  );
}

function ListingCard({
  listing,
  onDelete,
}: {
  listing: VehicleListing;
  onDelete: (id: string) => void;
}) {
  const status = listing.listingStatus ?? 'PENDING';
  const price = listing.price !== null ? BRL.format(Number(listing.price)) : 'Sob consulta';
  const canEdit = status === 'PENDING' || status === 'REJECTED';

  return (
    <article className="mp-card">
      <div className="mp-card__img">
        {listing.photoUrl ? (
          <img src={listing.photoUrl} alt="" />
        ) : (
          <div className="mp-card__img-fallback">Sem foto</div>
        )}
        <span className={`mp-status mp-status--${status.toLowerCase()}`}>
          {STATUS_LABEL[status]}
        </span>
      </div>
      <div className="mp-card__body">
        <div className="mp-card__meta">
          <span>{listing.brand}</span>
          <span>{listing.year}</span>
        </div>
        <h3 className="mp-card__model">{listing.model}</h3>
        <div className="mp-card__price">{price}</div>

        {status === 'REJECTED' && listing.rejectionReason && (
          <div className="mp-rejection">
            <strong>Motivo da rejeição:</strong>
            <p>{listing.rejectionReason}</p>
          </div>
        )}

        {canEdit && (
          <div className="mp-card__actions">
            <button className="mp-btn mp-btn--ghost mp-btn--sm" onClick={() => onDelete(listing.id)}>
              Excluir
            </button>
          </div>
        )}
      </div>
    </article>
  );
}
