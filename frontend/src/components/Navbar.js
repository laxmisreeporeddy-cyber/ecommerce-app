import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const { itemCount } = useCart();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="navbar">
      <Link to="/" className="navbar-logo">
        🛍️ ShopNow
      </Link>
      <div className="navbar-links">
        <Link to="/" className="navbar-link">
          Shop
        </Link>
        {user && (
          <Link to="/orders" className="navbar-link">
            Orders
          </Link>
        )}
        {isAdmin && (
          <Link to="/admin" className="navbar-link">
            Admin
          </Link>
        )}
      </div>
      <div className="navbar-right">
        <Link to="/cart" className="navbar-cart">
          🛒 Cart {itemCount > 0 && <span className="cart-badge">{itemCount}</span>}
        </Link>
        {user ? (
          <div className="navbar-user">
            <span className="navbar-username">{user.name.split(' ')[0]}</span>
            <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
              Logout
            </button>
          </div>
        ) : (
          <Link to="/login" className="btn btn-primary btn-sm">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}
