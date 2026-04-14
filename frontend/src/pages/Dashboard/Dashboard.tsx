import { useNavigate } from "react-router-dom";
import "../../styles/dashboard.css";

export default function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/");
  };

  return (
    <div className="dashboard-container">
      {/* TOPO */}
      <div className="dashboard-header">
        <h2>VALLE LEADS SYSTEM</h2>
        <button onClick={handleLogout}>Sair</button>
      </div>

      {/* CONTEÚDO */}
      <div className="dashboard-content">
        <h1>Dashboard</h1>

        <div className="card">
          <p>Bem-vindo ao sistema 👋</p>
        </div>

        <div className="card">
          <p>Total de Leads: 0</p>
        </div>
      </div>
    </div>
  );
}