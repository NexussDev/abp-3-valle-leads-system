import { ReactNode, useState } from 'react';
import { Sidebar } from '../Sidebar/Sidebar';
import Header from '../Header/Header';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div style={styles.layoutContainer}>
      <div
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
        style={{ position: 'fixed', left: 0, top: 0, zIndex: 1000, height: '100vh' }}
      >
        <Sidebar isExpanded={isExpanded} />
      </div>

      <div style={{
        ...styles.mainWrapper,
        marginLeft: isExpanded ? '260px' : '72px',
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
    transition: 'margin-left 0.3s ease',
    minWidth: 0,
  },
  contentArea: {
    flex: 1,
    overflowY: 'auto',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    scrollBehavior: 'smooth',
  },
};
