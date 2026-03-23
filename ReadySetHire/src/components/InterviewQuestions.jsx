import { useState, useRef, useEffect } from "react";
import SpeechRecognition, { useSpeechRecognition } from "react-speech-recognition";
import { createAnswer } from "../data/api.js";

/**
 * InterviewQuestions component.
 *
 * Handles the flow of recording and answering interview questions.  
 * It allows applicants to:
 * - Start and stop audio recording per question (one recording per question).
 * - Save transcripts automatically to the backend via `createAnswer`.
 * - Progress through multiple questions with a progress bar.
 * - Lock recording after one attempt per question to prevent re-recording.
 *
 * Integrates browser MediaRecorder API and `react-speech-recognition` to capture audio
 * and generate transcripts in real-time.
 *
 * @component
 * @example
 * <InterviewQuestions
 *   questions={questions}
 *   applicant={applicant}
 *   interview={interview}
 *   onComplete={() => console.log("Finished")}
 *   setCleanupRecording={setCleanupRecording}
 * />
 *
 * @param {Object} props - The component props.
 * @param {Array<Object>} props.questions - Array of interview questions to display.
 * @param {Object} props.applicant - Applicant object (must include `id`).
 * @param {Object} props.interview - Interview object (must include `id`).
 * @param {Function} props.onComplete - Callback fired when all questions are answered.
 * @param {Function} props.setCleanupRecording - Function to pass cleanup handler to parent.
 *
 * @returns {JSX.Element} The rendered InterviewQuestions component.
 */
function InterviewQuestions({ questions, applicant, interview, onComplete, setCleanupRecording }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [hasRecorded, setHasRecorded] = useState(false); // lock: prevents re-recording

  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const chunksRef = useRef([]);
  const transcriptRef = useRef("");

  const { transcript, finalTranscript, resetTranscript } = useSpeechRecognition();

  useEffect(() => {
    transcriptRef.current = finalTranscript || transcript;
  }, [finalTranscript, transcript]);

  /**
   * Cleanup function that stops any ongoing recording or speech recognition.
   * Ensures microphone tracks are released.
   */
  const cleanup = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== "inactive") {
      mediaRecorderRef.current.stop();
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    SpeechRecognition.stopListening();
    setIsRecording(false);
  };

  // Provide cleanup handler to parent (TakeInterview.jsx)
  useEffect(() => {
    if (setCleanupRecording) {
      setCleanupRecording(() => cleanup);
    }
  }, [setCleanupRecording]);

  /**
   * Start audio recording for the current question.
   * Locks after first attempt per question to prevent multiple recordings.
   */
  const startRecording = async () => {
    if (hasRecorded) {
      alert("You have already recorded an answer for this question.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };

      // Save transcript on stop
      mediaRecorder.onstop = async () => {
        const q = questions[currentIndex];
        const textToSave = transcriptRef.current;
        if (textToSave && textToSave.trim() !== "") {
          await createAnswer(applicant.id, interview.id, q.id, textToSave);
        }
        resetTranscript();
        if (mediaStreamRef.current) {
          mediaStreamRef.current.getTracks().forEach((track) => track.stop());
          mediaStreamRef.current = null;
        }
      };

      mediaRecorder.start();
      setIsRecording(true);
      setHasRecorded(true); // lock for this question
      SpeechRecognition.startListening({ continuous: true });
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Could not access microphone. Please allow mic access.");
    }
  };

  /**
   * Stop the current recording and speech recognition session.
   */
  const stopRecording = () => {
    if (isRecording) {
      SpeechRecognition.stopListening();
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      setIsRecording(false);
    }
  };

  /**
   * Move to the next question or finish the interview.
   * Prevents advancing if recording is still active.
   */
  const nextQuestion = () => {
    if (isRecording) {
      alert("Please stop recording before moving to the next question.");
      return;
    }
    resetTranscript();
    setHasRecorded(false); 
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      onComplete();
    }
  };

  const q = questions[currentIndex];

  return (
    <div className="card p-4">
      {/* Progress bar */}
      <div className="mb-3">
        <p>
          Question {currentIndex + 1} of {questions.length}
        </p>
        <div className="progress">
          <div
            className="progress-bar"
            role="progressbar"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          ></div>
        </div>
      </div>

      <h5>{q.question}</h5>

      {/* Recording controls */}
      {!isRecording && !hasRecorded ? (
        <button className="btn btn-outline-primary" onClick={startRecording}>
          ▶ Start Recording
        </button>
      ) : isRecording ? (
        <button className="btn btn-outline-danger" onClick={stopRecording}>
          ⏹ Stop Recording
        </button>
      ) : (
        <p className="text-muted mt-2">Answer recorded ✅</p>
      )}

      {/* Transcript display */}
      {finalTranscript || transcript ? (
        <div className="alert alert-secondary mt-3">
          <strong>Transcript:</strong> {finalTranscript || transcript}
        </div>
      ) : null}

      {/* Navigation */}
      <div className="mt-3">
        <button className="btn btn-primary" onClick={nextQuestion}>
          {currentIndex + 1 < questions.length ? "Next Question" : "Finish Interview"}
        </button>
      </div>
    </div>
  );
}

export default InterviewQuestions;
