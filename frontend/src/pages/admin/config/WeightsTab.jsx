import { useEffect, useState } from "react";
import { listWeights, updateWeight } from "../../../services/adminService";

export default function WeightsTab() {
  const [weights, setWeights] = useState([]);
  const [edits, setEdits] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        setError(null);
        setWeights(await listWeights());
      } catch (err) {
        setError(err.response?.data?.error?.message || "Failed to load weights");
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [refreshKey]);

  const handleSave = async (id) => {
    try {
      setSavingId(id);
      setError(null);
      await updateWeight(id, Number(edits[id]));
      setRefreshKey((key) => key + 1);
    } catch (err) {
      setError(err.response?.data?.error?.message || "Failed to update weight");
    } finally {
      setSavingId(null);
    }
  };

  if (loading) {
    return <div className="admin-loading">Loading weights…</div>;
  }

  return (
    <div>
      {error && <div className="admin-error">{error}</div>}

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Trait</th>
              <th>Dimension</th>
              <th>Framework</th>
              <th className="numeric">Weight</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {weights.map((row) => (
              <tr key={row.id}>
                <td>{row.trait.name}</td>
                <td>{row.dimension.name} ({row.dimension.code})</td>
                <td>{row.dimension.framework}</td>
                <td className="numeric">
                  <input
                    className="admin-input"
                    type="number"
                    step="0.1"
                    value={edits[row.id] ?? row.weight}
                    onChange={(e) => setEdits({ ...edits, [row.id]: e.target.value })}
                  />
                </td>
                <td>
                  <button
                    type="button"
                    className="admin-btn admin-btn--sm admin-btn--primary"
                    disabled={savingId === row.id}
                    onClick={() => handleSave(row.id)}
                  >
                    {savingId === row.id ? "Saving…" : "Save"}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
