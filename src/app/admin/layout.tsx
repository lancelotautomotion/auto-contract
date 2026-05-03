import type { Metadata } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "@/styles/admin.css";

export const metadata: Metadata = { title: "Kordia Admin" };
export const dynamic = "force-dynamic";

const font = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${font.className} admin-root`}>
      <header className="admin-header">
        <div className="admin-header-inner">
          <div className="admin-header-brand">
            <img
              src="/logotype_KORDIA.svg"
              alt="Kordia"
              className="admin-header-logoimg"
            />
            <span className="admin-header-badge">Admin</span>
          </div>
          <span className="admin-header-env">Vue CEO · Read-only</span>
        </div>
      </header>
      <main className="admin-main">{children}</main>
    </div>
  );
}
