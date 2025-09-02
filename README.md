# 🛒 Full-Stack E-Commerce Application

A modern, full-featured e-commerce platform built with React.js and Node.js, featuring dynamic pricing, offer management, payment integration, and comprehensive analytics.

## 🚀 Live Demo

- **Frontend**: [Your Frontend URL]
- **Backend API**: [Your Backend URL]
- **Admin Panel**: [Your Admin URL]

## 📋 Table of Contents

- [Features](#-features)
- [Security](#-security)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Installation](#-installation)
- [Environment Setup](#-environment-setup)
- [Development](#-development)
- [Deployment](#-deployment)
- [API Documentation](#-api-documentation)
- [Performance Optimization](#-performance-optimization)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

### 🛍️ **E-Commerce Core**

- **Product Management**: Dynamic product catalog with categories
- **Shopping Cart**: Persistent cart with quantity management
- **Wishlist**: Save products for later
- **Search & Filter**: Advanced product search and filtering
- **Product Reviews**: Customer feedback system

### 💰 **Pricing & Offers**

- **Dynamic Pricing**: Offer-based pricing system
- **Buy 2 Get 1 Free**: Automatic discount calculation
- **Promotional Codes**: Coupon and discount management
- **Price Tracking**: Analytics-ready pricing system

### 💳 **Payment Integration**

- **Cashfree Payments v4**: Latest API integration with SDK fallback
- **Server-Side Redirect**: Secure payment processing
- **Payment Verification**: Real-time status checking
- **Multiple Payment Methods**: UPI, Cards, Net Banking, Wallets
- **Cash on Delivery**: Direct COD integration
- **Payment Analytics**: Transaction tracking and reporting
- **Webhook Support**: Automated payment notifications

### 📱 **User Experience**

- **Responsive Design**: Mobile-first approach
- **Progressive Web App**: PWA capabilities
- **Fast Loading**: Optimized performance
- **Dark/Light Theme**: Dynamic theme system

### 📊 **Analytics & Tracking**

- **Google Analytics**: Enhanced e-commerce tracking
- **Facebook Pixel**: Social media analytics
- **Custom Events**: Detailed user behavior tracking
- **Performance Monitoring**: Real-time performance metrics

### 🔧 **Admin Features**

- **Product Management**: Add, edit, delete products
- **Order Management**: Track and manage orders
- **User Management**: Customer data management
- **Analytics Dashboard**: Sales and performance insights

## � Security

### **Critical Security Fixes Applied**

✅ **Admin Authentication Security** 
- **Issue Fixed**: Removed vulnerable `AdminDashboard` component that allowed unauthorized access
- **Solution**: Implemented mandatory authentication for all admin routes
- **Status**: `/myadmin` now requires login - fully secured ✅

✅ **Performance Optimization**
- **Issue Fixed**: Facebook Pixel navigation throttling causing browser IPC flooding
- **Solution**: Comprehensive tracking optimization with error suppression
- **Status**: Zero navigation throttling errors - fully optimized ✅

### **Security Features**

- **Bcrypt Password Hashing**: 12-round salt protection
- **Session-based Authentication**: Secure HTTP-only cookies
- **CORS Protection**: Configured origins and headers
- **Rate Limiting**: Request throttling protection
- **Input Validation**: Server-side data validation
- **Environment Security**: Separated dev/production configurations

### **Admin Panel Security**

- **Mandatory Authentication**: Cannot access admin without login
- **Session Validation**: Backend verification for all admin requests
- **Secure Logout**: Proper session cleanup and token invalidation
- **Route Protection**: Client-side and server-side auth checks

## �🛠️ Tech Stack

### **Frontend**
- **Framework**: React 18.2.0
- **Styling**: Tailwind CSS 3.4.17
- **State Management**: Context API + Hooks
- **Routing**: React Router DOM 6.3.0
- **Build Tool**: Create React App
- **Animations**: Framer Motion 12.16.0
- **Form Handling**: Formik + Yup
- **Image Slider**: Keen Slider 6.8.6

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js 4.18.2
- **Database**: MongoDB with Mongoose 8.0.3
- **Authentication**: JWT + bcryptjs
- **Payment**: Cashfree and COD integration
- **Security**: Helmet, CORS, Rate Limiting
- **Validation**: Express Validator

### **DevOps & Deployment**
- **Hosting**: Render.com
- **Database**: MongoDB Atlas
- **CDN**: Cloudflare (optional)
- **Monitoring**: Custom analytics
- **Process Manager**: PM2

## 📁 Project Structure

```
Fullapp-e/
├── Client/                          # React Frontend
│   ├── public/
│   │   ├── index.html
│   │   ├── manifest.json
│   │   └── robots.txt
│   ├── src/
│   │   ├── component/               # React Components
│   │   │   ├── Header/             # Navigation components
│   │   │   ├── Footer/             # Footer components
│   │   │   ├── Home/               # Homepage components
│   │   │   ├── Cart/               # Shopping cart
│   │   │   ├── Checkout/           # Checkout process
│   │   │   ├── Payment/            # Payment integration
│   │   │   ├── Products/           # Product management
│   │   │   ├── Category/           # Category pages
│   │   │   ├── SingleProduct/      # Product detail page
│   │   │   ├── Wishlist/           # Wishlist functionality
│   │   │   ├── MyAdmin/            # Admin panel
│   │   │   └── Common/             # Shared components
│   │   ├── contexts/               # React Contexts
│   │   │   ├── AuthContext.js      # Authentication state
│   │   │   ├── CartContext.js      # Cart management
│   │   │   ├── OfferContext.js     # Offer system
│   │   │   └── LocationContext.js  # Location tracking
│   │   ├── hooks/                  # Custom React Hooks
│   │   │   ├── useOfferEligibilityOptimized.js
│   │   │   ├── useDeviceDetect.js
│   │   │   ├── useDynamicTitle.js
│   │   │   └── useTheme.js
│   │   ├── utils/                  # Utility Functions
│   │   │   ├── priceHelper.js      # Price calculations
│   │   │   ├── trackingManager.js  # Analytics tracking
│   │   │   ├── paymentUtils.js     # Payment helpers
│   │   │   ├── envConfig.js        # Environment config
│   │   │   └── CategoryService.js  # Category API service
│   │   ├── services/               # API Services
│   │   │   └── paymentService.js   # Payment API calls
│   │   ├── Router/                 # Routing Configuration
│   │   │   ├── OptimizedRouter.js  # Main router with lazy loading
│   │   │   └── routes.js           # Route definitions
│   │   ├── config/                 # Configuration
│   │   │   └── api.js              # API base URL config
│   │   ├── assets/                 # Static Assets
│   │   │   ├── image/              # Images
│   │   │   └── team/               # Team photos
│   │   ├── App.js                  # Main App component
│   │   ├── index.js                # React entry point
│   │   └── index.css               # Global styles
│   ├── package.json                # Frontend dependencies
│   ├── tailwind.config.js          # Tailwind configuration
│   └── postcss.config.js           # PostCSS configuration
├── Server/                         # Node.js Backend
│   ├── Controller/                 # Route Controllers
│   │   ├── Products.controller.js  # Product CRUD operations
│   │   ├── Payment.controller.js   # Payment handling
│   │   └── Slider.controller.js    # Slider management
│   ├── model/                      # MongoDB Models
│   │   ├── Products.modal.js       # Product schema
│   │   ├── Category.modal.js       # Category schema
│   │   ├── EnvConfig.modal.js      # Environment config
│   │   ├── EnvAuth.modal.js        # Admin authentication
│   │   └── SliderWithLogo.modal.js # Homepage slider
│   ├── routes/                     # API Routes
│   │   ├── Products.route.js       # Product endpoints
│   │   ├── Payment.route.js        # Payment endpoints
│   │   ├── Config.route.js         # Configuration endpoints
│   │   ├── EnvAuth.route.js        # Admin auth endpoints
│   │   ├── EnvConfig.route.js      # Environment endpoints
│   │   └── Slider.route.js         # Slider endpoints
│   ├── middleware/                 # Express Middleware
│   ├── services/                   # Business Logic
│   ├── utils/                      # Server Utilities
│   │   └── CustomerDataExtractor.js# Customer data processing
│   ├── config/                     # Server Configuration
│   ├── index.js                    # Server entry point
│   ├── package.json                # Backend dependencies
│   └── ecosystem.config.js         # PM2 configuration
├── scripts/                        # Utility Scripts
│   ├── migrations/                 # Database migrations
│   └── testing/                    # Test scripts
├── .env                           # Environment variables
├── .gitignore                     # Git ignore rules
├── render.yaml                    # Render deployment config
├── package.json                   # Root package.json
└── README.md                      # This file
```

## 🚀 Installation

### **Prerequisites**
- Node.js 20.x or higher
- MongoDB 4.4 or higher
- Git

### **1. Clone the Repository**
```bash
git clone https://github.com/srenterprice11/Fullapp-e.git
cd Fullapp-e
```

### **2. Install Root Dependencies**
```bash
npm install
```

### **3. Install Frontend Dependencies**
```bash
cd Client
npm install
cd ..
```

### **4. Install Backend Dependencies**
```bash
cd Server
npm install
cd ..
```

## 🔧 Environment Setup

### **1. Create Environment Files**

Create `.env` file in the root directory:
```env
# Database Configuration
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
DB_ENV=your_mongodb_connection_string
DB=your_database_name

# Server Configuration
NODE_ENV=development
PORT=5001
SESSION_SECRET=your_session_secret_here

# Admin Configuration
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your_admin_password
ADMIN_EMAIL=admin@yourdomain.com

# Frontend Configuration
REACT_APP_API_BASE_URL=http://localhost:5001
REACT_APP_ENVIRONMENT=development

# Analytics (Optional)
REACT_APP_GA_TRACKING_ID=your_google_analytics_id
REACT_APP_FB_PIXEL_ID=your_facebook_pixel_id

# App Branding
REACT_APP_APP_NAME=Your Store Name
REACT_APP_LOGO=your_logo_url
REACT_APP_THEME_COLOR=#3B82F6
```

### **2. Frontend Environment**
Create `Client/.env`:
```env
REACT_APP_API_BASE_URL=http://localhost:5001
GENERATE_SOURCEMAP=false
```

### **3. Cashfree Payment Gateway Setup**

Add Cashfree configuration to your `.env` file:

```env
# Cashfree Payment Gateway
CASHFREE_CLIENT_ID=your_cashfree_client_id
CASHFREE_CLIENT_SECRET=your_cashfree_client_secret
CASHFREE_ENVIRONMENT=sandbox
CASHFREE_ENABLED=true
```

**Steps to configure:**

1. **Create Cashfree Account**:
   - Visit [Cashfree Dashboard](https://www.cashfree.com)
   - Sign up for a merchant account
   - Complete KYC verification

2. **Get API Credentials**:
   - Login to Cashfree Dashboard
   - Navigate to Developers > API Keys
   - Copy Client ID and Client Secret

3. **Configure Webhooks** (Optional):
   - Set webhook URL: `https://yourdomain.com/api/payment/webhook`
   - Enable order notifications

4. **Test Integration**:
   ```bash
   # Start the test environment
   ./start-payment-test.sh
   
   # Open test suite
   open test-cashfree-api-v4.html
   ```

### **4. Database Setup**
1. Create a MongoDB database
2. Update `MONGODB_URI` in your `.env` file
3. The application will automatically create collections on first run

## 🏃‍♂️ Development

### **Start Development Servers**

**Option 1: Start both servers separately**
```bash
# Terminal 1 - Backend
cd Server
npm run dev

# Terminal 2 - Frontend  
cd Client
npm start
```

**Option 2: Use concurrently (if configured)**
```bash
npm run dev
```

### **Development URLs**
- Frontend: http://localhost:3000
- Backend API: http://localhost:5001
- Admin Panel: http://localhost:3000/myadmin

### **Admin Access**
- Username: admin (or as configured in .env)
- Password: your_admin_password

## 🌐 Deployment

### **Render.com Deployment (Recommended)**

1. **Connect Repository**
   - Connect your GitHub repository to Render
   - Configure build and start commands

2. **Environment Variables**
   - Add all production environment variables
   - Set `NODE_ENV=production`
   - Configure `REACT_APP_API_BASE_URL` to your backend URL

3. **Build Configuration**
   ```yaml
   # render.yaml
   services:
     - type: web
       name: fullapp-backend
       env: node
       buildCommand: cd Server && npm install
       startCommand: cd Server && npm start
       
     - type: web
       name: fullapp-frontend
       env: static
       buildCommand: cd Client && npm install && npm run build
       staticPublishPath: ./Client/build
   ```

### **Manual Deployment**

1. **Build Frontend**
   ```bash
   cd Client
   npm run build
   ```

2. **Deploy Backend**
   ```bash
   cd Server
   npm install --production
   npm start
   ```

## 📚 API Documentation

### **Base URL**
- Development: `http://localhost:5001/api`
- Production: `https://yourdomain.com/api`

### **Authentication**
Most admin endpoints require authentication via JWT token.

### **Products Endpoints**

#### **Get All Products**
```http
GET /api/products/get
```

#### **Get Single Product**
```http
GET /api/products/single/:id
```

#### **Add Product (Admin)**
```http
POST /api/products/add
Content-Type: application/json

{
  "title": "Product Name",
  "price": 999,
  "discount": 799,
  "category": "category_id",
  "images": ["image_url_1", "image_url_2"],
  "description": "Product description",
  "stock": 100
}
```

#### **Update Product (Admin)**
```http
PUT /api/products/update/:id
```

#### **Delete Product (Admin)**
```http
DELETE /api/products/delete/:id
```

### **Category Endpoints**

#### **Get All Categories**
```http
GET /api/category/get
```

#### **Get Category Products**
```http
GET /api/category/:id
```

### **Payment Endpoints**

#### **Create Payment Order**
```http
POST /api/payment/create-order
Content-Type: application/json

{
  "amount": 1000,
  "customer": {
    "name": "Customer Name",
    "email": "customer@email.com",
    "phone": "9999999999"
  },
  "products": []
}
```

#### **Verify Payment**
```http
GET /api/payment/verify/:orderId
```

### **Slider Endpoints**

#### **Get Slider Data**
```http
GET /api/slider/get
```

## ⚡ Performance Optimization

### **Current Optimization Status**

#### **✅ Implemented**
- Lazy loading for routes
- Image optimization
- API response caching
- Bundle splitting (basic)
- Code minification
- Gzip compression

#### **🔄 In Progress**
- React.memo implementation
- Context splitting
- API deduplication
- Advanced caching strategies

#### **📋 Planned**
- Service worker implementation
- Database query optimization
- CDN integration
- Performance monitoring

### **Performance Metrics (Target)**
- **First Paint**: < 1.5s
- **Time to Interactive**: < 3s
- **Bundle Size**: < 1MB
- **Lighthouse Score**: > 90

### **Optimization Techniques**

1. **Code Splitting**
   ```javascript
   // Lazy load heavy components
   const AdminPanel = lazy(() => import('./components/Admin'));
   const Analytics = lazy(() => import('./components/Analytics'));
   ```

2. **Memoization**
   ```javascript
   // Expensive calculations
   const cartTotal = useMemo(() => 
     calculateTotal(cartItems), [cartItems]
   );
   ```

3. **Context Optimization**
   ```javascript
   // Split large contexts into smaller ones
   <AuthProvider>
     <CartProvider>
       <ProductProvider>
         <App />
       </ProductProvider>
     </CartProvider>
   </AuthProvider>
   ```

## 🧪 Testing

### **Frontend Testing**
```bash
cd Client
npm test
```

### **Backend Testing**
```bash
cd Server
npm test
```

### **E2E Testing**
```bash
npm run test:e2e
```

## 📊 Monitoring & Analytics

### **Built-in Analytics**
- Google Analytics 4 integration
- Facebook Pixel tracking
- Custom event tracking
- Performance monitoring

### **Key Metrics Tracked**
- Page views
- Product views
- Add to cart events
- Purchase events
- User engagement
- Performance metrics

## 🔒 Security Features

- **Helmet.js**: Security headers
- **Rate Limiting**: API protection
- **Input Validation**: Express validator
- **XSS Protection**: Content Security Policy
- **JWT Authentication**: Secure admin access
- **Environment Variables**: Sensitive data protection

## 🧪 Testing Cashfree Integration

### **Quick Test Setup**

Use the automated test environment for complete Cashfree integration testing:

```bash
# Start backend and frontend servers with test suite
./start-payment-test.sh

# Clean up test environment
./cleanup-payment-test.sh
```

### **Manual Testing Steps**

1. **Environment Configuration**:
   - Add Cashfree credentials to `.env` or admin panel
   - Ensure `CASHFREE_ENABLED=true`
   - Set `CASHFREE_ENVIRONMENT=sandbox` for testing

2. **Backend API Testing**:
   ```bash
   # Test payment configuration
   curl http://localhost:5001/api/payment/config
   
   # Test order creation
   curl -X POST http://localhost:5001/api/payment/create-order \
     -H "Content-Type: application/json" \
     -d '{
       "amount": 100,
       "customer": {
         "customer_name": "Test User",
         "customer_phone": "9999999999",
         "customer_email": "test@example.com"
       }
     }'
   ```

3. **Frontend Payment Flow**:
   - Navigate to cart and add products
   - Proceed to checkout with valid address
   - Select "Online Payment" option
   - Complete payment flow in sandbox

4. **Test Suite Usage**:
   - Open `test-cashfree-api-v4.html` in browser
   - Run all API tests sequentially
   - Verify order creation and payment verification
   - Test server-side redirect functionality

### **Test Credentials**

For sandbox testing, use these test payment details:

- **Test Card**: 4111 1111 1111 1111
- **Expiry**: Any future date
- **CVV**: Any 3 digits
- **OTP**: 123456

## 🐛 Troubleshooting

### **Common Issues**

1. **Port Already in Use**
   ```bash
   # Kill process on port 3000
   kill -9 $(lsof -ti:3000)
   
   # Kill process on port 5001
   kill -9 $(lsof -ti:5001)
   ```

2. **MongoDB Connection Issues**
   - Check MongoDB URI in `.env`
   - Ensure MongoDB service is running
   - Check network connectivity

3. **Build Errors**
   ```bash
   # Clear npm cache
   npm cache clean --force
   
   # Delete node_modules and reinstall
   rm -rf node_modules package-lock.json
   npm install
   ```

4. **Payment Issues**
   - Check Cashfree configuration
   - Verify payment processing
   - Test COD flow

## 🤝 Contributing

### **Development Workflow**

1. **Fork the repository**
2. **Create feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make changes and commit**
   ```bash
   git commit -m "Add amazing feature"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Create Pull Request**

### **Code Style**
- Follow ESLint configuration
- Use Prettier for formatting
- Write meaningful commit messages
- Add comments for complex logic

### **Pull Request Guidelines**
- Include description of changes
- Add screenshots for UI changes
- Ensure tests pass
- Update documentation if needed

## 📞 Support

### **Documentation**
- [API Documentation](docs/api.md)
- [Component Documentation](docs/components.md)
- [Deployment Guide](docs/deployment.md)

### **Contact**
- **Developer**: [Your Name]
- **Email**: [your.email@domain.com]
- **GitHub**: [@srenterprice11](https://github.com/srenterprice11)

### **Resources**
- [React Documentation](https://reactjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Express.js](https://expressjs.com/)
- [MongoDB](https://docs.mongodb.com/)

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- React team for the amazing framework
- Tailwind CSS for the utility-first CSS framework
- MongoDB team for the database
- Open source community for various packages used

---

**Made with ❤️ for e-commerce excellence**

> **Note**: This README is continuously updated. Please check back for the latest information and updates.
