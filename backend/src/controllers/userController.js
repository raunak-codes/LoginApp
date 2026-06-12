const userService = require("../services/userService");

const userController = {
  getProfile: async (req, res, next) => {
    try {
      const profile = await userService.getProfile(req.user.id);
      res.json(profile);
    } catch (err) {
      next(err);
    }
  },

  getAllUsers: async (req, res, next) => {
    try {
      const users = await userService.getAllUsers();
      res.json(users);
    } catch (err) {
      next(err);
    }
  },

  updateUserRole: async (req, res, next) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const updatedUser = await userService.updateUserRole(id, role);
      res.json({ message: "User role updated successfully", user: updatedUser });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = userController;
