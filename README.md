# Brij Namkeen E-commerce Website

A full-stack e-commerce website for Brij Namkeen, an authentic Indian snacks store.

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or MongoDB Atlas)
- Razorpay account (for payments)
- Gmail account with App Password (for emails)

### Setup

1. **Clone and Install Dependencies**
```bash
# Install backend dependencies
cd server
npm install

# Install frontend dependencies
cd ../client
npm install
```

2. **Configure Environment Variables**
```bash
cd server
# Copy the example file and update with your values
cp .env.example .env
```

Update the `.env` file with:
- `MONGODB_URI` - Your MongoDB connection string
- `JWT_SECRET` - A secure random string (min 32 chars)
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` - From Razorpay dashboard
- `SMTP_*` credentials - For email notifications
- `ADMIN_EMAIL` and `ADMIN_PASSWORD` - Initial admin credentials

3. **Seed Database (Optional)**
```bash
cd server
npm run seed
```

4. **Start Development Servers**
```bash
# Terminal 1 - Backend (port 5000)
cd server
npm run dev

# Terminal 2 - Frontend (port 5173)
cd client
npm run dev
```

5. **Access the Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Admin Panel: http://localhost:5173/admin/login

## 📁 Project Structure

```
brij-namkeen-store/
├── server/                 # Backend (Node.js + Express)
│   ├── src/
│   │   ├── middleware/     # Rate limiting, auth, validation
│   │   ├── models/         # MongoDB models
│   │   ├── routes/         # API routes
│   │   ├── services/       # Email service
│   │   ├── utils/          # Security headers
│   │   ├── scripts/        # Database seeding
│   │   └── index.js        # Server entry point
│   ├── .env               # Environment variables
│   └── package.json
│
└── client/                # Frontend (React + Vite)
    ├── src/
    │   ├── components/    # Navbar, Footer, ProductCard
    │   ├── context/       # CartContext, AuthContext
    │   ├── pages/         # All page components
    │   ├── App.jsx        # Main app with routing
    │   └── index.css      # Design system
    ├── public/
    └── package.json
```

## 🔐 Security Features

- **Rate Limiting**: IP + user-based limits on all endpoints
- **Input Validation**: Schema-based validation with express-validator
- **Authentication**: JWT with httpOnly cookies
- **Security Headers**: Helmet.js with OWASP-compliant CSP
- **Password Hashing**: bcrypt with 12 rounds
- **Account Lockout**: After 5 failed login attempts

## 🎨 Features

- **Product Catalog**: Browse by category with search
- **Shopping Cart**: Persistent cart with localStorage
- **Checkout**: Multi-step form with validation
- **Payment**: Razorpay integration
- **Email Notifications**: Order confirmations sent to owner and customer
- **Admin Dashboard**: Manage products, orders, view statistics
- **Responsive Design**: Works on mobile and desktop
- **Light Theme**: Warm orange/cream color palette

## 📧 Email Configuration (Gmail)

1. Enable 2-Factor Authentication on your Google account
2. Generate an App Password: Google Account → Security → App Passwords
3. Use your email as `SMTP_USER` and the app password as `SMTP_PASS`

## 💳 Razorpay Test Mode

Use test credentials from Razorpay Dashboard:
- Key ID: `rzp_test_xxxxx`
- Key Secret: From Razorpay dashboard
- Test Card: 4111 1111 1111 1111

## 🧪 API Endpoints

### Products
- `GET /api/products` - List products
- `GET /api/products/:id` - Get product
- `POST /api/products` - Create (admin)
- `PUT /api/products/:id` - Update (admin)
- `DELETE /api/products/:id` - Delete (admin)

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:id` - Get order
- `GET /api/orders` - List orders (admin)
- `PATCH /api/orders/:id/status` - Update status (admin)

### Authentication
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Logout
- `GET /api/auth/verify` - Verify token

### Payment
- `GET /api/payment/config` - Get Razorpay key
- `POST /api/payment/create-order` - Create payment order
- `POST /api/payment/verify` - Verify payment

## 📝 License

MIT License
