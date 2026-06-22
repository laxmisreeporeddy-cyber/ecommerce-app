import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../services/orderService';

const STATUS_TABS = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expanded, setExpanded] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const data = await orderService.getMyOrders({ status: filter });
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleCancel = async (id) => {
    if (!window.confirm('Cancel this order?')) return;
    try {
      await orderService.cancel(id);
      fetchOrders();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel order');
    }
  };

  return (
    <div className="page-container">
      <h1>My orders</h1>

      <div className="tabs">
        {STATUS_TABS.map((s) => (
          <div key={s} className={`tab ${filter === s ? 'active' : ''}`} onClick={() => setFilter(s)}>
            {s.charAt(0).toUpperCase() + s.slice(1)}
          </div>
        ))}
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading orders...</div>
      ) : orders.length === 0 ? (
        <div className="empty-state">No orders found</div>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div className="order-card" key={order._id}>
              <div className="order-card-header" onClick={() => setExpanded(expanded === order._id ? null : order._id)}>
                <div>
                  <strong>{order.orderNumber}</strong>
                  <span className="text-muted"> · {new Date(order.createdAt).toLocaleDateString()}</span>
                </div>
                <span className={`status status-${order.status}`}>{order.status}</span>
                <strong>${order.totalPrice.toFixed(2)}</strong>
              </div>
              {expanded === order._id && (
                <div className="order-card-detail">
                  {order.items.map((item, idx) => (
                    <div className="summary-row" key={idx}>
                      <span>
                        {item.name} × {item.quantity}
                      </span>
                      <span>${(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="summary-row">
                    <span>Shipping to</span>
                    <span>
                      {order.shippingAddress.street}, {order.shippingAddress.city} {order.shippingAddress.zip}
                    </span>
                  </div>
                  {order.status === 'pending' && (
                    <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)} style={{ marginTop: 10 }}>
                      Cancel order
                    </button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
