const skillService = require("../services/skillService");

const skillController = {
  listSkills: async (req, res, next) => {
    try {
      const skills = await skillService.listSkills();
      res.json(skills);
    } catch (err) {
      next(err);
    }
  },

  createSkill: async (req, res, next) => {
    try {
      const { skill_name } = req.body;
      if (!skill_name || skill_name.trim().length < 2) {
        return res.status(400).json({ error: "Skill name must be at least 2 characters" });
      }
      const skill = await skillService.createSkill(skill_name);
      res.status(201).json(skill);
    } catch (err) {
      next(err);
    }
  },
};

module.exports = skillController;
