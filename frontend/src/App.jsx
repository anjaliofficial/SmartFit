import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./public/Login"; // Your Login.jsx file

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
