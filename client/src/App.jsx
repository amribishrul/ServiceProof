import {
  Navigate,
  Route,
  Routes,
} from "react-router-dom";

import TechnicianDashboard from "./pages/TechnicianDashboard";

import CustomerVerificationPage from "./pages/CustomerVerificationPage";

function App() {
  return (
    <Routes>
      <Route
        path="/"
        element={
          <Navigate
            to="/technician"
            replace
          />
        }
      />

      <Route
        path="/technician"
        element={
          <TechnicianDashboard />
        }
      />

      <Route
        path="/verify/:token"
        element={
          <CustomerVerificationPage />
        }
      />

      <Route
        path="*"
        element={
          <Navigate
            to="/technician"
            replace
          />
        }
      />
    </Routes>
  );
}

export default App;