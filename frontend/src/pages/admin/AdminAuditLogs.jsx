import { useEffect, useState } from "react";
import { listAuditLogs } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import "../../styles/Admin.css";

export default function AdminAuditLogs() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listAuditLogs({ page, pageSize: 20 });
        setLogs(data.logs);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load audit logs");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page]);

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Audit Logs</h1>
          <p>Track administrative actions across the platform.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading audit logs…</div>
      ) : logs.length === 0 ? (
        <div className="admin-empty">No audit logs yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Admin</th>
                <th>Action</th>
                <th>Entity</th>
                <th className="numeric">Entity ID</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {logs.map((log) => (
                <tr key={log.id}>
                  <td>{log.admin?.fullName || log.adminId}</td>
                  <td>{log.action}</td>
                  <td>{log.entityType}</td>
                  <td className="numeric">{log.entityId ?? "—"}</td>
                  <td>{new Date(log.createdAt).toLocaleString()}</td>
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
