// src/NavBar.js
import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import '../styles/NavBar.css'


const NavBar = () => {
  return (
    <nav className="navbar">
      <Link to="/dashboard" className="brand">
        <img
          src="https://upload.wikimedia.org/wikipedia/en/thumb/5/50/National_Rugby_League.svg/800px-National_Rugby_League.svg.png"
          alt="NRL Logo"
          className="navbar-logo"
        />
        <span>NRL Draft HQ</span>
      </Link>
      <div className="nav-links">
        <NavLink to="/dashboard">Dashboard</NavLink>
        <NavLink to="/players-database">Player Database</NavLink>
        <NavLink to="/draft-tool">Build Team</NavLink>
      </div>
      
    </nav>
  )
}

export default NavBar
