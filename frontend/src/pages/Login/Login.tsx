import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, saveToken } from "../../services/auth";
import "../../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    try {
      const result = await login(email, senha);
      saveToken(result.token);
      navigate("/em-andamento");
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Credenciais inválidas";
      setErro(message);
      alert("E-mail ou senha incorretos!");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card-top">
        <img src="/logo.png" alt="Logo 1000 Valle" style={{ width: '150px' }} />
        <h3>ÁREA DO COLABORADOR</h3>
      </div>
      <form className="card" onSubmit={handleLogin}>
        <div className="input-group">
          <input
            type="email"
            placeholder="EMAIL"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="SENHA"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
            required
          />
        </div>
        {erro && <p style={{ color: '#b33939', fontSize: '0.8rem', textAlign: 'center' }}>{erro}</p>}
        <button type="submit" disabled={loading}>
          {loading ? "Verificando..." : "ENTRAR"}
        </button>
      </form>
    </div>
  );
}