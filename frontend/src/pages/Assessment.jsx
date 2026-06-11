import { useEffect, useState } from "react";
import { getQuestions } from "../services/questionService";

export default function Assessment() {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    async function loadQuestions() {
      try {
        const data = await getQuestions();
        setQuestions(data);
      } catch (err) {
        console.error(err);
      }
    }

    loadQuestions();
  }, []);

  const handleSelect = (questionId, optionId) => {
    setAnswers({
      ...answers,
      [questionId]: optionId,
    });
  };

  if (!questions.length) {
    return <h2>Loading...</h2>;
  }

  const question = questions[currentQuestion];

  return (
    <div style={{ padding: "20px" }}>
      <h2>
        Question {currentQuestion + 1} of {questions.length}
      </h2>

      <h3>{question.question_text}</h3>

      {question.question_options.map((option) => (
        <div key={option.id}>
          <label>
            <input
              type="radio"
              name={`question-${question.id}`}
              checked={answers[question.id] === option.id}
              onChange={() =>
                handleSelect(question.id, option.id)
              }
            />

            {option.option_text}
          </label>
        </div>
      ))}

      <br />

      {currentQuestion > 0 && (
        <button
          onClick={() =>
            setCurrentQuestion(currentQuestion - 1)
          }
        >
          Previous
        </button>
      )}

      <button
        onClick={() =>
          setCurrentQuestion(currentQuestion + 1)
        }
        disabled={currentQuestion === questions.length - 1}
      >
        Next
      </button>

      {currentQuestion === questions.length - 1 && (
        <button
          onClick={() => console.log(answers)}
        >
          Submit
        </button>
      )}
    </div>
  );
}