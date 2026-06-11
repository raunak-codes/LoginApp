const authService = require("../services/authService");
const { signupSchema, loginSchema } = require("../validators/authValidator");

const authController = {
  signup: async (req, res, next) => {
    try {
      const { error, value } = signupSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      const user = await authService.signup(value);
      res.status(201).json({ message: "User Registered", user });
    } catch (err) {
      next(err);
    }
  },

  login: async (req, res, next) => {
    try {
      const { error, value } = loginSchema.validate(req.body, { abortEarly: false });
      if (error) return next(error);

      const ip = req.ip || req.connection.remoteAddress;
      const result = await authService.login({ ...value, ip });
      res.json({ message: "Login Success", ...result });
    } catch (err) {
      next(err);
    }
  },
};

module.exports = authController;
