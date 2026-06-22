import React, { useState, useEffect } from 'react';
import { userService } from '../../services/userService';
import { useAuth } from '../../context/AuthContext';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { user: currentUser } = useAuth();

  const fetchUsers = () => {
    setLoading(true);
    userService
      .getAll()
      .then((data) => setUsers(data.users))
      .catch((err) => setError(err.response?.data?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const toggleRole = async (u) => {
    const newRole = u.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${u.name}'s role to ${newRole}?`)) return;
    try {
      await userService.update(u._id, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update role');
    }
  };

  const toggleActive = async (u) => {
    try {
      await userService.update(u._id, { isActive: !u.isActive });
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update user');
    }
  };

  if (loading) return <div className="page-loading">Loading users...</div>;
  if (error) return <div className="alert alert-danger">{error}</div>;

  return (
    <div className="admin-table-wrap">
      <table>
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Role</th>
            <th>Status</th>
            <th>Joined</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {users.map((u) => (
            <tr key={u._id}>
              <td><strong>{u.name}</strong></td>
              <td>{u.email}</td>
              <td>
                <span className={`role-badge role-${u.role}`}>{u.role.toUpperCase()}</span>
              </td>
              <td>{u.isActive ? 'Active' : 'Deactivated'}</td>
              <td>{new Date(u.createdAt).toLocaleDateString()}</td>
              <td>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleRole(u)}
                  disabled={u._id === currentUser.id}
                >
                  Make {u.role === 'admin' ? 'user' : 'admin'}
                </button>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => toggleActive(u)}
                  disabled={u._id === currentUser.id}
                >
                  {u.isActive ? 'Deactivate' : 'Activate'}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
