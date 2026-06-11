import { useEffect, useState } from "react";
import { getQuestions } from "../services/questionService";

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      const data = await getQuestions();

      console.log("QUESTIONS:", data);

      setQuestions(data || []);
    } catch (error) {
      console.error("ERROR:", error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <h2>Loading Questions...</h2>;
  }

  return (
    <div style={{ padding: "20px" }}>
      <h1>Assessment</h1>

      {questions.map((question) => (
        <div
          key={question.id}
          style={{
            border: "1px solid #ccc",
            padding: "15px",
            marginBottom: "15px",
          }}
        >
          <h3>{question.question_text}</h3>

          {question.question_options?.map((option) => (
            <div key={option.id}>
              <label>
                <input
                  type="radio"
                  name={`question-${question.id}`}
                />
                {option.option_text}
              </label>
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}