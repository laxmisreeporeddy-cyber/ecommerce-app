import React, { useState, useEffect, useCallback } from 'react';
import { orderService } from '../../services/orderService';

const STATUSES = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

export default function AdminOrders({ onStatusChange }) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const data = await orderService.getAll({ limit: 50 });
      setOrders(data.orders);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleStatusChange = async (id, status) => {
    try {
      await orderService.updateStatus(id, status);
      fetchOrders();
      if (onStatusChange) onStatusChange();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  if (loading) return <div className="page-loading">Loading orders...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Customer</th>
            <th>Date</th>
            <th>Total</th>
            <th>Status</th>
            <th>Update</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((o) => (
            <tr key={o._id}>
              <td><strong>{o.orderNumber}</strong></td>
              <td>{o.user?.name || 'Unknown'}</td>
              <td>{new Date(o.createdAt).toLocaleDateString()}</td>
              <td><strong>${o.totalPrice.toFixed(2)}</strong></td>
              <td><span className={`status status-${o.status}`}>{o.status}</span></td>
              <td>
                <select value={o.status} onChange={(e) => handleStatusChange(o._id, e.target.value)}>
                  {STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
