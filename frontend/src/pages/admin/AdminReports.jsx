import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { listReports } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import "../../styles/Admin.css";

export default function AdminReports() {
  const [reports, setReports] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listReports({ page, pageSize: 20 });
        setReports(data.reports);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load reports");
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
          <h1>Reports</h1>
          <p>Generated assessment reports for all completed sessions.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      {loading ? (
        <div className="admin-loading">Loading reports…</div>
      ) : reports.length === 0 ? (
        <div className="admin-empty">No reports found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Student</th>
                <th>Email</th>
                <th>Personality Type</th>
                <th className="numeric">Confidence</th>
                <th className="numeric">Version</th>
                <th>Generated</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map((report) => (
                <tr key={report.id}>
                  <td>{report.student?.fullName || "—"}</td>
                  <td>{report.student?.email || "—"}</td>
                  <td>{report.personalityType?.name || "—"}</td>
                  <td className="numeric">{report.confidence != null ? Math.round(report.confidence) : "—"}</td>
                  <td className="numeric">{report.version}</td>
                  <td>{report.generatedAt ? new Date(report.generatedAt).toLocaleString() : "—"}</td>
                  <td>
                    <Link to={`/admin/sessions/${report.sessionId}`} className="admin-btn admin-btn--sm">
                      View
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
