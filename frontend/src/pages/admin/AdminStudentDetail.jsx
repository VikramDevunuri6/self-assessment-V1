import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { getStudent, listSessions } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import StatusBadge from "../../components/admin/StatusBadge";
import { ROLE_LABELS } from "../../constants/roles";
import "../../styles/Admin.css";

export default function AdminStudentDetail() {
  const { userId } = useParams();

  const [student, setStudent] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const [studentData, sessionData] = await Promise.all([
          getStudent(userId),
          listSessions({ userId, page, pageSize: 20 }),
        ]);
        setStudent(studentData);
        setSessions(sessionData.sessions);
        setPagination(sessionData.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load student");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [userId, page]);

  if (loading) {
    return <div className="admin-loading">Loading student…</div>;
  }

  if (error) {
    return <div className="admin-error">{error}</div>;
  }

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <Link to="/admin/students" className="admin-back-link">
            <ArrowLeft size={14} />
            <span>Back to Students</span>
          </Link>
          <h1>{student.fullName}</h1>
          <p>{student.email}</p>
        </div>
      </div>

      <div className="admin-grid">
        <div className="admin-card">
          <h3>Profile</h3>
          <dl className="admin-detail-grid">
            <div>
              <dt>Roll Number</dt>
              <dd>{student.rollNumber || "—"}</dd>
            </div>
            <div>
              <dt>Branch</dt>
              <dd>{student.branch || "—"}</dd>
            </div>
            <div>
              <dt>Passing Year</dt>
              <dd>{student.passingYear || "—"}</dd>
            </div>
            <div>
              <dt>Role</dt>
              <dd>{ROLE_LABELS[student.role] || student.role || "—"}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <StatusBadge status={student.isActive ? "active" : "inactive"} />
              </dd>
            </div>
            <div>
              <dt>Joined</dt>
              <dd>{new Date(student.createdAt).toLocaleDateString()}</dd>
            </div>
          </dl>
        </div>

        <div className="admin-card">
          <h3>Assessment Activity</h3>
          <div className="admin-stat-grid admin-stat-grid--compact">
            <div className="admin-stat-card">
              <span className="stat-label">Total Sessions</span>
              <span className="stat-value">{student.sessions.total}</span>
            </div>
            <div className="admin-stat-card">
              <span className="stat-label">Completed</span>
              <span className="stat-value">{student.sessions.completed}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="admin-page-header">
        <div>
          <h2>Assessment History</h2>
          <p>All assessment sessions started by this student.</p>
        </div>
      </div>

      {sessions.length === 0 ? (
        <div className="admin-empty">No assessment sessions yet</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Status</th>
                <th>Started</th>
                <th>Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sessions.map((session) => (
                <tr key={session.id}>
                  <td>
                    <StatusBadge status={session.status} />
                  </td>
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
