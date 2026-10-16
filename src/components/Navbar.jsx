import { useId, useState } from "react";
import "./Navbar.css";

const LINKS = [
  { label: "Home", href: "#home" },
  { label: "Explore Services", href: "#explore-services", primary: true },
  { label: "How It Works", href: "#how-it-works" },
  { label: "Verified Requirements", href: "#verified-requirements" },
  { label: "About", href: "#about" },
  { label: "Help / FAQ", href: "#help" },
];

export default function Navbar({ active = "Home" }) {
  const [open, setOpen] = useState(false);
  const menuId = useId();

  return (
    <header className="site-nav">
      <div className="site-nav__inner">
        <a className="site-nav__logo" href="#home" aria-label="Requisito home">
          Requisito
        </a>

        <button
          type="button"
          className="site-nav__toggle"
          aria-expanded={open}
          aria-controls={menuId}
          aria-label={open ? "Close menu" : "Open menu"}
          onClick={() => setOpen((o) => !o)}
        >
          <span aria-hidden="true" />
        </button>

        <nav
          id={menuId}
          className={`site-nav__menu${open ? " is-open" : ""}`}
          aria-label="Primary"
        >
          <ul>
            {LINKS.map(({ label, href, primary }) => (
              <li key={label}>
                <a
                  href={href}
                  className={primary ? "is-primary" : undefined}
                  aria-current={label === active ? "page" : undefined}
                  onClick={() => setOpen(false)}
                >
                  {label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </header>
  );
}
