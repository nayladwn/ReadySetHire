import { Link } from 'react-router-dom';

/**
 * The Home page component for the ReadySetHire app.
 *
 * Displays a welcome message, a brief description, 
 * and a call-to-action button linking to the recipes page.
 *
 * @component
 * @example
 * return (
 *   <Home />
 * );
 *
 * @returns {JSX.Element} The rendered Home page.
 */
function Home() {
  return (
    <div className="container d-flex justify-content-center align-items-center" style={{ minHeight: "calc(100vh - 110px)" }}>
    <div className="text-center">
        <h1 className="mb-4">Welcome to ReadySetHire!</h1>
        <p>Organize all your interviews and applicants all in one.</p>
        <div className="d-flex gap-3 justify-content-center">
        <Link to="/interviews" className="btn btn-primary">Look at Interviews</Link>
        </div>
    </div>
    </div>
  );
}

export default Home;