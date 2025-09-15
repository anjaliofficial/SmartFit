import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { SavedOutfitsProvider } from "./context/SavedOutfitsContext"; // import provider

// Lazy imports
const LandingPage = lazy(() => import("./public/LandingPage"));
const AboutUs = lazy(() => import("./public/AboutUs"));
const ContactUs = lazy(() => import("./public/ContactUs"));
const Dashboard = lazy(() => import("./public/Dashboard"));
const OutfitDetails = lazy(() => import("./public/OutfitDetails"));
const SaveOutfits = lazy(() => import("./public/SaveOutfits"));
const ProfilePage = lazy(() => import("./public/ProfilePage"));
const OutfitAnalysisPage = lazy(() => import("./public/OutfitAnalysisPage"));
const UploadImage = lazy(() => import("./public/UploadImage"));
const OutfitRecommendationPage = lazy(() =>
  import("./public/OutfitRecommendations")
);

const Login = lazy(() => import("./public/Login"));
const Signup = lazy(() => import("./public/Signup"));
const ForgetPassword = lazy(() => import("./public/ForgetPassword"));

const SettingsPage = lazy(() => import("./public/SettingsPage"));

function App() {
  return (
    <Router>
      <SavedOutfitsProvider>
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/landingpage" element={<LandingPage />} />
            <Route path="/aboutus" element={<AboutUs />} />
            <Route path="/contactus" element={<ContactUs />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/outfit/:id" element={<OutfitDetails />} />
            <Route path="/saved-outfits" element={<SaveOutfits />} />
            <Route path="/profilepage" element={<ProfilePage />} />
            <Route path="/uploadimage" element={<UploadImage />} />
            <Route path="/outfitanalysis" element={<OutfitAnalysisPage />} />
            <Route
              path="/outfitrecommendations"
              element={<OutfitRecommendationPage />}
            />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgetpassword" element={<ForgetPassword />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Routes>
        </Suspense>
      </SavedOutfitsProvider>
    </Router>
  );
}

export default App;
