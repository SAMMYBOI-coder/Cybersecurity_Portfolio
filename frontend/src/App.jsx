import { useEffect, useMemo, useState } from "react";
import {
  getProjects,
  getCertifications,
  getAchievements,
  sendContactMessage,
} from "./services/api";

const writingItems = [
  {
    tag: "WEB SECURITY",
    title: "Race Conditions in Authentication Workflows",
    summary:
      "A practical note on token lifecycle, concurrency and why atomic operations matter in security-sensitive flows.",
    status: "Draft",
  },
  {
    tag: "DEVOPS",
    title: "Building a Self-Hosted Portfolio CI/CD Pipeline",
    summary:
      "From React and Express to Docker Compose, GitHub Actions, Ubuntu Server and Cloudflare Tunnel.",
    status: "Planned",
  },
  {
    tag: "ACTIVE DIRECTORY",
    title: "Active Directory: From Fundamentals to Lab Practice",
    summary:
      "Revision notes connecting domain concepts, authentication and hands-on lab observations.",
    status: "Planned",
  },
];

const extraActivity = [
  {
    year: "2026",
    title: "MicroCMS Web Security CTF",
    type: "WEB SECURITY",
    description:
      "Completed practical web-security challenges and validated an access-control bypass.",
  },
  {
    year: "2026",
    title: "Active Directory Security Lab",
    type: "ACTIVE DIRECTORY",
    description:
      "Built and assessed a Windows domain lab to strengthen practical understanding of AD security.",
  },
  {
    year: "2026",
    title: "Authorised Web Application Assessment",
    type: "WEB SECURITY",
    description:
      "Performed structured black-box testing, evidence collection and remediation-focused reporting.",
  },
  {
    year: "2026",
    title: "Portfolio CI/CD Deployment",
    type: "DEVOPS",
    description:
      "Deployed the portfolio through Docker, GitHub Actions, Ubuntu Server and Cloudflare Tunnel.",
  },
];

const skillGroups = [
  {
    title: "SKILL & HANDS-ON PRACTICE",
    items: [
      "Web Application Security",
      "Penetration Testing",
      "VAPT",
      "Active Directory",
      "Network Security",
      "Digital Forensics",
      "Reverse Engineering",
      "Security Research",
    ],
  },
  {
    title: "TOOLS & DEVELOPMENT",
    items: [
      "Burp Suite",
      "Linux",
      "Hack The Box",
      "PortSwigger",
      "Docker",
      "Git / GitHub",
      "JavaScript",
      "React",
      "Node.js",
    ],
  },
  {
    title: "LANGUAGES",
    items: ["English", "Nepali", "Hindi"],
  },
  {
    title: "HOBBIES & INTERESTS",
    items: ["Swimming", "CTFs", "Home Labs"],
  },
];

const profileLinks = [
  {
    label: "GitHub",
    short: "GH",
    href: "https://github.com/SAMMYBOI-coder",
  },
  {
    label: "LinkedIn",
    short: "IN",
    href: null,
  },
  {
    label: "Hack The Box",
    short: "HTB",
    href: null,
  },
  {
    label: "TryHackMe",
    short: "THM",
    href: null,
  },
];

function ProfileLinks({ compact = false }) {
  return (
    <div className={`profile-links ${compact ? "compact" : ""}`}>
      {profileLinks.map((profile) =>
        profile.href ? (
          <a
            className="profile-link"
            href={profile.href}
            target="_blank"
            rel="noreferrer"
            key={profile.label}
          >
            <span className="profile-short">{profile.short}</span>
            <span>{profile.label}</span>
            <span className="profile-arrow">↗</span>
          </a>
        ) : (
          <span
            className="profile-link is-pending"
            title={`Add your ${profile.label} profile URL`}
            key={profile.label}
          >
            <span className="profile-short">{profile.short}</span>
            <span>{profile.label}</span>
            <span className="profile-dot">•</span>
          </span>
        ),
      )}
    </div>
  );
}

function AmbientScene({ route }) {
  return (
    <div className={`ambient-scene ambient-${route}`} aria-hidden="true">
      <span className="ambient-orb orb-one" />
      <span className="ambient-orb orb-two" />
      <span className="ambient-orb orb-three" />
      <span className="ambient-noise" />
    </div>
  );
}

