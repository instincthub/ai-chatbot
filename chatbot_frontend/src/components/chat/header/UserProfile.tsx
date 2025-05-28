// src/components/Chat/Header/UserProfile.tsx
import React, { useState } from "react";
import { FaUserCircle, FaSignOutAlt, FaCog } from "react-icons/fa";
import { User } from "../../../types";

interface UserProfileProps {
  currentUser: User;
  onUserSwitch: (userId: string) => void;
}

const UserProfile: React.FC<UserProfileProps> = ({
  currentUser,
  onUserSwitch,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  const handleLogout = () => {
    // Handle logout logic
    console.log("Logging out...");
  };

  const handleSettings = () => {
    // Navigate to settings
    console.log("Opening settings...");
  };

  return (
    <div className="user-profile">
      <button
        className="profile-button"
        onClick={toggleDropdown}
        aria-label="User profile"
      >
        {currentUser.avatarUrl ? (
          <img
            src={currentUser.avatarUrl}
            alt={currentUser.name}
            className="avatar"
          />
        ) : (
          <FaUserCircle className="avatar-icon" />
        )}
        <span className="user-name">{currentUser.name}</span>
      </button>

      {isOpen && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <strong>Signed in as</strong>
            <div>{currentUser.email}</div>
          </div>

          <ul className="dropdown-menu">
            <li className="dropdown-item" onClick={handleSettings}>
              <FaCog className="dropdown-icon" />
              <span>Settings</span>
            </li>
            <li className="dropdown-item" onClick={handleLogout}>
              <FaSignOutAlt className="dropdown-icon" />
              <span>Sign out</span>
            </li>
          </ul>
        </div>
      )}
    </div>
  );
};

export default UserProfile;
