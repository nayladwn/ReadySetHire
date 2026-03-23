import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getApplicant, getInterview, getQuestions, updateApplicant } from "../data/api.js";
import InterviewQuestions from "./InterviewQuestions";
import CannotTakeInterview from "./CannotTakeInterview";
import NotFound from "./NotFound";

/**
 * TakeInterview component
 *
 * Handles the applicant interview process:
 * - Fetches applicant, interview, and questions data.
 * - Guards against invalid states (draft, no questions, already completed).
 * - Guides user through the flow: Welcome → Questions → Completed.
 * - Uses `InterviewQuestions` to record answers.
 *
 * Guards handled:
 * - Applicant not found → `NotFound` page
 * - Interview in draft → `CannotTakeInterview`
 * - No questions assigned → `CannotTakeInterview`
 * - Applicant already completed → `CannotTakeInterview`
 *
 * @component
 * @example
 * // Route setup
 * <Route path="/take/:applicantId" element={<TakeInterview />} />
 *
 * @returns {JSX.Element} A page where applicants can take their assigned interview.
 */
function TakeInterview() {
  const { applicantId } = useParams();
  const navigate = useNavigate();

  const [step, setStep] = useState("loading"); // Tracks interview stage
  const [applicant, setApplicant] = useState(null);
  const [interview, setInterview] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [cleanupRecording, setCleanupRecording] = useState(null);

  /**
   * Fetch applicant, interview, and questions data on mount.
   * Sets appropriate state depending on validity and status of interview.
   */
  useEffect(() => {
    async function fetchData() {
      try {
        const appData = await getApplicant(applicantId);
        const app = appData[0];

        // 🚨 If no applicant → show 404 page
        if (!app) {
          setStep("notfound");
          return;
        }
        setApplicant(app);

        const intvData = await getInterview(app.interview_id);
        const intv = intvData[0];
        setInterview(intv);

        const qs = await getQuestions(app.interview_id);
        setQuestions(qs);

        // ✅ Guards
        if (intv.status === "Draft") {
          setStep("blocked-draft");
          return;
        }
        if (qs.length === 0) {
          setStep("blocked-no-questions");
          return;
        }
        if (app.interview_status === "Completed") {
          setStep("blocked-completed");
          return;
        }

        setStep("welcome");
      } catch (err) {
        console.error("Error loading interview:", err);
        setStep("error");
      }
    }
    fetchData();
  }, [applicantId]);

  /**
   * Begin interview: switch to questions and mark applicant as "In Progress".
   */
  const handleStart = async () => {
    setStep("questions");
    try {
      await updateApplicant(applicantId, { interview_status: "In Progress" });
    } catch (err) {
      console.error("Failed to update applicant status:", err);
    }
  };

  /**
   * Complete interview: cleanup recording, mark applicant as "Completed".
   */
  const handleComplete = async () => {
    if (cleanupRecording) cleanupRecording();
    setStep("completed");

    try {
      await updateApplicant(applicantId, { interview_status: "Completed" });
    } catch (err) {
      console.error("Failed to update applicant status:", err);
    }
  };

  // Guards for blocked or invalid interview states
  if (step === "notfound") return <NotFound />;
  if (step === "blocked-draft") {
    return <CannotTakeInterview reason="This interview is still in Draft status and cannot be taken yet." />;
  }
  if (step === "blocked-no-questions") {
    return <CannotTakeInterview reason="This interview has no questions assigned yet." />;
  }
  if (step === "blocked-completed") {
    return <CannotTakeInterview reason="This interview has already been completed." />;
  }

  if (step === "loading") return <p>Loading interview...</p>;
  if (step === "error") return <p>Error loading interview.</p>;

  return (
    <div className="container mt-4">
      {/* Welcome step */}
      {step === "welcome" && (
        <div className="card p-4 text-center">
          <h3>Welcome to Your Interview</h3>
          <p>
            <strong>Applicant:</strong> {applicant.title} {applicant.firstname} {applicant.surname}
            <br />
            <strong>Email:</strong> {applicant.email_address}
          </p>
          <p>
            <strong>Interview:</strong> {interview?.title}
            <br />
            {interview?.description}
          </p>
          <button className="btn btn-primary mt-3" onClick={handleStart}>
            Start Interview
          </button>
        </div>
      )}

      {/* Questions step */}
      {step === "questions" && (
        <InterviewQuestions
          questions={questions}
          applicant={applicant}
          interview={interview}
          onComplete={handleComplete}
          setCleanupRecording={setCleanupRecording}
        />
      )}

      {/* Completed step */}
      {step === "completed" && (
        <div className="card p-4 text-center">
          <div style={{ fontSize: "3rem", color: "#4caf50" }}>✔</div>
          <h3>Thank You for Completing the Interview!</h3>
          <p>Your responses have been successfully recorded.</p>
          <p className="mt-3">
            <strong>Interview completed for:</strong> {applicant.firstname} {applicant.surname}
            <br />
            <strong>Interview:</strong> {interview?.title}
          </p>
          <button
            className="btn btn-outline-secondary mt-3"
            onClick={() => navigate("/interviews")}
          >
            Back to Interviews
          </button>
        </div>
      )}
    </div>
  );
}

export default TakeInterview;
