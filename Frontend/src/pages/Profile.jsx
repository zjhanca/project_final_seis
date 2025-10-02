// src/pages/Profile.jsx
import { useState } from "react";
import { useAuth } from "../context/AuthContext";

export default function Profile() {
  const { user } = useAuth();
  const [profileData, setProfileData] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
    bio: user?.bio || ""
  });

  return (
    <div className="profile-page">
      <div className="profile-container">
        <h1>Perfil de Usuario</h1>
        
        <div className="profile-content">
          <div className="profile-avatar-section">
            <div className="profile-avatar-large">
              {user?.profileImage ? (
                <img src={user.profileImage} alt="Perfil" />
              ) : (
                <div className="avatar-placeholder-large">
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </div>
              )}
            </div>
          </div>

          <form className="profile-form">
            <div className="form-group">
              <label htmlFor="name">Nombre completo</label>
              <input
                type="text"
                id="name"
                name="name"
                value={profileData.name}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Correo electrónico</label>
              <input
                type="email"
                id="email"
                name="email"
                value={profileData.email}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="phone">Teléfono</label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={profileData.phone}
                className="form-input"
                placeholder="+57 300 123 4567"
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="bio">Biografía</label>
              <textarea
                id="bio"
                name="bio"
                value={profileData.bio}
                className="form-textarea"
                rows="4"
                placeholder="Cuéntanos un poco sobre ti..."
                readOnly
              />
            </div>


          </form>
        </div>
      </div>
    </div>
  );
}