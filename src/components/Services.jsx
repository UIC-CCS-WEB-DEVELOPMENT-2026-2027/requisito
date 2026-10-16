import "./Services.css";
import Button from "./Button";

const ICON_BG = "#cce0fb";
const ICON = "#0052bc";

const DocumentIcon = ({ children }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke={ICON} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    {children}
  </svg>
);

const CARD = [
  {
    title: "BIR Registration / TIN",
    icon: <DocumentIcon><path d="M5 3h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /><path d="M7 8h10M7 12h6M7 16h8" /></DocumentIcon>,
    desc: "Register with the Bureau of Internal Revenue and get a Taxpayer Identification Number (TIN) for employment, business, and other official transactions.",
  },
  {
    title: "PhilHealth ID",
    icon: <DocumentIcon><rect x="2" y="4" width="20" height="16" rx="2" /><circle cx="8" cy="10" r="2" /><path d="M5 16c.8-2 5.2-2 6 0M14 9h5M14 13h5" /></DocumentIcon>,
    desc: "Register as a PhilHealth member, request your member data record, and learn how to use your coverage for government and accredited health services.",
  },
  {
    title: "Health Card",
    icon: <DocumentIcon><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M12 8v8M8 12h8" /></DocumentIcon>,
    desc: "Apply for or renew a local government health or sanitary card when required for employment, food handling, or other regulated work.",
  },
  {
    title: "Passport (DFA)",
    icon: <DocumentIcon><path d="M17 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2z" /><path d="M7 9h10M7 13h10" /></DocumentIcon>,
    desc: "Apply for or renew a Philippine passport through the Department of Foreign Affairs. Book an appointment and prepare your requirements.",
  },
];

export default function Services() {
  return (
    <section id="services" className="services">
      <div className="services__inner">
        <div className="services__intro">
          <h2 className="services__title">Government Documents</h2>
          <p className="services__subtitle">
            Find official Philippine government IDs, certificates, clearances,
            and registration documents in one place.
          </p>
        </div>

        <div className="services__grid">
          {CARD.map((card) => (
            <article key={card.title} className="services__card">
              <div className="services__icon" style={{ backgroundColor: ICON_BG }}>
                {card.icon}
              </div>
              <h3 className="services__card-title">{card.title}</h3>
              <p className="services__card-desc">{card.desc}</p>
              <Button>View requirements</Button>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
