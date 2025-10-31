import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../App';
import { LogOut, User, Clock, FileText, BarChart3, Users, Calendar, Menu, X } from 'lucide-react';
import logo from '../assets/apt.ico';

const Header = () => {
  const { user, logout, notifications } = useAuth();
  const location = useLocation();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  // Close menu when clicking on a link
  const handleLinkClick = () => {
    setIsMenuOpen(false);
  };

  return (
    <header className="header">
      <div className="header-content">
        <div className="header-left">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <img 
              src={logo} 
              alt="Company Logo" 
              style={{ height: '40px', width: '40px', objectFit: 'contain' }} 
            />
            <h1 style={{ fontSize: '1.5rem' }}>AproposDrive</h1>
          </div>
          <span className="user-badge">
            {user.role === 'admin' ? 'Admin' : 'Employee'}
          </span>
        </div>

        {/* Mobile menu button */}
        <button 
          className="mobile-menu-button"
          onClick={toggleMenu}
        >
          {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>

        <nav className={isMenuOpen ? 'nav-mobile-open' : ''}>
          <ul className="nav-links">
            {user.role === 'admin' ? (
              <>
                <li>
                  <Link 
                    to="/admin-dashboard" 
                    className={isActive('/admin-dashboard') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <BarChart3 size={16} />
                    <span className="nav-text">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/attendance-report" 
                    className={isActive('/attendance-report') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <Clock size={16} />
                    <span className="nav-text">Attendance</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/attendance-edit-requests" 
                    className={isActive('/attendance-edit-requests') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <FileText size={16} />
                    <span className="nav-text">Edit Requests</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/add-employee" 
                    className={isActive('/add-employee') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <Users size={16} />
                    <span className="nav-text">Add Employee</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/leave-management" 
                    className={isActive('/leave-management') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <FileText size={16} />
                    <span className="nav-text">Leave Requests</span>
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link 
                    to="/employee-dashboard" 
                    className={isActive('/employee-dashboard') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <Clock size={16} />
                    <span className="nav-text">Dashboard</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/attendance" 
                    className={isActive('/attendance') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <Calendar size={16} />
                    <span className="nav-text">Attendance</span>
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/leave-management" 
                    className={isActive('/leave-management') ? 'active' : ''}
                    onClick={handleLinkClick}
                  >
                    <FileText size={16} />
                    <span className="nav-text">My Leaves</span>
                  </Link>
                </li>
              </>
            )}
            <li>
              <Link 
                to="/profile" 
                className={isActive('/profile') ? 'active' : ''}
                onClick={handleLinkClick}
              >
                <User size={16} />
                <span className="nav-text">Profile</span>
              </Link>
            </li>
          </ul>
        </nav>

        <div className="header-right">
          <div className="user-info">
            <div className="user-name">
              {user.name}
            </div>
            <div className="user-email">
              {user.email}
            </div>
          </div>
          <button 
            onClick={handleLogout} 
            className="btn btn-danger btn-sm"
          >
            <LogOut size={16} />
            <span className="btn-text">Logout</span>
          </button>
        </div>
      </div>

      {/* Mobile overlay */}
      {isMenuOpen && (
        <div 
          className="mobile-overlay"
          onClick={toggleMenu}
        />
      )}
    </header>
  );
};

export default Header;