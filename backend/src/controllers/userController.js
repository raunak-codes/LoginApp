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
};

module.exports = userController;
