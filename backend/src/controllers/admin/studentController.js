const studentService = require("../../services/admin/studentService");
const asyncHandler = require("../../utils/asyncHandler");

const listStudents = asyncHandler(async (req, res) => {
  const result = await studentService.listStudents(req.query);
  res.json(result);
});

const getStudent = asyncHandler(async (req, res) => {
  const result = await studentService.getStudentDetail(req.params.id);
  res.json(result);
});

module.exports = { listStudents, getStudent };
