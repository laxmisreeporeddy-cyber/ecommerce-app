// Run with: npm run seed
// Populates the database with demo admin/user accounts and sample products.
require('dotenv').config();
const mongoose = require('mongoose');
const connectDB = require('./db');
const User = require('../models/User');
const Product = require('../models/Product');
const Order = require('../models/Order');

const seed = async () => {
  await connectDB();

  console.log('Clearing existing data...');
  await Promise.all([User.deleteMany(), Product.deleteMany(), Order.deleteMany()]);

  console.log('Creating users...');
  const admin = await User.create({
    name: 'Admin User',
    email: 'admin@shop.com',
    password: 'admin123',
    role: 'admin',
  });

  const demoUser = await User.create({
    name: 'John Doe',
    email: 'user@shop.com',
    password: 'user123',
    role: 'user',
    address: { street: '123 Main St', city: 'New York', state: 'NY', zip: '10001', country: 'USA' },
  });

  console.log('Creating products...');
  const products = await Product.insertMany([
    {
      name: 'Wireless Headphones',
      description: 'Premium wireless headphones with active noise cancellation and 30-hour battery life.',
      price: 89.99,
      category: 'Electronics',
      stock: 15,
      imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400',
      createdBy: admin._id,
    },
    {
      name: 'Smart Watch',
      description: 'Feature-rich smartwatch with health monitoring, GPS, and 7-day battery life.',
      price: 249.99,
      category: 'Electronics',
      stock: 8,
      imageUrl: 'https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=1000&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8c21hcnQlMjB3YXRjaHxlbnwwfHwwfHx8MA%3D%3D',
      createdBy: admin._id,
    },
    {
      name: 'Running Shoes',
      description: 'Lightweight and responsive running shoes designed for daily training.',
      price: 129.99,
      category: 'Sports',
      stock: 22,
      imageUrl: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600',
      createdBy: admin._id,
    },
    {
      name: 'Coffee Maker',
      description: 'Programmable 12-cup coffee maker with auto-clean feature.',
      price: 79.99,
      category: 'Home',
      stock: 3,
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600',
      createdBy: admin._id,
    },
    {
      name: 'JavaScript: The Complete Guide',
      description: 'Master modern JavaScript from fundamentals to advanced concepts, with 200+ exercises.',
      price: 39.99,
      category: 'Books',
      stock: 0,
      imageUrl: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=600',
      createdBy: admin._id,
    },
    {
      name: 'Yoga Mat',
      description: 'Eco-friendly non-slip yoga mat with alignment lines, 6mm thick.',
      price: 34.99,
      category: 'Sports',
      stock: 30,
      imageUrl: 'https://images.unsplash.com/photo-1591291621164-2c6367723315?w=600',
      createdBy: admin._id,
    },
    {
      name: 'Cotton T-Shirt 3-Pack',
      description: 'Pack of 3 premium cotton t-shirts, breathable and durable.',
      price: 44.99,
      category: 'Clothing',
      stock: 18,
      imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=600',
      createdBy: admin._id,
    },
    {
      name: 'LED Desk Lamp',
      description: 'Adjustable LED desk lamp with USB charging port and 5 brightness levels.',
      price: 55.99,
      category: 'Home',
      stock: 11,
      imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=600',
      createdBy: admin._id,
    },
    {
      name: 'Stationery Set',
      description: 'Complete stationery set with pens, pencils, notebook, sticky notes, and a pencil case.',
      price: 19.99,
      category: 'Other',
      stock: 25,
      imageUrl: 'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?w=600',
      createdBy: admin._id,
    },
    {
      name: "Women's Floral Dress",
      description: 'Lightweight floral summer dress with a flattering A-line cut, breathable fabric.',
      price: 49.99,
      category: 'Clothing',
      stock: 14,
      imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600',
      createdBy: admin._id,
    },
    {
      name: "Men's Casual Shirt-Dress",
      description: 'Relaxed-fit long shirt-dress for men, breathable cotton blend, ideal for casual wear.',
      price: 54.99,
      category: 'Clothing',
      stock: 10,
      imageUrl: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600',
      createdBy: admin._id,
    },
  ]);

  console.log('Creating a sample order...');
  await Order.create({
    user: demoUser._id,
    items: [
      {
        product: products[0]._id,
        name: products[0].name,
        quantity: 1,
        price: products[0].price,
      },
    ],
    shippingAddress: {
      fullName: 'John Doe',
      street: '123 Main St',
      city: 'New York',
      state: 'NY',
      zip: '10001',
      country: 'USA',
    },
    paymentMethod: 'card',
    itemsPrice: products[0].price,
    shippingPrice: 9.99,
    taxPrice: Number((products[0].price * 0.08).toFixed(2)),
    totalPrice: Number((products[0].price + 9.99 + products[0].price * 0.08).toFixed(2)),
    status: 'delivered',
    statusHistory: [{ status: 'pending' }, { status: 'processing' }, { status: 'shipped' }, { status: 'delivered' }],
  });

  console.log('Seed complete!');
  console.log('---------------------------------');
  console.log('Admin login: admin@shop.com / admin123');
  console.log('User login:  user@shop.com / user123');
  console.log('---------------------------------');

  await mongoose.connection.close();
  process.exit(0);
};

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
