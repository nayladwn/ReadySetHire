/**
 * Loading component.
 *
 * Displays a full-screen loading indicator with a spinner and optional message.  
 * Uses Bootstrap utility classes (`d-flex`, `vh-100`, etc.) to center the spinner
 * both vertically and horizontally.
 *
 * @component
 * @example
 * // Default usage
 * <Loading />
 *
 * @example
 * // With custom message
 * <Loading message="Fetching applicants..." />
 *
 * @param {Object} props - The component props.
 * @param {string} [props.message="Loading..."] - Optional loading message displayed under the spinner.
 *
 * @returns {JSX.Element} A styled loading screen with spinner and text.
 */
function Loading({ message = "Loading..." }) {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <div
          className="spinner-border text-primary mb-3"
          role="status"
          style={{ width: "3rem", height: "3rem" }}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        <h5>{message}</h5>
      </div>
    </div>
  );
}

export default Loading;
