const express = require('express');
const router = express.Router();
const {
  createEmployee,
  getEmployees,
  getEmployeeById,
  updateEmployee,
  deleteEmployee
} = require('../controllers/employeeController');
const { protect } = require('../middleware/authMiddleware'); 

router.route('/')
  .post(protect, createEmployee)
  .get(protect, getEmployees);

router.route('/:id')
  .get(protect, getEmployeeById)
  .put(protect, updateEmployee)
  .delete(protect, deleteEmployee);

module.exports = router;