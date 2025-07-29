# Wix Velo Admin Automation Setup Guide

## Complete Integration Guide for Whole Wellness Coaching Platform

This guide provides step-by-step instructions to set up comprehensive admin automation for your nonprofit coaching platform using Wix Velo, N8N workflows, and Supabase database integration.

## 📋 Prerequisites

Before starting, ensure you have:
- Wix site with Velo Dev Mode enabled
- Supabase project with database URL and API key
- N8N instance (cloud or self-hosted)
- Your Replit Express.js platform running
- Admin email access for notifications

## 🚀 Step 1: Wix Velo Setup

### 1.1 Enable Velo Development
1. Open your Wix site in the Editor
2. Click **Dev Mode** in the top menu
3. Select **Turn on Dev Mode**
4. Choose **Start Coding** when prompted

### 1.2 Install Admin Automation Code
1. In Velo's code panel, create a new page called `admin-dashboard`
2. Copy the contents of `wix-velo-admin-automation.js` to your page code
3. Create a new backend file: `admin-backend.js`
4. Copy the contents of `wix-velo-backend-integration.js` to the backend file

### 1.3 Configure Admin Dashboard Page
Create a new page in your Wix site:
- **Page Name**: Admin Dashboard
- **URL**: `/admin-dashboard`
- **Access**: Restricted to admin users only

#### Dashboard Elements to Add:
```
- Text element: #totalUsersMetric
- Text element: #totalDonationsMetric  
- Text element: #activeCoachesMetric
- Text element: #completedSessionsMetric
- Button: #syncDataButton
- Button: #runWorkflowsButton
- Button: #generateReportsButton
- Button: #exportUsersButton
- Text element: #lastUpdateTime
- Text element: #syncStatus
- Container: #systemAlerts
- Chart element: #revenueChart
- Chart element: #userGrowthChart
```

## 🔧 Step 2: API Configuration

### 2.1 Update Platform URLs
In both Wix Velo files, replace `your-replit-domain.replit.app` with your actual Replit URL:

```javascript
const API_BASE_URL = 'https://YOUR_ACTUAL_REPLIT_URL.replit.app/api';
```

### 2.2 Set Up Authentication
1. In Wix Velo, go to **Secrets Manager**
2. Add these secrets:
   - `PLATFORM_API_KEY`: Generate admin API key for your platform
   - `SUPABASE_URL`: Your Supabase project URL
   - `SUPABASE_API_KEY`: Your Supabase API key

## 📊 Step 3: Database Collections Setup

### 3.1 Create Wix Data Collections
Create these collections in your Wix site's database:

#### Admin Users Collection
```
- Title: AdminUsers
- Fields:
  - email (Text, Required)
  - role (Text, Default: "admin")
  - status (Text, Default: "active")
  - lastLogin (Date & Time)
  - permissions (Tags)
```

#### Admin Activity Log
```
- Title: AdminActivityLog
- Fields:
  - adminEmail (Text, Required)
  - action (Text, Required)
  - details (Text)
  - timestamp (Date & Time, Required)
  - ipAddress (Text)
```

#### Synced Data Collections
```
- SyncedUsers (mirrors platform user data)
- SyncedDonations (mirrors platform donation data)
- SyncedBookings (mirrors platform booking data)
- SyncedCoaches (mirrors platform coach data)
```

### 3.2 Set Collection Permissions
- **Admin Users**: Admin read/write only
- **Activity Log**: Admin read/write only
- **Synced Data**: Admin read only, System write

## 🔄 Step 4: N8N Workflow Setup

### 4.1 Import Workflow
1. Access your N8N instance
2. Go to **Workflows** → **Import from file**
3. Upload `n8n-supabase-workflow.json`
4. The workflow will be imported with all nodes configured

### 4.2 Configure Credentials
Set up these credentials in N8N:

#### Platform Admin Auth
- **Type**: HTTP Header Auth
- **Name**: platform-admin-auth
- **Header Name**: Authorization
- **Header Value**: Bearer YOUR_ADMIN_API_KEY

#### Supabase Database
- **Type**: Postgres
- **Name**: supabase-db
- **Host**: pwuwmnivvdvdxdewynbo.supabase.co
- **Database**: postgres
- **Username**: postgres
- **Password**: YOUR_SUPABASE_PASSWORD
- **SSL**: Enabled

#### Email Configuration
- **Type**: SMTP
- **Name**: email-config
- **Host**: Your SMTP server
- **Port**: 587 (or your SMTP port)
- **Username**: Your email
- **Password**: Your email password

### 4.3 Update Webhook URLs
Replace placeholder URLs in the workflow with your actual URLs:
- Platform API: `https://YOUR_REPLIT_URL.replit.app`
- Supabase: Already configured with your instance

## ⚙️ Step 5: Platform Configuration

### 5.1 Admin API Endpoints
Your platform now includes these admin endpoints:

