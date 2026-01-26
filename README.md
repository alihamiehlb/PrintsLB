# PrintsLB - Professional 3D Printing Services

A modern, full-stack 3D printing service website built with Next.js 14, TypeScript, and TailwindCSS. Created by Ali Hamieh for professional 3D printing services with order management, tracking, and admin panel   made by ali hussien tayseer hamieh .

## 🚀 Features

### User Features
- **Authentication**: Secure user registration and login with NextAuth.js
- **Service Catalog**: Browse 3D printing services with detailed descriptions
- **Shopping Cart**: Add services to cart and manage quantities
- **Order Tracking**: Real-time order status tracking
- **Contact Form**: Get in touch for custom projects
- **Responsive Design**: Mobile-first design with modern UI

### Admin Features
- **Admin Panel**: Comprehensive dashboard for order management
- **Order Management**: View, update, and manage all orders
- **User Management**: Manage user accounts and permissions
- **Service Management**: Update services and pricing
- **Statistics**: Track orders, users, and revenue
- **Real-time Updates**: Live order status updates

### Technical Features
- **Modern Tech Stack**: Next.js 14, TypeScript, TailwindCSS
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: NextAuth.js with secure password hashing
- **Animations**: Framer Motion for smooth interactions
- **Responsive**: Mobile-optimized design
- **SEO Ready**: Optimized for search engines

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, React 19, TypeScript
- **Styling**: TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes
- **Database**: PostgreSQL, Prisma ORM
- **Authentication**: NextAuth.js
- **Deployment**: Vercel
- **Icons**: Lucide React

## 📦 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/alihamiehlb/printsLB.git
   cd printslb_final
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Configure your environment variables:
   ```env
   # Database
   DATABASE_URL="postgresql://username:password@localhost:5432/printslb"

   # NextAuth.js
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="your-secret-key-here-change-in-production"

   # Admin credentials
   ADMIN_EMAIL="admin@printslb.com"
   ADMIN_PASSWORD="admin123"
   ```

4. **Set up the database**
   ```bash
   npm run db:push
   npm run db:seed
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 🗄️ Database Schema

The application uses PostgreSQL with the following main entities:

- **Users**: Customer accounts with roles (USER/ADMIN)
- **Services**: Available 3D printing services
- **Orders**: Customer orders with status tracking
- **OrderItems**: Individual items within orders
- **CartItems**: Shopping cart functionality
- **OrderTracking**: Order status history

## 🎨 Design System

- **Color Scheme**: Modern tech theme with blue/cyan accents
- **Typography**: Clean, readable fonts
- **Animations**: Smooth transitions and micro-interactions
- **Responsive**: Mobile-first approach
- **Dark Theme**: Professional dark background design

## 📱 Pages

### Public Pages
- **Home**: Landing page with hero section and features
- **Services**: Detailed service offerings
- **Pricing**: Transparent pricing plans
- **Contact**: Contact form and information
- **Track Order**: Order tracking for customers

### Authenticated Pages
- **Dashboard**: User dashboard with order history
- **Cart**: Shopping cart management
- **Profile**: User profile management

### Admin Pages
- **Admin Panel**: Comprehensive admin dashboard
- **Order Management**: Manage all orders
- **User Management**: Manage user accounts
- **Service Management**: Update services

## 🔐 Security

- **Authentication**: Secure NextAuth.js implementation
- **Password Hashing**: bcryptjs for secure password storage
- **Role-based Access**: Admin-only routes protection
- **Input Validation**: Form validation and sanitization
- **Environment Variables**: Secure configuration management

## 🚀 Deployment

### Vercel Deployment

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Vercel**
   - Import your GitHub repository
   - Configure environment variables
   - Deploy automatically

### Environment Variables for Production
- `DATABASE_URL`: Your PostgreSQL connection string
- `NEXTAUTH_URL`: Your production URL
- `NEXTAUTH_SECRET`: A secure secret key
- `ADMIN_EMAIL`: Admin email address
- `ADMIN_PASSWORD`: Admin password

## 🌐 Domain Setup

### Recommended Domain Providers
1. **Namecheap**: Affordable domains with free privacy
2. **GoDaddy**: Popular domain registrar
3. **Cloudflare**: Great performance and security
4. **Google Domains**: Simple and reliable

### Domain Configuration
1. Purchase `printslb.com` (or your preferred domain)
2. Configure DNS to point to Vercel
3. Set up SSL certificate (automatic with Vercel)
4. Configure email forwarding

## 📊 Database Options

### Free Database Providers
1. **Supabase**: Free PostgreSQL with generous limits
2. **PlanetScale**: MySQL with great developer experience
3. **Neon**: Serverless PostgreSQL with free tier
4. **Railway**: Simple database hosting

### Recommended: Supabase
- Generous free tier
- Built-in authentication
- Real-time capabilities
- Easy setup

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📄 License

This project is proprietary software owned by Ali Hamieh.

## 📞 Support

For support or inquiries:
- **Email**: info@printslb.com
- **Phone**: +961 123 456 789
- **Location**: Beirut, Lebanon

## 🔄 Future Enhancements

- [ ] Payment integration (Stripe, PayPal)
- [ ] File upload for 3D models
- [ ] Real-time notifications
- [ ] Mobile app
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] API for third-party integrations

---

**PrintsLB by Ali Hamieh** - Professional 3D Printing Services
*Bringing your ideas to life, one print at a time.*
