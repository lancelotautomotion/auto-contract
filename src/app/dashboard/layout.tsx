import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Sidebar />
      <div style={{ flex: 1, minWidth: 0, backgroundColor: 'var(--bg)', transition: 'background-color 0.2s ease' }}>
        {children}
      </div>
    </div>
  );
}
