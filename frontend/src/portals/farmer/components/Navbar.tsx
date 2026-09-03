import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X, User, LogOut, Bell } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Navbar: React.FC = () => {
  const { farmer, logout } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setIsOpen(false);
    navigate('/');
  };

  const closeMenu = () => setIsOpen(false);

  return (
    <header style={{ backgroundColor: 'var(--color-primary)', color: 'white', position: 'sticky', top: 0, zIndex: 50, boxShadow: 'var(--shadow-md)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', maxWidth: '600px', margin: '0 auto' }}>
        <Link to="/farmer/" onClick={closeMenu} style={{ fontSize: '1.25rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          🌱 KrishiPortal
        </Link>

        {farmer && (
          <div className="flex items-center gap-4">
            <Link to="/farmer/notifications" onClick={closeMenu}>
              <Bell size={24} color="white" />
            </Link>
            <button onClick={() => setIsOpen(!isOpen)} style={{ color: 'white' }}>
              {isOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        )}
      </div>

      {isOpen && farmer && (
        <div style={{ backgroundColor: 'var(--color-primary-dark)', padding: '1rem', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <nav className="flex flex-col gap-4">
            <Link to="/farmer/" onClick={closeMenu} className="font-semibold">Dashboard</Link>
            <Link to="/farmer/book-slot" onClick={closeMenu} className="font-semibold">Book Slot</Link>
            <Link to="/farmer/my-token" onClick={closeMenu} className="font-semibold">My Token</Link>
            <Link to="/farmer/live-queue" onClick={closeMenu} className="font-semibold">Live Queue</Link>
            <Link to="/farmer/scanner" onClick={closeMenu} className="font-semibold">Scan QR (Admin)</Link>
            <Link to="/farmer/profile" onClick={closeMenu} className="font-semibold flex items-center gap-2">
              <User size={20} /> My Profile
            </Link>
            <hr style={{ borderColor: 'rgba(255,255,255,0.2)' }} />
            <button onClick={handleLogout} className="font-semibold flex items-center gap-2 w-full text-left">
              <LogOut size={20} /> Logout
            </button>
          </nav>
        </div>
      )}
    </header>
  );
};

export default Navbar;
