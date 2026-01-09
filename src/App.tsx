import { Routes, Route, Navigate } from "react-router-dom";
import { useCookies } from "react-cookie";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Cards from "./pages/Cards";
import Contacts from "./pages/Contacts";
import Reviews from "./pages/Reviews";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  const [cookies] = useCookies(["token"]);

  return (
    <Routes>
      <Route
        path="/login"
        element={
          cookies.token ? <Navigate to="/dashboard" replace /> : <Login />
        }
      />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/cards"
        element={
          <ProtectedRoute>
            <Cards />
          </ProtectedRoute>
        }
      />
      <Route
        path="/contacts"
        element={
          <ProtectedRoute>
            <Contacts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/reviews"
        element={
          <ProtectedRoute>
            <Reviews />
          </ProtectedRoute>
        }
      />
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}

export default App;
