import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getQuestions, getInterview, deleteQuestion, updateQuestion } from "../data/api.js";
import AddQuestion from "./AddQuestion";
import Loading from "../components/Loading";

/**
 * Questions management page.
 *
 * Displays all questions for a specific interview:
 * - Fetches interview details and questions.
 * - Supports adding, editing, and deleting questions.
 */
function Questions() {
  const { id } = useParams();
  const [questions, setQuestions] = useState([]);
  const [interviewName, setInterviewName] = useState("");
  const [loading, setLoading] = useState(true);

  const [editId, setEditId] = useState(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editDifficulty, setEditDifficulty] = useState("Easy");

  /**
   * Fetches questions and interview data when component mounts or `id` changes.
   */
  useEffect(() => {
    async function fetchData() {
      try {
        const [qs, interviewData] = await Promise.all([getQuestions(id), getInterview(id)]);
        setQuestions(qs);
        setInterviewName(interviewData[0]?.title || `Interview ${id}`);
      } catch (err) {
        console.error("Failed to fetch data:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  /**
   * Deletes a question by ID.
   *
   * @param {number} questionId - ID of the question to delete.
   */
  async function handleDelete(questionId) {
    if (!window.confirm("Are you sure you want to delete this question?")) return;
    try {
      await deleteQuestion(questionId);
      setQuestions((prev) => prev.filter((q) => String(q.id) !== String(questionId)));
    } catch (err) {
      console.error("Failed to delete question:", err);
    }
  }

  /**
   * Enables edit mode for a question.
   *
   * @param {Object} question - Question object.
   */
  function startEdit(question) {
    setEditId(question.id);
    setEditQuestion(question.question);
    setEditDifficulty(question.difficulty);
  }

  /**
   * Saves updates to a question.
   *
   * @param {number} questionId - ID of the question being edited.
   */
  async function handleSaveEdit(questionId) {
    try {
      const updated = await updateQuestion(questionId, {
        question: editQuestion,
        difficulty: editDifficulty,
      });
      setQuestions((prev) => prev.map((q) => (q.id === questionId ? updated[0] : q)));
      setEditId(null);
    } catch (err) {
      console.error("Failed to update question:", err);
    }
  }

  /**
   * Returns the CSS badge class for difficulty levels.
   *
   * @param {string} difficulty - Difficulty level of the question.
   * @returns {string} - Bootstrap badge class.
   */
  function getBadgeClass(difficulty) {
    switch (difficulty) {
      case "Easy":
        return "badge bg-primary";
      case "Intermediate":
        return "badge bg-warning text-dark";
      case "Advanced":
        return "badge bg-danger";
      default:
        return "badge bg-secondary";
    }
  }

  if (loading) return <Loading message="Loading questions…" />;



  return (
    <div>
      <Link to="/interviews" className="btn btn-link mb-3">
        &larr; Back to Interviews
      </Link>

      <h3>Questions Management</h3>
      <p>
        Interview: <strong>{interviewName}</strong>
      </p>

      <AddQuestion
        interviewId={id}
        onCreated={(newQuestion) => setQuestions((prev) => [...prev, newQuestion])}
      />

      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>Question</th>
            <th>Interview</th>
            <th>Difficulty</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {questions.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No questions found.
              </td>
            </tr>
          ) : (
            questions.map((q) => (
              <tr key={q.id}>
                <td>
                  {editId === q.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editQuestion}
                      onChange={(e) => setEditQuestion(e.target.value)}
                    />
                  ) : (
                    q.question
                  )}
                </td>
                <td>{interviewName}</td>
                <td>
                  {editId === q.id ? (
                    <select
                      className="form-select"
                      value={editDifficulty}
                      onChange={(e) => setEditDifficulty(e.target.value)}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Intermediate">Intermediate</option>
                      <option value="Advanced">Advanced</option>
                    </select>
                  ) : (
                    <span className={getBadgeClass(q.difficulty)}>{q.difficulty}</span>
                  )}
                </td>
                <td>
                  {editId === q.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-success me-2"
                        onClick={() => handleSaveEdit(q.id)}
                      >
                        Save
                      </button>
                      <button className="btn btn-sm btn-secondary" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEdit(q)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(q.id)}
                      >
                        🗑️
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default Questions;
