import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import ClientLogin from "../pages/ClientLogin/ClientLogin";
import LeadsPage from "../pages/Leads/index";
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Catalogo from "../pages/Catalogo/Catalogo";
import Perfil from "../pages/Perfil/Perfil";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rotas públicas (sem sidebar) */}
        <Route path="/" element={<ClientLogin />} />
        <Route path="/demonstrar-interesse" element={<ClientLogin />} />
        <Route path="/catalogo" element={<Catalogo />} />
        <Route path="/colaborador" element={<Login />} />

        {/* Rotas protegidas (com sidebar) */}
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
        <Route path="/leads" element={<Layout><LeadsPage /></Layout>} />
        <Route path="/perfil" element={<Layout><Perfil /></Layout>} />

        <Route path="*" element={<Navigate to="/catalogo" />} />
      </Routes>
    </BrowserRouter>
  );
}