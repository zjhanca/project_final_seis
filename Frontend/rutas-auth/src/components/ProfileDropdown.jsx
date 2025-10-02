// src/components/ProfileDropdown.jsx
import { useState, useRef, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const ProfileDropdown = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsOpen(false);
  };

  const handleProfileClick = () => {
    navigate("/profile");
    setIsOpen(false);
  };

  const handleSettingsClick = () => {
    navigate("/configuracion");
    setIsOpen(false);
  };

  const getInitials = (name) => {
    if (!name) return "U";
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="profile-dropdown-container" ref={dropdownRef}>
      {/* Avatar clickeable */}
      <div 
        className="profile-avatar" 
        onClick={() => setIsOpen(!isOpen)}
      >
        {user?.profileImage ? (
          <img 
            src={user.profileImage} 
            alt="Perfil" 
            className="avatar-image"
          />
        ) : (
          <div className="avatar-placeholder">
            {getInitials(user?.name)}
          </div>
        )}
        <div className="avatar-status-indicator"></div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="profile-dropdown-menu">
          <div className="dropdown-header">
            <div className="user-info">
              <div className="user-avatar-small">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Perfil" />
                ) : (
                  <div className="avatar-placeholder-small">
                    {getInitials(user?.name)}
                  </div>
                )}
              </div>
              <div className="user-details">
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
              </div>
            </div>
          </div>

          <div className="dropdown-divider"></div>

          <div className="dropdown-items">
            <button 
              className="dropdown-item"
              onClick={handleProfileClick}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
              Perfil
            </button>

            <button 
              className="dropdown-item"
              onClick={handleSettingsClick}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1m17-4a4 4 0 0 1-8 0 4 4 0 0 1 8 0zM7 17a4 4 0 0 1-8 0 4 4 0 0 1 8 0z"></path>
              </svg>
              Configuración
            </button>

            <div className="dropdown-divider"></div>

            <button 
              className="dropdown-item logout-item"
              onClick={handleLogout}
            >
              <svg className="dropdown-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                <polyline points="16,17 21,12 16,7"></polyline>
                <line x1="21" y1="12" x2="9" y2="12"></line>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;