const request = require("supertest");
const app = require("../../server");
const authService = require("../services/authService");

jest.mock("../services/authService");

describe("Auth APIs Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/auth/login", () => {
    it("should login successfully with valid email and password", async () => {
      authService.login.mockResolvedValue({
        token: "jwt_token_example",
        user: { id: 10, name: "Admin Test", email: "admin@test.com", role: "admin" },
      });

      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "admin@test.com", password: "password" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Login Success");
      expect(res.body.token).toBe("jwt_token_example");
      expect(res.body.user.role).toBe("admin");
    });

    it("should fail validation for malformed email", async () => {
      const res = await request(app)
        .post("/api/v1/auth/login")
        .send({ email: "not-an-email", password: "pw" });

      expect(res.statusCode).toBe(422); // mapped validation error code
      expect(res.body.error).toBe("Validation Error");
    });
  });

  describe("POST /api/v1/auth/signup", () => {
    it("should successfully register a new user", async () => {
      authService.signup.mockResolvedValue({
        id: 11,
        name: "New Employee",
        email: "new@employee.com",
        role: "employee",
      });

      const res = await request(app)
        .post("/api/v1/auth/signup")
        .send({
          name: "New Employee",
          email: "new@employee.com",
          password: "password123",
          role: "employee",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.message).toBe("User Registered");
      expect(res.body.user.email).toBe("new@employee.com");
    });
  });
});
