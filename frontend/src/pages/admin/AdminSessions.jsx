import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listSessions } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import StatusBadge from "../../components/admin/StatusBadge";
import "../../styles/Admin.css";

const STATUS_OPTIONS = [
  { value: "", label: "All statuses" },
  { value: "in_progress", label: "In Progress" },
  { value: "completed", label: "Completed" },
];

export default function AdminSessions() {
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listSessions({ page, pageSize: 20, status: status || undefined });
        setSessions(data.sessions);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load sessions");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, status]);

  const handleStatusChange = (e) => {
    setPage(1);
    setStatus(e.target.value);
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Sessions</h1>
          <p>Track assessment sessions across all students.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <div className="admin-toolbar">
        <select className="admin-select" value={status} onChange={handleStatusChange}>
          {STATUS_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="admin-loading">Loading sessions…</div>
      ) : sessions.length === 0 ? (
        <div className="admin-empty">No sessions found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Status</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>{session.student?.fullName || "—"}</td>
                  <td>{session.student?.email || "—"}</td>
                  <td><StatusBadge status={session.status} /></td>
                  <td>{session.startedAt ? new Date(session.startedAt).toLocaleString() : "—"}</td>
                  <td>{session.completedAt ? new Date(session.completedAt).toLocaleString() : "—"}</td>
                  <td>
                    <Link to={`/admin/sessions/${session.id}`} className="admin-btn admin-btn--sm">
                      View Details
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <Pagination pagination={pagination} onPageChange={setPage} />
        </div>
      )}
    </div>
  );
}
