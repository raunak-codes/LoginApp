const leaveRepository = require("../repositories/leaveRepository");
const emailService = require("./emailService");
const { NotFoundError, BadRequestError } = require("../utils/errors");
const logger = require("../utils/logger");

const leaveService = {
  listTypes: async () => {
    return await leaveRepository.findTypes();
  },

  applyLeave: async ({ employee_id, leave_type_id, from_date, to_date, reason }) => {
    const from = new Date(from_date);
    const to = new Date(to_date);

    if (isNaN(from.getTime()) || isNaN(to.getTime())) {
      throw new BadRequestError("Invalid date format");
    }

    const total_days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;
    if (total_days <= 0) {
      throw new BadRequestError("'to_date' must be after or equal to 'from_date'");
    }

    return await leaveRepository.createApplication({
      employee_id,
      leave_type_id,
      from_date,
      to_date,
      total_days,
      reason,
    });
  },

  listMyLeaves: async (employee_id) => {
    return await leaveRepository.findByEmployee(employee_id);
  },

  listPendingLeaves: async () => {
    return await leaveRepository.findPending();
  },

  approveLeave: async (id, approved_by, remarks) => {
    const leave = await leaveRepository.findById(id);
    if (!leave) {
      throw new NotFoundError(`Leave request ${id} not found`);
    }
    if (leave.status !== "pending") {
      throw new BadRequestError(`Leave request ${id} is already ${leave.status}`);
    }

    const updatedLeave = await leaveRepository.approve(id, approved_by, remarks);

    // Send status email in background
    emailService
      .sendLeaveStatusEmail(
        leave.employee_email,
        leave.employee_name,
        leave.leave_name,
        leave.from_date,
        leave.to_date,
        "approved",
        remarks
      )
      .catch((err) => logger.error(`Failed to send leave approval email: ${err.message}`));

    return updatedLeave;
  },

  rejectLeave: async (id, rejected_by, remarks) => {
    const leave = await leaveRepository.findById(id);
    if (!leave) {
      throw new NotFoundError(`Leave request ${id} not found`);
    }
    if (leave.status !== "pending") {
      throw new BadRequestError(`Leave request ${id} is already ${leave.status}`);
    }

    const updatedLeave = await leaveRepository.reject(id, rejected_by, remarks);

    // Send status email in background
    emailService
      .sendLeaveStatusEmail(
        leave.employee_email,
        leave.employee_name,
        leave.leave_name,
        leave.from_date,
        leave.to_date,
        "rejected",
        remarks
      )
      .catch((err) => logger.error(`Failed to send leave rejection email: ${err.message}`));

    return updatedLeave;
  },
};

module.exports = leaveService;
