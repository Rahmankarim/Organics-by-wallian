# 🥜 Luxury Dry Fruits E-commerce Platform

A comprehensive, production-ready e-commerce platform built with Next.js 14+, TypeScript, MongoDB, and modern web technologies for selling premium dry fruits and nuts.

## ✨ Features

### 🛍️ Customer Features

- **Product Catalog**: Browse premium dry fruits with advanced filtering and search
- **Product Variants**: Multiple sizes, packaging options, and bulk quantities
- **Shopping Cart**: Persistent cart with real-time inventory checking
- **Wishlist**: Save favorite products for later
- **User Reviews**: Verified purchase reviews with ratings and images
- **Order Tracking**: Real-time order status updates with tracking numbers
- **Multiple Payment Methods**: Stripe integration with various payment options
- **User Profiles**: Account management with order history and preferences

### 👨‍💼 Admin Features

- **Dashboard Analytics**: Comprehensive sales, revenue, and user analytics
- **Product Management**: Add, edit, and manage products with inventory tracking
- **Order Management**: Process orders, update status, and manage fulfillment
- **User Management**: View and manage customer accounts
- **Review Moderation**: Approve, reject, or respond to customer reviews
- **Sales Reports**: Detailed analytics with charts and export functionality

### 🔧 Technical Features

- **Authentication**: NextAuth.js with OAuth (Google, Facebook) and credentials
- **Database**: MongoDB with Mongoose ODM and optimized schemas
- **Payments**: Stripe integration with webhooks and dispute handling
- **Security**: JWT tokens, password hashing, rate limiting, input validation
- **State Management**: Zustand with persistence
- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Type Safety**: Full TypeScript implementation
- **SEO Optimized**: Meta tags, structured data, and performance optimization

## 🚀 Tech Stack

- **Frontend**: Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes, MongoDB, Mongoose
- **Authentication**: NextAuth.js
- **Payments**: Stripe
- **State Management**: Zustand
- **Email**: Resend/SendGrid
- **File Upload**: Cloudinary
- **Deployment**: Vercel (recommended)

## 📦 Installation

### Prerequisites

- Node.js 18+
- MongoDB (local or Atlas)
- Stripe account
- Email service account (Resend/SendGrid)

### 1. Clone the repository

```bash
git clone <repository-url>
cd luxury-dry-fruits-ecommerce
```

### 2. Install dependencies

```bash
npm install
# or
yarn install
# or
pnpm install
```

### 3. Environment Setup

Copy the environment template and fill in your credentials:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your actual credentials:

```env
# Database
MONGODB_URI=mongodb://localhost:27017/luxury-dry-fruits

# NextAuth
NEXTAUTH_SECRET=your-secret-here
NEXTAUTH_URL=http://localhost:3000

# Stripe
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Add other required environment variables
```

### 4. Database Setup

The application will automatically create the necessary database schemas when you start it. Optionally, you can seed sample data:

```bash
npm run seed
```

### 5. Run the development server

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔧 Configuration

### Database Models

The application uses comprehensive Mongoose schemas:

- **Users**: Authentication, profiles, preferences
- **Products**: Catalog with variants, inventory, SEO
- **Orders**: Full order lifecycle with status tracking
- **Reviews**: Verified purchase reviews with moderation
- **Analytics**: User behavior and sales tracking

### Authentication Setup

#### Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google+ API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`

#### Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app
3. Add Facebook Login product
4. Set Valid OAuth Redirect URI: `http://localhost:3000/api/auth/callback/facebook`

### Stripe Setup

