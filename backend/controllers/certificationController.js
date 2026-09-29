const { certifications } = require("../data/portfolioData");

const getCertifications = (req, res) => {
  res.status(200).json({
    success: true,
    count: certifications.length,
    data: certifications,
  });
};

module.exports = {
  getCertifications,
};
