import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../../styles/login.css";

export default function ClientLogin() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    nome: "",
    whatsapp: "",
    cidade: "",
    veiculo: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Dados do cliente cadastrados:", formData);
    // Aqui você pode adicionar a lógica para salvar no banco de dados
    alert("Cadastro realizado com sucesso!");
  };

  return (
    <div className="container">
      {/* Botão para ir para a área do colaborador */}
      <button 
        className="btn-switch" 
        onClick={() => navigate("/colaborador")}
      >
        ACESSO COLABORADOR
      </button>

      <div className="card-top">
        {/* Logo da Empresa */}
        <img src="/logo.png" alt="Logo 1000 Valle" style={{ width: '120px' }} />
        
        {/* Seção de boas-vindas com o texto e o carro lateral */}
        <div className="welcome-container">
          <div className="welcome-text">
            <h2>Olá, tudo certo?</h2>
            <p>Estamos aqui para te ajudar e orientar nos próximos passos para conquistar seu veículo.</p>
          </div>
          <img src="/carro-suv.png" alt="Carro" className="car-img-top" />
        </div>
      </div>

      <form className="card" onSubmit={handleSubmit}>
        <h3>ÁREA DO CLIENTE</h3>

        <div className="input-group">
          <label>NOME</label>
          <input 
            name="nome" 
            type="text" 
            placeholder="Digite seu nome"
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label>WHATSAPP</label>
          <input 
            name="whatsapp" 
            type="text" 
            placeholder="(00) 00000-0000"
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label>CIDADE</label>
          <input 
            name="cidade" 
            type="text" 
            placeholder="Sua cidade"
            onChange={handleChange} 
            required 
          />
        </div>

        <div className="input-group">
          <label>VEÍCULO</label>
          <input 
            name="veiculo" 
            type="text" 
            placeholder="Veículo de interesse"
            onChange={handleChange} 
            required 
          />
        </div>

        <button type="submit">CADASTRAR</button>
      </form>
    </div>
  );
}