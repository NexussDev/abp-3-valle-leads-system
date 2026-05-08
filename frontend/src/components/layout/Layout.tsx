import { ReactNode, useState } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import Header from '../Header/Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  // Estado para controlar se a sidebar está aberta ou fechada
  const [isExpanded, setIsExpanded] = useState(false);

  const toggleSidebar = () => setIsExpanded(!isExpanded);

  return (
    <div style={styles.layoutContainer}>
      {/* Passamos o estado e a função para a Sidebar */}
      <Sidebar isExpanded={isExpanded} toggleSidebar={toggleSidebar} />
      
      <div style={{ 
        ...styles.mainWrapper, 
        marginLeft: isExpanded ? '260px' : '80px' // Ajusta o conteúdo conforme a sidebar
      }}>
        <Header />
        <main style={styles.contentArea}>
          {children}
        </main>
      </div>
    </div>
  );
}

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
    transition: 'margin-left 0.3s ease', // Suaviza o movimento do conteúdo
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    padding: '32px',
  },
};