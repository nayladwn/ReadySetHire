import { Link } from "react-router-dom";

/**
 * NotFound component (404 page).
 *
 * Displays a full-screen "Page Not Found" (404) error page when the user navigates
 * to a non-existent route. Provides a message explaining the error and a button
 * to return to the home page.
 *
 * @component
 * @example
 * // Used in your router setup as a fallback route
 * <Route path="*" element={<NotFound />} />
 *
 * @returns {JSX.Element} A styled 404 error page with a link back to the home page.
 */
function NotFound() {
  return (
    <div className="d-flex justify-content-center align-items-center vh-100 bg-light">
      <div className="text-center">
        <h1 className="display-1 fw-bold text-primary">404</h1>
        <h2 className="mb-3">Page Not Found</h2>
        <p className="text-muted mb-4">
          Sorry, the page you are looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">
          Back to Home
        </Link>
      </div>
    </div>
  );
}

export default NotFound;
