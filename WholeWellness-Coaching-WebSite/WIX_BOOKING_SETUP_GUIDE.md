# Wix Booking Integration Setup Guide

## Overview
This guide helps you set up the comprehensive Wix booking integration for your coaching platform, enabling seamless appointment scheduling, service management, and payment processing.

## Prerequisites

### 1. Wix Account Setup
- Create a Wix business account at [wix.com](https://wix.com)
- Set up a Wix Bookings site with your services
- Enable Wix Bookings app on your site

### 2. Required Wix Apps
- **Wix Bookings**: For appointment scheduling
- **Wix Stores** (optional): For product sales
- **Wix Pricing Plans** (optional): For subscription services

## Step 1: Configure Wix Bookings

### Setup Services
1. Go to **Wix Bookings** in your site dashboard
2. Click **Services** → **Add Service**
3. For each coaching service, configure:
   - **Service Name**: "Life Coaching Session", "Weight Loss Coaching", etc.
   - **Duration**: 60 minutes (or your preferred duration)
   - **Price**: Set your coaching rates
   - **Category**: Group similar services
   - **Description**: Detailed service description

### Setup Staff/Coaches
1. Go to **Staff** → **Add Staff Member**
2. Add your coaches with:
   - Name and contact details
   - Services they provide
   - Working hours and availability
   - Time zone settings

### Configure Booking Settings
1. **General Settings**:
   - Booking window (how far in advance clients can book)
   - Cancellation policy
   - Confirmation requirements

2. **Notifications**:
   - Email notifications for new bookings
   - SMS reminders (if enabled)
   - Calendar integration

3. **Forms & Fields**:
   - Required client information
   - Custom intake questions
   - Terms of service acceptance

## Step 2: Get Wix API Credentials

### Create Wix App
1. Go to [Wix Developers](https://dev.wix.com)
2. Click **Create New App**
3. Choose **Web App** type
4. Set your app name: "Coaching Platform Integration"

### Configure OAuth
1. In your Wix app dashboard:
   - Go to **OAuth** settings
   - Add your redirect URI: `https://your-domain.com/api/wix/callback`
   - For development: `http://localhost:5000/api/wix/callback`

### Get Client ID
1. In your app dashboard, copy the **Client ID**
2. Note: You'll need this for the WIX_CLIENT_ID environment variable

### Set Permissions
Enable these permissions for your app:
- **Bookings**: Read, Write, Manage
- **Services**: Read, Write
- **Calendar**: Read, Write
- **Contacts**: Read, Write
- **Members**: Read (if using member features)

## Step 3: Environment Setup

### Add Environment Variables
In your Replit secrets or `.env` file:
```
WIX_CLIENT_ID=your_wix_client_id_here
WIX_SITE_ID=your_wix_site_id_here
```

### Install Dependencies
The following Wix SDK packages are already installed:
- `@wix/sdk`
- `@wix/bookings`
- `@wix/stores`
- `@wix/pricing-plans`
- `@wix/data`

## Step 4: Test the Integration

### Run Integration Test
```bash
npx tsx test-wix-booking-integration.js
```

Expected output:
```
✅ Wix integration initialized
📊 Found X services
📊 Found X bookings
📊 Found X available slots
✅ Wix booking integration test completed successfully!
```

### Test API Endpoints
1. Start your server: `npm run dev`
2. Test endpoints:
   - `GET /api/wix/services` - List all services
   - `GET /api/wix/bookings` - List all bookings
   - `POST /api/wix/bookings` - Create new booking
   - `GET /api/wix/services/:id/slots?date=YYYY-MM-DD` - Get available slots

### Test Frontend Interface
1. Visit `/wix-booking` in your browser
2. Complete the booking flow:
   - Select a service
   - Choose a date
   - Pick a time slot
   - Fill in contact details
   - Submit booking

## Step 5: Webhook Configuration

### Setup Webhooks in Wix
1. In your Wix app dashboard:
   - Go to **Webhooks**
   - Add webhook endpoints:
     - `https://your-domain.com/api/wix/webhooks/bookings`
     - `https://your-domain.com/api/wix/webhooks/services`
     - `https://your-domain.com/api/wix/webhooks/users`

2. Subscribe to events:
   - `bookings/created`
   - `bookings/updated`
   - `bookings/cancelled`
   - `services/created`
   - `services/updated`

### Webhook Security
- Enable webhook signature verification
- Set up webhook authentication headers
- Configure retry policies for failed webhooks

## Step 6: Production Deployment

### Domain Configuration
1. Update OAuth redirect URIs to production domain
2. Configure CORS settings for your domain
3. Update webhook URLs to production endpoints

### SSL/HTTPS
- Ensure your site uses HTTPS
- Configure SSL certificates
- Update all API endpoints to use HTTPS

### Monitoring
- Set up error logging for booking failures
- Monitor webhook delivery status
- Track booking conversion rates

## Features Included

### Booking Management
- **Service Selection**: Choose from available coaching services
- **Date & Time Picker**: Interactive calendar with available slots
- **Contact Information**: Collect client details
- **Booking Confirmation**: Email notifications and calendar invites
- **Cancellation/Rescheduling**: Easy booking modifications

### Integration Features
- **Real-time Availability**: Live slot availability checking
- **Automatic Sync**: Webhooks for real-time updates
- **Payment Processing**: Integrated with Wix Payments
- **Calendar Integration**: Sync with Google Calendar, Outlook
- **Client Management**: Automatic contact creation

### Admin Features
- **Booking Dashboard**: View all appointments
- **Service Management**: Add/edit services via Wix dashboard
- **Staff Scheduling**: Manage coach availability
- **Analytics**: Booking metrics and reports

## Troubleshooting

### Common Issues

1. **Authentication Errors**
   - Check WIX_CLIENT_ID is correct
   - Verify OAuth redirect URIs match
   - Ensure proper permissions are set

2. **No Services Found**
   - Verify Wix Bookings app is enabled
   - Check that services are published
   - Confirm API permissions include Services

3. **Booking Creation Fails**
   - Verify time slots are available
   - Check required fields are provided
   - Ensure staff member is assigned to service

4. **Webhook Issues**
   - Verify webhook URLs are accessible
   - Check webhook signatures
   - Monitor webhook delivery logs

### API Rate Limits
- Wix APIs have rate limits (1000 requests/hour)
- Implement exponential backoff for retries
- Cache frequently accessed data

### Data Sync
- Webhooks provide real-time updates
- Implement fallback periodic sync
- Handle duplicate events gracefully

## Support Resources

### Documentation
- [Wix Bookings API](https://dev.wix.com/api/rest/bookings)
- [Wix SDK Documentation](https://dev.wix.com/docs/sdk)
- [OAuth Setup Guide](https://dev.wix.com/docs/rest/getting-started/authentication)

### Testing Tools
- Wix API Explorer
- Postman collection for Wix APIs
- Browser developer tools for webhook testing

### Community
- Wix Developers Forum
- Stack Overflow (wix-bookings tag)
- GitHub issues for SDK problems

## Next Steps

1. **Complete Wix Site Setup**
   - Configure your services and staff
   - Set up payment processing
   - Test the booking flow

2. **Provide API Credentials**
   - Share your WIX_CLIENT_ID
   - Verify OAuth configuration
   - Test the integration

3. **Customize Booking Flow**
   - Modify booking form fields
   - Add custom branding
   - Configure email templates

4. **Monitor and Optimize**
   - Track booking conversion rates
   - Optimize service descriptions
   - Analyze booking patterns

---

**Ready to integrate?** Provide your Wix credentials and we'll test the full booking system immediately.