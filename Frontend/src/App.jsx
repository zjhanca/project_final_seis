// src/App.jsx
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import PrivateRoute from "./routes/PrivateRoute"; 
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import Configuracion from './pages/Configuracion';

// Importar componentes consolidados
import ListLibros from "./components/ListLibros";
import ListPrestamos from "./components/ListPrestamos";
import ListAutores from "./components/ListAutores";
import ListUsers from "./components/ListUsers"; 
import ListDevoluciones from "./components/ListDevoluciones";

import "./App.css";

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="app">
          <Navbar />
          <main>
            <Routes>
              {/* Rutas públicas */}
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/forgot-password" element={<ForgotPassword />} />
              <Route path="/reset-password" element={<ResetPassword />} />
              
              {/* Rutas de gestión consolidadas */}
              <Route path="/autores" element={<ListAutores />} />
              <Route path="/libros" element={<ListLibros />} />
              <Route path="/usuarios" element={<ListUsers />} />
              <Route path="/prestamos" element={<ListPrestamos />} />
              <Route path="/devoluciones" element={<ListDevoluciones />} />
              <Route path="/configuracion" element={<Configuracion />} />
              
              {/* Rutas antiguas redirigidas a las nuevas (opcional - para compatibilidad) */}
              <Route path="/listautores" element={<ListAutores />} />
              <Route path="/listlibros" element={<ListLibros />} />
              <Route path="/listusers" element={<ListUsers />} />
              <Route path="/user" element={<ListUsers />} />
              <Route path="/listprestamos" element={<ListPrestamos />} />
              <Route path="/listdevoluciones" element={<ListDevoluciones />} />
              
              {/* Rutas protegidas */}
              <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                }
              />
              <Route
                path="/profile"
                element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                }
              />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;