```
GET    /api/admin/metrics           - Dashboard metrics
GET    /api/admin/users             - User management
GET    /api/admin/donations         - Donation management
GET    /api/admin/coaches           - Coach management
GET    /api/admin/bookings          - Booking management
POST   /api/admin/bulk-operations   - Bulk user operations
POST   /api/admin/workflows/:id     - Execute workflows
GET    /api/admin/reports           - Generate reports
GET    /api/admin/alerts            - System alerts
```

### 5.2 Authentication Setup
Ensure admin users have proper roles in your platform's database to access admin endpoints.

## 🔗 Step 6: Integration Testing

### 6.1 Test Wix Dashboard
1. Navigate to your admin dashboard page
2. Click **Sync Data** - should fetch data from platform
3. Click **Run Workflows** - should execute automation tasks
4. Check that metrics display correctly

### 6.2 Test N8N Workflows
1. In N8N, manually execute the workflow
2. Check logs for successful API calls
3. Verify data logging in Supabase
4. Test scheduled automation (runs every 5 minutes)

### 6.3 Test Platform APIs
Using curl or Postman:

```bash
# Test metrics endpoint
curl -H "Authorization: Bearer YOUR_API_KEY" \
     https://YOUR_REPLIT_URL.replit.app/api/admin/metrics

# Test workflow execution
curl -X POST -H "Authorization: Bearer YOUR_API_KEY" \
     https://YOUR_REPLIT_URL.replit.app/api/admin/workflows/process-pending-donations
```

## 🔧 Step 7: Automation Features

### 7.1 Automated Tasks
The system automatically handles:

**Every 5 minutes:**
- Process pending donations
- Assign coaches to bookings
- Send follow-up emails
- Update user segments

**Every hour:**
- Publish scheduled content
- Generate user reports
- Check system alerts

**Daily:**
- Send dormant user follow-ups
- Generate financial reports
- Update coaching metrics

### 7.2 Manual Operations
Admin dashboard provides:
- Bulk user operations
- Real-time data sync
- Report generation
- Coach assignment
- Email campaign management

## 📈 Step 8: Monitoring & Alerts

### 8.1 System Alerts
Monitor for:
- High volume of pending donations (>10)
- Unassigned bookings (>5)
- Failed API requests
- Database sync issues

### 8.2 Performance Metrics
Track:
- Total users and growth rate
- Monthly donation revenue
- Active coaches and sessions
- Email delivery rates
- Automation success rates

## 🔒 Step 9: Security Configuration

### 9.1 Access Control
- Limit admin dashboard to authorized personnel
- Use strong API keys with limited scope
- Enable 2FA for admin accounts
- Regular audit of admin activities

### 9.2 Data Protection
- Encrypt sensitive data in transit
- Regular database backups
- Secure webhook endpoints
- Monitor for suspicious activities

## 🚀 Step 10: Deployment Checklist

### Pre-Launch
- [ ] All API endpoints tested
- [ ] Wix dashboard functional
- [ ] N8N workflows active
- [ ] Database collections created
- [ ] Admin users configured
- [ ] Email notifications working
- [ ] Security measures in place

### Post-Launch
- [ ] Monitor system alerts
- [ ] Track automation metrics
- [ ] Regular data sync checks
- [ ] Performance optimization
- [ ] User training completed

## 🆘 Troubleshooting

### Common Issues

**Dashboard not loading data:**
- Check API key configuration
- Verify platform URL is correct
- Ensure admin user has proper permissions

**N8N workflow failures:**
- Check credential configuration
- Verify webhook URLs
- Review error logs in N8N

**Database sync issues:**
- Confirm Supabase credentials
- Check database permissions
- Verify collection schemas

**Email notifications not sending:**
- Check SMTP configuration
- Verify email credentials
- Review email queue status

## 📞 Support & Maintenance

### Regular Maintenance
- Weekly review of automation logs
- Monthly performance analysis
- Quarterly security audits
- Annual system updates

### Support Contacts
- Platform Issues: Check Replit logs
- Wix Issues: Wix Support documentation
- N8N Issues: N8N community forums
- Database Issues: Supabase documentation

## 🎯 Next Steps

After successful setup:
1. Train admin staff on dashboard usage
2. Set up monitoring and alerting
3. Create backup and recovery procedures
4. Plan for scaling and optimization
5. Document custom modifications

## 📚 Additional Resources

- [Wix Velo Documentation](https://www.wix.com/velo/reference)
- [N8N Workflow Documentation](https://docs.n8n.io/)
- [Supabase API Documentation](https://supabase.io/docs)
- [Express.js Admin API Reference](./server/admin-routes.js)

---

**Note**: Replace all placeholder URLs, API keys, and credentials with your actual values before deployment. This system provides comprehensive automation for your nonprofit coaching platform while maintaining security and scalability.