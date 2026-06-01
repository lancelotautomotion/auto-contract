"use client";

import { useRouter } from "next/navigation";

const MONTH_NAMES = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];

export default function MonthSelector({ selYear, selMonth }: { selYear: number; selMonth: number }) {
  const router = useRouter();
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 4 }, (_, i) => currentYear - 2 + i); // -2 ans à +1 an

  function navigate(year: number, month: number) {
    const param = `${year}-${String(month + 1).padStart(2, "0")}`;
    router.push(`?month=${param}`);
  }

  return (
    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "16px" }}>
      <select
        value={selMonth}
        onChange={(e) => navigate(selYear, Number(e.target.value))}
        style={{
          padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "8px",
          background: "var(--dash-white)", color: "var(--ink)", fontSize: "13px",
          fontFamily: "var(--ff)", fontWeight: 600, cursor: "pointer", outline: "none",
        }}
      >
        {MONTH_NAMES.map((name, i) => (
          <option key={i} value={i}>{name}</option>
        ))}
      </select>

      <select
        value={selYear}
        onChange={(e) => navigate(Number(e.target.value), selMonth)}
        style={{
          padding: "6px 10px", border: "1px solid var(--line)", borderRadius: "8px",
          background: "var(--dash-white)", color: "var(--ink)", fontSize: "13px",
          fontFamily: "var(--ff)", fontWeight: 600, cursor: "pointer", outline: "none",
        }}
      >
        {years.map((y) => (
          <option key={y} value={y}>{y}</option>
        ))}
      </select>

      {selYear === new Date().getFullYear() && selMonth === new Date().getMonth() && (
        <span style={{
          fontSize: "10px", fontWeight: 600, color: "var(--violet)",
          background: "var(--violet-light)", padding: "3px 9px", borderRadius: "20px",
        }}>
          En cours
        </span>
      )}
    </div>
  );
}
