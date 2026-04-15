import React from "react";
import { NavLink } from "react-router-dom";

function Sidebar({ isOpen, onClose }) {

  return (
    <>
      {/* Mobile Overlay */}
      <div
        className={`sidebar-overlay ${isOpen ? "open" : ""}`}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside className={`sidebar ${isOpen ? "open" : ""}`}>
        <div className="sidebar-logo">
          <h1>
            <span className="logo-icon">C</span>
            Calendly
          </h1>
        </div>

        <nav className="sidebar-nav">
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="nav-icon">📅</span>
            Event Types
          </NavLink>

          <NavLink
            to="/availability"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="nav-icon">🕐</span>
            Availability
          </NavLink>

          <NavLink
            to="/meetings"
            className={({ isActive }) =>
              `sidebar-nav-item ${isActive ? "active" : ""}`
            }
            onClick={onClose}
          >
            <span className="nav-icon">👥</span>
            Meetings
          </NavLink>
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="sidebar-avatar">A</div>
            <div className="sidebar-user-info">
              <div className="sidebar-user-name">Admin User</div>
              <div className="sidebar-user-email">admin@calendly.com</div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}

export default Sidebar;
