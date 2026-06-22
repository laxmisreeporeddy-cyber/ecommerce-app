import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { orderService } from '../services/orderService';

const TAX_RATE = 0.08;
const FREE_SHIPPING_THRESHOLD = 100;
const FLAT_SHIPPING_RATE = 9.99;

export default function CheckoutPage() {
  const { items, subtotal, clearCart } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: user?.name || '',
    street: '',
    city: '',
    state: '',
    zip: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [placedOrder, setPlacedOrder] = useState(null);

  const shipping = subtotal > FREE_SHIPPING_THRESHOLD ? 0 : FLAT_SHIPPING_RATE;
  const tax = subtotal * TAX_RATE;
  const total = subtotal + shipping + tax;

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!form.fullName || !form.street || !form.city || !form.zip || !form.cardNumber) {
      setError('Please fill in all required fields');
      return;
    }
    if (items.length === 0) {
      setError('Your cart is empty');
      return;
    }

    setSubmitting(true);
    try {
      // NOTE: this is a demo checkout flow -- payment fields are collected
      // but never sent to or processed by the backend. Wire up a real
      // payment provider (Stripe, etc.) before using this in production.
      const data = await orderService.create({
        items: items.map((i) => ({ productId: i.productId, quantity: i.quantity })),
        shippingAddress: {
          fullName: form.fullName,
          street: form.street,
          city: form.city,
          state: form.state,
          zip: form.zip,
          country: 'USA',
        },
        paymentMethod: 'card',
      });
      setPlacedOrder(data.order);
      clearCart();
      setTimeout(() => navigate('/orders'), 2500);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order');
    } finally {
      setSubmitting(false);
    }
  };

  if (placedOrder) {
    return (
      <div className="page-container">
        <div className="order-success">
          <div className="order-success-icon">✅</div>
          <h2>Order placed!</h2>
          <p className="text-muted">Your order has been confirmed. Redirecting to your orders...</p>
          <div className="order-success-id">Order: {placedOrder.orderNumber}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1>Checkout</h1>
      <div className="checkout-layout">
        <form className="checkout-form" onSubmit={handleSubmit}>
          {error && <div className="alert alert-danger">{error}</div>}

          <h3>Shipping address</h3>
          <div className="form-group">
            <label>Full name</label>
            <input name="fullName" value={form.fullName} onChange={handleChange} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label>Street address</label>
            <input name="street" value={form.street} onChange={handleChange} placeholder="123 Main St" />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>City</label>
              <input name="city" value={form.city} onChange={handleChange} placeholder="New York" />
            </div>
            <div className="form-group">
              <label>State</label>
              <input name="state" value={form.state} onChange={handleChange} placeholder="NY" />
            </div>
            <div className="form-group">
              <label>ZIP</label>
              <input name="zip" value={form.zip} onChange={handleChange} placeholder="10001" />
            </div>
          </div>

          <h3>Payment</h3>
          <div className="form-group">
            <label>Card number</label>
            <input name="cardNumber" value={form.cardNumber} onChange={handleChange} placeholder="4242 4242 4242 4242" maxLength={19} />
          </div>
          <div className="form-row">
            <div className="form-group">
              <label>Expiry</label>
              <input name="expiry" value={form.expiry} onChange={handleChange} placeholder="MM/YY" />
            </div>
            <div className="form-group">
              <label>CVV</label>
              <input name="cvv" value={form.cvv} onChange={handleChange} placeholder="123" maxLength={3} />
            </div>
          </div>

          <button className="btn btn-primary btn-full" type="submit" disabled={submitting}>
            {submitting ? 'Placing order...' : `Place order - $${total.toFixed(2)}`}
          </button>
        </form>

        <div className="cart-summary">
          <h3>Order summary</h3>
          {items.map((i) => (
            <div className="summary-row" key={i.productId}>
              <span>
                {i.name} × {i.quantity}
              </span>
              <span>${(i.price * i.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="summary-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="summary-row">
            <span>Shipping</span>
            <span>{shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}</span>
          </div>
          <div className="summary-row">
            <span>Tax</span>
            <span>${tax.toFixed(2)}</span>
          </div>
          <div className="summary-row summary-total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
