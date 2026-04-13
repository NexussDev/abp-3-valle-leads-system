import { useNavigate } from "react-router-dom";

export default function InProgress() {
  const navigate = useNavigate();

  const containerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '100vh',
    backgroundColor: '#e0e0e0', // Fundo cinza solicitado
    color: '#333',
    fontFamily: 'sans-serif'
  };

  return (
    <div style={containerStyle}>
      <h1>EM ANDAMENTO</h1>
      <p>Esta funcionalidade está sendo desenvolvida.</p>
      <button 
        onClick={() => navigate("/")}
        style={{ marginTop: '20px', padding: '10px 20px', cursor: 'pointer' }}
      >
        Voltar para Início
      </button>
    </div>
  );
}