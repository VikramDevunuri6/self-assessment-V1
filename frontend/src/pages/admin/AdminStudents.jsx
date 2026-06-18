import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Search } from "lucide-react";
import { listStudents } from "../../services/adminService";
import Pagination from "../../components/admin/Pagination";
import "../../styles/Admin.css";

export default function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        const data = await listStudents({ page, pageSize: 20, search: search || undefined });
        setStudents(data.students);
        setPagination(data.pagination);
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load students");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [page, search]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput.trim());
  };

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Students</h1>
          <p>Browse registered students and their assessment activity.</p>
        </div>
      </div>

      {error && <div className="admin-error">{error}</div>}

      <form className="admin-toolbar" onSubmit={handleSearchSubmit}>
        <input
          className="admin-input"
          placeholder="Search by name, email or roll number"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <button type="submit" className="admin-btn admin-btn--primary">
          <Search size={14} />
          <span>Search</span>
        </button>
      </form>

      {loading ? (
        <div className="admin-loading">Loading students…</div>
      ) : students.length === 0 ? (
        <div className="admin-empty">No students found</div>
      ) : (
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email</th>
                <th>Roll Number</th>
                <th>Branch</th>
                <th>Passing Year</th>
                <th className="numeric">Sessions</th>
                <th className="numeric">Completed</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {students.map((student) => (
                <tr key={student.id}>
                  <td>{student.fullName}</td>
                  <td>{student.email}</td>
                  <td>{student.rollNumber || "—"}</td>
                  <td>{student.branch || "—"}</td>
                  <td>{student.passingYear || "—"}</td>
                  <td className="numeric">{student.sessions.total}</td>
                  <td className="numeric">{student.sessions.completed}</td>
                  <td>
                    <Link to={`/admin/students/${student.id}`} className="admin-btn admin-btn--sm">
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
