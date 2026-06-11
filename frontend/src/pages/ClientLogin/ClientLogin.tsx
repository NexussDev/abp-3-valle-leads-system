import { submitPublicLead } from '../../services/publicLeadsApi';
import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import '../../styles/client-login.css';

const ESTADOS = [
  { uf: 'AC', nome: 'Acre' }, { uf: 'AL', nome: 'Alagoas' }, { uf: 'AP', nome: 'Amapá' },
  { uf: 'AM', nome: 'Amazonas' }, { uf: 'BA', nome: 'Bahia' }, { uf: 'CE', nome: 'Ceará' },
  { uf: 'DF', nome: 'Distrito Federal' }, { uf: 'ES', nome: 'Espírito Santo' },
  { uf: 'GO', nome: 'Goiás' }, { uf: 'MA', nome: 'Maranhão' }, { uf: 'MT', nome: 'Mato Grosso' },
  { uf: 'MS', nome: 'Mato Grosso do Sul' }, { uf: 'MG', nome: 'Minas Gerais' },
  { uf: 'PA', nome: 'Pará' }, { uf: 'PB', nome: 'Paraíba' }, { uf: 'PR', nome: 'Paraná' },
  { uf: 'PE', nome: 'Pernambuco' }, { uf: 'PI', nome: 'Piauí' },
  { uf: 'RJ', nome: 'Rio de Janeiro' }, { uf: 'RN', nome: 'Rio Grande do Norte' },
  { uf: 'RS', nome: 'Rio Grande do Sul' }, { uf: 'RO', nome: 'Rondônia' },
  { uf: 'RR', nome: 'Roraima' }, { uf: 'SC', nome: 'Santa Catarina' },
  { uf: 'SP', nome: 'São Paulo' }, { uf: 'SE', nome: 'Sergipe' }, { uf: 'TO', nome: 'Tocantins' },
];

function maskPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length <= 2) return digits.length ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export default function ClientLogin() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const isDemonstrarInteresse = location.pathname === '/demonstrar-interesse';
  const veiculoParam = searchParams.get('veiculo') || '';

  const [formData, setFormData] = useState({
    nome: '',
    whatsapp: '',
    estado: '',
    cidade: '',
    veiculo: veiculoParam,
    origem: '',
  });
  const [cidades, setCidades] = useState<string[]>([]);
  const [cidadeFiltro, setCidadeFiltro] = useState('');
  const [showCidades, setShowCidades] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const cidadeRef = useRef<HTMLDivElement>(null);

  // Carrega cidades do IBGE quando estado muda
  useEffect(() => {
    if (!formData.estado) { setCidades([]); return; }
    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${formData.estado}/municipios?orderBy=nome`)
      .then(r => r.json())
      .then((data: { nome: string }[]) => setCidades(data.map(d => d.nome)))
      .catch(() => setCidades([]));
    setFormData(f => ({ ...f, cidade: '' }));
    setCidadeFiltro('');
  }, [formData.estado]);

  // Fecha dropdown de cidades ao clicar fora
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (cidadeRef.current && !cidadeRef.current.contains(e.target as Node)) {
        setShowCidades(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const cidadesFiltradas = cidades.filter(c =>
    c.toLowerCase().includes(cidadeFiltro.toLowerCase())
  ).slice(0, 50);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'whatsapp') {
      setFormData(f => ({ ...f, whatsapp: maskPhone(value) }));
    } else {
      setFormData(f => ({ ...f, [name]: value }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await submitPublicLead({
        nome: formData.nome,
        whatsapp: formData.whatsapp,
        cidade: formData.cidade || formData.estado,
        veiculo: formData.veiculo,
        origem: formData.origem || 'Site',
      });
      setFormData({
        nome: '',
        whatsapp: '',
        estado: '',
        cidade: '',
        veiculo: veiculoParam,
        origem: '',
      });
      
      setCidadeFiltro('');
      setLoading(false);
      
      setSuccess(true);
      
      setTimeout(() => {
        setSuccess(false);
      
        if (isDemonstrarInteresse) {
          navigate('/catalogo');
        }
      }, 3000);
    } catch {
      setLoading(false);
      alert('Erro ao cadastrar. Tente novamente.');
    }
  };

  return (
    <div className="cl-root">
      {/* ── Left panel ── */}
      <div className="cl-left">
        <div className="cl-left__overlay" />
        <span className="cl-deco cl-deco--1" />
        <span className="cl-deco cl-deco--2" />
        <span className="cl-deco cl-deco--3" />

        <div className="cl-left__top">
          <img src="/logo.png" alt="1000 Valle" className="cl-left__logo" />
          {isDemonstrarInteresse ? (
            <button className="cl-switch" onClick={() => navigate('/catalogo')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Voltar ao Catálogo
            </button>
          ) : (
            <button className="cl-switch" onClick={() => navigate('/colaborador')}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              Acesso Colaborador
            </button>
          )}
        </div>

        <div className="cl-left__content">
          <span className="cl-left__badge">Bem-vindo à 1000 Valle</span>
          <h1 className="cl-left__headline">Olá, tudo certo?</h1>
          <p className="cl-left__sub">
            Estamos aqui para te ajudar e orientar nos próximos passos para conquistar o seu veículo dos sonhos.
          </p>
          <div className="cl-left__stats">
            <div className="cl-stat"><strong>+5.000</strong><span>Clientes atendidos</span></div>
            <div className="cl-stat-divider" />
            <div className="cl-stat"><strong>+300</strong><span>Veículos em estoque</span></div>
            <div className="cl-stat-divider" />
            <div className="cl-stat"><strong>15 anos</strong><span>De experiência</span></div>
          </div>
        </div>

        <img src="/carro-suv.png" alt="Veículo" className="cl-left__car" />
        <p className="cl-left__copy">© 2026 1000 Valle Multimarcas</p>
      </div>

      {/* ── Right panel ── */}
      <div className="cl-right">
        <div className="cl-card">
          <div className="cl-card__header">
            <span className="cl-card__badge">Área do Cliente</span>
            <h2 className="cl-card__title">Cadastre seu interesse</h2>
            <p className="cl-card__subtitle">
              Preencha os dados abaixo e um consultor entrará em contato com você.
            </p>
          </div>

          <form className="cl-form" onSubmit={handleSubmit} noValidate>
            {/* nome */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="nome">Nome completo</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                <input id="nome" name="nome" type="text" className="clf-input"
                  placeholder="Digite seu nome" value={formData.nome} onChange={handleChange} required />
              </div>
            </div>

            {/* whatsapp com máscara */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="whatsapp">WhatsApp</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.51 5.51l.96-.96a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
                </svg>
                <input id="whatsapp" name="whatsapp" type="tel" className="clf-input"
                  placeholder="(00) 00000-0000" value={formData.whatsapp} onChange={handleChange}
                  maxLength={15} required />
              </div>
            </div>

            {/* estado */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="estado">Estado</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <select id="estado" name="estado" className="clf-input"
                  value={formData.estado} onChange={handleChange} required>
                  <option value="" disabled hidden>Selecione o estado</option>
                  {ESTADOS.map(e => (
                    <option key={e.uf} value={e.uf}>{e.nome}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* cidade com busca IBGE */}
            <div className="clf-group" ref={cidadeRef} style={{ position: 'relative' }}>
              <label className="clf-label" htmlFor="cidade-input">Cidade</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                  <polyline points="9 22 9 12 15 12 15 22" />
                </svg>
                <input
                  id="cidade-input"
                  type="text"
                  className="clf-input"
                  placeholder={formData.estado ? 'Buscar cidade...' : 'Selecione o estado primeiro'}
                  value={formData.cidade || cidadeFiltro}
                  disabled={!formData.estado}
                  onChange={e => {
                    setCidadeFiltro(e.target.value);
                    setFormData(f => ({ ...f, cidade: '' }));
                    setShowCidades(true);
                  }}
                  onFocus={() => formData.estado && setShowCidades(true)}
                  autoComplete="off"
                />
              </div>
              {showCidades && cidadesFiltradas.length > 0 && (
                <ul style={{
                  position: 'absolute', top: '100%', left: 0, right: 0,
                  background: '#fff', border: '1px solid #e2e8f0', borderRadius: 10,
                  maxHeight: 180, overflowY: 'auto', zIndex: 50,
                  padding: 4, margin: 0, listStyle: 'none',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.1)',
                }}>
                  {cidadesFiltradas.map(c => (
                    <li key={c}
                      onClick={() => {
                        setFormData(f => ({ ...f, cidade: c }));
                        setCidadeFiltro('');
                        setShowCidades(false);
                      }}
                      style={{
                        padding: '8px 12px', cursor: 'pointer', borderRadius: 7,
                        fontSize: 13, color: '#1e293b',
                      }}
                      onMouseEnter={e => (e.currentTarget.style.background = '#f1f5f9')}
                      onMouseLeave={e => (e.currentTarget.style.background = 'none')}
                    >
                      {c}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* veiculo */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="veiculo">Veículo de interesse</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="1" y="8" width="22" height="10" rx="2" />
                  <path d="M5 8V6a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v2" />
                  <circle cx="7" cy="18" r="2" />
                  <circle cx="17" cy="18" r="2" />
                </svg>
                <input id="veiculo" name="veiculo" type="text" className="clf-input"
                  placeholder="Ex: Honda HR-V, Toyota Corolla..." value={formData.veiculo} onChange={handleChange} required />
              </div>
            </div>

            {/* origem */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="origem">Como nos conheceu?</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <select name="origem" id="origem" className="clf-input" required
                  value={formData.origem} onChange={handleChange}>
                  <option value="" disabled hidden>Selecione a origem</option>
                  <option value="instagram">Instagram</option>
                  <option value="whatsapp">WhatsApp</option>
                  <option value="facebook">Facebook</option>
                  <option value="site">Site</option>
                  <option value="outros">Outros</option>
                </select>
              </div>
            </div>

            <button type="submit" className="clf-submit" disabled={loading || success}>
              {loading ? (
                <span className="clf-spinner" />
              ) : success ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                  Cadastro realizado!
                </>
              ) : (
                <>
                  Quero ser atendido
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="cl-card__hint">Seus dados estão seguros e não serão compartilhados.</p>
        </div>
      </div>
    </div>
  );
}
