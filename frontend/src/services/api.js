const API_URL = "http://localhost:5000/api";

export const getProjects = async () => {
  const response = await fetch(`${API_URL}/projects`);

  if (!response.ok) {
    throw new Error("Failed to fetch projects");
  }

  return response.json();
};

export const getCertifications = async () => {
  const response = await fetch(`${API_URL}/certifications`);

  if (!response.ok) {
    throw new Error("Failed to fetch certifications");
  }

  return response.json();
};

export const getAchievements = async () => {
  const response = await fetch(`${API_URL}/achievements`);

  if (!response.ok) {
    throw new Error("Failed to fetch achievements");
  }

  return response.json();
};

export const sendContactMessage = async (formData) => {
  const response = await fetch(`${API_URL}/contact`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(formData),
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.message || "Failed to send message");
  }

  return data;
};
