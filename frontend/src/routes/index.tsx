import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import ClientLogin from "../pages/ClientLogin/ClientLogin";
import LeadsPage from "../pages/Leads/index"; // Aponta para a pasta Leads
import Layout from "../components/layout/Layout";
import Dashboard from "../pages/Dashboard/Dashboard";
import Catalogo from "../pages/Catalogo/Catalogo";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>

       <Route path="/catalogo" element={<Catalogo />} />

        {/* Rotas SEM Sidebar (Login) */}
        <Route path="/" element={<ClientLogin />} />
        <Route path="/colaborador" element={<Login />} />

        {/* Rotas COM Sidebar (Envolvidas pelo Layout) */}
        <Route 
          path="/dashboard" 
          element={
            <Layout>
              <Dashboard />
            </Layout>
          } 
        />
        
        <Route 
          path="/leads" 
          element={
            <Layout>
              <LeadsPage />
            </Layout>
          } 
        />

        {/* Redirecionamento de segurança */}
        <Route path="*" element={<Navigate to="/" />} />
        <Route path="/dashboard" element={<Layout><Dashboard /></Layout>} />
      </Routes>
    </BrowserRouter>
  );
}