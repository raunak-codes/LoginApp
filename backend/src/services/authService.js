const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const userRepository = require("../repositories/userRepository");
const logger = require("../utils/logger");
const emailService = require("./emailService");
const { BadRequestError, UnauthorizedError } = require("../utils/errors");
const { incrementFailedLogins } = require("../middleware/requestCounter");

const authService = {
  signup: async ({ name, email, password, role }) => {
    const userExist = await userRepository.findByEmail(email);
    if (userExist) {
      logger.logSecurity("Registration failed: Email already exists", { email });
      throw new BadRequestError("Email already exists");
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const validRoles = ["admin", "hr", "manager", "employee", "user"];
    const assignedRole = validRoles.includes(role) ? role : "user";

    const newUser = await userRepository.create({
      name,
      email,
      password: hashedPassword,
      role: assignedRole,
    });

    // Send welcome email in the background
    emailService.sendWelcomeEmail(email, name).catch((err) => {
      logger.error(`Failed to send welcome email to ${email}: ${err.message}`);
    });

    return newUser;
  },

  login: async ({ email, password, ip }) => {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      logger.logLogin(email, false, ip, { error: "User not found" });
      incrementFailedLogins();
      throw new UnauthorizedError("Invalid email or password");
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      logger.logLogin(email, false, ip, { error: "Wrong Password" });
      incrementFailedLogins();
      throw new UnauthorizedError("Invalid email or password");
    }

    // Success! Log the login
    logger.logLogin(email, true, ip);

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || "mysecretkey",
      { expiresIn: "1d" }
    );

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    };
  },
};

module.exports = authService;
