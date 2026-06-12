import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "../../styles/catalogo.css";
import { carPhotoPexels } from "../../services/carApi";
import { getPublicCatalog } from "../../services/publicCatalog";
import type { PublicVehicle, Badge as BadgeKind } from "../../types/VehicleListing";

// ── tipos ──────────────────────────────────────────────────
type Categoria = "all" | "suv" | "sedan" | "hatch" | "pickup";
type BadgeType = BadgeKind | null;

interface Veiculo {
  id: string;
  marca: string;
  nome: string;
  ano: number;
  preco: string;
  km: string;
  combustivel: string;
  cambio: string;
  categoria: Exclude<Categoria, "all">;
  badge: BadgeType;
  accentColor: string;
  photoUrl: string | null;
}

const CATEGORY_ACCENT: Record<Exclude<Categoria, "all">, string> = {
  suv: "#c0392b",
  sedan: "#7c3aed",
  hatch: "#e07b39",
  pickup: "#0ea5e9",
};

const BRL = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

const KM_FMT = new Intl.NumberFormat("pt-BR");

function toVeiculo(v: PublicVehicle): Veiculo {
  const cat = (v.category ?? "sedan") as Exclude<Categoria, "all">;
  return {
    id: v.id,
    marca: v.brand ?? "—",
    nome: v.model ?? "—",
    ano: v.year ?? 0,
    preco: v.price ? BRL.format(Number(v.price)) : "Sob consulta",
    km: v.km !== null ? `${KM_FMT.format(v.km)} km` : "—",
    combustivel: v.fuel ?? "—",
    cambio: v.transmission ?? "—",
    categoria: (["suv", "sedan", "hatch", "pickup"] as const).includes(cat as never)
      ? cat
      : "sedan",
    badge: (v.badge ?? null) as BadgeType,
    accentColor: CATEGORY_ACCENT[cat] ?? "#c0392b",
    photoUrl: v.photoUrl,
  };
}

// ── svg do carro inline ─────────────────────────────────────
function CarSVG({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 300 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="cat-car-svg">
      <path d="M32 80 L32 61 L58 38 L198 35 L246 60 L268 65 L268 80 Z"
        fill={color} fillOpacity="0.12" stroke={color} strokeWidth="1.5"/>
      <path d="M32 80 L268 80" stroke={color} strokeWidth="1.5"/>
      <circle cx="78"  cy="86" r="14" fill="#16161e" stroke={color} strokeWidth="1.5"/>
      <circle cx="78"  cy="86" r="6"  fill={color} fillOpacity="0.3"/>
      <circle cx="222" cy="86" r="14" fill="#16161e" stroke={color} strokeWidth="1.5"/>
      <circle cx="222" cy="86" r="6"  fill={color} fillOpacity="0.3"/>
      <path d="M105 38 L185 35 L190 57 L100 57 Z"
        fill={color} fillOpacity="0.08" stroke={color} strokeWidth="0.8"/>
      <rect x="246" y="62" width="18" height="8" rx="2" fill="#e07b39" fillOpacity="0.7"/>
      <rect x="36"  y="62" width="18" height="8" rx="2" fill={color}   fillOpacity="0.3"/>
    </svg>
  );
}

// ── badge ───────────────────────────────────────────────────
function Badge({ type }: { type: BadgeType }) {
  if (!type) return null;
  const map = {
    novo:     { label: "Novo",     cls: "cat-badge--novo" },
    destaque: { label: "Destaque", cls: "cat-badge--destaque" },
    oferta:   { label: "Oferta",   cls: "cat-badge--oferta" },
  };
  const b = map[type];
  return <span className={`cat-badge ${b.cls}`}>{b.label}</span>;
}

