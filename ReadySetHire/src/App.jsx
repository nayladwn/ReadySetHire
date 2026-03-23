import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Header from "./components/Header";
import Home from "./components/Home";
import InterviewList from "./components/InterviewList";
import Questions from "./components/Questions";
import Applicants from "./components/Applicants";
import TakeInterview from "./components/TakeInterview";
import Results from "./components/Results";
import Footer from "./components/Footer";
import NotFound from "./components/NotFound";


function App() {
  const navLinks = [
    { path: "/", text: "Home" },
    { path: "/interviews", text: "Interviews" },
  ];

  return (
    <Router>
      <div id="app-layout">
        <Header brandText="ReadySetHire" navLinks={navLinks} />

        {/* 👇 Use <main> so CSS flexbox works */}
        <main className="container mt-5 flex-grow-1">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/interviews" element={<InterviewList />} />
            <Route path="/interviews/:id/questions" element={<Questions />} />
            <Route path="/interviews/:id/applicants" element={<Applicants />} />
            <Route path="/applicants/:applicantId/take" element={<TakeInterview />} />
            <Route path="/results/:applicantId" element={<Results />} />

            {/* 404 fallback */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
  );
}

export default App;
