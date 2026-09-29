const { achievements } = require("../data/portfolioData");

const getAchievements = (req, res) => {
  res.status(200).json({
    success: true,
    count: achievements.length,
    data: achievements,
  });
};

module.exports = {
  getAchievements,
};
