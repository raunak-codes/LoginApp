const departmentRepository = require("../repositories/departmentRepository");
const cache = require("../utils/cache");

const DEPT_CACHE_KEY = "departments";

const departmentService = {
  listDepartments: async () => {
    let departments = cache.get(DEPT_CACHE_KEY);
    if (!departments) {
      departments = await departmentRepository.findAll();
      cache.set(DEPT_CACHE_KEY, departments, 3600); // cache for 1 hour
    }
    return departments;
  },

  createDepartment: async (name) => {
    const newDept = await departmentRepository.create(name);
    cache.del(DEPT_CACHE_KEY);
    return newDept;
  },
};

module.exports = departmentService;
