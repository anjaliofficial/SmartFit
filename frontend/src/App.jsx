import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const LandingPage = lazy(() => import("./public/LandingPage"));
const AboutUs = lazy(() => import("./public/AboutUs"));
const ContactUs = lazy(() => import("./public/ContactUs"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/LandingPage" element={<LandingPage />} />
        <Route path="/AboutUs" element={<AboutUs />} />
        <Route path="/ContactUs" element={<ContactUs />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
