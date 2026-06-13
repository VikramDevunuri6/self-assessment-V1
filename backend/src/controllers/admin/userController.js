const userService = require("../../services/admin/userService");
const asyncHandler = require("../../utils/asyncHandler");

const listUsers = asyncHandler(async (req, res) => {
  const result = await userService.listUsers(req.query);
  res.json(result);
});

const createAdmin = asyncHandler(async (req, res) => {
  const user = await userService.createAdmin(req.body);
  res.locals.entityId = user.id;
  res.status(201).json({ user });
});

const changeRole = asyncHandler(async (req, res) => {
  const user = await userService.changeRole(req.user.userId, req.params.id, req.body.role);
  res.json({ user });
});

const enableUser = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.user.userId, req.params.id, true);
  res.json({ user });
});

const disableUser = asyncHandler(async (req, res) => {
  const user = await userService.setStatus(req.user.userId, req.params.id, false);
  res.json({ user });
});

const deleteUser = asyncHandler(async (req, res) => {
  await userService.deleteUser(req.user.userId, req.params.id);
  res.status(204).end();
});

module.exports = { listUsers, createAdmin, changeRole, enableUser, disableUser, deleteUser };