function IntroScreen({ onDone }) {
  useEffect(() => {
    const first = window.setTimeout(() => {
      document.querySelector(".intro-shell")?.classList.add("intro-collapse");
    }, 850);
    const second = window.setTimeout(onDone, 1900);
    return () => {
      window.clearTimeout(first);
      window.clearTimeout(second);
    };
  }, [onDone]);

  return (
    <div className="intro-screen" aria-hidden="true">
      <div className="intro-shell">
        <div className="intro-name">SANJAY SHRESTHA</div>
        <div className="intro-mark">
          <img src="/avatar.png" alt="" />
        </div>
        <div className="intro-line" />
      </div>
    </div>
  );
}

function useHashRoute() {
  const readRoute = () => {
    if (!window.location.hash.startsWith("#/")) {
      return "home";
    }

    const value = window.location.hash.replace(/^#\//, "");
    return value || "home";
  };

  const [route, setRoute] = useState(readRoute);

  useEffect(() => {
    const handler = () => {
      const hash = window.location.hash;

      if (hash.startsWith("#/")) {
        setRoute(readRoute());
        window.scrollTo({ top: 0, behavior: "smooth" });
        return;
      }

      setRoute("home");

      const targetId = hash.replace(/^#/, "");
      if (targetId) {
        window.requestAnimationFrame(() => {
          window.requestAnimationFrame(() => {
            document.getElementById(targetId)?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          });
        });
      }
    };

    window.addEventListener("hashchange", handler);
    return () => window.removeEventListener("hashchange", handler);
  }, []);

  return route;
}

function Header({ theme, onThemeToggle }) {
  return (
    <header className="site-header">
      <nav className="nav-shell">
        <a href="#/home" className="brand" aria-label="Home">
          <img src="/avatar.png" alt="" />
          <span>SS</span>
        </a>

        <div className="nav-links">
          <a href="#about">About</a>
          <a href="#projects">Projects</a>
          <a href="#education">Education</a>
          <a href="#credentials">Credentials</a>
          <a href="#writing">Writing</a>
          <a href="#contact">Contact</a>
        </div>

        <button
          className="theme-toggle"
          type="button"
          onClick={onThemeToggle}
          aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
        >
          <span>{theme === "dark" ? "☀" : "☾"}</span>
        </button>
      </nav>
    </header>
  );
}

function SectionHeading({ label, title, description, actionHref, actionText }) {
  return (
    <div className="section-heading">
      <div>
        <p className="section-label">{label}</p>
        <h2>{title}</h2>
        {description && <p className="section-description">{description}</p>}
      </div>
      {actionHref && (
        <a href={actionHref} className="section-action">
          {actionText} →
        </a>
      )}
    </div>
  );
}

function SkillSignals() {
  return (
    <div className="skill-signals">
      <div className="skill-profile-heading">SKILLS & EXPERTISE</div>

      <div className="skill-group-list">
        {skillGroups.map((group) => (
          <section className="skill-group" key={group.title}>
            <h3>{group.title}</h3>
            <div className="skill-pills">
              {group.items.map((item) => (
                <span className="skill-pill" key={item}>
                  {item}
                </span>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function HacktivityTimeline({ activity, full = false }) {
  return (
    <div className={`hacktivity-box ${full ? "full" : ""}`}>
      <div className="hacktivity-head">
        <div>
          <span className="section-label">LIVE FEED</span>
          <h3>Recent signals</h3>
        </div>
        <div className="live-status">
          <span className="status-dot" />
          ACTIVE
        </div>
      </div>

      <div className="activity-timeline">
        {activity.map((item, index) => (
          <article className="activity-row" key={`${item.title}-${index}`}>
            <div className="timeline-rail">
              <span className="timeline-node" />
              {index !== activity.length - 1 && <span className="timeline-line" />}
            </div>
            <div className="activity-content">
              <div className="activity-meta">
                <span>{item.year}</span>
                <span>{item.type}</span>
              </div>
              <h4>{item.title}</h4>
              <p>{item.description}</p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function Home({
  projects,
  certifications,
  achievements,
  loading,
  error,
  formData,
  setFormData,
  formStatus,
  handleSubmit,
}) {
  const selectedProjects = projects.slice(0, 3);

  const activity = [
    ...achievements.map((item) => ({
      year: "2026",
      title: item.title,
      type: "CTF / ACHIEVEMENT",
      description: item.description,
    })),
    ...extraActivity,
  ].slice(0, 5);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <main className="page-shell">
      <section className="hero reveal">
        <div className="hero-copy">
          <div className="system-chip">
            <span className="status-dot" />
            PROFILE ONLINE
          </div>

          <p className="eyebrow">CYBERSECURITY • DEVELOPMENT • DEVOPS</p>

          <h1>
            <span>Hi, I&apos;m</span>
            <strong>Sanjay Shrestha.</strong>
          </h1>

          <p className="hero-role">
            Cybersecurity Student <span>×</span> Security Practitioner
          </p>

          <p className="hero-description">
            I build, test and secure systems while growing practical skills across
            offensive security, web application security, networking, development
            and DevOps.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="button primary">Explore work</a>
            <a href="#contact" className="button ghost">Contact me</a>
          </div>

          <div className="hero-socials">
            <ProfileLinks compact />
          </div>
        </div>

        <div className="identity-stage">
          <div className="orbit orbit-a" />
          <div className="orbit orbit-b" />
          <div className="orbit-dot dot-a" />
          <div className="orbit-dot dot-b" />

          <div className="avatar-core">
            <img src="/avatar.png" alt="Temporary Sanjay Shrestha identity mark" />
          </div>

          <div className="stage-label label-a">WEB//SEC</div>
          <div className="stage-label label-b">VAPT</div>
          <div className="stage-label label-c">DEV//OPS</div>
        </div>
      </section>

      <section id="about" className="section-block reveal">
        <SectionHeading
          label="01 / ABOUT"
          title="Security practitioner in progress."
        />

        <div className="about-grid">
          <div className="about-copy">
            <p>
              Final-year cybersecurity student focused on offensive security and
              web application security.
            </p>
            <p>
              I learn through labs, CTFs, authorised assessments and by building
              real systems.
            </p>
            <p>
              Development and DevOps help me understand both how applications work
              and how they fail.
            </p>
          </div>

          <SkillSignals />
        </div>
      </section>

      <section id="projects" className="section-block reveal">
        <SectionHeading
          label="02 / SELECTED PROJECTS"
          title="Work that shows how I think."
          description="A few highlighted builds and security projects. The full page contains the rest."
          actionHref="#/projects"
          actionText="View all projects"
        />

        {loading && <p className="muted">Loading projects...</p>}
        {error && <p className="error">{error}</p>}

        {!loading && !error && (
          <div className="project-showcase">
            {selectedProjects[0] && (
              <article className="project-featured">
                <div className="project-topline">
                  <span>FEATURED</span>
                  <span>{selectedProjects[0].category}</span>
                </div>
                <h3>{selectedProjects[0].title}</h3>
                <p>{selectedProjects[0].description}</p>
                <div className="tag-row">
                  {selectedProjects[0].technologies.map((technology) => (
                    <span key={technology}>{technology}</span>
                  ))}
                </div>
              </article>
            )}

            <div className="project-secondary">
              {selectedProjects.slice(1, 3).map((project, index) => (
                <article className="project-mini" key={project.id}>
                  <span className="mini-index">0{index + 2}</span>
                  <div>
                    <div className="mini-meta">{project.category}</div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        )}
      </section>

      <section id="education" className="section-block reveal">
        <SectionHeading
          label="03 / EDUCATION"
          title="Academic foundation."
        />

        <article className="education-editorial">
          <div className="education-year">
            <span>UNDERGRADUATE</span>
            <strong>FINAL YEAR</strong>
          </div>

          <div className="education-main">
            <h3>BSc (Hons) Ethical Hacking & Cybersecurity</h3>
            <p className="education-place">Softwarica College • Coventry University</p>
            <p>
              Undergraduate study across offensive security, defensive security,
              digital forensics, networking and secure systems.
            </p>
          </div>

          <div className="education-mark">
            <span>01</span>
            <div className="education-line" />
          </div>
        </article>
      </section>

      <section id="credentials" className="section-block reveal">
        <SectionHeading
          label="04 / CREDENTIALS + HACKTIVITY"
          title="Credentials backed by activity."
          description="Certifications on the left, recent security signals on the right."
          actionHref="#/hacktivity"
          actionText="View all activity"
        />

        <div className="credentials-grid">
          <div className="certification-column">
            <div className="column-heading">
              <span>CERTIFICATIONS</span>
              <a href="#/certifications">View all →</a>
            </div>

            <div className="cert-stack">
              {certifications.slice(0, 3).map((certification, index) => (
                <article className="cert-card" key={certification.id}>
                  <div className="cert-number">0{index + 1}</div>
                  <div className="cert-body">
                    <span className="cert-issuer">{certification.issuer}</span>
                    <h3>{certification.name}</h3>
                    <p>{certification.description}</p>
                  </div>
                  <span className={`cert-status ${certification.status === "In Progress" ? "progress" : ""}`}>
                    {certification.status || "Achieved"}
                  </span>
                </article>
              ))}
            </div>
          </div>

          <HacktivityTimeline activity={activity} />
        </div>
      </section>

      <section id="writing" className="section-block reveal">
        <SectionHeading
          label="05 / WRITING"
          title="Field notes & research."
          actionHref="#/writing"
          actionText="View all writing"
        />

        <div className="writing-strip">
          {writingItems.slice(0, 3).map((item) => (
            <article className="writing-tile" key={item.title}>
              <div className="writing-meta">
                <span>{item.tag}</span>
                <span>{item.status}</span>
              </div>
              <h3>{item.title}</h3>
              <p>{item.summary}</p>
              <span className="coming-soon">OPEN NOTE →</span>
            </article>
          ))}
        </div>
      </section>

      <section id="contact" className="section-block contact-block reveal">
        <SectionHeading
          label="06 / CONTACT"
          title="Let&apos;s connect."
          description="Open to cybersecurity opportunities, practical collaboration and technical conversations."
        />

        <div className="contact-layout">
          <div className="contact-info">
            <ProfileLinks />
          </div>

          <form className="contact-form" onSubmit={handleSubmit}>
            <div className="field-row">
              <label>
                <span>Name</span>
                <input name="name" value={formData.name} onChange={handleChange} required />
              </label>
              <label>
                <span>Email</span>
                <input name="email" type="email" value={formData.email} onChange={handleChange} required />
              </label>
            </div>

            <label>
              <span>Message</span>
              <textarea name="message" value={formData.message} onChange={handleChange} required />
            </label>

            <div className="form-footer">
              <button type="submit">Send message ↗</button>
              {formStatus && <p>{formStatus}</p>}
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}

function PageShell({ eyebrow, title, intro, children }) {
  return (
    <main className="page-shell inner-page">
      <div className="page-motif" aria-hidden="true">
        <span />
        <span />
        <span />
      </div>

      <a href="#/home" className="back-link">← Back home</a>

      <header className="inner-header">
        <p className="section-label">{eyebrow}</p>
        <h1>{title}</h1>
        {intro && <p>{intro}</p>}
      </header>

      {children}
    </main>
  );
}

function ProjectsPage({ projects }) {
  return (
    <PageShell
      eyebrow="PROJECTS"
      title="Selected work."
      intro="Security, development and infrastructure work presented as concise project records."
    >
      <div className="index-list">
        {projects.map((project, index) => (
          <article className="index-row" key={project.id}>
            <span className="index-number">0{index + 1}</span>
            <div>
              <div className="mini-meta">{project.category}</div>
              <h2>{project.title}</h2>
              <p>{project.description}</p>
              <div className="tag-row">
                {project.technologies.map((tag) => <span key={tag}>{tag}</span>)}
              </div>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function HacktivityPage({ achievements }) {
  const activity = useMemo(() => [
    ...achievements.map((item) => ({
      year: "2026",
      title: item.title,
      type: "CTF / ACHIEVEMENT",
      description: item.description,
    })),
    ...extraActivity,
  ], [achievements]);

  return (
    <PageShell
      eyebrow="HACKTIVITY"
      title="Security activity."
      intro="CTFs, labs, security research milestones and practical work."
    >
      <HacktivityTimeline activity={activity} full />
    </PageShell>
  );
}

function CertificationsPage({ certifications }) {
  return (
    <PageShell
      eyebrow="CERTIFICATIONS"
      title="Credentials."
      intro="Certifications and current learning milestones."
    >
      <div className="cert-page-list">
        {certifications.map((certification, index) => (
          <article className="cert-page-row" key={certification.id}>
            <span className="index-number">0{index + 1}</span>
            <div>
              <div className="mini-meta">{certification.issuer}</div>
              <h2>{certification.name}</h2>
              <p>{certification.description}</p>
            </div>
            <span className={`cert-status ${certification.status === "In Progress" ? "progress" : ""}`}>
              {certification.status || "Achieved"}
            </span>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function WritingPage() {
  return (
    <PageShell
      eyebrow="WRITING"
      title="Field notes & research."
      intro="Short technical notes built from labs, coursework, development and security research."
    >
      <div className="index-list">
        {writingItems.map((item, index) => (
          <article className="index-row" key={item.title}>
            <span className="index-number">0{index + 1}</span>
            <div>
              <div className="mini-meta">{item.tag} • {item.status}</div>
              <h2>{item.title}</h2>
              <p>{item.summary}</p>
            </div>
          </article>
        ))}
      </div>
    </PageShell>
  );
}

function ContactPage({ formData, setFormData, formStatus, handleSubmit }) {
  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  return (
    <PageShell
      eyebrow="CONTACT"
      title="Let&apos;s connect."
      intro="Open to cybersecurity opportunities, collaboration and technical conversations."
    >
      <div className="contact-layout">
        <div className="contact-info">
          <ProfileLinks />
        </div>

        <form className="contact-form" onSubmit={handleSubmit}>
          <div className="field-row">
            <label>
              <span>Name</span>
              <input name="name" value={formData.name} onChange={handleChange} required />
            </label>
            <label>
              <span>Email</span>
              <input name="email" type="email" value={formData.email} onChange={handleChange} required />
            </label>
          </div>

          <label>
            <span>Message</span>
            <textarea name="message" value={formData.message} onChange={handleChange} required />
          </label>

          <div className="form-footer">
            <button type="submit">Send message ↗</button>
            {formStatus && <p>{formStatus}</p>}
          </div>
        </form>
      </div>
    </PageShell>
  );
}

function App() {
  const route = useHashRoute();

  const [theme, setTheme] = useState(() => {
    try {
      return localStorage.getItem("portfolio-theme-v2") || "dark";
    } catch {
      return "dark";
    }
  });

  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ name: "", email: "", message: "" });
  const [formStatus, setFormStatus] = useState("");

  const [showIntro, setShowIntro] = useState(() => {
    try {
      return sessionStorage.getItem("portfolio-intro-seen") !== "1";
    } catch {
      return true;
    }
  });

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    try {
      localStorage.setItem("portfolio-theme-v2", theme);
    } catch {
      // Ignore storage restrictions.
    }
  }, [theme]);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [projectResponse, certificationResponse, achievementResponse] =
          await Promise.all([
            getProjects(),
            getCertifications(),
            getAchievements(),
          ]);

        setProjects(projectResponse.data);
        setCertifications(certificationResponse.data);
        setAchievements(achievementResponse.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 },
    );

    document.querySelectorAll(".reveal").forEach((element) => observer.observe(element));
    return () => observer.disconnect();
  }, [route, loading]);

  useEffect(() => {
    document.body.classList.toggle("intro-open", showIntro);
    return () => document.body.classList.remove("intro-open");
  }, [showIntro]);

  const closeIntro = () => {
    try {
      sessionStorage.setItem("portfolio-intro-seen", "1");
    } catch {
      // Continue without session storage.
    }
    setShowIntro(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      setFormStatus("Sending...");
      const response = await sendContactMessage(formData);
      setFormStatus(response.message);
      setFormData({ name: "", email: "", message: "" });
    } catch (err) {
      setFormStatus(err.message);
    }
  };

  let content;

  switch (route) {
    case "projects":
      content = <ProjectsPage projects={projects} />;
      break;
    case "hacktivity":
      content = <HacktivityPage achievements={achievements} />;
      break;
    case "certifications":
      content = <CertificationsPage certifications={certifications} />;
      break;
    case "writing":
      content = <WritingPage />;
      break;
    case "contact":
      content = (
        <ContactPage
          formData={formData}
          setFormData={setFormData}
          formStatus={formStatus}
          handleSubmit={handleSubmit}
        />
      );
      break;
    default:
      content = (
        <Home
          projects={projects}
          certifications={certifications}
          achievements={achievements}
          loading={loading}
          error={error}
          formData={formData}
          setFormData={setFormData}
          formStatus={formStatus}
          handleSubmit={handleSubmit}
        />
      );
  }

  return (
    <>
      {showIntro && <IntroScreen onDone={closeIntro} />}

      <AmbientScene route={route} />

      <Header
        theme={theme}
        onThemeToggle={() => setTheme((value) => (value === "dark" ? "light" : "dark"))}
      />

      <div key={route} className={`route-stage route-${route}`}>
        {content}
      </div>

      <footer className="page-shell">
        <div>
          <strong>SANJAY SHRESTHA</strong>
          <span>Cybersecurity • Development • DevOps</span>
        </div>
        <p>© 2026</p>
      </footer>
    </>
  );
}

export default App;
