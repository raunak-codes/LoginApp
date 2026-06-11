const userRepository = require("../repositories/userRepository");
const cache = require("../utils/cache");
const { NotFoundError } = require("../utils/errors");

const ROLES_CACHE_KEY = "roles";

const userService = {
  getProfile: async (id) => {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return user;
  },

  getRoles: async () => {
    let roles = cache.get(ROLES_CACHE_KEY);
    if (!roles) {
      roles = ["admin", "hr", "manager", "employee", "user"];
      cache.set(ROLES_CACHE_KEY, roles, 86400); // 24 hours
    }
    return roles;
  },
};

module.exports = userService;
