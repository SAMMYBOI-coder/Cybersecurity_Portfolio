import { useEffect, useState } from "react";
import {
  getProjects,
  getCertifications,
  getAchievements,
  sendContactMessage,
} from "./services/api";

function App() {
  const [projects, setProjects] = useState([]);
  const [certifications, setCertifications] = useState([]);
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  });

  const [formStatus, setFormStatus] = useState("");

  useEffect(() => {
    const loadPortfolioData = async () => {
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

    loadPortfolioData();
  }, []);

  const handleChange = (event) => {
    setFormData({
      ...formData,
      [event.target.name]: event.target.value,
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      setFormStatus("Sending...");

      const response = await sendContactMessage(formData);

      setFormStatus(response.message);

      setFormData({
        name: "",
        email: "",
        message: "",
      });
    } catch (err) {
      setFormStatus(err.message);
    }
  };

  return (
    <>
      <header>
        <nav>
          <a href="#home" className="logo">
            SS
          </a>

          <div className="nav-links">
            <a href="#about">About</a>
            <a href="#skills">Skills</a>
            <a href="#projects">Projects</a>
            <a href="#certifications">Certifications</a>
            <a href="#achievements">Achievements</a>
            <a href="#contact">Contact</a>
          </div>
        </nav>
      </header>

      <main>
        <section id="home" className="hero">
          <p className="eyebrow">
            CYBERSECURITY • DEVELOPMENT • DEVOPS
          </p>

          <h1>
            Hi, I'm <span>Sanjay Shrestha.</span>
          </h1>

          <h2>Cybersecurity Student & Security Practitioner</h2>

          <p className="hero-description">
            I build, test and secure systems while developing practical skills
            across offensive security, web application security, networking and
            software development.
          </p>

          <div className="hero-actions">
            <a href="#projects" className="button primary">
              View Projects
            </a>

            <a href="#contact" className="button secondary">
              Contact Me
            </a>
          </div>
        </section>

        <section id="about">
          <p className="section-label">ABOUT</p>

          <h2>Building practical security skills through real projects.</h2>

          <p>
            I'm focused on cybersecurity with a strong interest in penetration
            testing, web application security, internal network security and
            security engineering. I use labs, CTFs and development projects to
            turn theory into practical experience.
          </p>
        </section>

        <section id="skills">
          <p className="section-label">SKILLS</p>
          <h2>Technologies & Areas</h2>

          <div className="skill-grid">
            <article>
              <h3>Offensive Security</h3>
              <p>Web Security • VAPT • Active Directory • Network Security</p>
            </article>

            <article>
              <h3>Security Tools</h3>
              <p>Burp Suite • Linux • Git • Networking Tools</p>
            </article>

            <article>
              <h3>Development</h3>
              <p>JavaScript • React • Node.js • Express • REST APIs</p>
            </article>

            <article>
              <h3>DevOps</h3>
              <p>Git • GitHub • CI/CD • Docker</p>
            </article>
          </div>
        </section>

        <section id="projects">
          <p className="section-label">PROJECTS</p>
          <h2>Selected Work</h2>

          {loading && <p>Loading projects...</p>}

          {error && <p className="error">{error}</p>}

          {!loading && !error && (
            <div className="project-grid">
              {projects.map((project) => (
                <article className="project-card" key={project.id}>
                  <p className="project-category">{project.category}</p>

                  <h3>{project.title}</h3>

                  <p>{project.description}</p>

                  <div className="technology-list">
                    {project.technologies.map((technology) => (
                      <span key={technology}>{technology}</span>
                    ))}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section id="certifications">
          <p className="section-label">CERTIFICATIONS</p>
          <h2>Certifications</h2>

          <div className="card-grid">
            {certifications.map((certification) => (
              <article className="info-card" key={certification.id}>
                <h3>{certification.name}</h3>
                <p>{certification.issuer}</p>
                <p>{certification.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="achievements">
          <p className="section-label">ACHIEVEMENTS</p>
          <h2>Highlights</h2>

          <div className="card-grid">
            {achievements.map((achievement) => (
              <article className="info-card" key={achievement.id}>
                <h3>{achievement.title}</h3>
                <p>{achievement.description}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="contact">
          <p className="section-label">CONTACT</p>
          <h2>Let's connect.</h2>

          <p>
            Interested in cybersecurity, collaboration or opportunities? Send
            me a message.
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="name"
              placeholder="Your name"
              value={formData.name}
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Your email"
              value={formData.email}
              onChange={handleChange}
              required
            />

            <textarea
              name="message"
              placeholder="Your message"
              value={formData.message}
              onChange={handleChange}
              required
            />

            <button type="submit">Send Message</button>

            {formStatus && <p>{formStatus}</p>}
          </form>
        </section>
      </main>

      <footer>
        <p>© 2026 Sanjay Shrestha</p>
        <p>Built with React + Express</p>
      </footer>
    </>
  );
}

export default App;