// ── card ────────────────────────────────────────────────────
function VeiculoCard({
  v,
  idx,
  onInteresse,
}: {
  v: Veiculo;
  idx: number;
  onInteresse: (nome: string) => void;
}) {
  const navigate = useNavigate();
  const [salvo, setSalvo] = useState(false);
  const [photoUrl, setPhotoUrl] = useState<string | null>(v.photoUrl);

  useEffect(() => {
    if (v.photoUrl) {
      setPhotoUrl(v.photoUrl);
      return;
    }
    carPhotoPexels(v.marca, v.nome).then(url => {
      if (url) setPhotoUrl(url);
    });
  }, [v.marca, v.nome, v.photoUrl]);

  function handleInteresse() {
    onInteresse(`${v.marca} ${v.nome}`);
    navigate(`/demonstrar-interesse?veiculo=${encodeURIComponent(`${v.marca} ${v.nome}`)}`);
  }

  return (
    <div className="cat-card" style={{ animationDelay: `${idx * 0.06}s` }}>
      <Badge type={v.badge} />

      <div className="cat-card__img">
        {photoUrl ? (
          <img
            src={photoUrl}
            className="cat-card__photo"
            loading="lazy"
            alt={`${v.marca} ${v.nome}`}
          />
        ) : (
          <CarSVG color={v.accentColor} />
        )}
      </div>

      <div className="cat-card__body">
        {/* meta */}
        <div className="cat-card__meta">
          <span className="cat-card__marca">{v.marca}</span>
          <span className="cat-card__ano">{v.ano}</span>
        </div>

        <h3 className="cat-card__nome">{v.nome}</h3>

        {/* specs */}
        <div className="cat-card__specs">
          <span className="cat-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
            </svg>
            {v.combustivel}
          </span>
          <span className="cat-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
            </svg>
            {v.km}
          </span>
          <span className="cat-spec">
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="2" y="3" width="20" height="14" rx="2"/>
            </svg>
            {v.cambio}
          </span>
        </div>

        {/* footer */}
        <div className="cat-card__footer">
          <div className="cat-card__price">
            <span className="cat-price-label">Preço</span>
            <span className="cat-price-value">{v.preco}</span>
          </div>

        <div className="cat-card__actions">
          <button
            className="cat-btn-save"
            onClick={() => setSalvo(s => !s)}
            aria-label="Salvar"
            data-saved={salvo}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill={salvo ? "currentColor" : "none"}
              stroke="currentColor" strokeWidth="2">
              <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"/>
            </svg>
          </button>

          <button
            className="cat-btn-interesse"
            onClick={handleInteresse}
          >
            Demonstrar Interesse
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
              <path d="M5 12h14M13 6l6 6-6 6"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
    </div>
  );
}

// ── toast ───────────────────────────────────────────────────
function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  return (
    <div className={`cat-toast ${visible ? "cat-toast--show" : ""}`}>
      <span className="cat-toast__icon">✓</span>
      <div>
        <strong>Interesse registrado!</strong>
        <p>{msg} · Nossa equipe entrará em contato em breve.</p>
      </div>
    </div>
  );
}

