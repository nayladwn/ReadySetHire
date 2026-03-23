import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { getApplicants, updateApplicant, deleteApplicant, getInterview } from "../data/api.js";
import AddApplicant from "./AddApplicant";
import Loading from "../components/Loading";

/**
 * Applicants management page.
 *
 * Displays and manages applicants for a given interview:
 * - Fetches applicants and interview data.
 * - Allows creating new applicants via `AddApplicant`.
 * - Supports editing and deleting applicants.
 * - Provides links to take the interview or view results.
 */
function Applicants() {
  const { id } = useParams();
  const [applicants, setApplicants] = useState([]);
  const [interviewName, setInterviewName] = useState("");
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);

  // The editing state
  const [editId, setEditId] = useState(null);
  const [editTitle, setEditTitle] = useState("Mr");
  const [editFirstname, setEditFirstname] = useState("");
  const [editSurname, setEditSurname] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editEmail, setEditEmail] = useState("");
  const [editStatus, setEditStatus] = useState("Not Started");

  /**
   * Fetches applicants and interview info when component mounts or `id` changes.
   */
  useEffect(() => {
    async function fetchData() {
      try {
        const [as, interviewData] = await Promise.all([getApplicants(id), getInterview(id)]);
        setApplicants(as);
        setInterviewName(interviewData[0]?.title || `Interview ${id}`);
      } catch (err) {
        console.error("Failed to fetch applicants:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [id]);

  /**
   * Returns the CSS badge class for a given applicant status.
   *
   * @param {string} status - Applicant's interview status.
   * @returns {string} - Bootstrap badge class.
   */
  function getStatusBadgeClass(status) {
    switch (status) {
      case "Completed":
        return "badge bg-primary";
      case "Not Started":
        return "badge bg-secondary";
      default:
        return "badge bg-light text-dark";
    }
  }

  /**
   * Deletes an applicant by ID.
   *
   * @param {number} applicantId - ID of the applicant to delete.
   */
  async function handleDelete(applicantId) {
    if (!window.confirm("Are you sure you want to delete this applicant?")) return;
    try {
      await deleteApplicant(applicantId);
      setApplicants((prev) => prev.filter((a) => String(a.id) !== String(applicantId)));
    } catch (err) {
      console.error("Failed to delete applicant:", err);
    }
  }

  /**
   * Puts an applicant into edit mode.
   *
   * @param {Object} applicant - Applicant object to edit.
   */
  function startEdit(applicant) {
    setEditId(applicant.id);
    setEditTitle(applicant.title);
    setEditFirstname(applicant.firstname);
    setEditSurname(applicant.surname);
    setEditPhone(applicant.phone_number || "");
    setEditEmail(applicant.email_address);
    setEditStatus(applicant.interview_status);
  }

  /**
   * Saves the edited applicant data.
   *
   * @param {number} applicantId - ID of the applicant being edited.
   */
  async function handleSaveEdit(applicantId) {
    try {
      const updated = await updateApplicant(applicantId, {
        title: editTitle,
        firstname: editFirstname,
        surname: editSurname,
        phone_number: editPhone,
        email_address: editEmail,
        interview_status: editStatus,
      });
      setApplicants((prev) => prev.map((a) => (a.id === applicantId ? updated[0] : a)));
      setEditId(null);
    } catch (err) {
      console.error("Failed to update applicant:", err);
    }
  } 

  if (loading) return <Loading message="Loading applicants…" />;

  return (
    <div>
      <Link to="/interviews" className="btn btn-link mb-3">
        &larr; Back to Interviews
      </Link>

      <h3>Applicants Management</h3>
      <p>
        Interview: <strong>{interviewName}</strong>
      </p>

      {showForm && (
        <AddApplicant
          interviewId={id}
          onCreated={(newApplicant) => setApplicants((prev) => [...prev, newApplicant])}
          onCancel={() => setShowForm(false)}
        />
      )}

      <div className="d-flex justify-content-start mb-3">
        <button className="btn btn-success" onClick={() => setShowForm(!showForm)}>
          {showForm ? "Cancel" : "Add Applicant"}
        </button>
      </div>

      <table className="table table-bordered align-middle">
        <thead>
          <tr>
            <th>Name</th>
            <th>Phone</th>
            <th>Email</th>
            <th>Interview</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {applicants.length === 0 ? (
            <tr>
              <td colSpan="6" className="text-center">
                No applicants found.
              </td>
            </tr>
          ) : (
            applicants.map((a) => (
              <tr key={a.id}>
                <td>
                  {editId === a.id ? (
                    <>
                      <select
                        className="form-select mb-1"
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                      >
                        <option>Mr</option>
                        <option>Ms</option>
                        <option>Dr</option>
                      </select>
                      <input
                        type="text"
                        className="form-control mb-1"
                        value={editFirstname}
                        onChange={(e) => setEditFirstname(e.target.value)}
                      />
                      <input
                        type="text"
                        className="form-control"
                        value={editSurname}
                        onChange={(e) => setEditSurname(e.target.value)}
                      />
                    </>
                  ) : (
                    `${a.title} ${a.firstname} ${a.surname}`
                  )}
                </td>
                <td>
                  {editId === a.id ? (
                    <input
                      type="text"
                      className="form-control"
                      value={editPhone}
                      onChange={(e) => setEditPhone(e.target.value)}
                    />
                  ) : (
                    a.phone_number
                  )}
                </td>
                <td>
                  {editId === a.id ? (
                    <input
                      type="email"
                      className="form-control"
                      value={editEmail}
                      onChange={(e) => setEditEmail(e.target.value)}
                    />
                  ) : (
                    a.email_address
                  )}
                </td>
                <td>{interviewName}</td>
                <td>
                  {editId === a.id ? (
                    <select
                      className="form-select"
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="Completed">Completed</option>
                    </select>
                  ) : (
                    <span className={getStatusBadgeClass(a.interview_status)}>
                      {a.interview_status}
                    </span>
                  )}
                </td>
                <td>
                  {editId === a.id ? (
                    <div className="d-flex flex-column">
                      <button
                        className="btn btn-success mb-2"
                        onClick={() => handleSaveEdit(a.id)}
                      >
                        Save Changes
                      </button>
                      <button className="btn btn-secondary" onClick={() => setEditId(null)}>
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <>
                      <Link
                        to={`/applicants/${a.id}/take`}
                        className="btn btn-sm btn-outline-primary me-2"
                      >
                        🎥 Take Interview
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-success me-2"
                        onClick={() => {
                          const link = `${window.location.origin}/applicants/${a.id}/take`;
                          navigator.clipboard.writeText(link);
                          alert("Interview link copied to clipboard:\n" + link);
                        }}
                      >
                        🔗 Copy Link
                      </button>
                      <Link
                        to={`/results/${a.id}`}
                        className="btn btn-sm btn-outline-success me-2"
                      >
                        📊 Results
                      </Link>
                      <button
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEdit(a)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(a.id)}
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

export default Applicants;
