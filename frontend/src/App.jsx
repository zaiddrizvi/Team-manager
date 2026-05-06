import { Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Login from './pages/Login.jsx';
import ProjectDetails from './pages/ProjectDetails.jsx';
import Projects from './pages/Projects.jsx';
import Signup from './pages/Signup.jsx';
import Tasks from './pages/Tasks.jsx';
import { useAuth } from './context/AuthContext.jsx';

const Layout = ({ children }) => (
  <>
    <Navbar />
    <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
  </>
);

export default function App() {
  const { user } = useAuth();

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
      <Route path="/signup" element={user ? <Navigate to="/" /> : <Signup />} />
      <Route
        path="/"
        element={<ProtectedRoute><Layout><Dashboard /></Layout></ProtectedRoute>}
      />
      <Route
        path="/projects"
        element={<ProtectedRoute><Layout><Projects /></Layout></ProtectedRoute>}
      />
      <Route
        path="/projects/:id"
        element={<ProtectedRoute><Layout><ProjectDetails /></Layout></ProtectedRoute>}
      />
      <Route
        path="/tasks"
        element={<ProtectedRoute><Layout><Tasks /></Layout></ProtectedRoute>}
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}
