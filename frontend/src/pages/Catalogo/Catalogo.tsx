import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/catalogo.css";

// ── tipos ──────────────────────────────────────────────────
type Categoria = "all" | "suv" | "sedan" | "hatch" | "pickup";
type BadgeType = "novo" | "destaque" | "oferta" | null;

interface Veiculo {
  id: number;
  marca: string;
  nome: string;
  ano: number;
  preco: string;
  km: string;
  combustivel: string;
  cambio: string;
  categoria: Omit<Categoria, "all">;
  badge: BadgeType;
  accentColor: string;
}

// ── dados mockados ──────────────────────────────────────────
const veiculos: Veiculo[] = [
  { id: 1, marca: "Toyota",     nome: "RAV4 Hybrid",        ano: 2024, preco: "R$ 210.000", km: "18.000 km", combustivel: "Híbrido",     cambio: "Automático", categoria: "suv",    badge: "novo",     accentColor: "#c0392b" },
  { id: 2, marca: "BMW",        nome: "Série 3 320i",        ano: 2023, preco: "R$ 295.000", km: "32.000 km", combustivel: "Gasolina",    cambio: "Automático", categoria: "sedan",  badge: "destaque", accentColor: "#7c3aed" },
  { id: 3, marca: "Jeep",       nome: "Compass Limited",     ano: 2024, preco: "R$ 188.000", km: "8.000 km",  combustivel: "Flex",        cambio: "Automático", categoria: "suv",    badge: null,       accentColor: "#c0392b" },
  { id: 4, marca: "Volkswagen", nome: "Polo GTS",            ano: 2023, preco: "R$ 118.000", km: "22.000 km", combustivel: "Flex Turbo",  cambio: "Automático", categoria: "hatch",  badge: "oferta",   accentColor: "#c0392b" },
  { id: 5, marca: "Ford",       nome: "Ranger Storm",        ano: 2024, preco: "R$ 265.000", km: "5.000 km",  combustivel: "Diesel",      cambio: "Automático", categoria: "pickup", badge: "novo",     accentColor: "#e07b39" },
  { id: 6, marca: "Honda",      nome: "Civic Touring",       ano: 2023, preco: "R$ 175.000", km: "28.000 km", combustivel: "Gasolina",    cambio: "CVT",        categoria: "sedan",  badge: null,       accentColor: "#7c3aed" },
  { id: 7, marca: "Hyundai",    nome: "Tucson HTRAC",        ano: 2024, preco: "R$ 225.000", km: "12.000 km", combustivel: "Gasolina",    cambio: "Automático", categoria: "suv",    badge: "destaque", accentColor: "#c0392b" },
  { id: 8, marca: "Fiat",       nome: "Pulse Abarth",        ano: 2024, preco: "R$ 142.000", km: "15.000 km", combustivel: "Flex Turbo",  cambio: "Automático", categoria: "hatch",  badge: null,       accentColor: "#e07b39" },
  { id: 9, marca: "Chevrolet",  nome: "Tracker Premier",     ano: 2024, preco: "R$ 158.000", km: "4.500 km",  combustivel: "Flex Turbo",  cambio: "Automático", categoria: "suv",    badge: "novo",     accentColor: "#c0392b" },
];

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
  const [enviado, setEnviado] = useState(false);
  const [salvo,   setSalvo]   = useState(false);

  function handleInteresse() {
    setEnviado(true);
    onInteresse(`${v.marca} ${v.nome}`);
  }

  return (
    <div className="cat-card" style={{ animationDelay: `${idx * 0.06}s` }}>
      <Badge type={v.badge} />

      {/* imagem mockada */}
      <div className="cat-card__img">
        <CarSVG color={v.accentColor} />
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
            className={`cat-btn-interesse ${enviado ? "cat-btn-interesse--ativo" : ""}`}
            onClick={handleInteresse}
            disabled={enviado}
          >
            {enviado ? (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 6L9 17l-5-5"/>
                </svg>
                Interesse Enviado
              </>
            ) : (
              <>
                Demonstrar Interesse
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                  <path d="M5 12h14M13 6l6 6-6 6"/>
                </svg>
              </>
            )}
          </button>
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

  const [busca,     setBusca]     = useState("");
  const [categoria, setCategoria] = useState<Categoria>("all");
  const [toastMsg,  setToastMsg]  = useState("");
  const [toastVis,  setToastVis]  = useState(false);

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

        <button className="cat-header__cta" onClick={() => navigate("/cliente")}>
          Área do Cliente
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

      {filtrados.length === 0 ? (
        <div className="cat-empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <p>Nenhum veículo encontrado para "<strong>{busca}</strong>"</p>
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