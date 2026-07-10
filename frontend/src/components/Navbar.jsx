import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);

  return (
    <nav>
      <div style={{ maxWidth: '1400px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#667eea' }}>
          RestaurantReserve
        </div>
        <ul style={{ margin: 0 }}>
          {!user ? (
            <>
              <li><Link to="/login">Login</Link></li>
              <li><Link to="/register">Register</Link></li>
            </>
          ) : (
            <>
              {user.role === 'customer' ? (
                <li><Link to="/dashboard">Dashboard</Link></li>
              ) : (
                <li><Link to="/admin">Admin Panel</Link></li>
              )}
              <li style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <span style={{ color: '#6b7280', fontWeight: 500 }}>
                  Hi, {user.name}
                </span>
                <button onClick={logout}>Logout</button>
              </li>
            </>
          )}
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
