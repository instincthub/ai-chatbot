// src/components/Chat/Sidebar/ProjectsList.tsx
import React from "react";
import { FaFolder } from "react-icons/fa";
import { Project } from "../../../types";

interface ProjectsListProps {
  projects: Project[];
  onProjectSelect: (projectId: string) => void;
}

const ProjectsList: React.FC<ProjectsListProps> = ({
  projects,
  onProjectSelect,
}) => {
  if (projects.length === 0) {
    return <div className="empty-list">No projects yet</div>;
  }

  return (
    <ul className="projects-list">
      {projects.map((project) => (
        <li
          key={project.id}
          className="project-item"
          onClick={() => onProjectSelect(project.id)}
        >
          <FaFolder className="project-icon" />
          <span>{project.name}</span>
        </li>
      ))}
    </ul>
  );
};

export default ProjectsList;
