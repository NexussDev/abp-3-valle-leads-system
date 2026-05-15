import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);
  
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password: senha }),
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.message || "Credenciais inválidas");
      }
  
      localStorage.setItem("token", data.token);
      localStorage.setItem("@LeadsCar:role", data.role ?? "");
      localStorage.setItem("@LeadsCar:userName", email.split("@")[0]);
  
      navigate("/dashboard");
    } catch (err: any) {
      setErro(err.message || "E-mail ou senha incorretos.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-root">
      {/* ── Left panel ── */}
      <div className="login-left">
        <div className="login-left__overlay" />

        {/* decorative circles */}
        <span className="deco deco--1" />
        <span className="deco deco--2" />
        <span className="deco deco--3" />

        <div className="login-left__content">
          <img src="/logo.png" alt="1000 Valle" className="login-left__logo" />
          <h1 className="login-left__headline">
            A melhor experiência <br /> em negócios automotivos.
          </h1>
          <p className="login-left__sub">
            Gestão de leads, equipes e resultados — tudo em um só lugar.
          </p>
        </div>

        <p className="login-left__copy">© 2026 1000 Valle. Todos os direitos reservados.</p>
      </div>

      {/* ── Right panel ── */}
      <div className="login-right">
        <div className="login-card">
          {/* header */}
          <div className="login-card__header">
            <span className="login-card__badge">Área do Colaborador</span>
            <h2 className="login-card__title">Bem-vindo de volta</h2>
            <p className="login-card__subtitle">
              Faça login com seu e-mail e senha
            </p>
          </div>

          {/* form */}
          <form className="login-form" onSubmit={handleLogin} noValidate>
            {/* email */}
            <div className="lf-group">
              <label className="lf-label" htmlFor="email">
                E-mail
              </label>
              <div className="lf-input-wrap">
                <svg className="lf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="2" y="4" width="20" height="16" rx="3" />
                  <path d="M2 8l10 6 10-6" />
                </svg>
                <input
                  id="email"
                  type="email"
                  className="lf-input"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* password */}
            <div className="lf-group">
              <label className="lf-label" htmlFor="senha">
                Senha
              </label>
              <div className="lf-input-wrap">
                <svg className="lf-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  id="senha"
                  type={showPassword ? "text" : "password"}
                  className="lf-input"
                  placeholder="Digite sua senha"
                  value={senha}
                  onChange={(e) => setSenha(e.target.value)}
                  required
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="lf-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                >
                  {showPassword ? (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* error */}
            {erro && <p className="lf-error">{erro}</p>}

            {/* submit */}
            <button type="submit" className="lf-submit" disabled={loading}>
              {loading ? (
                <span className="lf-spinner" />
              ) : (
                <>
                  Entrar na plataforma
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                    <path d="M5 12h14M13 6l6 6-6 6" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <p className="login-card__hint">
            Problemas para acessar? Fale com o seu gestor.
          </p>
        </div>
      </div>
    </div>
  );
}