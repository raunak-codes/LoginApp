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

  getAllUsers: async () => {
    return await userRepository.findAll();
  },

  updateUserRole: async (id, role) => {
    const roles = await userService.getRoles();
    if (!roles.includes(role)) {
      const { BadRequestError } = require("../utils/errors");
      throw new BadRequestError("Invalid role");
    }
    const user = await userRepository.findById(id);
    if (!user) {
      throw new NotFoundError("User not found");
    }
    return await userRepository.updateRole(id, role);
  },
};

module.exports = userService;
