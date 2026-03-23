import { useState } from "react";
import { createApplicant } from "../data/api.js";

/**
 * AddApplicant form component.
 *
 * Allows creating a new applicant for a given interview.
 * - Submits applicant details to the backend.
 * - Calls `onCreated` with the created applicant.
 * - Calls `onCancel` to close the form after submission.
 *
 * @param {Object} props
 * @param {number} props.interviewId - ID of the interview the applicant belongs to.
 * @param {Function} props.onCreated - Callback when applicant is successfully created.
 * @param {Function} props.onCancel - Callback to close the form after submit or cancel.
 */
function AddApplicant({ interviewId, onCreated, onCancel }) {
  const [newTitle, setNewTitle] = useState("Mr");
  const [newFirstname, setNewFirstname] = useState("");
  const [newSurname, setNewSurname] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newStatus, setNewStatus] = useState("Not Started");
  const [submitting, setSubmitting] = useState(false);

  /**
   * Handles submission of the Add Applicant form.
   * Creates a new applicant in the database and resets form fields.
   *
   * @param {Event} e - Form submission event.
   */
  async function handleAddApplicant(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const created = await createApplicant({
        interview_id: Number(interviewId),
        title: newTitle,
        firstname: newFirstname,
        surname: newSurname,
        phone_number: newPhone,
        email_address: newEmail,
        interview_status: newStatus,
      });
      onCreated(created[0]);
      // reset form
      setNewTitle("Mr");
      setNewFirstname("");
      setNewSurname("");
      setNewPhone("");
      setNewEmail("");
      setNewStatus("Not Started");
      onCancel?.();
    } catch (err) {
      console.error("Failed to create applicant:", err);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleAddApplicant} className="card p-4 mb-4">
      <h5 className="mb-3">Add New Applicant</h5>
      <select
        className="form-select mb-2"
        value={newTitle}
        onChange={(e) => setNewTitle(e.target.value)}
        required
      >
        <option value="Mr">Mr</option>
        <option value="Ms">Ms</option>
        <option value="Dr">Dr</option>
      </select>
      <input
        type="text"
        className="form-control mb-2"
        placeholder="First Name"
        value={newFirstname}
        onChange={(e) => setNewFirstname(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Surname"
        value={newSurname}
        onChange={(e) => setNewSurname(e.target.value)}
        required
      />
      <input
        type="email"
        className="form-control mb-2"
        placeholder="Email Address"
        value={newEmail}
        onChange={(e) => setNewEmail(e.target.value)}
        required
      />
      <input
        type="text"
        className="form-control mb-2"
        placeholder="Phone Number (optional)"
        value={newPhone}
        onChange={(e) => setNewPhone(e.target.value)}
      />
      <select
        className="form-select mb-3"
        value={newStatus}
        onChange={(e) => setNewStatus(e.target.value)}
      >
        <option value="Not Started">Not Started</option>
        <option value="Completed">Completed</option>
      </select>
      <button className="btn btn-primary w-100 mb-2" disabled={submitting}>
        Save Applicant
      </button>
      <button type="button" className="btn btn-secondary w-100" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default AddApplicant;
