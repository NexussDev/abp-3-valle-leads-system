import { useState } from "react";
import styles from './Leads.module.css';
import KanbanColumn from './components/KanbanColumn/KanbanColumn';
import { leadsData } from "./data/leadsData";
import { Column } from "./../../types/Column";

export default function LeadsPage() {

  // ✅ STATES (AGORA NO LUGAR CERTO)
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("");
  const [period, setPeriod] = useState("30");

  // ✅ FUNÇÃO DE FILTRO
const filterLeads = (columns: Column[]): Column[] => {
  return columns.map((col) => ({
    ...col,
    items: col.items.filter((item) => {

      const matchesSearch =
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.car.toLowerCase().includes(search.toLowerCase());

      const matchesStatus =
        status === "" || item.status === status;

      const days = parseInt(period);
      const now = new Date();
      const itemDate = new Date(item.date);

      const diffTime = now.getTime() - itemDate.getTime();
      const diffDays = diffTime / (1000 * 60 * 60 * 24);

      const matchesDate = diffDays <= days;

      return matchesSearch && matchesStatus && matchesDate;
    }),
  }));
};

  return (
    <div className={styles.container}>

      {/* NAVBAR */}
      <header className={styles.navbar}>
        <div className={styles.logo}>
          <span className={styles.logoRed}>1000</span> Valle
          <small>MULTIMARCAS</small>
        </div>
        <nav className={styles.menu}>
          <a href="#" className={styles.active}>Oportunidades</a>
          <a href="#">Atividades</a>
          <a href="#">Estatísticas</a>
          <a href="#">Funil</a>
        </nav>

        <div className={styles.userProfile}>
          <button className={styles.ajudaBtn}>Ajuda ▾</button>
          <div className={styles.user}>
            <strong>Pedro</strong>
            <span>Consultor</span>
          </div>
          <img src="https://i.pravatar.cc/150?u=pedro" className={styles.topAvatar} />
        </div>
      </header>

      {/* FILTROS */}
      <div className={styles.filterBar}>
        <div className={styles.searchGroup}>

          {/* 🔎 PESQUISA */}
          <input
            type="text"
            placeholder="🔍 Pesquisa"
            className={styles.searchInput}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

          {/* 📌 STATUS */}
          <select
            className={styles.statusSelect}
            value={status}
            onChange={(e) => setStatus(e.target.value)}
          >
            <option value="">Todos</option>
            <option value="Novo">Novo</option>
            <option value="Contato">Contato</option>
            <option value="Negociação">Negociação</option>
            <option value="Proposta">Proposta</option>
            <option value="Vendido">Vendido</option>
          </select>

          {/* 📅 PERÍODO */}
          <select
            className={styles.statusSelect}
            value={period}
            onChange={(e) => setPeriod(e.target.value)}
          >
            <option value="7">Últimos 7 dias</option>
            <option value="30">Últimos 30 dias</option>
            <option value="90">Últimos 90 dias</option>
          </select>

        </div>

        <button className={styles.btnNew}>+ NOVO LEADS</button>
      </div>

      {/* BOARD */}
      <main className={styles.board}>
        {filterLeads(leadsData).map((col) => (
          <KanbanColumn key={col.id} column={col} />
        ))}
      </main>

      {/* FOOTER */}
      <footer className={styles.footer}>
        <span>Resultado: <strong>R$ 0</strong></span>
        <span>Conversão: <strong>0%</strong></span>
      </footer>
    </div>
  );
}