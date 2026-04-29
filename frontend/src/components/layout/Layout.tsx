import { ReactNode } from 'react';
import Sidebar from '../Sidebar/Sidebar';
import Header from '../Header/Header';
// ❌ Removida a linha: import { Outlet } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    // ✅ Agora 'styles' está sendo lido aqui embaixo
    <div style={styles.layoutContainer}>
      <Sidebar />
      <div style={styles.mainWrapper}>
        <Header />
        <main style={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}

// ✅ Definição do objeto styles (agora sendo lido pelo componente acima)
const styles: { [key: string]: React.CSSProperties } = {
  layoutContainer: {
    display: 'flex',
    height: '100vh',
    width: '100vw',
    overflow: 'hidden',
    backgroundColor: '#f8fafc',
  },
  mainWrapper: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px',
  },
};