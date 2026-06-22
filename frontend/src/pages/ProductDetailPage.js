import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { productService } from '../services/productService';
import { useCart } from '../context/CartContext';

export default function ProductDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();

  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    productService
      .getOne(id)
      .then((data) => setProduct(data.product))
      .catch((err) => setError(err.response?.data?.message || 'Product not found'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <div className="page-loading">Loading...</div>;
  if (error) return <div className="page-container"><div className="alert alert-danger">{error}</div></div>;
  if (!product) return null;

  const handleAddToCart = () => {
    addItem(product, qty);
    navigate('/cart');
  };

  return (
    <div className="page-container">
      <div className="breadcrumb">
        <Link to="/">Shop</Link> / <span>{product.category}</span> / <span>{product.name}</span>
      </div>
      <div className="product-detail">
        <div className="product-detail-image">{product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>📦</span>}</div>
        <div className="product-detail-info">
          <div className="tag">{product.category}</div>
          <h1>{product.name}</h1>
          <div className="product-detail-price">${product.price.toFixed(2)}</div>
          <p className="text-muted">{product.description}</p>

          <div className="qty-row">
            <div className="qty-ctrl">
              <button className="qty-btn" onClick={() => setQty((q) => Math.max(1, q - 1))}>
                −
              </button>
              <span>{qty}</span>
              <button className="qty-btn" onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>
                +
              </button>
            </div>
            <button className="btn btn-primary" disabled={product.stock === 0} onClick={handleAddToCart}>
              {product.stock === 0 ? 'Out of stock' : 'Add to cart'}
            </button>
          </div>

          <div className={product.stock === 0 ? 'out-stock' : product.stock < 5 ? 'low-stock' : 'in-stock'}>
            {product.stock === 0
              ? 'Out of stock'
              : product.stock < 5
              ? `Only ${product.stock} left in stock`
              : `${product.stock} items available`}
          </div>
        </div>
      </div>
    </div>
  );
}
