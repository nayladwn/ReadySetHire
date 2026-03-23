import { useState } from "react";
import { createQuestion } from "../data/api.js";

/**
 * AddQuestion form component.
 *
 * Allows adding a new question to a specific interview.
 * - Calls `onCreated` when a question is successfully created.
 * - Supports AI-powered question generation.
 *
 * @param {Object} props
 * @param {number} props.interviewId - The ID of the interview the question belongs to.
 * @param {Function} props.onCreated - Callback when a new question is created.
 */
function AddQuestion({ interviewId, onCreated }) {
  const [newQuestion, setNewQuestion] = useState("");
  const [newDifficulty, setNewDifficulty] = useState("Easy");
  const [submitting, setSubmitting] = useState(false);
  const [generating, setGenerating] = useState(false);

  /**
   * Handles manual submission of a new question.
   *
   * @param {Event} e - Form submission event.
   */
  async function handleAdd(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createQuestion({
        interview_id: interviewId,
        question: newQuestion,
        difficulty: newDifficulty,
      });
      onCreated(created[0]);
      setNewQuestion("");
      setNewDifficulty("Easy");
    } catch (err) {
      console.error("Failed to create question:", err);
    } finally {
      setSubmitting(false);
    }
  }

  /**
   * Uses the AI backend to generate a new interview question.
   * Updates the question input with the generated question.
   */
  async function handleGenerate() {
    setGenerating(true);
    try {
      const res = await fetch("http://localhost:3001/api/generate-question", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: "General Role" }),
      });
      const data = await res.json();
      if (data?.question) setNewQuestion(data.question);
    } catch {
      alert("Error generating question");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <form onSubmit={handleAdd} className="mb-4">
      <div className="row g-2 align-items-center">
        <div className="col-md-6">
          <div className="input-group input-group-sm">
            <input
              type="text"
              className="form-control"
              placeholder="Enter question"
              value={newQuestion}
              onChange={(e) => setNewQuestion(e.target.value)}
              required
            />
            <button
              type="button"
              className="btn rainbow-btn"
              onClick={handleGenerate}
              disabled={generating}
            >
              {generating ? "Generating…" : "✨ Generate"}
            </button>
          </div>
        </div>
        <div className="col-md-3">
          <select
            className="form-select form-select-sm"
            value={newDifficulty}
            onChange={(e) => setNewDifficulty(e.target.value)}
          >
            <option value="Easy">Easy</option>
            <option value="Intermediate">Intermediate</option>
            <option value="Advanced">Advanced</option>
          </select>
        </div>
        <div className="col-md-3">
          <button className="btn btn-primary btn-sm w-100" disabled={submitting}>
            {submitting ? "Adding…" : "+ Add Question"}
          </button>
        </div>
      </div>
    </form>
  );
}

export default AddQuestion;
