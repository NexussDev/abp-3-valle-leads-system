import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../pages/Login";
import Leads from "../pages/Leads";
import Dashboard from "../pages/Dashboard";

export function AppRoutes() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  );
}