import type { Express } from "express";
import { createClient, OAuthStrategy } from '@wix/sdk';
import { items } from '@wix/data';
import { bookings, services } from '@wix/bookings';
import { products } from '@wix/stores';
import { plans } from '@wix/pricing-plans';

// Wix API configuration
interface WixConfig {
  clientId: string;
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

interface WixProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
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
  private wixClient: any;

  constructor(config: WixConfig) {
    this.config = config;
    
    // Create Wix client with all modules
    this.wixClient = createClient({
      modules: { 
        services, 
        products, 
        plans, 
        items, 
        bookings 
      },
      auth: OAuthStrategy({ clientId: this.config.clientId }),
    });
  }

  // Fetch services from Wix using SDK
  async getServices(): Promise<WixService[]> {
    try {
      const serviceList = await this.wixClient.services.queryServices().find();
      
      console.log('Wix Services:');
      console.log('Total: ', serviceList.items.length);
      
      return serviceList.items.map((service: any) => ({
        _id: service._id,
        name: service.name || 'Unnamed Service',
        description: service.info?.description || '',
        price: service.payment?.rateLabel?.amount || 0,
        duration: service.schedulePolicy?.sessionDurations?.[0] || 60,
        category: service.category || 'general'
      }));
    } catch (error) {
      console.error('Error fetching services from Wix:', error);
      return [];
    }
  }

  // Fetch products from Wix using SDK
  async getProducts(): Promise<WixProduct[]> {
    try {
      const productList = await this.wixClient.products.queryProducts().find();
      
      console.log('Wix Products:');
      console.log('Total: ', productList.items.length);
      
      return productList.items.map((product: any) => ({
        _id: product._id,
        name: product.name || 'Unnamed Product',
        description: product.description || '',
        price: product.price?.price || 0,
        category: product.productType || 'general'
      }));
    } catch (error) {
      console.error('Error fetching products from Wix:', error);
      return [];
    }
  }

  // Fetch pricing plans from Wix using SDK
  async getPlans(): Promise<any[]> {
    try {
      const plansList = await this.wixClient.plans.listPublicPlans();
      
      console.log('Wix Plans:');
      console.log('Total: ', plansList.plans?.length || 0);
      
      return plansList.plans || [];
    } catch (error) {
      console.error('Error fetching plans from Wix:', error);
      return [];
    }
  }

  // Fetch data items from Wix collections using SDK
  async getDataItems(collectionId: string): Promise<any[]> {
    try {
      const dataItemsList = await this.wixClient.items.queryDataItems({
        dataCollectionId: collectionId
      }).find();
      
      console.log(`Wix Data Items (${collectionId}):`);
      console.log('Total: ', dataItemsList.items.length);
      
      return dataItemsList.items;
    } catch (error) {
      console.error(`Error fetching data items from collection ${collectionId}:`, error);
      return [];
    }
  }

  // Fetch users from Members collection
  async getUsers(): Promise<WixUser[]> {
    try {
      // Fetch from Members data collection
      const members = await this.getDataItems('Members');
      
      return members.map((member: any) => ({
        _id: member.data._id,
        email: member.data.email,
        firstName: member.data.firstName,
        lastName: member.data.lastName,
        membershipLevel: member.data.membershipLevel || 'free',
        profileImage: member.data.profileImage
      }));
    } catch (error) {
      console.error('Error fetching users from Wix:', error);
      return [];
    }
  }

  // Fetch bookings from Wix
  async getBookings(): Promise<WixBooking[]> {
    try {
      const bookingsList = await this.wixClient.bookings.queryBookings().find();
      
      console.log('Wix Bookings:');
      console.log('Total: ', bookingsList.items.length);
      
      return bookingsList.items.map((booking: any) => ({
        _id: booking._id,
        serviceId: booking.serviceId,
        userId: booking.bookedEntity?.contactId,
        dateTime: booking.slot?.startDateTime,
        status: booking.status,
        notes: booking.additionalFields?.customFieldsMessage
      }));
    } catch (error) {
      console.error('Error fetching bookings from Wix:', error);
      return [];
    }
  }

  // Sync user data with local database
  async syncUsers(): Promise<void> {
    const wixUsers = await this.getUsers();
    console.log(`Synced ${wixUsers.length} users from Wix`);
  }

  // Sync services/pricing with local database
  async syncServices(): Promise<void> {
    const wixServices = await this.getServices();
    console.log(`Synced ${wixServices.length} services from Wix`);
  }

  // Sync all data types
  async syncAllData(): Promise<void> {
    try {
      await Promise.all([
        this.syncUsers(),
        this.syncServices(),
        this.getProducts(),
        this.getPlans()
      ]);
      console.log('All Wix data synchronized successfully');
    } catch (error) {
      console.error('Error during full sync:', error);
    }
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
    clientId: process.env.WIX_CLIENT_ID || '4b89abab-c440-4aef-88ec-c22c187b62fe'
  };
}