import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";
import { listUsers, updateUserRole, setUserActive, deleteUser } from "../../services/adminService";
import { getUser } from "../../services/authService";
import Pagination from "../../components/admin/Pagination";
import StatusBadge from "../../components/admin/StatusBadge";
import CreateAdminModal from "../../components/admin/CreateAdminModal";
import { ROLES, ASSIGNABLE_ROLES, ROLE_LABELS } from "../../constants/roles";
import "../../styles/Admin.css";

export default function AdminUsers() {
  const currentUser = getUser();

  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listUsers({ page, pageSize: 20, search: search || undefined });
        setUsers(data.users);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load users");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, search, refreshKey]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleRoleChange = async (user, role) => {
    try {
      setError(null);
      await updateUserRole(user.id, role);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update role");
    }
  };

  const handleToggleActive = async (user) => {
    try {
      setError(null);
      await setUserActive(user.id, !user.isActive);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update account status");
    }
  };

  const handleDelete = async (user) => {
    if (!window.confirm(`Delete ${user.fullName}? This cannot be undone.`)) return;

    try {
      setError(null);
      await deleteUser(user.id);
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to delete user");
    }
  };

  const handleCreated = () => {
    setShowCreateModal(false);
    setRefreshKey((key) => key + 1);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>User Management</h1>
          <p>Create staff accounts, change roles, and enable or disable users.</p>
        </div>
        <button type="button" className="admin-btn admin-btn--primary" onClick={() => setShowCreateModal(true)}>
          <Plus size={14} />
          <span>Create Admin</span>
        </button>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-toolbar" onSubmit={handleSearchSubmit}>
        <input
          className="admin-input"
          placeholder="Search by name or email"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn--primary">
          <Search size={14} />
          <span>Search</span>
        </button>
      </form>

      {loading ? (
        <div className="admin-loading">Loading users…</div>
      ) : users.length === 0 ? (
        <div className="admin-empty">No users found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const isSelf = user.id === currentUser?.id;
                const isSuperAdmin = user.role === ROLES.SUPER_ADMIN;
                const locked = isSelf || isSuperAdmin;

                return (
                  <tr key={user.id}>
                    <td>{user.fullName}</td>
                    <td>{user.email}</td>
                    <td>
                      {locked ? (
                        ROLE_LABELS[user.role] || user.role
                      ) : (
                        <select
                          className="admin-select"
                          value={user.role}
                          onChange={(e) => handleRoleChange(user, e.target.value)}
                        >
                          {ASSIGNABLE_ROLES.map((roleOption) => (
                            <option key={roleOption} value={roleOption}>
                              {ROLE_LABELS[roleOption]}
                            </option>
                          ))}
                        </select>
                      )}
                    </td>
                    <td>
                      <StatusBadge status={user.isActive ? "active" : "inactive"} />
                    </td>
                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="admin-toolbar" style={{ marginBottom: 0 }}>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm"
                          onClick={() => handleToggleActive(user)}
                          disabled={locked}
                        >
                          {user.isActive ? "Disable" : "Enable"}
                        </button>
                        <button
                          type="button"
                          className="admin-btn admin-btn--sm admin-btn--danger"
                          onClick={() => handleDelete(user)}
                          disabled={locked}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}

      {showCreateModal && <CreateAdminModal onClose={() => setShowCreateModal(false)} onSaved={handleCreated} />}
    </div>
  );
}
