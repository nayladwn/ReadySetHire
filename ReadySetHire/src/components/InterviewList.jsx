import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  getInterviews,
  deleteInterview,
  updateInterview,
  getQuestions,
  getApplicants,
} from "../data/api.js";
import AddInterview from "./AddInterview";
import Loading from "../components/Loading";

/**
 * InterviewList page.
 *
 * Displays all interviews and allows management:
 * - Fetches interviews and counts of related applicants/questions.
 * - Supports adding/editing/deleting interviews.
 * - Provides navigation to interview details (questions & applicants).
 */
function InterviewList() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);

  /**
   * Fetches all interviews and their associated question/applicant counts.
   */
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getInterviews();
        const interviewsWithCounts = await Promise.all(
          data.map(async (intv) => {
            const [qs, apps] = await Promise.all([
              getQuestions(intv.id),
              getApplicants(intv.id),
            ]);
            return {
              ...intv,
              questionCount: qs.length,
              applicantCount: apps.length,
            };
          })
        );
        setInterviews(interviewsWithCounts);
      } catch (err) {
        console.error("Failed to load interviews:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  /**
   * Deletes an interview.
   *
   * @param {number} id - Interview ID.
   */
  async function handleDelete(id) {
    if (!window.confirm("Are you sure you want to delete this interview?")) return;
    try {
      await deleteInterview(id);
      setInterviews((prev) => prev.filter((i) => String(i.id) !== String(id)));
    } catch (err) {
      console.error("Failed to delete interview:", err);
    }
  }

  /**
   * Enables edit mode for an interview.
   *
   * @param {Object} interview - Interview object.
   */
  function handleEdit(interview) {
    setEditId(interview.id);
    setShowForm(true);
  }

  /**
   * Saves updates to an interview.
   *
   * @param {Object} updatedForm - Updated interview data.
   */
  async function handleSaveEdit(updatedForm) {
    try {
      const updated = await updateInterview(editId, updatedForm);
      setInterviews((prev) =>
        prev.map((i) =>
          i.id === editId
            ? { ...updated[0], questionCount: i.questionCount, applicantCount: i.applicantCount }
            : i
        )
      );
      setEditId(null);
      setShowForm(false);
    } catch (err) {
      console.error("Failed to update interview:", err);
    }
  }

  if (loading) return <Loading message="Loading interviews…" />;


  return (
    <div>
      <h1 className="mb-4">Interviews</h1>
      <p className="text-muted">Manage your interview campaigns</p>

      {!showForm && (
        <button className="btn btn-success mb-3" onClick={() => setShowForm(true)}>
          Add Interview
        </button>
      )}

      {showForm && (
        <AddInterview
          onCreated={(newInterview) =>
            setInterviews([...interviews, { ...newInterview, questionCount: 0, applicantCount: 0 }])
          }
          onCancel={() => {
            setShowForm(false);
            setEditId(null);
          }}
          editData={editId ? interviews.find((i) => i.id === editId) : null}
          onSaveEdit={handleSaveEdit}
        />
      )}

      {interviews.map((interview) => (
        <div key={interview.id} className="card mb-3 shadow-sm">
          <div className="card-body">
            <div className="d-flex justify-content-between align-items-center mb-2">
              <h5 className="card-title mb-0">{interview.title}</h5>
              <span className="badge bg-primary">{interview.status}</span>
            </div>
            <p className="text-secondary mb-1">{interview.job_role}</p>
            <p className="small text-muted">{interview.description}</p>

            <div className="d-flex justify-content-between align-items-center">
              <div>
                <Link
                  to={`/interviews/${interview.id}/questions`}
                  className="btn btn-sm btn-outline-primary me-2"
                >
                  View Questions ({interview.questionCount})
                </Link>
                <Link
                  to={`/interviews/${interview.id}/applicants`}
                  className="btn btn-sm btn-outline-secondary"
                >
                  View Applicants ({interview.applicantCount})
                </Link>
              </div>

              <div>
                <button
                  className="btn btn-sm btn-outline-warning me-2"
                  onClick={() => handleEdit(interview)}
                >
                  Edit
                </button>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(interview.id)}
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default InterviewList;
