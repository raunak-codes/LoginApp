const request = require("supertest");

// Mock auth middleware to inject user details
jest.mock("../middleware/auth", () => (req, res, next) => {
  req.user = { id: 5, role: "employee" };
  next();
});

const app = require("../../server");
const leaveService = require("../services/leaveService");

jest.mock("../services/leaveService");

describe("Leave APIs Integration Tests", () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("POST /api/v1/leave/apply", () => {
    it("should apply for leave successfully with valid inputs", async () => {
      leaveService.applyLeave.mockResolvedValue({
        id: 100,
        employee_id: 5,
        leave_type_id: 1,
        from_date: "2026-06-15",
        to_date: "2026-06-17",
        total_days: 3,
        status: "pending",
      });

      const res = await request(app)
        .post("/api/v1/leave/apply")
        .send({
          leave_type_id: 1,
          from_date: "2026-06-15",
          to_date: "2026-06-17",
          reason: "Need rest",
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.total_days).toBe(3);
      expect(res.body.status).toBe("pending");
    });

    it("should fail validation if to_date is before from_date", async () => {
      const res = await request(app)
        .post("/api/v1/leave/apply")
        .send({
          leave_type_id: 1,
          from_date: "2026-06-17",
          to_date: "2026-06-15", // earlier than from_date
          reason: "Invalid dates",
        });

      expect(res.statusCode).toBe(422);
    });
  });

  describe("POST /api/v1/leave/:id/approve", () => {
    it("should approve leave request", async () => {
      leaveService.approveLeave.mockResolvedValue({
        id: 100,
        status: "approved",
      });

      const res = await request(app)
        .post("/api/v1/leave/100/approve")
        .send({ remarks: "Approved by Admin" });

      expect(res.statusCode).toBe(200);
      expect(res.body.message).toBe("Leave approved");
    });
  });
});
