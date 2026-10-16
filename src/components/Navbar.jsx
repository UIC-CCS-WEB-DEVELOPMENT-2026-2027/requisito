import { useId, useState } from "react";
import "./Navbar.css";

const LINKS = ["Home", "Explore Services", "How It Works", "Verified Requirements", "About", "Help / FAQ"];

export default function Navbar({ onHome, onNavigate, active = "Home" }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();
  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <button className="site-nav__logo" onClick={() => { onHome(); setOpen(false); }} aria-label="Requisito home">Requisito</button>
        <button className="site-nav__toggle" type="button" aria-expanded={open} aria-controls={menuId} aria-label={open ? "Close menu" : "Open menu"} onClick={() => setOpen((value) => !value)}>
          <span aria-hidden="true" />
        </button>
        <nav id={menuId} className={`site-nav__menu${open ? " is-open" : ""}`} aria-label="Primary">
          <ul>
            {LINKS.map((label) => (
              <li key={label}>
                <a href={`#${label.toLowerCase().replaceAll(" ", "-").replace("/", "")}`} className={label === active ? "is-active" : undefined} aria-current={label === active ? "page" : undefined} onClick={(event) => { event.preventDefault(); if (label === "Home") onHome(); else onNavigate(label); setOpen(false); }}>{label}</a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
