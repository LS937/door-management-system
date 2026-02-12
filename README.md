# Door Management System

A complete production-ready solution for handling wooden door orders built with Next.js 16, shadcn/ui, Supabase, and deployed on Vercel.

## Features

### Customer Features
- **User Authentication**: Sign up and sign in with email/password
- **Place Orders**: Submit new door orders with:
  - **Photo Upload**: Required - Upload a photo of the door/specifications
  - Order number (required, integer only, validated for duplicates)
  - Order message (optional)
  - Contact person (optional)
  - Customer delivery information (optional - name, email, phone, address)
- **Track Order Status**: View orders organized by status:
  - Pending: Waiting for admin approval
  - Accepted: Orders accepted by admin and under processing
  - Delivered: Completed orders
  - Rejected: Orders rejected by admin with reason
- **Request Pickup**: Request vehicle pickup for prepared orders
- **Order History**: View all orders except delivered orders older than 3 months
- **Search Orders**: Search orders by order number

### Admin Features
- **Review Orders**: View all new pending orders with uploaded photos
- **Accept Orders**: Accept orders with expected delivery date selection
- **Reject Orders**: Reject orders with mandatory reason
- **Process Orders**: Manage orders through their lifecycle:
  - Mark orders as prepared when ready
  - Mark orders as delivered when complete
- **Order Management**: View orders by status with photo visibility:
  - New Orders: Pending admin approval
  - Processing: Accepted, prepared, and pickup-requested orders
  - Delivered: Completed orders
  - Rejected: Orders that were declined
- **Search Orders**: Search orders by order number
- **View Photos**: See customer-uploaded photos in full order view

### UI/UX Features
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Clean Design**: Elegant, modern interface using shadcn/ui components
- **Photo Display**: High-quality photo viewing in expanded order details
- **Loading States**: Clear feedback during async operations
- **Error Handling**: Graceful error handling with user-friendly messages

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **Database**: Supabase (PostgreSQL)
- **Storage**: Supabase Storage (for photos)
- **Authentication**: Custom localStorage-based auth (demo mode)
- **Deployment**: Vercel
- **Theme**: next-themes
- **Icons**: lucide-react
- **Form Handling**: react-hook-form with zod validation
- **Date Picker**: react-day-picker with date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier works fine)
- Vercel account (optional, for deployment)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd door-management-system
```

2. Install dependencies:
```bash
npm install
```

3. Set up Supabase:
   - Create a new project at [supabase.com](https://supabase.com)
   - Copy your project URL and anon key
   - Run the SQL schema in the Supabase SQL Editor (see `supabase-schema.sql`)

4. Configure environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` with your Supabase credentials:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

5. Run the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Setting up Supabase Database

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy the contents of `supabase-schema.sql`
4. Paste and run the SQL script
5. Verify that tables and storage bucket are created:
   - Tables: `orders`, `pickup_requests`, `user_roles`
   - Storage bucket: `order-photos` (public)

### Building for Production

```bash
npm run build
npm run start
```

### Deploying to Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

The app will automatically:
- Optimize images
- Enable React strict mode
- Configure proper environment variables
- Set up image optimization for Supabase storage

## Usage

### First Time Setup

1. Navigate to the home page
2. Click "Sign Up" to create an account
3. Fill in your details (First Name, Email, Password)
4. After signing up, you'll be redirected to role selection
5. Choose either "Customer" or "Admin" role

### Customer Workflow

1. **Sign In** as a customer
2. **Place New Order**:
   - Click "Place New Order" button
   - **Upload a photo** (required - PNG, JPG, JPEG up to 5MB)
   - Enter order number (required - integers only)
   - Optionally fill in:
     - Order message/description
     - Contact person
     - Customer delivery information
   - Submit the order
3. **Track Orders**:
   - View pending orders waiting for admin approval
   - Check accepted orders that are being processed
   - Monitor delivered orders
   - Search orders by order number
4. **Request Pickup**:
   - Once admin marks orders as "prepared"
   - Click "Request Pickup"
   - Select which prepared orders to pick up

### Admin Workflow

