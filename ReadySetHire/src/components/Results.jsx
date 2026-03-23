import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { getApplicantAnswers } from "../data/api.js";

/**
 * Results component
 *
 * Displays the recorded answers of a specific applicant for their interview.
 * Fetches answers from the backend using the applicant ID provided in the URL.
 * Each result is displayed as a card, divided into two equal sections:
 * - Left side: the question
 * - Right side: the applicant's answer (or a placeholder if none was recorded).
 *
 * @component
 * @example
 * // In your router setup
 * <Route path="/results/:applicantId" element={<Results />} />
 *
 * @returns {JSX.Element} A results page showing applicant answers.
 */

function Results() {
  const { applicantId } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const data = await getApplicantAnswers(applicantId);
        setAnswers(data);
      } catch (err) {
        console.error("Error fetching answers:", err);
        alert("Could not load answers.");
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, [applicantId]);

  if (loading) return <p>Loading results...</p>;

  return (
    <div className="container">
      <button onClick={() => navigate(-1)} className="btn btn-link mb-3">
        &larr; Back
      </button>

      <h2 className="mb-4">Applicant Results</h2>

      {answers.length > 0 ? (
        <div className="row g-3">
          {answers.map((ans) => (
            <div key={ans.id} className="col-12">
              <div className="card shadow-sm">
                <div className="row g-0">
                  {/* Left: Question */}
                  <div className="col-md-6 border-end d-flex align-items-center p-3 bg-light">
                    <h6 className="mb-0">
                      {ans.question?.question || `Q${ans.question_id}`}
                    </h6>
                  </div>

                  {/* Right: Answer */}
                  <div className="col-md-6 p-3">
                    {ans.answer && ans.answer.trim() !== "" ? (
                      <p className="mb-0">{ans.answer}</p>
                    ) : (
                      <p className="text-muted fst-italic mb-0">
                        No transcript recorded
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p>No answers recorded.</p>
      )}
    </div>
  );
}

export default Results;
