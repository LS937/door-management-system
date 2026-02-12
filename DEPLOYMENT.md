# Deployment Guide for Vercel

This guide will help you deploy the Door Management System to Vercel.

## Prerequisites

1. A GitHub account with your code repository
2. A Vercel account (sign up at [vercel.com](https://vercel.com))
3. A Supabase account with a configured project

## Step 1: Prepare Supabase

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "New Project"
3. Choose your organization and region
4. Set a secure database password
5. Wait for the project to be ready (1-2 minutes)

### 1.2 Run Database Schema

1. In your Supabase project, go to **SQL Editor**
2. Click **New Query**
3. Copy the entire content from `supabase-schema.sql` in your repository
4. Paste it into the SQL editor
5. Click **Run** to execute the script
6. Verify the following were created:
   - Tables: `orders`, `pickup_requests`, `user_roles`
   - Storage bucket: `order-photos`
   - Proper indexes and RLS policies

### 1.3 Get Supabase Credentials

1. In your Supabase project, go to **Settings** > **API**
2. Copy the following values:
   - **Project URL** (e.g., `https://xxxxx.supabase.co`)
   - **anon/public key** (the public key under "Project API keys")
3. Keep these values handy for the next steps

## Step 2: Push Code to GitHub

1. Ensure all your code is committed:
```bash
git add .
git commit -m "Production ready with Supabase integration"
git push origin main
```

2. Verify your repository is accessible on GitHub

## Step 3: Deploy to Vercel

### 3.1 Import Project

1. Go to [vercel.com](https://vercel.com)
2. Click **Add New** > **Project**
3. Select **Import Git Repository**
4. Choose your GitHub repository
5. Click **Import**

### 3.2 Configure Project

1. **Framework Preset**: Should auto-detect as **Next.js**
2. **Root Directory**: Leave as `./` (default)
3. **Build Command**: `npm run build` (default)
4. **Output Directory**: `.next` (default)

### 3.3 Add Environment Variables

Click **Environment Variables** and add the following:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

**Important**: 
- Replace the values with your actual Supabase credentials from Step 1.3
- Make sure there are no extra spaces or quotes
- These variables should be available for all environments (Production, Preview, Development)

### 3.4 Deploy

1. Click **Deploy**
2. Wait for the deployment to complete (usually 2-3 minutes)
3. Once complete, you'll see a success message with your deployment URL

## Step 4: Verify Deployment

1. Click on the deployment URL (e.g., `https://your-app.vercel.app`)
2. Test the following:
   - Home page loads correctly
   - Sign up creates a new account
   - Sign in works
   - Photo upload works in order creation
   - Orders are saved and retrieved from Supabase
   - Photos are visible in order details

## Step 5: Custom Domain (Optional)

1. In Vercel project settings, go to **Domains**
2. Click **Add Domain**
3. Enter your domain name
4. Follow the instructions to configure DNS
5. Wait for DNS propagation (can take up to 24 hours)

## Troubleshooting

### Deployment Fails

**Error**: "Module not found"
- **Solution**: Run `npm install` locally and ensure `package-lock.json` is committed

**Error**: "Build failed"
- **Solution**: Run `npm run build` locally to identify the issue

### Environment Variables Not Working

**Symptom**: App loads but can't connect to Supabase
- **Solution**: 
  1. Go to Vercel project settings > Environment Variables
  2. Verify all variables are set correctly
  3. Re-deploy by going to Deployments > Click on latest > Click "Redeploy"

### Photos Not Uploading

**Symptom**: Order creation works but photos don't show
- **Solution**:
  1. Verify Supabase storage bucket `order-photos` exists
  2. Check storage policies in Supabase
  3. Ensure `NEXT_PUBLIC_SUPABASE_URL` is correct

### Database Errors

**Symptom**: Orders not saving or loading
- **Solution**:
  1. Verify `supabase-schema.sql` was run successfully
  2. Check Supabase logs for errors
  3. Verify RLS policies are set up correctly

## Environment Variables Reference

| Variable | Description | Example | Required |
|----------|-------------|---------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | `https://xxxxx.supabase.co` | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon/public key | `eyJhbGc...` | Yes |

## Post-Deployment Checklist

- [ ] Home page loads correctly
- [ ] Sign up functionality works
- [ ] Sign in functionality works
- [ ] Customer can place orders with photos
- [ ] Photos are uploaded to Supabase storage
- [ ] Photos are visible in order details
- [ ] Admin can accept/reject orders
- [ ] Search functionality works
- [ ] Theme toggle works
- [ ] Mobile responsiveness verified

## Updating the Deployment

To deploy updates:

1. Make changes to your code
2. Commit and push to GitHub:
```bash
git add .
git commit -m "Your update message"
git push origin main
```
3. Vercel will automatically detect the changes and deploy them

## Monitoring

### View Deployment Logs

1. Go to your Vercel project
2. Click **Deployments**
3. Click on any deployment
4. View **Build Logs** or **Runtime Logs**

### View Analytics

1. In Vercel project, go to **Analytics**
2. Monitor:
   - Page views
   - Performance metrics
   - Error rates

## Support

If you encounter issues:

1. Check Vercel deployment logs
2. Check Supabase logs and API calls
3. Review browser console for errors
4. Verify environment variables are set correctly

## Security Best Practices

1. **Never commit `.env.local`** to version control
2. Use Vercel's environment variables for sensitive data
3. Rotate Supabase keys regularly
4. Monitor Supabase usage and set up alerts
5. Enable Vercel's Web Application Firewall (WAF) for additional protection

## Scaling Considerations

As your app grows:

1. **Database**: Supabase free tier includes 500 MB database space and 1 GB file storage
2. **Upgrade**: Consider upgrading to Supabase Pro if you exceed limits
3. **CDN**: Vercel automatically uses CDN for static assets
4. **Edge Functions**: Consider using Vercel Edge Functions for better performance

## Conclusion

Your Door Management System is now deployed and production-ready! Users can access it at your Vercel URL, and all data is securely stored in Supabase.
