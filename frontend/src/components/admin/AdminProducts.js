import React, { useState, useEffect, useCallback } from 'react';
import { productService } from '../../services/productService';

const EMPTY_FORM = { name: '', price: '', category: 'Electronics', stock: '', description: '', imageUrl: '' };
const CATEGORIES = ['Electronics', 'Clothing', 'Home', 'Books', 'Sports', 'Other'];

export default function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [error, setError] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const data = await productService.getAll({ limit: 50 });
      setProducts(data.products);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openAdd = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setError('');
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditingId(p._id);
    setForm({
      name: p.name,
      price: p.price,
      category: p.category,
      stock: p.stock,
      description: p.description,
      imageUrl: p.imageUrl || '',
    });
    setError('');
    setShowModal(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSave = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name || !form.price || !form.description) {
      setError('Name, price, and description are required');
      return;
    }
    const payload = {
      ...form,
      price: parseFloat(form.price),
      stock: parseInt(form.stock) || 0,
    };
    try {
      if (editingId) {
        await productService.update(editingId, payload);
      } else {
        await productService.create(payload);
      }
      setShowModal(false);
      fetchProducts();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save product');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return;
    try {
      await productService.remove(id);
      fetchProducts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete product');
    }
  };

  if (loading) return <div className="page-loading">Loading products...</div>;

  return (
    <div>
      <div className="section-header">
        <strong>Products ({products.length})</strong>
        <button className="btn btn-primary btn-sm" onClick={openAdd}>
          + Add product
        </button>
      </div>

      <div className="admin-table-wrap">
        <table>
          <thead>
            <tr>
              <th>Product</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p._id}>
                <td><strong>{p.name}</strong></td>
                <td><span className="tag">{p.category}</span></td>
                <td>${p.price.toFixed(2)}</td>
                <td className={p.stock === 0 ? 'out-stock' : p.stock < 5 ? 'low-stock' : 'in-stock'}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} units`}
                </td>
                <td>
                  <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}>
                    Edit
                  </button>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }} onClick={() => handleDelete(p._id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <strong>{editingId ? 'Edit product' : 'Add product'}</strong>
              <button className="btn-icon" onClick={() => setShowModal(false)}>
                ✕
              </button>
            </div>
            <form onSubmit={handleSave}>
              <div className="modal-body">
                {error && <div className="alert alert-danger">{error}</div>}
                <div className="form-group">
                  <label>Product name</label>
                  <input name="name" value={form.name} onChange={handleChange} />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Price ($)</label>
                    <input type="number" step="0.01" name="price" value={form.price} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Category</label>
                    <select name="category" value={form.category} onChange={handleChange}>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label>Stock</label>
                    <input type="number" name="stock" value={form.stock} onChange={handleChange} />
                  </div>
                  <div className="form-group">
                    <label>Image URL (optional)</label>
                    <input name="imageUrl" value={form.imageUrl} onChange={handleChange} placeholder="https://..." />
                  </div>
                </div>
                <div className="form-group">
                  <label>Description</label>
                  <textarea name="description" value={form.description} onChange={handleChange} />
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
