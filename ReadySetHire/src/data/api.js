const API_BASE_URL = 'https://comp2140a2.uqcloud.net/api';
const JWT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoic3R1ZGVudCIsInVzZXJuYW1lIjoiczQ4MjE4NjUifQ.prmD8tEMM8fiG2MzwQNlfNVcFy-ELfAdvfHApdMcad8'; // your token
const USERNAME = 's4821865';

async function apiRequest(endpoint, method = 'GET', body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${JWT_TOKEN}`,
    },
  };

  if (method === 'POST' || method === 'PATCH') {
    options.headers['Prefer'] = 'return=representation';
  }

  if (body) {
    options.body = JSON.stringify({ ...body, username: USERNAME });
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, options);

  if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

  // ✅ handle no content (204) gracefully
  if (response.status === 204) return null;

  return response.json();
}


export const getInterviews = () => apiRequest('/interview');
export const createInterview = (data) => apiRequest('/interview', 'POST', data);
export const getInterview = (id) => apiRequest(`/interview?id=eq.${id}`);
export const updateInterview = (id, data) =>
  apiRequest(`/interview?id=eq.${id}`, 'PATCH', data);
export const deleteInterview = (id) =>
  apiRequest(`/interview?id=eq.${id}`, 'DELETE');

/**
 * Function to get all questions for a specific interview.
 * 
 * @param {string|number} interviewId - The ID of the interview.
 * @returns {Promise<Array>} - An array of question objects.
 */
export async function getQuestions(interviewId) {
  return apiRequest(`/question?interview_id=eq.${interviewId}`);
}

export const createQuestion = (data) =>
  apiRequest('/question', 'POST', data);

export const deleteQuestion = (id) =>
  apiRequest(`/question?id=eq.${id}`, "DELETE");

export const updateQuestion = (id, data) =>
  apiRequest(`/question?id=eq.${id}`, "PATCH", data);

export const getApplicants = (interviewId) =>
  apiRequest(`/applicant?interview_id=eq.${interviewId}`);

export const createApplicant = (data) =>
  apiRequest("/applicant", "POST", data);

export const updateApplicant = (id, data) =>
  apiRequest(`/applicant?id=eq.${id}`, "PATCH", data);

export const deleteApplicant = (id) =>
  apiRequest(`/applicant?id=eq.${id}`, "DELETE");

export const getApplicant = (id) => apiRequest(`/applicant?id=eq.${id}`);

/**
 * Create an answer record for an applicant + question
 */
export async function createAnswer(applicantId, interviewId, questionId, answerText) {
  return apiRequest('/applicant_answer', 'POST', {
    interview_id: interviewId,
    question_id: questionId,
    applicant_id: applicantId,
    answer: answerText
  });
}

/**
 * Fetch all answers for a given applicant
 */
export async function getApplicantAnswers(applicantId) {
  return apiRequest(`/applicant_answer?applicant_id=eq.${applicantId}&select=id,answer,question:question_id(id,question)`);
}
