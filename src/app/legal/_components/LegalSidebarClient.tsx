"use client";

import { useState, useEffect } from "react";

interface SidebarLink {
  href: string;
  label: string;
}

export default function LegalSidebarClient({ links }: { links: SidebarLink[] }) {
  const [activeId, setActiveId] = useState<string>(links[0]?.href.slice(1) ?? "");

  useEffect(() => {
    const ids = links.map(l => l.href.slice(1));
    const sections = ids
      .map(id => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveId(entry.target.id);
        });
      },
      { threshold: 0, rootMargin: "-72px 0px -70% 0px" }
    );

    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, [links]);

  return (
    <aside className="legal-sidebar">
      <div className="legal-sidebar-title">Sommaire</div>
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={activeId === link.href.slice(1) ? "active" : ""}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
