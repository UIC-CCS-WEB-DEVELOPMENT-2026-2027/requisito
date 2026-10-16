import "./Button.css";

export default function Button({ children, href = "#", variant = "primary" }) {
  return (
    <a className={`btn btn--${variant}`} href={href}>
      {children}
      <span aria-hidden="true">→</span>
    </a>
  );
}
