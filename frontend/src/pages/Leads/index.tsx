import styles from './Leads.module.css';
import KanbanColumn from './components/KanbanColumn/KanbanColumn';
import { leadsData } from "./data/leadsData";

export default function LeadsPage() {
  return (
    <div className={styles.container}>
      {/* Navbar Escura */}
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

      {/* Barra de Filtros Branca (Segunda Imagem) */}
      <div className={styles.filterBar}>
        <div className={styles.searchGroup}>
          <input type="text" placeholder="🔍 Pesquisa" className={styles.searchInput} />
          <select className={styles.statusSelect}><option>Status/Fonte</option></select>
          <div className={styles.datePicker}>Últimos 30 dias 📅</div>
        </div>
        <button className={styles.btnNew}>+ NOVO LEADS</button>
      </div>

      {/* Grid do Kanban */}
      <main className={styles.board}>
        {leadsData.map((col) => (
          <KanbanColumn key={col.title} column={col} />
        ))}
      </main>

      <footer className={styles.footer}>
        <span>Resultado: <strong>R$ 0</strong></span>
        <span>Conversão: <strong>0%</strong></span>
      </footer>
    </div>
  );
}