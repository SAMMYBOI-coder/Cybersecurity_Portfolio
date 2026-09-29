const { projects } = require("../data/portfolioData");

const getProjects = (req, res) => {
  res.status(200).json({
    success: true,
    count: projects.length,
    data: projects,
  });
};

const getProjectBySlug = (req, res) => {
  const project = projects.find(
    (item) => item.slug === req.params.slug
  );

  if (!project) {
    return res.status(404).json({
      success: false,
      message: "Project not found",
    });
  }

  res.status(200).json({
    success: true,
    data: project,
  });
};

module.exports = {
  getProjects,
  getProjectBySlug,
};
