import { Link } from "react-router-dom";

/**
 * CannotTakeInterview component.
 *
 * Displays a message when an applicant cannot take an interview due to restrictions
 * (e.g., interview is still in draft mode or has no questions).
 * Provides a button to navigate back to the interview list.
 *
 * @component
 * @example
 * <CannotTakeInterview reason="This interview has no questions assigned yet." />
 *
 * @param {Object} props - The component props.
 * @param {string} props.reason - A human-readable reason why the interview cannot be taken.
 *
 * @returns {JSX.Element} The rendered component.
 */
function CannotTakeInterview({ reason }) {
  return (
    <div className="card p-4 text-center">
      <h4>Cannot Take Interview</h4>
      <p>{reason}</p>
      <Link to="/interviews" className="btn btn-outline-primary mt-3">
        Back to Interviews
      </Link>
    </div>
  );
}

export default CannotTakeInterview;
