const profileRepository = require("../../repositories/profileRepository");
const assessmentRepository = require("../../repositories/assessmentRepository");
const roleRepository = require("../../repositories/roleRepository");
const { parsePagination, buildPaginationMeta } = require("../../utils/pagination");

async function listStudents(query) {
  const pagination = parsePagination(query);
  const { data, count } = await profileRepository.listStudents({ ...pagination, search: query.search });

  const userIds = data.map((student) => student.id);
  const sessionCounts = await assessmentRepository.countSessionsByUserIds(userIds);

  const students = data.map((student) => ({
    id: student.id,
    fullName: student.full_name,
    email: student.email,
    rollNumber: student.roll_number,
    branch: student.branch,
    passingYear: student.passing_year,
    sessions: sessionCounts[student.id] || { total: 0, completed: 0 },
  }));

  return { students, pagination: buildPaginationMeta(pagination, count) };
}

/**
 * Full profile for a single user, plus their primary role and assessment
 * session counts. Powers the admin "User Details" page.
 */
async function getStudentDetail(userId) {
  const profile = await profileRepository.getProfileById(userId);
  const [roles, sessionCounts] = await Promise.all([
    roleRepository.getRolesForUser(userId),
    assessmentRepository.countSessionsByUserIds([userId]),
  ]);

  return {
    id: profile.id,
    fullName: profile.full_name,
    email: profile.email,
    rollNumber: profile.roll_number,
    branch: profile.branch,
    passingYear: profile.passing_year,
    isActive: profile.is_active,
    createdAt: profile.created_at,
    role: roles[0]?.code ?? null,
    sessions: sessionCounts[userId] || { total: 0, completed: 0 },
  };
}

module.exports = { listStudents, getStudentDetail };
