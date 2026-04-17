import { Plus_Jakarta_Sans } from 'next/font/google';
import Sidebar from "./Sidebar";
import '@/styles/dashboard.css';

const font = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  display: 'swap',
});

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${font.className} app`}>
      <Sidebar />
      <div className="main">
        {children}
      </div>
    </div>
  );
}
