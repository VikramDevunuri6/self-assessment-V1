export default function QuestionReviewTab({ data }) {
  if (!data) return null;

  if (data.items.length === 0) {
    return <div className="admin-empty">No questions found</div>;
  }

  return (
    <div className="admin-question-review">
      {data.items.map((item, index) => (
        <div key={item.questionId} className="admin-card admin-question-card">
          <div className="admin-question-card-header">
            <span className="admin-badge admin-badge--info">Q{index + 1}</span>
            {item.category && <span className="admin-badge admin-badge--muted">{item.category.name}</span>}
            {item.trait && <span className="admin-badge admin-badge--muted">{item.trait.name}</span>}
            {item.groupNo != null && <span className="admin-badge admin-badge--muted">Group {item.groupNo}</span>}
          </div>

          <p className="admin-question-text">{item.questionText}</p>

          <ul className="admin-option-list">
            {item.options.map((option) => {
              const isSelected = option.id === item.selectedOptionId;
              return (
                <li key={option.id} className={`admin-option-item ${isSelected ? "selected" : ""}`}>
                  <span>{option.text}</span>
                  <span className="admin-option-score">{option.score}</span>
                </li>
              );
            })}
          </ul>

          {!item.selectedOption && <p className="admin-question-unanswered">Not answered</p>}
        </div>
      ))}
    </div>
  );
}
