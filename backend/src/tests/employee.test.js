const request = require("supertest");

// Mock auth middleware to bypass token verification during tests
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: 1, role: "admin" };
  next();
});

const app = require("../../server");
const employeeService = require("../services/employeeService");

jest.mock("../services/employeeService");

describe("Employee APIs Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("GET /api/v1/employees", () => {
    it("should list employees with pagination metadata", async () => {
      employeeService.listEmployees.mockResolvedValue({
        data: [{ id: 1, name: "Alice", designation: "Engineer" }],
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });

      const res = await request(app).get("/api/v1/employees?page=1&limit=20");

      expect(res.statusCode).toBe(200);
      expect(res.body.total).toBe(1);
      expect(res.body.data[0].name).toBe("Alice");
    });
  });

  describe("POST /api/v1/employees", () => {
    it("should fail validation if user_id or department_id is missing", async () => {
      const res = await request(app)
        .post("/api/v1/employees")
        .send({ phone: "1234567", designation: "HR Analyst" }); // missing fields

      expect(res.statusCode).toBe(422);
    });

    it("should create employee when payload is valid", async () => {
      employeeService.createEmployee.mockResolvedValue({
        id: 1,
        user_id: 2,
        department_id: 3,
        phone: "1234567890",
        designation: "HR Analyst",
        salary: 45000.0,
      });

      const res = await request(app)
        .post("/api/v1/employees")
        .send({
          user_id: 2,
          department_id: 3,
          phone: "1234567890",
          designation: "HR Analyst",
          salary: 45000.0,
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.designation).toBe("HR Analyst");
    });
  });
});
