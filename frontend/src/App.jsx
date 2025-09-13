import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const LandingPage = lazy(() => import("./public/LandingPage"));
const AboutUs = lazy(() => import("./public/AboutUs"));
const ContactUs = lazy(() => import("./public/ContactUs"));
const Dashboard = lazy(() => import("./public/Dashboard"));
const OutfitDetails = lazy(() => import("./public/OutFitDetails"));
const SaveOutfits = lazy(() => import("./public/SaveOutfits"));
function App() {
  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/LandingPage" element={<LandingPage />} />
          <Route path="/AboutUs" element={<AboutUs />} />
          <Route path="/ContactUs" element={<ContactUs />} />
          <Route path="/Dashboard" element={<Dashboard />} />
          <Route path="/outfit/:id" element={<OutfitDetails />} />
          <Route path="/saved-outfits" element={<SaveOutfits />} />
          {/* ✅ fixed */}
        </Routes>
      </Suspense>
    </Router>
  );
}

export default App;
