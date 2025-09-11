import React, { lazy, Suspense } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

const Login = lazy(() => import("./public/Login"));

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login />} />
        {/* Add more routes here */}
      </Routes>
    </Router>
  );
}

export default App;
