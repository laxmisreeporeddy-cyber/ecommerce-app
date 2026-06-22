import React, { useState, useEffect } from 'react';
import { orderService } from '../services/orderService';
import AdminProducts from '../components/admin/AdminProducts';
import AdminOrders from '../components/admin/AdminOrders';
import AdminUsers from '../components/admin/AdminUsers';

export default function AdminPage() {
  const [tab, setTab] = useState('products');
  const [stats, setStats] = useState(null);

  const loadStats = () => {
    orderService.getStats().then(setStats).catch(() => {});
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Admin dashboard</h1>
          <p className="text-muted">Manage your store</p>
        </div>
      </div>

      {stats && (
        <div className="stat-grid">
          <div className="stat">
            <div className="stat-val">{stats.totalOrders}</div>
            <div className="stat-label">Total orders</div>
          </div>
          <div className="stat">
            <div className="stat-val">${stats.totalRevenue.toFixed(0)}</div>
            <div className="stat-label">Revenue</div>
          </div>
          {stats.statusCounts.map((s) => (
            <div className="stat" key={s._id}>
              <div className="stat-val">{s.count}</div>
              <div className="stat-label">{s._id}</div>
            </div>
          ))}
        </div>
      )}

      <div className="tabs">
        <div className={`tab ${tab === 'products' ? 'active' : ''}`} onClick={() => setTab('products')}>
          Products
        </div>
        <div className={`tab ${tab === 'orders' ? 'active' : ''}`} onClick={() => setTab('orders')}>
          Orders
        </div>
        <div className={`tab ${tab === 'users' ? 'active' : ''}`} onClick={() => setTab('users')}>
          Users
        </div>
      </div>

      {tab === 'products' && <AdminProducts />}
      {tab === 'orders' && <AdminOrders onStatusChange={loadStats} />}
      {tab === 'users' && <AdminUsers />}
    </div>
  );
}
