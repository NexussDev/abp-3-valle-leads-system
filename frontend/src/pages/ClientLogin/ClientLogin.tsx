import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/client-login.css";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    cidade: "",
    veiculo: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      console.log("Dados do cliente cadastrados:", formData);
      setLoading(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    }, 900);
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
          <button className="cl-switch" onClick={() => navigate("/colaborador")}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            Acesso Colaborador
          </button>
        </div>

        <div className="cl-left__content">
          <span className="cl-left__badge">Bem-vindo à 1000 Valle</span>
          <h1 className="cl-left__headline">
            Olá, tudo certo?
          </h1>
          <p className="cl-left__sub">
            Estamos aqui para te ajudar e orientar nos próximos passos para conquistar o seu veículo dos sonhos.
          </p>

          <div className="cl-left__stats">
            <div className="cl-stat">
              <strong>+5.000</strong>
              <span>Clientes atendidos</span>
            </div>
            <div className="cl-stat-divider" />
            <div className="cl-stat">
              <strong>+300</strong>
              <span>Veículos em estoque</span>
            </div>
            <div className="cl-stat-divider" />
            <div className="cl-stat">
              <strong>15 anos</strong>
              <span>De experiência</span>
            </div>
          </div>
        </div>

        {/* car image floating at bottom */}
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
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  className="clf-input"
                  placeholder="Digite seu nome"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* whatsapp */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="whatsapp">WhatsApp</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.8 19.8 0 0 1-3.07-8.67A2 2 0 0 1 3.61 1h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.81a2 2 0 0 1-.45 2.11L7.91 8.6a16 16 0 0 0 5.51 5.51l.96-.96a2 2 0 0 1 2.11-.45c.9.33 1.85.56 2.81.69A2 2 0 0 1 22 16.92z" />
                </svg>
                <input
                  id="whatsapp"
                  name="whatsapp"
                  type="tel"
                  className="clf-input"
                  placeholder="(00) 00000-0000"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            {/* cidade */}
            <div className="clf-group">
              <label className="clf-label" htmlFor="cidade">Cidade</label>
              <div className="clf-input-wrap">
                <svg className="clf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <input
                  id="cidade"
                  name="cidade"
                  type="text"
                  className="clf-input"
                  placeholder="Sua cidade"
                  onChange={handleChange}
                  required
                />
              </div>
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
                <input
                  id="veiculo"
                  name="veiculo"
                  type="text"
                  className="clf-input"
                  placeholder="Ex: Honda HR-V, Toyota Corolla..."
                  onChange={handleChange}
                  required
                />
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

          <p className="cl-card__hint">
            Seus dados estão seguros e não serão compartilhados.
          </p>
        </div>
      </div>
    </div>
  );
}