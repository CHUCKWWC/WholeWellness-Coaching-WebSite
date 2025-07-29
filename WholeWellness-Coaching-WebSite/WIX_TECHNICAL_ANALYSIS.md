# Wix Booking Integration - Technical Analysis

## Core Integration Architecture

### 1. Wix SDK Configuration
```typescript
// server/wix-integration.ts
import { createClient, OAuthStrategy } from '@wix/sdk';
import { services, products, plans, items, bookings } from '@wix/data';

export class WixIntegration {
  private wixClient: any;

  constructor(config: WixConfig) {
    this.wixClient = createClient({
      modules: { 
        services, 
        products, 
        plans, 
        items, 
        bookings 
      },
      auth: OAuthStrategy({ clientId: config.clientId }),
    });
  }
}
```

### 2. Service Data Fetching
```typescript
async getServices(): Promise<WixService[]> {
  try {
    const serviceList = await this.wixClient.services.queryServices().find();
    
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
```

### 3. Booking Creation with Data Collections
```typescript
async createBooking(bookingData: BookingRequest): Promise<WixBooking> {
  try {
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
```

### 4. Available Slots Generation
```typescript
async getAvailableSlots(serviceId: string, date: string): Promise<TimeSlot[]> {
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

    return slots;
  } catch (error) {
    console.error('Error generating available slots:', error);
    return [];
  }
}
```

## Express.js API Endpoints

### 1. RESTful Booking Routes
```typescript
// server/routes.ts
app.post("/api/wix/bookings", async (req, res) => {
  try {
    const bookingData = req.body;
    const booking = await wixIntegration.createBooking(bookingData);
    res.json(booking);
  } catch (error) {
    console.error("Error creating Wix booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

app.get("/api/wix/services/:serviceId/slots", async (req, res) => {
  try {
    const { serviceId } = req.params;
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({ error: "Date parameter is required" });
    }
    
    const slots = await wixIntegration.getAvailableSlots(serviceId, date as string);
    res.json(slots);
  } catch (error) {
    console.error("Error fetching available slots:", error);
    res.status(500).json({ error: "Failed to fetch available slots" });
  }
});

app.delete("/api/wix/bookings/:bookingId", async (req, res) => {
  try {
    const { bookingId } = req.params;
    const result = await wixIntegration.cancelBooking(bookingId);
    res.json({ success: result });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ error: "Failed to cancel booking" });
  }
});
```

### 2. Booking Cancellation and Updates
```typescript
async cancelBooking(bookingId: string): Promise<boolean> {
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
    return true;
  } catch (error) {
    console.error('Error cancelling booking:', error);
    return false;
  }
}

async rescheduleBooking(bookingId: string, newSlot: TimeSlot): Promise<boolean> {
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
    return true;
  } catch (error) {
    console.error('Error rescheduling booking:', error);
    return false;
  }
}
```

## React Frontend Components

### 1. Booking Form with Zod Validation
```typescript
// client/src/pages/WixBooking.tsx
const bookingSchema = z.object({
  serviceId: z.string().min(1, 'Please select a service'),
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  phone: z.string().optional(),
  selectedDate: z.string().min(1, 'Please select a date'),
  selectedTime: z.string().min(1, 'Please select a time'),
  notes: z.string().optional(),
});

const form = useForm<BookingForm>({
  resolver: zodResolver(bookingSchema),
  defaultValues: {
    serviceId: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    selectedDate: '',
    selectedTime: '',
    notes: '',
  },
});
```

### 2. React Query Integration
```typescript
// Fetch services
const { data: services = [], isLoading: servicesLoading } = useQuery<WixService[]>({
  queryKey: ['/api/wix/services'],
  retry: false,
});

// Fetch available time slots
const { data: timeSlots = [], isLoading: slotsLoading } = useQuery<TimeSlot[]>({
  queryKey: ['/api/wix/services', selectedService?._id, 'slots', selectedDate],
  enabled: !!selectedService && !!selectedDate,
  retry: false,
});

// Create booking mutation
const createBookingMutation = useMutation({
  mutationFn: async (bookingData: BookingForm) => {
    const selectedSlot = timeSlots.find(slot => 
      slot.startDateTime === bookingData.selectedTime
    );
    
    if (!selectedSlot) {
      throw new Error('Selected time slot is no longer available');
    }

    const response = await apiRequest('/api/wix/bookings', 'POST', {
      serviceId: bookingData.serviceId,
      userId: 'temp-user-id',
      contactDetails: {
        firstName: bookingData.firstName,
        lastName: bookingData.lastName,
        email: bookingData.email,
        phone: bookingData.phone,
      },
      slot: {
        startDateTime: selectedSlot.startDateTime,
        endDateTime: selectedSlot.endDateTime,
      },
      notes: bookingData.notes,
    });
    
    return response;
  },
  onSuccess: () => {
    toast({
      title: 'Booking Created Successfully!',
      description: 'Your appointment has been scheduled. You will receive a confirmation email shortly.',
    });
    queryClient.invalidateQueries({ queryKey: ['/api/wix/bookings'] });
  },
  onError: (error: any) => {
    toast({
      title: 'Booking Failed',
      description: error.message || 'There was an error creating your booking. Please try again.',
      variant: 'destructive',
    });
  },
});
```

