import React, { useState } from "react";
import Sidebar from "./Sidebar";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Mobile Header */}
      <div className="mobile-header">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(true)}
        >
          ☰
        </button>
        <h1 style={{ fontSize: "1.125rem", fontWeight: 700, color: "#0069ff" }}>
          Calendly
        </h1>
        <div style={{ width: 40 }} />
      </div>

      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="app-content">{children}</main>
    </div>
  );
}

export default Layout;