1. **Sign In** as an admin
2. **Review New Orders**:
   - View all pending orders in "New Orders" tab
   - **See uploaded photos** in expanded view
   - Click "Accept Order" to approve with delivery date
   - Click "Reject Order" to decline with a reason
3. **Process Orders**:
   - View accepted orders in "Processing" tab
   - Mark orders as "Prepared" when ready
   - Mark orders as "Delivered" when complete
4. **Monitor History**:
   - View delivered orders with photos
   - View rejected orders with reasons
   - Search orders by order number

## Data Management

- **Database**: PostgreSQL via Supabase with Row Level Security (RLS)
- **Storage**: Supabase Storage for order photos
- **Fallback**: localStorage fallback if Supabase is not configured
- **Persistence**: Data persists across sessions
- **Cleanup**: Delivered orders older than 3 months are automatically deleted
- **Security**: Photos are stored in public bucket for easy viewing

## Project Structure

```
door-management-system/
├── app/
│   ├── dashboard/
│   │   ├── admin/          # Admin dashboard
│   │   ├── customer/       # Customer dashboard
│   │   └── page.tsx        # Role selection
│   ├── sign-in/            # Sign in page
│   ├── sign-up/            # Sign up page
│   ├── layout.tsx          # Root layout
│   ├── page.tsx            # Landing page
│   └── globals.css         # Global styles
├── components/
│   ├── admin/              # Admin-specific components
│   │   ├── accept-order-dialog.tsx
│   │   └── reject-order-dialog.tsx
│   ├── customer/           # Customer-specific components
│   │   ├── place-order-dialog.tsx  # With photo upload
│   │   └── pickup-request-dialog.tsx
│   ├── ui/                 # shadcn/ui components
│   ├── order-card.tsx      # Reusable order card
│   ├── order-list-item.tsx # Order display with photo
│   ├── simple-user-button.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── simple-auth.tsx     # Authentication context
│   ├── storage.ts          # Supabase + localStorage utilities
│   ├── supabase.ts         # Supabase client config
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
├── supabase-schema.sql     # Database schema
├── .env.example            # Environment variables template
├── .env.local              # Your local environment (git-ignored)
├── next.config.ts          # Next.js configuration
└── middleware.ts           # Next.js middleware
```

## Environment Variables

### Required for Production

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here

# Optional: Service Role Key (for admin operations, keep secret)
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### Optional: Clerk Authentication

```env
# Optional: Clerk Authentication (future enhancement)
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key
```

## Production Checklist

- [x] Supabase database configured
- [x] Supabase storage bucket created
- [x] Photo upload functionality implemented
- [x] All fields except photo made optional
- [x] Photo display in admin dashboard
- [x] Async/await for all database operations
- [x] Error handling and loading states
- [x] Image optimization configured
- [x] Environment variables set up
- [x] Production build tested
- [x] Vercel deployment ready

## Security Features

- Row Level Security (RLS) enabled on all tables
- Authenticated users can only access their own data (with admin override)
- Public photo storage for easy viewing
- Environment variables for sensitive data
- Input validation for order numbers
- File type and size validation for photos

## Performance Optimizations

- React strict mode enabled
- Image optimization for Supabase storage
- Lazy loading of images
- Async operations with proper loading states
- Automatic cleanup of old orders
- Efficient database queries with indexes

## Troubleshooting

### Photos not uploading
- Check Supabase storage bucket exists (`order-photos`)
- Verify storage policies are set correctly
- Ensure NEXT_PUBLIC_SUPABASE_URL is correct

### Database errors
- Verify Supabase credentials in `.env.local`
- Check that `supabase-schema.sql` was run successfully
- Verify RLS policies allow authenticated access

### Build errors
- Run `npm install` to ensure all dependencies are installed
- Check Node.js version (18+ required)
- Verify environment variables are set

## Future Enhancements

- **Email Notifications**: Notify customers when order status changes
- **Bulk Operations**: Accept/reject multiple orders at once
- **Advanced Search**: Filter by date, status, customer
- **Analytics Dashboard**: Order statistics and trends
- **Multi-language Support**: i18n implementation
- **Real-time Updates**: WebSocket for live order status
- **PDF Export**: Generate printable order sheets
- **Mobile App**: React Native version

## License

MIT
