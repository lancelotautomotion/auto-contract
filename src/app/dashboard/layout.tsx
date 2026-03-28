import Nav from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: '260px 1fr 260px',
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

      {/* Contenu centré */}
      <div style={{ minWidth: 0 }}>
        {children}
      </div>

      {/* Colonne droite vide — symétrique */}
      <div />

    </div>
  );
}
