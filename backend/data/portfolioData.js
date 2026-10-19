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
      "A full-stack React and Express portfolio containerised with Docker Compose, continuously validated with GitHub Actions and deployed to an Ubuntu server through Cloudflare Tunnel.",
    technologies: ["React", "Node.js", "Docker", "GitHub Actions", "Cloudflare"],
    featured: true,
  },
];

const certifications = [
  {
    id: 1,
    name: "eJPT",
    issuer: "INE Security",
    description: "Junior penetration testing certification.",
    status: "Achieved",
  },
  {
    id: 2,
    name: "CPTS",
    issuer: "Hack The Box Academy",
    description: "Hands-on penetration testing learning path and certification preparation.",
    status: "In Progress",
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