// ── página principal ────────────────────────────────────────
export default function Catalogo() {
  const navigate = useNavigate();
  const location = useLocation();

  const [busca,     setBusca]     = useState("");
  const [categoria, setCategoria] = useState<Categoria>("all");
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastVis,  setToastVis]  = useState(false);

  // Quando o usuário acabou de enviar o formulário em /demonstrar-interesse,
  // chega aqui com state.interesseEnviado. Mostra o toast e limpa o state
  // (replace) para que o aviso não reapareça em refresh ou navegação back.
  useEffect(() => {
    const st = location.state as { interesseEnviado?: boolean; veiculo?: string } | null;
    if (!st?.interesseEnviado) return;
    setToastMsg(st.veiculo ?? 'Em breve um consultor entrará em contato.');
    setToastVis(true);
    const t = setTimeout(() => setToastVis(false), 5000);
    navigate(location.pathname, { replace: true, state: null });
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [veiculos,  setVeiculos]  = useState<Veiculo[]>([]);
  const [loading,   setLoading]   = useState(true);
  const [erro,      setErro]      = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setErro(null);
    getPublicCatalog()
      .then(data => {
        if (cancelled) return;
        setVeiculos(data.map(toVeiculo));
      })
      .catch(() => {
        if (!cancelled) setErro("Não foi possível carregar os veículos.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // filtra
  const filtrados = veiculos.filter(v => {
    const matchCat  = categoria === "all" || v.categoria === categoria;
    const q         = busca.toLowerCase();
    const matchText = v.nome.toLowerCase().includes(q) || v.marca.toLowerCase().includes(q);
    return matchCat && matchText;
  });

  function handleInteresse(nome: string) {
    setToastMsg(nome);
    setToastVis(true);
    setTimeout(() => setToastVis(false), 3500);
  }

  const categorias: { key: Categoria; label: string }[] = [
    { key: "all",    label: "Todos"  },
    { key: "suv",    label: "SUV"    },
    { key: "sedan",  label: "Sedan"  },
    { key: "hatch",  label: "Hatch"  },
    { key: "pickup", label: "Pickup" },
  ];

  return (
    <div className="cat-root">
      {/* ── HEADER ── */}
      <header className="cat-header">
        <img src="/logo.png" alt="1000 Valle" className="cat-header__logo" />

        <nav className="cat-nav">
          <a href="#" className="cat-nav__link cat-nav__link--active">Catálogo</a>
          <a href="#" className="cat-nav__link">Ofertas</a>
          <a href="#" className="cat-nav__link">Financiamento</a>
          <a href="#" className="cat-nav__link">Sobre</a>
        </nav>

        <button className="cat-header__cta" onClick={() => navigate("/colaborador")}>
          Acesso Colaborador
        </button>
      </header>

      {/* ── HERO ── */}
      <section className="cat-hero">
        <div className="cat-hero__bg" />
        <span className="cat-hero__eyebrow">
          <span className="cat-eyebrow-dot" />
          Estoque atualizado
        </span>
        <h1 className="cat-hero__title">
          Encontre seu<br /><em>próximo</em><br />veículo
        </h1>
        <p className="cat-hero__sub">
          Explore nossa seleção de veículos seminovos e novos com as melhores condições do mercado.
        </p>

        {/* busca */}
        <div className="cat-search-wrap">
          <svg className="cat-search-icon" width="16" height="16" viewBox="0 0 24 24"
            fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            className="cat-search"
            type="text"
            placeholder="Buscar por modelo ou marca..."
            value={busca}
            onChange={e => setBusca(e.target.value)}
          />
        </div>

        {/* chips */}
        <div className="cat-chips">
          {categorias.map(c => (
            <button
              key={c.key}
              className={`cat-chip ${categoria === c.key ? "cat-chip--active" : ""}`}
              onClick={() => setCategoria(c.key)}
            >
              {c.label}
            </button>
          ))}
        </div>
      </section>

      {/* ── STATS ── */}
      <div className="cat-stats">
        {[
          { num: "300+",  label: "Veículos Disponíveis" },
          { num: "14",    label: "Marcas" },
          { num: "98%",   label: "Clientes Satisfeitos" },
          { num: "24h",   label: "Resposta Garantida" },
        ].map(s => (
          <div className="cat-stat" key={s.label}>
            <strong>{s.num}</strong>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── GRID ── */}
      <div className="cat-section-header">
        <h2 className="cat-section-title">Em Destaque</h2>
        <span className="cat-section-count">{filtrados.length} veículos</span>
      </div>

      {loading ? (
        <div className="cat-grid">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="cat-card cat-card--skeleton" style={{ animationDelay: `${i * 0.06}s` }}>
              <div className="cat-card__img cat-skeleton" />
              <div className="cat-card__body">
                <div className="cat-skeleton cat-skeleton--line" style={{ width: "40%" }} />
                <div className="cat-skeleton cat-skeleton--line" style={{ width: "70%", height: 22 }} />
                <div className="cat-skeleton cat-skeleton--line" style={{ width: "90%" }} />
              </div>
            </div>
          ))}
        </div>
      ) : erro ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <p>{erro}</p>
        </div>
      ) : filtrados.length === 0 ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p>
            {busca
              ? <>Nenhum veículo encontrado para "<strong>{busca}</strong>"</>
              : <>Nenhum veículo disponível no momento.</>}
          </p>
        </div>
      ) : (
        <div className="cat-grid">
          {filtrados.map((v, i) => (
            <VeiculoCard key={v.id} v={v} idx={i} onInteresse={handleInteresse} />
          ))}
        </div>
      )}

      {/* ── FOOTER ── */}
      <footer className="cat-footer">
        <div className="cat-footer__inner">
          <div className="cat-footer__brand">
            <img src="/logo.png" alt="1000 Valle" style={{ width: 120, filter: "brightness(0) invert(1)", opacity: 0.8 }} />
            <p>Conectando você ao veículo dos seus sonhos com transparência e o melhor atendimento.</p>
          </div>
          <div className="cat-footer__col">
            <h4>Catálogo</h4>
            <a href="#">SUVs</a><a href="#">Sedans</a><a href="#">Hatches</a><a href="#">Pickups</a>
          </div>
          <div className="cat-footer__col">
            <h4>Serviços</h4>
            <a href="#">Financiamento</a><a href="#">Avaliação</a><a href="#">Revisão</a>
          </div>
          <div className="cat-footer__col">
            <h4>Empresa</h4>
            <a href="#">Sobre Nós</a><a href="#">Contato</a><a href="#">Política de Privacidade</a>
          </div>
        </div>
        <div className="cat-footer__bottom">
          <p>© 2026 1000 Valle Multimarcas. Todos os direitos reservados.</p>
        </div>
      </footer>

      <Toast msg={toastMsg} visible={toastVis} />
    </div>
  );
}