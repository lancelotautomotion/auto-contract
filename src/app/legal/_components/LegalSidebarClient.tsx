"use client";

import { useState, useEffect } from "react";
import { ChevronDown } from "lucide-react";

interface SidebarLink {
  href: string;
  label: string;
}

export default function LegalSidebarClient({ links }: { links: SidebarLink[] }) {
  const [activeId, setActiveId] = useState<string>(links[0]?.href.slice(1) ?? "");
  const [open, setOpen] = useState(false);

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
      { threshold: 0, rootMargin: "-80px 0px -70% 0px" }
    );

    sections.forEach(s => obs.observe(s));
    return () => obs.disconnect();
  }, [links]);

  const activeLabel = links.find(l => l.href.slice(1) === activeId)?.label ?? "Sommaire";

  return (
    <aside className="legal-sidebar" data-open={open}>
      <div className="legal-sidebar-title">Sommaire</div>
      <button
        type="button"
        className="legal-sidebar-toggle"
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
      >
        <span>{activeLabel}</span>
        <ChevronDown className="chevron" size={14} strokeWidth={1.6} />
      </button>
      <ul>
        {links.map(link => (
          <li key={link.href}>
            <a
              href={link.href}
              className={activeId === link.href.slice(1) ? "active" : ""}
              onClick={() => setOpen(false)}
            >
              {link.label}
            </a>
          </li>
        ))}
      </ul>
    </aside>
  );
}
