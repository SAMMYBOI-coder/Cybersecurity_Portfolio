const projects = [
  {
    id: 1,
    title: "Active Directory Security Lab",
    slug: "active-directory-security-lab",
    category: "Offensive Security",
    description:
      "A hands-on Active Directory lab focused on Windows domain environments, enumeration, authentication, privilege relationships and internal network security.",
    technologies: ["Windows Server", "Active Directory", "Linux", "Networking"],
    featured: true,
  },
  {
    id: 2,
    title: "Web Application Security Assessment",
    slug: "web-application-security-assessment",
    category: "Web Security",
    description:
      "An authorised black-box web application assessment involving reconnaissance, vulnerability validation, evidence collection and remediation-focused reporting.",
    technologies: ["Burp Suite", "HTTP", "REST APIs", "Web Security"],
    featured: true,
  },
  {
    id: 3,
    title: "Cybersecurity Portfolio Platform",
    slug: "cybersecurity-portfolio-platform",
    category: "Development / DevOps",
    description:
      "A full-stack portfolio platform built using React and Express, designed for future MongoDB integration, containerisation and CI/CD deployment.",
    technologies: ["React", "Node.js", "Express", "REST API"],
    featured: true,
  },
];

const certifications = [
  {
    id: 1,
    name: "eJPT",
    issuer: "INE Security",
    description: "Junior penetration testing certification.",
  },
];

const achievements = [
  {
    id: 1,
    title: "Hackastra CTF",
    description: "Ranked 11th among approximately 400 participants.",
  },
];

module.exports = {
  projects,
  certifications,
  achievements,
};
