// src/NavBar.js
import React from 'react'
import { Link } from 'react-router-dom'
import './NavBar.css' // Make sure to create this CSS file for styling

const NavBar = () => {
  return (
    <nav className="navbar">
      <Link to="/dashboard">
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/5/50/National_Rugby_League.svg/800px-National_Rugby_League.svg.png"
          alt="NRL Logo"
          className="navbar-logo"
        />
      </Link>
      <div className="nav-links">
        <Link to="/players-database">Player Database</Link>
        <Link to="/draft-picks-database">Teams Database</Link>
      </div>
      
      <div className="nav-contact">
        <Link to="/contact" className="contact-link">
          Contact
        </Link>
      </div>
    </nav>
  )
}

export default NavBar
