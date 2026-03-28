import Nav from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg)' }}>

      {/* Colonne nav — centrée horizontalement dans l'espace disponible */}
      <div style={{
        width: '260px',
        flexShrink: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingRight: '40px',
        position: 'sticky',
        top: 0,
        height: '100vh',
      }}>
        <Nav />
      </div>

      {/* Contenu */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {children}
      </div>

      {/* Espaceur droit — compense la colonne nav pour centrer le contenu */}
      <div style={{ width: '260px', flexShrink: 0 }} />

    </div>
  );
}
