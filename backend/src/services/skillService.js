const skillRepository = require("../repositories/skillRepository");
const cache = require("../utils/cache");

const SKILLS_CACHE_KEY = "skills";

const skillService = {
  listSkills: async () => {
    let skills = cache.get(SKILLS_CACHE_KEY);
    if (!skills) {
      skills = await skillRepository.findAll();
      cache.set(SKILLS_CACHE_KEY, skills, 3600); // cache for 1 hour
    }
    return skills;
  },

  createSkill: async (name) => {
    const newSkill = await skillRepository.create(name);
    cache.del(SKILLS_CACHE_KEY);
    return newSkill;
  },
};

module.exports = skillService;
