import { useState } from "react";
import { useNavigate } from "react-router-dom"; // Importe o hook de navegação
import "../../styles/login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate(); // Inicializa o navegador do React Router

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErro("");
    setLoading(true);

    // Credenciais fictícias para teste
    const emailFicticio = "admin@1000valle.com";
    const senhaFicticia = "123456";

    // Simula um pequeno atraso de rede
    setTimeout(() => {
      if (email === emailFicticio && senha === senhaFicticia) {
        // Salva um status de login
        localStorage.setItem("token", "autenticado_ficticio");

        // Redireciona para a página "Em Andamento"
        navigate("/em-andamento");
      } else {
        alert("E-mail ou senha incorretos!");
        setErro("Credenciais inválidas");
      }
      setLoading(false);
    }, 800);
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