"use client";
import React, { useState } from "react";
import Link from "next/link";
import "./styles/Navbar.css";
import { Menu, X } from "lucide-react";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="navbar-wrapper">
      {/* Top Navbar */}
      <nav className="navbar">
        <h1 className="navbar-title">IMAGE-EDITOR</h1>
        <button
          className="hamburger-btn"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
          aria-label="Toggle sidebar"
        >
          {isSidebarOpen ? <X size={26} /> : <Menu size={26} />}
        </button>
      </nav>

      {/* Sidebar (from right) */}
      <aside className={`sidebar ${isSidebarOpen ? "open" : ""}`}>
        <ul>
          <li onClick={() => setIsSidebarOpen(false)}>
            <Link href="/">Dashboard</Link>
          </li>
          <li onClick={() => setIsSidebarOpen(false)}>
            <Link href="/compress">Compress Files</Link>
          </li>
          <li onClick={() => setIsSidebarOpen(false)}>
            <Link href="/about">About</Link>
          </li>
        </ul>
      </aside>

      {/* Overlay */}
      {isSidebarOpen && (
        <div className="overlay" onClick={() => setIsSidebarOpen(false)}></div>
      )}
    </div>
  );
};

export default Navbar;
