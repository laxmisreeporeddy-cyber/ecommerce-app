<<<<<<< HEAD
# ShopNow — Full-Stack E-Commerce Web Application

A complete online store with product catalog, cart, checkout, order tracking, and role-based admin management.

**Stack:** React (frontend) · Node.js / Express (backend) · MongoDB (database) · JWT (auth)

---

## Project structure

```
ecommerce-app/
├── backend/              Express REST API
│   ├── config/            DB connection + seed script
│   ├── controllers/       Route handler logic
│   ├── middleware/        Auth (JWT) + error handling
│   ├── models/             Mongoose schemas (User, Product, Order)
│   ├── routes/             Express routers
│   ├── server.js           App entry point
│   └── .env.example
└── frontend/              React SPA
    ├── public/
    └── src/
        ├── components/     Navbar, ProductCard, route guards, admin widgets
        ├── context/         Auth + Cart global state
        ├── pages/            Shop, Product, Cart, Checkout, Orders, Admin, Login/Register
        ├── services/         Axios API clients
        └── App.js / App.css
```

---

## Features

- **Product catalog** — search, filter by category, sort by price/name/rating, pagination
- **Cart & checkout** — persists in localStorage, computes shipping/tax/total, places real orders against the API
- **Auth** — JWT-based register/login, passwords hashed with bcrypt
- **Role-based access** — `user` vs `admin`; admin routes protected both in the API (middleware) and the UI (route guards)
- **Order tracking** — customers see their own orders and can cancel while pending; admins see all orders and can update status (pending → processing → shipped → delivered, or cancelled)
- **Admin dashboard** — manage products (CRUD), manage orders (status updates), manage users (promote/demote, activate/deactivate)
- **Stock management** — stock decrements atomically when an order is placed (MongoDB transaction) and restocks automatically on cancellation

---

## Prerequisites

- [Node.js](https://nodejs.org/) v18 or later
- A MongoDB instance — either:
  - **Local:** [Install MongoDB Community Server](https://www.mongodb.com/docs/manual/installation/) and run `mongod`
  - **Cloud (easiest):** free tier at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register)

> **Note on transactions:** Order creation uses a MongoDB transaction to atomically check/decrement stock. Transactions require MongoDB to be running as a replica set. Atlas clusters are replica sets by default. For a local standalone `mongod`, either run `mongod --replSet rs0` and initiate it (`rs.initiate()` in the mongo shell), or simplify `createOrder` in `orderController.js` to skip the session/transaction wrapper — it'll still work correctly for typical single-request usage, just without atomic rollback under concurrent orders.

---

## 1. Backend setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:

```
PORT=5000
MONGO_URI=mongodb://localhost:27017/ecommerce
JWT_SECRET=replace_this_with_a_long_random_secret_string
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:3000
```

If using Atlas, `MONGO_URI` looks like:
```
mongodb+srv://<username>:<password>@cluster0.xxxxx.mongodb.net/ecommerce
```

Seed the database with demo accounts and products:

```bash
npm run seed
```

This creates:
| Role  | Email             | Password   |
|-------|-------------------|------------|
| Admin | admin@shop.com    | admin123   |
| User  | user@shop.com     | user123    |

Start the API:

```bash
npm run dev      # with nodemon (auto-restart)
# or
npm start        # plain node
```

API runs at `http://localhost:5000`. Check it's alive:

```bash
curl http://localhost:5000/api/health
```

---

## 2. Frontend setup

In a separate terminal:

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` should point at your running backend:

```
REACT_APP_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm start
```

Opens at `http://localhost:3000`.

---

## 3. Try it out

1. Go to `http://localhost:3000`
2. Browse products, add a few to your cart
3. Click **Login**, sign in as `user@shop.com / user123`
4. Go to cart → checkout → place an order
5. Check **Orders** to see it tracked as "pending"
6. Log out, log back in as `admin@shop.com / admin123`
7. Open **Admin** → update that order's status, add/edit/delete products, view all users

---

## API reference

All endpoints are prefixed with `/api`.

### Auth (`/auth`)
| Method | Endpoint    | Access  | Description |
|--------|-------------|---------|--------------|
| POST   | `/register` | Public  | Create a user account (always role=`user`) |
| POST   | `/login`    | Public  | Returns JWT + user object |
| GET    | `/me`       | Private | Get current user |
| PUT    | `/me`       | Private | Update name/address |

### Products (`/products`)
| Method | Endpoint      | Access | Description |
|--------|---------------|--------|--------------|
| GET    | `/`           | Public | List products — supports `?search=&category=&minPrice=&maxPrice=&sort=&page=&limit=` |
| GET    | `/categories` | Public | List distinct categories |
| GET    | `/:id`        | Public | Get one product |
| POST   | `/`           | Admin  | Create product |
| PUT    | `/:id`        | Admin  | Update product |
| DELETE | `/:id`        | Admin  | Delete product |

### Orders (`/orders`) — all require auth
| Method | Endpoint       | Access | Description |
|--------|----------------|--------|--------------|
| POST   | `/`            | User   | Place an order from `{ items, shippingAddress, paymentMethod }` |
| GET    | `/my`          | User   | List own orders, optional `?status=` |
| GET    | `/:id`         | Owner/Admin | Get single order |
| PUT    | `/:id/cancel`  | Owner  | Cancel own order (only while `pending`) |
| GET    | `/`            | Admin  | List all orders |
| PUT    | `/:id/status`  | Admin  | Update order status |
| GET    | `/stats`       | Admin  | Order counts + revenue for dashboard |

### Users (`/users`) — admin only
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET    | `/`      | List all users |
| GET    | `/:id`   | Get one user |
| PUT    | `/:id`   | Update role / active status |
| DELETE | `/:id`   | Delete user |

---

## Security notes built in

- Passwords hashed with bcrypt, never returned in API responses (`select: false`)
- JWT signed with a server-side secret, role embedded server-side only — registration always forces `role: 'user'`, so a client can't self-promote to admin
- All admin routes protected by both `protect` (valid JWT) and `authorize('admin')` middleware
- Rate limiting on `/auth/login` and `/auth/register` to slow brute-force attempts
- `helmet` for standard HTTP security headers
- Centralized error handler normalizes Mongoose/JWT errors into clean JSON

## What's intentionally left as a demo stub

- **Payment processing**: the checkout form collects card fields for realism, but nothing is charged or sent to a payment processor. Swap in Stripe/PayPal before going to production.
- **Email notifications**: order confirmation emails aren't sent. Hook into a provider like SendGrid in `orderController.js` after order creation if needed.
- **Image uploads**: products take an `imageUrl` string field rather than a file upload pipeline. Add S3/Cloudinary if you want real image hosting.

---

## Deploying

- **Backend**: any Node host (Render, Railway, Fly.io, EC2). Set the same env vars from `.env.example`.
- **Frontend**: `npm run build` produces a static `build/` folder — deploy to Vercel, Netlify, or serve via the backend with `express.static`.
- **Database**: MongoDB Atlas free tier is the easiest path for both dev and small production deployments.

Remember to update `CLIENT_URL` (backend) and `REACT_APP_API_URL` (frontend) to your deployed URLs.
=======
# ecommerce-app
>>>>>>> 711c3d7333ceed6a6c56591cdde3c0b291242d2b
