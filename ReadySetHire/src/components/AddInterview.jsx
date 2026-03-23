import { useState } from "react";
import { createInterview } from "../data/api.js";

/**
 * AddInterview form component.
 *
 * Handles creation and editing of interviews.
 * - Calls `onCreated` when a new interview is created.
 * - Calls `onSaveEdit` when an existing interview is edited.
 * - Calls `onCancel` to close the form after submission or cancel.
 *
 * @param {Object} props
 * @param {Function} props.onCreated - Callback when interview is created.
 * @param {Function} props.onCancel - Callback to close the form.
 * @param {Object} [props.editData] - Existing interview data if editing.
 * @param {Function} props.onSaveEdit - Callback for saving interview edits.
 */
function AddInterview({ onCreated, onCancel, editData, onSaveEdit }) {
  const [form, setForm] = useState(
    editData || { title: "", job_role: "", description: "", status: "Draft" }
  );

  /**
   * Handles input changes in the form.
   *
   * @param {Event} e - Input change event.
   */
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  /**
   * Handles submission of the Add/Edit Interview form.
   * - Creates a new interview if not editing.
   * - Saves edits if editing.
   *
   * @param {Event} e - Form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await onSaveEdit(form);
      } else {
        const created = await createInterview(form);
        onCreated(created[0]);
      }
      onCancel();
    } catch (err) {
      console.error("Failed to save interview:", err);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="card p-3 mb-4">
      <input
        className="form-control mb-2"
        name="title"
        placeholder="Interview Title"
        value={form.title}
        onChange={handleChange}
        required
      />
      <input
        className="form-control mb-2"
        name="job_role"
        placeholder="Job Role"
        value={form.job_role}
        onChange={handleChange}
        required
      />
      <textarea
        className="form-control mb-2"
        name="description"
        placeholder="Description"
        value={form.description}
        onChange={handleChange}
      />
      <select
        className="form-select mb-2"
        name="status"
        value={form.status}
        onChange={handleChange}
      >
        <option value="Draft">Draft</option>
        <option value="Published">Published</option>
      </select>
      <button type="submit" className="btn btn-primary mb-2">
        {editData ? "Save Changes" : "Save Interview"}
      </button>
      <button type="button" className="btn btn-secondary" onClick={onCancel}>
        Cancel
      </button>
    </form>
  );
}

export default AddInterview;
