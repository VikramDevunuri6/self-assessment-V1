export default function AnswerSheetTab({ data }) {
  if (!data) return null;

  if (data.items.length === 0) {
    return <div className="admin-empty">No questions found</div>;
  }

  return (
    <div className="admin-table-wrap">
      <table className="admin-table">
        <thead>
          <tr>
            <th>#</th>
            <th className="wrap">Question</th>
            <th>Category</th>
            <th>Trait</th>
            <th className="wrap">Selected Answer</th>
            <th className="numeric">Score</th>
          </tr>
        </thead>
        <tbody>
          {data.items.map((item, index) => (
            <tr key={item.questionId}>
              <td>{index + 1}</td>
              <td className="wrap">{item.questionText}</td>
              <td>{item.category?.name || "—"}</td>
              <td>{item.trait?.name || "—"}</td>
              <td className="wrap">{item.selectedOption?.text || "—"}</td>
              <td className="numeric">{item.selectedOption ? item.selectedOption.score : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
