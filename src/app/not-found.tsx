export const dynamic = 'force-dynamic';

export default function NotFound() {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: '16px', fontFamily: 'system-ui, sans-serif' }}>
      <h1 style={{ fontSize: '48px', fontWeight: 800, color: '#2C2C2A', margin: 0 }}>404</h1>
      <p style={{ fontSize: '16px', color: '#71716E', margin: 0 }}>Page introuvable</p>
      <a href="/" style={{ fontSize: '14px', color: '#7F77DD', fontWeight: 600 }}>← Retour à l&apos;accueil</a>
    </div>
  );
}
