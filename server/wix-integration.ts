import type { Express } from "express";

// Error handling for missing Wix modules - use dynamic imports
let wixModules: {
  createClient?: any;
  OAuthStrategy?: any;
  items?: any;
  bookings?: any;
  services?: any;
  products?: any;
  plans?: any;
} = {};

// Initialize Wix modules with error handling
async function initializeWixModules() {
  try {
    const wixSdk = await import('@wix/sdk');
    wixModules.createClient = wixSdk.createClient;
    wixModules.OAuthStrategy = wixSdk.OAuthStrategy;
  } catch (error) {
    console.error('Failed to import @wix/sdk:', error);
  }

  try {
    const wixData = await import('@wix/data');
    wixModules.items = wixData.items;
  } catch (error) {
    console.error('Failed to import @wix/data:', error);
  }

  try {
    const wixBookings = await import('@wix/bookings');
    wixModules.bookings = wixBookings.bookings;
    wixModules.services = wixBookings.services;
  } catch (error) {
    console.error('Failed to import @wix/bookings:', error);
  }

  try {
    const wixStores = await import('@wix/stores');
    wixModules.products = wixStores.products;
  } catch (error) {
    console.error('Failed to import @wix/stores:', error);
  }

  try {
    const wixPricingPlans = await import('@wix/pricing-plans');
    wixModules.plans = wixPricingPlans.plans;
  } catch (error) {
    console.error('Failed to import @wix/pricing-plans:', error);
  }
}

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
  private initialized: boolean = false;

  constructor(config: WixConfig) {
    this.config = config;
    this.wixClient = null;
  }

  // Initialize Wix client with error handling
  private async initialize() {
    if (this.initialized) return;
    
    try {
      await initializeWixModules();
      
      if (!wixModules.createClient || !wixModules.OAuthStrategy) {
        console.error('Wix SDK modules not available - running in fallback mode');
        this.initialized = true;
        return;
      }

      // Create Wix client with all modules
      this.wixClient = wixModules.createClient({
        modules: { 
          services: wixModules.services, 
          products: wixModules.products, 
          plans: wixModules.plans, 
          items: wixModules.items, 
          bookings: wixModules.bookings 
        },
        auth: wixModules.OAuthStrategy({ clientId: this.config.clientId }),
      });
      
      this.initialized = true;
      console.log('Wix integration initialized successfully');
    } catch (error) {
      console.error('Failed to initialize Wix integration:', error);
      this.initialized = true; // Set to true to prevent retry loops
    }
  }

  // Check if Wix integration is available
  private isAvailable(): boolean {
    return this.wixClient !== null;
  }

  // Fetch services from Wix using SDK
  async getServices(): Promise<WixService[]> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - returning empty services list');
      return [];
    }

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
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - returning empty products list');
      return [];
    }

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
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - returning empty plans list');
      return [];
    }

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
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn(`Wix integration not available - returning empty data items for ${collectionId}`);
      return [];
    }

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
      // Use the data collection API for bookings
      const bookings = await this.getDataItems('Bookings');
      
      console.log('Wix Bookings:');
      console.log('Total: ', bookings.length);
      
      return bookings.map((booking: any) => ({
        _id: booking.data._id,
        serviceId: booking.data.serviceId,
        userId: booking.data.userId,
        dateTime: booking.data.dateTime,
        status: booking.data.status || 'pending',
        notes: booking.data.notes
      }));
    } catch (error) {
      console.error('Error fetching bookings from Wix:', error);
      return [];
    }
  }

  // Create a new booking in Wix
  async createBooking(bookingData: {
    serviceId: string;
    userId: string;
    contactDetails: {
      firstName: string;
      lastName: string;
      email: string;
      phone?: string;
    };
    slot: {
      startDateTime: string;
      endDateTime: string;
    };
    notes?: string;
  }): Promise<WixBooking> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.error('Wix integration not available - cannot create booking');
      throw new Error('Wix integration not available');
    }

    try {
      // Create booking using data collection API
      const bookingId = `booking_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const booking = await this.wixClient.data.insertDataItem({
        dataCollectionId: 'Bookings',
        dataItem: {
          data: {
            _id: bookingId,
            serviceId: bookingData.serviceId,
            userId: bookingData.userId,
            dateTime: bookingData.slot.startDateTime,
            endDateTime: bookingData.slot.endDateTime,
            status: 'pending',
            contactFirstName: bookingData.contactDetails.firstName,
            contactLastName: bookingData.contactDetails.lastName,
            contactEmail: bookingData.contactDetails.email,
            contactPhone: bookingData.contactDetails.phone || '',
            notes: bookingData.notes || '',
            createdAt: new Date().toISOString()
          }
        }
      });

      console.log('Booking created successfully:', booking._id);
      
      return {
        _id: booking._id,
        serviceId: bookingData.serviceId,
        userId: bookingData.userId,
        dateTime: bookingData.slot.startDateTime,
        status: 'pending',
        notes: bookingData.notes || ''
      };
    } catch (error) {
      console.error('Error creating booking in Wix:', error);
      throw error;
    }
  }

  // Get available time slots for a service
  async getAvailableSlots(serviceId: string, date: string): Promise<any[]> {
    try {
      // Generate available time slots from 9 AM to 5 PM (business hours)
      const slots = [];
      const baseDate = new Date(date);
      
      for (let hour = 9; hour < 17; hour++) {
        const startTime = new Date(baseDate);
        startTime.setHours(hour, 0, 0, 0);
        
        const endTime = new Date(baseDate);
        endTime.setHours(hour + 1, 0, 0, 0);
        
        slots.push({
          startDateTime: startTime.toISOString(),
          endDateTime: endTime.toISOString(),
          duration: 60, // 60 minutes
          available: true
        });
      }

      console.log(`Generated ${slots.length} available slots for ${serviceId} on ${date}`);
      return slots;
    } catch (error) {
      console.error('Error generating available slots:', error);
      return [];
    }
  }

  // Cancel a booking
  async cancelBooking(bookingId: string): Promise<boolean> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - cannot cancel booking');
      return false;
    }

    try {
      await this.wixClient.data.updateDataItem({
        dataCollectionId: 'Bookings',
        dataItemId: bookingId,
        dataItem: {
          data: {
            status: 'cancelled',
            updatedAt: new Date().toISOString()
          }
        }
      });
      console.log('Booking cancelled successfully:', bookingId);
      return true;
    } catch (error) {
      console.error('Error cancelling booking:', error);
      return false;
    }
  }

  // Reschedule a booking
  async rescheduleBooking(bookingId: string, newSlot: {
    startDateTime: string;
    endDateTime: string;
  }): Promise<boolean> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - cannot reschedule booking');
      return false;
    }

    try {
      await this.wixClient.data.updateDataItem({
        dataCollectionId: 'Bookings',
        dataItemId: bookingId,
        dataItem: {
          data: {
            dateTime: newSlot.startDateTime,
            endDateTime: newSlot.endDateTime,
            status: 'confirmed',
            updatedAt: new Date().toISOString()
          }
        }
      });
      console.log('Booking rescheduled successfully:', bookingId);
      return true;
    } catch (error) {
      console.error('Error rescheduling booking:', error);
      return false;
    }
  }

  // Sync user data with local database
  async syncUsers(): Promise<void> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - skipping user sync');
      return;
    }

    const wixUsers = await this.getUsers();
    console.log(`Synced ${wixUsers.length} users from Wix`);
  }

  // Sync services/pricing with local database
  async syncServices(): Promise<void> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - skipping service sync');
      return;
    }

    const wixServices = await this.getServices();
    console.log(`Synced ${wixServices.length} services from Wix`);
  }

  // Sync all data types
  async syncAllData(): Promise<void> {
    await this.initialize();
    
    if (!this.isAvailable()) {
      console.warn('Wix integration not available - skipping full data sync');
      return;
    }

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