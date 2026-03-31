import Nav from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', minHeight: '100vh' }}>

      {/* Sidebar */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRight: '1px solid #E5E0D8',
        position: 'sticky',
        top: 0,
        height: '100vh',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}>
        <Nav />
      </div>

      {/* Contenu */}
      <div style={{ minWidth: 0, backgroundColor: '#F2F0EB' }}>
        {children}
      </div>

    </div>
  );
}
