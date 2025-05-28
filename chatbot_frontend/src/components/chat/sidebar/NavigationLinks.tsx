// src/components/Chat/Sidebar/NavigationLinks.tsx
import React from "react";
import { IconType } from "react-icons";
import { FaComments, FaCode, FaLightbulb } from "react-icons/fa";

interface NavLink {
  id: string;
  label: string;
  icon: IconType;
  path: string;
}

const navigationLinks: NavLink[] = [
  { id: "chat", label: "ChatGPT", icon: FaComments, path: "/chat" },
  {
    id: "builder",
    label: "Landing Page Builder",
    icon: FaCode,
    path: "/builder",
  },
  { id: "explore", label: "Explore GPTs", icon: FaLightbulb, path: "/explore" },
];

const NavigationLinks: React.FC = () => {
  return (
    <nav className="navigation-links">
      <ul>
        {navigationLinks.map((link) => (
          <li key={link.id}>
            <a href={link.path} className="nav-link">
              <link.icon className="nav-icon" />
              <span>{link.label}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default NavigationLinks;
