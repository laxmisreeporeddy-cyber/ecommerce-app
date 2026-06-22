import React, { useState, useEffect, useCallback } from 'react';
import ProductCard from '../components/ProductCard';
import { productService } from '../services/productService';

export default function ShopPage() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('');

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const params = { page, limit: 12 };
      if (search) params.search = search;
      if (category) params.category = category;
      if (sort) params.sort = sort;
      const data = await productService.getAll(params);
      setProducts(data.products);
      setPages(data.pages);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, category, sort]);

  useEffect(() => {
    productService.getCategories().then((data) => setCategories(data.categories)).catch(() => {});
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Reset to page 1 whenever filters change
  useEffect(() => {
    setPage(1);
  }, [search, category, sort]);

  return (
    <div className="page-container">
      <div className="page-header">
        <div>
          <h1>Product Catalog</h1>
          <p className="text-muted">Browse our collection</p>
        </div>
      </div>

      <div className="search-bar">
        <input
          type="text"
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {loading ? (
        <div className="page-loading">Loading products...</div>
      ) : products.length === 0 ? (
        <div className="empty-state">No products found. Try adjusting your filters.</div>
      ) : (
        <>
          <div className="product-grid">
            {products.map((p) => (
              <ProductCard key={p._id} product={p} />
            ))}
          </div>

          {pages > 1 && (
            <div className="pagination">
              <button className="btn btn-ghost btn-sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                Previous
              </button>
              <span>
                Page {page} of {pages}
              </span>
              <button
                className="btn btn-ghost btn-sm"
                disabled={page >= pages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}