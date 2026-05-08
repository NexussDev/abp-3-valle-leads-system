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

    // Simula um pequeno atraso de rede
    setTimeout(() => {
      // Regra de negócio mockada para definir o Role baseado no e-mail
      let role = "";
      
      if (senha === "123456") { // Senha padrão para todos os testes
        if (email === "admin@1000valle.com") role = "ADMIN";
        else if (email === "gerente@1000valle.com") role = "GERENTE";
        else if (email === "lider@1000valle.com") role = "LIDER";
      }

      if (role !== "") {
        // ✅ SALVANDO PERFIL: Aqui guardamos quem logou para o Dashboard e Leads consultarem
        localStorage.setItem('@LeadsCar:role', role);
        localStorage.setItem('@LeadsCar:userName', email.split('@')[0]);

        console.log(`Login como ${role} realizado com sucesso!`);
        navigate("/dashboard"); 
      } else {
        alert("E-mail ou senha incorretos! Use admin@, gerente@ ou lider@ com a senha 123456");
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