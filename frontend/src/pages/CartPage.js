import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;

export default function CartPage() {
  const { items, updateQuantity, removeItem, subtotal } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const shipping = items.length === 0 ? 0 : subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleCheckout = () => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/checkout' } } });
      return;
    }
    navigate('/checkout');
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Shopping Cart</h1>
        <Link to="/" className="btn btn-ghost btn-sm">
          Continue shopping
        </Link>
      </div>

      <div className="cart-layout">
        <div className="cart-items">
          {items.length === 0 ? (
            <div className="empty-state">
              Your cart is empty.
              <br />
              <Link to="/" className="btn btn-primary btn-sm" style={{ marginTop: 12 }}>
                Shop now
              </Link>
            </div>
          ) : (
            items.map((item) => (
              <div className="cart-item" key={item.productId}>
                <div className="cart-item-image">{item.imageUrl ? <img src={item.imageUrl} alt={item.name} /> : <span>📦</span>}</div>
                <div className="cart-item-info">
                  <div className="cart-item-name">{item.name}</div>
                  <div className="cart-item-price">${item.price.toFixed(2)}</div>
                </div>
                <div className="qty-ctrl">
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity - 1)}>
                    −
                  </button>
                  <span>{item.quantity}</span>
                  <button className="qty-btn" onClick={() => updateQuantity(item.productId, item.quantity + 1)}>
                    +
                  </button>
                </div>
                <div className="cart-item-total">${(item.price * item.quantity).toFixed(2)}</div>
                <button className="btn-icon-danger" onClick={() => removeItem(item.productId)} aria-label="Remove item">
                  ✕
                </button>
              </div>
            ))
          )}
        </div>

        <div className="cart-summary">
          <h3>Order summary</h3>
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax (8%)</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
          <button className="btn btn-primary btn-full" disabled={items.length === 0} onClick={handleCheckout}>
            Proceed to checkout
          </button>
        </div>
      </div>
    </div>
  );
}
