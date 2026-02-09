# Door Management System

A complete solution for handling wooden door orders built with Next.js 16, shadcn/ui, and localStorage-based data management.

## Features

### Customer Features
- **User Authentication**: Sign up and sign in with email/password
- **Place Orders**: Submit new door orders with detailed information including:
  - Order message/description
  - Contact person
  - Customer delivery information (name, email, phone, address)
- **Track Order Status**: View orders organized by status:
  - Pending: Waiting for admin approval
  - Accepted: Orders accepted by admin and under processing
  - Delivered: Completed orders
  - Rejected: Orders rejected by admin with reason
- **Request Pickup**: Request vehicle pickup for prepared orders
- **Order History**: View all orders except delivered orders older than 3 months

### Admin Features
- **Review Orders**: View all new pending orders
- **Accept Orders**: Accept orders with expected delivery date selection
- **Reject Orders**: Reject orders with mandatory reason
- **Process Orders**: Manage orders through their lifecycle:
  - Mark orders as prepared when ready
  - Mark orders as delivered when complete
- **Order Management**: View orders by status:
  - New Orders: Pending admin approval
  - Processing: Accepted, prepared, and pickup-requested orders
  - Delivered: Completed orders
  - Rejected: Orders that were declined

### UI/UX Features
- **Responsive Design**: Works perfectly on mobile and desktop
- **Dark/Light Mode**: Theme toggle with system preference detection
- **Clean Design**: Elegant, modern interface using shadcn/ui components
- **Roboto Mono Font**: Monospace font for a clean, professional look

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI Components**: shadcn/ui
- **Styling**: Tailwind CSS 4
- **Authentication**: Custom localStorage-based auth (demo mode)
- **Data Storage**: LocalStorage
- **Theme**: next-themes
- **Icons**: lucide-react
- **Form Handling**: react-hook-form with zod validation
- **Date Picker**: react-day-picker with date-fns

## Getting Started

### Prerequisites

- Node.js 18+ and npm

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

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

### Building for Production

```bash
npm run build
npm run start
```

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
   - Fill in order details
   - Provide customer delivery information
   - Submit the order
3. **Track Orders**:
   - View pending orders waiting for admin approval
   - Check accepted orders that are being processed
   - Monitor delivered orders
4. **Request Pickup**:
   - Once admin marks orders as "prepared"
   - Click "Request Pickup"
   - Select which prepared orders to pick up

### Admin Workflow

1. **Sign In** as an admin
2. **Review New Orders**:
   - View all pending orders in "New Orders" tab
   - Click "Accept Order" to approve with delivery date
   - Click "Reject Order" to decline with a reason
3. **Process Orders**:
   - View accepted orders in "Processing" tab
   - Mark orders as "Prepared" when ready
   - Mark orders as "Delivered" when complete
4. **Monitor History**:
   - View delivered orders
   - View rejected orders with reasons

## Data Management

- **Storage**: All data is stored in browser localStorage
- **Persistence**: Data persists across sessions
- **Cleanup**: Delivered orders older than 3 months are automatically deleted
- **Reset**: Clear browser localStorage to reset all data

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
│   ├── customer/           # Customer-specific components
│   ├── ui/                 # shadcn/ui components
│   ├── order-card.tsx      # Reusable order card
│   ├── simple-user-button.tsx
│   ├── theme-provider.tsx
│   └── theme-toggle.tsx
├── lib/
│   ├── simple-auth.tsx     # Authentication context
│   ├── storage.ts          # LocalStorage utilities
│   ├── types.ts            # TypeScript types
│   └── utils.ts            # Utility functions
└── middleware.ts           # Next.js middleware
```

## Environment Variables

The app uses simple localStorage-based authentication by default. For production, you can integrate Clerk:

```env
# Optional: Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_publishable_key
CLERK_SECRET_KEY=your_secret_key

# Clerk URLs
NEXT_PUBLIC_CLERK_SIGN_IN_URL=/sign-in
NEXT_PUBLIC_CLERK_SIGN_UP_URL=/sign-up
NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL=/dashboard
NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL=/dashboard
```

## Future Enhancements

- **Backend Integration**: Replace localStorage with proper database (PostgreSQL, MongoDB, etc.)
- **Real Authentication**: Integrate production-ready auth (Clerk, Auth0, NextAuth.js)
- **Email Notifications**: Notify customers when order status changes
- **File Uploads**: Allow customers to upload door specifications/images
- **Print Orders**: Generate printable order sheets for admin
- **Advanced Search**: Filter and search orders
- **Analytics Dashboard**: Order statistics and trends
- **Multi-language Support**: i18n implementation

## License

MIT
