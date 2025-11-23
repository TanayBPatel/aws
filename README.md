# TradeIn - Fintech Trading Application

A full-stack fintech application for stock and cryptocurrency trading, built with React, Node.js, Express, and MongoDB Atlas.

## Features

- 🔐 **User Authentication** - JWT-based authentication with role-based access (Investor/Admin)
- 💼 **Portfolio Management** - Track holdings, deposits, and withdrawals
- 📈 **Trading** - Buy and sell stocks and cryptocurrencies
- 📊 **Market Data** - Real-time market prices and trends
- 👥 **Admin Dashboard** - System monitoring and user management
- 💬 **Social Feed** - Community posts and interactions
- ⚠️ **Price Alerts** - Set alerts for price movements

## Tech Stack

### Frontend
- React 19
- TypeScript
- Vite
- React Router
- TailwindCSS (via custom CSS)

### Backend
- Node.js
- Express.js
- MongoDB Atlas
- Mongoose
- JWT Authentication
- bcryptjs

## Getting Started

### Prerequisites
- Node.js (v16 or higher)
- MongoDB Atlas account (or local MongoDB)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure environment variables in `.env`:**
   ```env
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/tradein_db?retryWrites=true&w=majority
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRE=30d
   PORT=5000
   NODE_ENV=development
   ```

5. **Start the backend server:**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

The backend server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to project root:**
   ```bash
   cd ..
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file (optional - defaults to localhost:5000):**
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

4. **Start the development server:**
   ```bash
   npm run dev
   ```

The frontend will run on `http://localhost:5173` (or another port if 5173 is busy)

### First Time Setup

1. **Start the backend server first** (see Backend Setup above)

2. **Create an admin account:**
   - Go to the registration page
   - Select "Admin" role
   - Register with your details

3. **Seed the database with initial securities:**
   - Login as admin
   - Visit `/admin` dashboard
   - Call the seed endpoint: `POST /api/markets/seed` (or use Postman/curl)

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user

### Portfolio
- `GET /api/portfolio` - Get user's portfolio
- `POST /api/portfolio/deposit` - Deposit funds
- `POST /api/portfolio/withdraw` - Withdraw funds

### Trading
- `POST /api/trade/buy` - Buy securities
- `POST /api/trade/sell` - Sell securities

### Markets
- `GET /api/markets` - Get all securities
- `GET /api/markets/:id` - Get security by ID
- `POST /api/markets/seed` - Seed database (Admin only)

### Social
- `GET /api/social` - Get all posts
- `POST /api/social` - Create a post
- `PUT /api/social/:id/like` - Toggle like on a post

### Admin
- `GET /api/admin/users` - Get all users (Admin only)
- `GET /api/admin/system` - Get system stats (Admin only)
- `GET /api/admin/user/:id` - Get user details (Admin only)

## Project Structure

```
Tradein/
├── backend/
│   ├── config/
│   │   └── db.js              # MongoDB connection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── portfolioController.js
│   │   ├── tradeController.js
│   │   ├── marketsController.js
│   │   ├── socialController.js
│   │   └── adminController.js
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── admin.js           # Admin role check
│   │   └── errorHandler.js    # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Portfolio.js
│   │   ├── Security.js
│   │   ├── Transaction.js
│   │   ├── SocialPost.js
│   │   └── Alert.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── portfolioRoutes.js
│   │   ├── tradeRoutes.js
│   │   ├── marketsRoutes.js
│   │   ├── socialRoutes.js
│   │   └── adminRoutes.js
│   └── server.js              # Entry point
├── frontend/
│   ├── services/
│   │   └── api.ts             # API service
│   └── ...
├── contexts/
│   ├── AuthContext.tsx        # Authentication context
│   └── ThemeContext.tsx
├── pages/
│   ├── Auth.tsx
│   ├── Dashboard.tsx
│   ├── Markets.tsx
│   ├── Portfolio.tsx
│   ├── AdminDashboard.tsx
│   └── ...
└── components/
    └── ...
```

## Deployment

### Backend Deployment (Heroku/Railway/Render)

1. **Set environment variables in your hosting platform:**
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE` (optional)
   - `PORT` (usually auto-set by hosting)
   - `NODE_ENV=production`

2. **Deploy:**
   ```bash
   git push heroku main
   # or follow your hosting platform's instructions
   ```

### Frontend Deployment (Vercel/Netlify)

1. **Set environment variable:**
   - `VITE_API_URL` - Your deployed backend URL

2. **Build and deploy:**
   ```bash
   npm run build
   # Deploy the 'dist' folder to your hosting platform
   ```

## Development Tips

- The backend uses JWT tokens stored in localStorage
- All protected routes require the `Authorization: Bearer <token>` header
- The frontend automatically includes the token in API requests
- MongoDB Atlas connection string format: `mongodb+srv://username:password@cluster.mongodb.net/dbname`

## Troubleshooting

### "Route not found" error
- Ensure the backend server is running
- Check that the API URL in frontend matches backend URL
- Verify CORS is enabled in backend

### MongoDB connection issues
- Verify your MongoDB Atlas connection string
- Check your IP is whitelisted in MongoDB Atlas
- Ensure database user has proper permissions

### Authentication issues
- Clear localStorage and login again
- Check JWT_SECRET is set correctly
- Verify token expiration settings

## License

MIT

## Support

For issues and questions, please open an issue on GitHub.