### 3. Multi-Step Booking Interface
```typescript
// Step-based booking flow
const [step, setStep] = useState(1);
const [selectedService, setSelectedService] = useState<WixService | null>(null);
const [selectedDate, setSelectedDate] = useState<string>('');

// Progress indicator component
<div className="flex items-center justify-between">
  {[
    { step: 1, label: 'Select Service' },
    { step: 2, label: 'Choose Date' },
    { step: 3, label: 'Pick Time' },
    { step: 4, label: 'Your Details' },
  ].map((item, index) => (
    <React.Fragment key={item.step}>
      <div className="flex items-center">
        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
          step >= item.step ? 'bg-primary text-white' : 'bg-gray-200 text-gray-600'
        }`}>
          {step > item.step ? <CheckCircle className="w-4 h-4" /> : item.step}
        </div>
        <span className={`ml-2 text-sm ${
          step >= item.step ? 'text-gray-900 font-medium' : 'text-gray-500'
        }`}>
          {item.label}
        </span>
      </div>
      {index < 3 && <div className="flex-1 mx-4 h-0.5 bg-gray-200"></div>}
    </React.Fragment>
  ))}
</div>
```

## TypeScript Interfaces

### 1. Core Data Types
```typescript
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

interface TimeSlot {
  startDateTime: string;
  endDateTime: string;
  duration: number;
  available: boolean;
}

interface BookingRequest {
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
}
```

### 2. Configuration Types
```typescript
interface WixConfig {
  clientId: string;
  siteId?: string;
}

interface WixProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  category: string;
}
```

## Environment Configuration

### 1. Required Environment Variables
```bash
# Wix Integration
WIX_CLIENT_ID=your_wix_client_id_here
WIX_SITE_ID=your_wix_site_id_here

# Database
DATABASE_URL=your_database_url_here
```

### 2. Package Dependencies
```json
{
  "dependencies": {
    "@wix/sdk": "latest",
    "@wix/bookings": "latest",
    "@wix/data": "latest",
    "@wix/stores": "latest",
    "@wix/pricing-plans": "latest",
    "zod": "^3.22.4",
    "@hookform/resolvers": "^3.3.2",
    "react-hook-form": "^7.48.2",
    "@tanstack/react-query": "^5.8.4"
  }
}
```

## Testing Framework

### 1. Integration Test Suite
```javascript
// test-wix-booking-integration.js
async function testWixBookingIntegration() {
  try {
    const wixIntegration = new WixIntegration(wixConfig);
    
    // Test service fetching
    const services = await wixIntegration.getServices();
    console.log(`Found ${services.length} services`);
    
    // Test available slots
    const slots = await wixIntegration.getAvailableSlots(services[0]._id, '2025-07-18');
    console.log(`Found ${slots.length} available slots`);
    
    // Test booking creation
    const bookingData = {
      serviceId: services[0]._id,
      userId: 'test-user',
      contactDetails: {
        firstName: 'John',
        lastName: 'Doe',
        email: 'john@example.com'
      },
      slot: {
        startDateTime: slots[0].startDateTime,
        endDateTime: slots[0].endDateTime
      }
    };
    
    const booking = await wixIntegration.createBooking(bookingData);
    console.log('Booking created:', booking._id);
    
    return true;
  } catch (error) {
    console.error('Test failed:', error);
    return false;
  }
}
```

### 2. API Endpoint Testing
```bash
# Test API endpoints
curl -X GET http://localhost:5000/api/wix/services
curl -X GET "http://localhost:5000/api/wix/services/SERVICE_ID/slots?date=2025-07-18"
curl -X POST http://localhost:5000/api/wix/bookings \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"SERVICE_ID","userId":"USER_ID","contactDetails":{"firstName":"John","lastName":"Doe","email":"john@example.com"},"slot":{"startDateTime":"2025-07-18T09:00:00.000Z","endDateTime":"2025-07-18T10:00:00.000Z"}}'
```

## Performance Considerations

### 1. Data Caching Strategy
```typescript
// Cache services for 5 minutes
const { data: services } = useQuery({
  queryKey: ['/api/wix/services'],
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});

// Cache slots for 1 minute (more dynamic)
const { data: timeSlots } = useQuery({
  queryKey: ['/api/wix/services', serviceId, 'slots', date],
  staleTime: 1 * 60 * 1000, // 1 minute
  enabled: !!serviceId && !!date,
});
```

### 2. Error Handling
```typescript
// Comprehensive error handling
const createBookingMutation = useMutation({
  mutationFn: createBooking,
  onError: (error: any) => {
    if (error.message.includes('unauthorized')) {
      toast({
        title: 'Authentication Error',
        description: 'Please check your Wix credentials.',
        variant: 'destructive',
      });
    } else if (error.message.includes('network')) {
      toast({
        title: 'Network Error',
        description: 'Please check your internet connection.',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Booking Failed',
        description: error.message || 'Unknown error occurred.',
        variant: 'destructive',
      });
    }
  },
});
```

## Production Deployment

### 1. Environment Setup
```bash
# Production environment variables
WIX_CLIENT_ID=production_client_id
DATABASE_URL=production_database_url
NODE_ENV=production
```

### 2. Build Configuration
```bash
# Build commands
npm run build
npm run start

# Docker deployment
FROM node:18-alpine
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 5000
CMD ["npm", "run", "start"]
```

This technical analysis provides the complete codebase structure for the Wix booking integration, covering backend API implementation, frontend React components, TypeScript interfaces, testing strategies, and deployment considerations.