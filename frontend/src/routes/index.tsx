import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login/Login";
import Leads from "../pages/Leads";
import Dashboard from '../pages/Dashboard/Dashboard';
import ClientLogin from "../pages/ClientLogin/ClientLogin";
import InProgress from "../pages/InProgress/InProgress";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLogin />} />
        <Route path="/colaborador" element={<Login />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/cliente" element={<ClientLogin />} />
        <Route path="/em-andamento" element={<InProgress />} />
      </Routes>
    </BrowserRouter>
  );
}