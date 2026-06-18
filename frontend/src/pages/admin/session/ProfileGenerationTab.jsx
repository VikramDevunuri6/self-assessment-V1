export default function ProfileGenerationTab({ data }) {
  if (!data) return null;

  const { personalityMatch } = data;
  const { matchedCode, evaluationOrder } = personalityMatch;

  return (
    <div className="admin-card admin-breakdown-section">
      <div className="admin-section-header">
        <h3>Personality Type Matching</h3>
        {matchedCode && <span className="admin-badge admin-badge--success">Matched: {matchedCode}</span>}
      </div>
      <p>
        Personality types are evaluated in priority order against the dimension scores above. The first type whose
        criteria are fully satisfied is selected; if none match, the lowest-priority type is used as a fallback.
      </p>

      {evaluationOrder.map((type, index) => {
        const isMatched = type.code === matchedCode;
        return (
          <div className={`admin-type-card ${isMatched ? "matched" : ""}`} key={type.code}>
            <div className="admin-type-card-header">
              <strong>
                {index + 1}. {type.name} ({type.code})
              </strong>
              <span className={`admin-badge admin-badge--${type.matched ? "success" : "muted"}`}>
                {type.matched ? "Criteria met" : "Criteria not met"}
              </span>
            </div>
            <p>Priority: {type.priority}</p>
            <details className="admin-report-section">
              <summary>Criteria</summary>
              <pre className="admin-json-preview">{JSON.stringify(type.criteria, null, 2)}</pre>
            </details>
          </div>
        );
      })}
    </div>
  );
}
