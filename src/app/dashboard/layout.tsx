import Nav from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr',
      minHeight: '100vh',
      backgroundColor: 'var(--bg)',
    }}>

      {/* Colonne nav */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '48px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <Nav />
      </div>

      {/* Contenu */}
      <div style={{ minWidth: 0, paddingRight: '48px' }}>
        {children}
      </div>

    </div>
  );
}
