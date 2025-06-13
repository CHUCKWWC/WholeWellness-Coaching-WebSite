import type { Express } from "express";

// Wix API configuration
interface WixConfig {
  siteId: string;
  apiKey: string;
  baseUrl: string;
}

// Wix data types
interface WixUser {
  _id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  membershipLevel: 'free' | 'paid';
  profileImage?: string;
}

interface WixService {
  _id: string;
  name: string;
  description: string;
  price: number;
  duration: number;
  category: string;
}

interface WixBooking {
  _id: string;
  serviceId: string;
  userId: string;
  dateTime: string;
  status: 'pending' | 'confirmed' | 'cancelled';
  notes?: string;
}

export class WixIntegration {
  private config: WixConfig;

  constructor(config: WixConfig) {
    this.config = config;
  }

  // Fetch users from Wix
  async getUsers(): Promise<WixUser[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/members`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Wix API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.members || [];
    } catch (error) {
      console.error('Error fetching users from Wix:', error);
      return [];
    }
  }

  // Fetch services/pricing from Wix
  async getServices(): Promise<WixService[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/services`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Wix API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.services || [];
    } catch (error) {
      console.error('Error fetching services from Wix:', error);
      return [];
    }
  }

  // Fetch bookings from Wix
  async getBookings(): Promise<WixBooking[]> {
    try {
      const response = await fetch(`${this.config.baseUrl}/bookings`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Wix API error: ${response.statusText}`);
      }
      
      const data = await response.json();
      return data.bookings || [];
    } catch (error) {
      console.error('Error fetching bookings from Wix:', error);
      return [];
    }
  }

  // Sync user data with local database
  async syncUsers(): Promise<void> {
    const wixUsers = await this.getUsers();
    // Implementation would sync with your local database
    console.log(`Synced ${wixUsers.length} users from Wix`);
  }

  // Sync services/pricing with local database
  async syncServices(): Promise<void> {
    const wixServices = await this.getServices();
    // Implementation would update local service data
    console.log(`Synced ${wixServices.length} services from Wix`);
  }
}

// Setup Wix webhook endpoints
export function setupWixWebhooks(app: Express, wixIntegration: WixIntegration) {
  // Webhook for user updates
  app.post('/api/wix/webhooks/users', async (req, res) => {
    try {
      const { action, data } = req.body;
      
      if (action === 'member_updated' || action === 'member_created') {
        await wixIntegration.syncUsers();
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Wix user webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Webhook for service/pricing updates
  app.post('/api/wix/webhooks/services', async (req, res) => {
    try {
      const { action, data } = req.body;
      
      if (action === 'service_updated' || action === 'service_created') {
        await wixIntegration.syncServices();
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Wix service webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });

  // Webhook for booking updates
  app.post('/api/wix/webhooks/bookings', async (req, res) => {
    try {
      const { action, data } = req.body;
      
      if (action === 'booking_created' || action === 'booking_updated') {
        // Handle booking synchronization
        console.log('Booking webhook received:', action, data);
      }
      
      res.json({ success: true });
    } catch (error) {
      console.error('Wix booking webhook error:', error);
      res.status(500).json({ error: 'Webhook processing failed' });
    }
  });
}

// Environment configuration for Wix
export function getWixConfig(): WixConfig {
  return {
    siteId: process.env.WIX_SITE_ID || '',
    apiKey: process.env.WIX_API_KEY || '',
    baseUrl: process.env.WIX_API_BASE_URL || 'https://www.wixapis.com/v1'
  };
}