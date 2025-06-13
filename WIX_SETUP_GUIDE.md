# Wix Admin Integration Setup Guide

## Overview
This guide will help you set up Wix as your administrative backend for managing users, pricing, bookings, and content on your Whole Wellness Coaching website.

## Step 1: Create Your Wix Admin Site

### 1.1 Create New Wix Site
1. Go to [Wix.com](https://www.wix.com) and sign up/login
2. Click "Create New Site"
3. Choose "Business" template
4. Select a template suitable for admin/dashboard purposes
5. Name your site: "Whole Wellness Admin Dashboard"

### 1.2 Enable Wix Developer Tools
1. Go to your Wix site dashboard
2. Navigate to Settings → Developer Tools
3. Enable "Wix Developer Platform"
4. Enable "API Access"

## Step 2: Set Up Database Collections

### 2.1 Create User Management Collection
1. Go to CMS → Database
2. Create new collection: "Members"
3. Add fields:
   - `email` (Text, required)
   - `firstName` (Text)
   - `lastName` (Text)
   - `membershipLevel` (Text, options: "free", "paid")
   - `profileImage` (Image)
   - `dateJoined` (Date)
   - `paymentStatus` (Text, options: "active", "cancelled", "pending")

### 2.2 Create Services/Pricing Collection
1. Create new collection: "Services"
2. Add fields:
   - `serviceName` (Text, required)
   - `description` (Rich Text)
   - `price` (Number, required)
   - `duration` (Number, in minutes)
   - `category` (Text, options: "individual", "group", "weight-loss", "specialty")
   - `isActive` (Boolean)
   - `bookingLink` (Text)

### 2.3 Create Content Management Collection
1. Create new collection: "WebsiteContent"
2. Add fields:
   - `section` (Text, required - e.g., "hero", "about", "testimonials")
   - `title` (Text)
   - `content` (Rich Text)
   - `imageUrl` (Image)
   - `isActive` (Boolean)
   - `lastUpdated` (Date)

## Step 3: Configure API Access

### 3.1 Get API Credentials
1. In Wix Dashboard, go to Settings → API Keys
2. Create new API key with permissions:
   - Read/Write Collections
   - Read/Write Members
   - Read/Write Bookings
3. Copy your Site ID and API Key

### 3.2 Set Environment Variables
Add these to your Replit environment secrets:
```
WIX_SITE_ID=your_site_id_here
WIX_API_KEY=your_api_key_here
WIX_API_BASE_URL=https://www.wixapis.com/v1
```

## Step 4: Create Admin Interface in Wix

### 4.1 Member Management Page
1. Create new page: "Member Management"
2. Add elements:
   - Table displaying all members
   - Search/filter functionality
   - Edit member details form
   - Upgrade/downgrade membership buttons
   - Payment status indicators

### 4.2 Service Management Page
1. Create new page: "Services & Pricing"
2. Add elements:
   - Service list with edit capabilities
   - Add new service form
   - Price adjustment controls
   - Service activation toggles

### 4.3 Content Management Page
1. Create new page: "Website Content"
2. Add elements:
   - Section-by-section content editor
   - Image upload functionality
   - Preview capabilities
   - Publish/unpublish controls

## Step 5: Set Up Webhooks

### 5.1 Configure Wix Webhooks
1. Go to Developer Tools → Webhooks
2. Add webhook endpoints:
   - Member updates: `https://your-site.replit.app/api/wix/webhooks/users`
   - Service updates: `https://your-site.replit.app/api/wix/webhooks/services`
   - Booking updates: `https://your-site.replit.app/api/wix/webhooks/bookings`

### 5.2 Test Webhook Integration
1. Make a test change in Wix admin
2. Check your website logs for webhook notifications
3. Verify data synchronization

## Step 6: Admin Workflow Examples

### Managing Member Access to AI Chatbot
1. In Wix Admin → Member Management
2. Find user by email
3. Change `membershipLevel` to "paid"
4. User instantly gains AI chatbot access

### Updating Service Prices
1. In Wix Admin → Services & Pricing
2. Edit service price
3. Website automatically reflects new pricing
4. No code changes needed

### Content Updates
1. In Wix Admin → Website Content
2. Edit testimonials, hero text, or about section
3. Changes appear on live website immediately

## Step 7: Daily Admin Tasks

### User Management
- Review new member signups
- Process membership upgrades/downgrades
- Handle payment status changes
- Send member communications

### Content Management
- Update testimonials and success stories
- Modify service descriptions
- Upload new resources
- Update pricing promotions

### Analytics Review
- Check member engagement
- Review booking patterns
- Monitor AI chatbot usage
- Track conversion rates

## Security Best Practices

1. **API Key Security**
   - Never share API keys publicly
   - Rotate keys regularly
   - Use environment variables only

2. **Access Control**
   - Limit admin access to authorized personnel
   - Use strong passwords
   - Enable two-factor authentication

3. **Data Backup**
   - Regular database exports
   - Keep offline backups
   - Test recovery procedures

## Troubleshooting

### Common Issues
1. **Webhook not firing**: Check URL endpoints and API permissions
2. **Data not syncing**: Verify API credentials and network connectivity
3. **Permission errors**: Ensure API key has required collection access

### Support Resources
- Wix Developer Documentation
- API testing tools
- Community forums
- Direct support channels

## Next Steps
1. Complete Wix site setup following this guide
2. Provide API credentials for integration
3. Test admin workflows
4. Train staff on admin interface
5. Go live with integrated system

---

**Need Help?** Contact your developer with any issues during setup or provide the API credentials once ready for integration testing.