1. Create a [Stripe account](https://stripe.com)
2. Get your test API keys from the dashboard
3. Set up webhooks endpoint: `https://yourdomain.com/api/webhooks/stripe`
4. Enable required webhook events:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `charge.dispute.created`

### Email Configuration

Choose between Resend (recommended) or SendGrid:

#### Resend

1. Sign up at [Resend](https://resend.com)
2. Get your API key
3. Verify your domain

#### SendGrid

1. Sign up at [SendGrid](https://sendgrid.com)
2. Create an API key
3. Verify sender identity

## 📁 Project Structure

```
├── app/                    # Next.js 13+ app directory
│   ├── api/               # API routes
│   │   ├── auth/          # Authentication endpoints
│   │   ├── products/      # Product management
│   │   ├── orders/        # Order processing
│   │   ├── cart/          # Shopping cart
│   │   ├── reviews/       # Review system
│   │   ├── payments/      # Payment processing
│   │   └── webhooks/      # Webhook handlers
│   ├── admin/             # Admin dashboard pages
│   ├── products/          # Product pages
│   ├── cart/              # Shopping cart page
│   └── ...                # Other pages
├── components/            # Reusable components
│   └── ui/               # shadcn/ui components
├── lib/                   # Utilities and configurations
│   ├── models.ts         # TypeScript interfaces
│   ├── mongoose.ts       # Database schemas
│   ├── auth.ts           # Authentication utilities
│   ├── store.ts          # Zustand state management
│   └── utils.ts          # Helper functions
├── hooks/                 # Custom React hooks
├── public/               # Static assets
└── styles/               # Global styles
```

## 🔌 API Routes

### Authentication

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Products

- `GET /api/products` - List products with filtering
- `GET /api/products/[id]` - Get single product
- `POST /api/products` - Create product (admin)
- `PUT /api/products/[id]` - Update product (admin)

### Orders

- `GET /api/orders` - List user orders
- `POST /api/orders` - Create new order
- `GET /api/orders/[id]` - Get order details
- `PUT /api/orders/[id]` - Update order status

### Cart

- `GET /api/cart` - Get cart items
- `POST /api/cart` - Add item to cart
- `PUT /api/cart` - Update cart item
- `DELETE /api/cart` - Remove from cart

### Admin

- `GET /api/admin/analytics` - Dashboard analytics
- `GET /api/admin/orders` - Order management
- `GET /api/admin/products` - Product management

## 🎨 Customization

### Adding New Product Categories

1. Update the `ProductCategory` type in `lib/models.ts`
2. Add category-specific filtering in `app/api/products/route.ts`
3. Update the frontend category filters

### Custom Payment Methods

1. Extend the payment integration in `app/api/payments/`
2. Update order models to support new payment types
3. Add frontend payment selection UI

### Email Templates

Customize email templates in the email service integration files.

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Manual Deployment

1. Build the application:
   ```bash
   npm run build
   ```
2. Start the production server:
   ```bash
   npm start
   ```

### Environment Variables for Production

Update these in your production environment:

- Set `NEXTAUTH_URL` to your domain
- Use production Stripe keys
- Configure production database URI
- Set up proper email service credentials

## 🔒 Security Considerations

- All API routes include authentication and authorization
- Input validation and sanitization
- Rate limiting on sensitive endpoints
- CSRF protection through NextAuth.js
- Secure password hashing with bcrypt
- JWT token validation
- SQL injection prevention through Mongoose

## 📊 Analytics & Monitoring

The platform includes comprehensive analytics:

- Revenue tracking and forecasting
- User behavior analysis
- Product performance metrics
- Order conversion rates
- Cart abandonment tracking

## 🧪 Testing

```bash
# Run unit tests
npm run test

# Run e2e tests
npm run test:e2e

# Run linting
npm run lint

# Type checking
npm run type-check
```

## 🚀 Deployment

### Vercel Deployment

1. **Fork or clone this repository**

2. **Set up environment variables in Vercel:**
   - Go to your Vercel dashboard
   - Select your project
   - Navigate to Settings → Environment Variables
   - Add the following required variables:

   ```bash
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/OrganicsByWalian
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=https://your-domain.vercel.app
   ```

3. **Deploy to Vercel:**
   ```bash
   npm run build
   vercel --prod
   ```

4. **Set up MongoDB Atlas (recommended for production):**
   - Create a MongoDB Atlas account
   - Create a new cluster
   - Get your connection string
   - Add it to your Vercel environment variables

### Alternative Deployment Options

- **Netlify**: Configure build settings and environment variables
- **Railway**: Connect GitHub repo and set environment variables
- **DigitalOcean App Platform**: Deploy via GitHub integration

### Environment Variables Reference

All environment variables are documented in `.env.example`. Copy this file to `.env.local` for local development.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new features
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:

- Create an issue in the GitHub repository
- Check the documentation
- Contact the development team

## 🚧 Roadmap

- [ ] Multi-language support
- [ ] Advanced inventory management
- [ ] Subscription boxes
- [ ] Loyalty program
- [ ] Advanced analytics dashboard
- [ ] Mobile app integration
- [ ] Bulk order management
- [ ] Supplier management system

---

Built with ❤️ for premium dry fruit retailers
