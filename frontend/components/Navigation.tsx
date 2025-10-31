import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCurrentUser, isLibrarian, logout } from '../utils/auth';

export default function Navigation() {
  const [user, setUser] = useState<any>(null);
  const [showLibrarianDashboard, setShowLibrarianDashboard] = useState(false);

  useEffect(() => {
    // Check user status on component mount and when localStorage changes
    const checkUser = () => {
      const currentUser = getCurrentUser();
      setUser(currentUser);
      setShowLibrarianDashboard(isLibrarian());
    };

    checkUser();

    // Listen for storage changes (when user logs in/out in another tab)
    const handleStorageChange = () => {
      checkUser();
    };

    window.addEventListener('storage', handleStorageChange);

    // Also check periodically in case of local storage changes in the same tab
    const interval = setInterval(checkUser, 1000);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      clearInterval(interval);
    };
  }, []);

  const handleLogout = () => {
    logout();
    setUser(null);
    setShowLibrarianDashboard(false);
    window.location.href = '/login';
  };

  return (
    <header className="header">
      <div className="container">
        <h1>📚 Library Management System</h1>
        <nav className="nav">
          {user ? (
            <>
              <Link href="/books">View Books</Link>
              <Link href="/my-reservations">My Reservations</Link>
              {(user.role === 'admin' || user.role === 'librarian') && (
                <Link href="/add-book">Add Book</Link>
              )}
              {showLibrarianDashboard && (
                <Link href="/librarian-dashboard">Dashboard</Link>
              )}
              <span className="nav-user" style={{ color: '#a0aec0', fontSize: '0.9rem' }}>
                Welcome, {user.name} ({user.role})
              </span>
              <button 
                onClick={handleLogout}
                className="nav-logout-btn"
                style={{
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.3)',
                  borderRadius: '6px',
                  padding: '0.25rem 0.5rem',
                  cursor: 'pointer',
                  fontSize: '0.9rem',
                  color: '#ef4444'
                }}
              >
                Logout
              </button>
            </>
          ) : null}
        </nav>
      </div>
    </header>
  );
}