import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/Login/Login";
import ClientLogin from "../pages/ClientLogin/ClientLogin";
import LeadsPage from "../pages/Leads"; // Aponta para a pasta Leads

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<ClientLogin />} />
        <Route path="/colaborador" element={<Login />} />
        <Route path="/leads" element={<LeadsPage />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </BrowserRouter>
  );
}