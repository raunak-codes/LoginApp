const employeeRepository = require("../repositories/employeeRepository");
const { NotFoundError } = require("../utils/errors");

const employeeService = {
  listEmployees: async (query) => {
    // Standard pagination defaults
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 20;
    const { department_id, search, sortBy, sortOrder } = query;

    return await employeeRepository.findAll({
      page,
      limit,
      department_id,
      search,
      sortBy,
      sortOrder,
    });
  },

  getEmployee: async (id) => {
    const employee = await employeeRepository.findById(id);
    if (!employee) {
      throw new NotFoundError(`Employee with ID ${id} not found`);
    }
    return employee;
  },

  createEmployee: async (data) => {
    return await employeeRepository.create(data);
  },

  updateEmployee: async (id, data) => {
    // Check if exists
    await employeeService.getEmployee(id);
    return await employeeRepository.update(id, data);
  },

  deleteEmployee: async (id) => {
    // Check if exists
    await employeeService.getEmployee(id);
    return await employeeRepository.delete(id);
  },

  uploadImages: async (employee_id, imageUrls) => {
    // Check if employee exists
    await employeeService.getEmployee(employee_id);
    return await employeeRepository.addImages(employee_id, imageUrls);
  },

  getStats: async () => {
    return await employeeRepository.getStats();
  },
};

module.exports = employeeService;
