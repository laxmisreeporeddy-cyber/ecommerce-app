import React from 'react';
import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';

export default function ProductCard({ product }) {
  const { addItem, items } = useCart();
  const inCart = items.find((i) => i.productId === product._id);

  const stockLabel =
    product.stock === 0 ? 'Out of stock' : product.stock < 5 ? `Only ${product.stock} left` : `In stock`;
  const stockClass = product.stock === 0 ? 'out-stock' : product.stock < 5 ? 'low-stock' : 'in-stock';

  return (
    <div className="product-card">
      <Link to={`/products/${product._id}`} className="product-card-link">
        <div className="product-card-image">
          {product.imageUrl ? <img src={product.imageUrl} alt={product.name} /> : <span>📦</span>}
        </div>
        <div className="product-card-body">
          <div className="product-card-category">{product.category}</div>
          <div className="product-card-name">{product.name}</div>
          <div className="product-card-price">${product.price.toFixed(2)}</div>
          <div className={`product-card-stock ${stockClass}`}>{stockLabel}</div>
        </div>
      </Link>
      <button
        className={`btn btn-sm ${inCart ? 'btn-ghost' : 'btn-primary'}`}
        disabled={product.stock === 0}
        onClick={() => addItem(product, 1)}
      >
        {product.stock === 0 ? 'Unavailable' : inCart ? 'Add more' : 'Add to cart'}
      </button>
    </div>
  );
}
