export interface Property {
  id: string;
  propertyId: string;
  name: string;
  phoneNumber: string;
  location: {
    city: string;
    area: string;
    street: string;
  };
  type: 'Plot' | 'House' | 'Shop' | 'Flat' | 'Other';
  size: {
    value: number;
    unit: 'Marla' | 'Kanal' | 'Sqft';
  };
  price: number;
  status: 'Available' | 'Sold' | 'Rented' | 'On Hold';
  notes: string;
  remarks?: {
    type: 'Sold' | 'On Rent' | 'Other';
    customText?: string;
  };
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Client {
  id: string;
  name: string;
  mobile: string;
  whatsapp: string;
  type: 'Buyer' | 'Seller';
  budget: number;
  budgetNotes: string;
  additionalNotes: string;
  propertyId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Renting {
  id: string;
  rentingId: string;
  propertyType: 'House' | 'Plot' | 'Flat' | 'Apartment' | 'Shop' | 'Office' | 'Warehouse' | 'Other';
  title: string;
  location: {
    city: string;
    area: string;
    street: string;
    fullAddress: string;
  };
  size: {
    value: number;
    unit: 'Marla' | 'Kanal' | 'Sqft' | 'Sqm';
  };
  bedrooms?: number;
  bathrooms?: number;
  rentAmount: number;
  securityDeposit: number;
  furnished: 'Furnished' | 'Semi-Furnished' | 'Unfurnished';
  availabilityStatus: 'Available' | 'Rented' | 'Under Negotiation' | 'Maintenance' | 'Reserved';
  owner: {
    name: string;
    mobile: string;
    whatsapp?: string;
    email?: string;
  };
  amenities: string[];
  leaseDuration: {
    type: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'Custom';
    value: number;
    customPeriod?: string;
  };
  paymentSchedule: 'Monthly' | 'Quarterly' | 'Half-Yearly' | 'Yearly' | 'Custom';
  additionalNotes: string;
  images: string[];
  documents: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Deal {
  id: string;
  propertyId: string;
  buyerId: string;
  sellerId: string;
  agreedPrice: number;
  paymentSchedule: PaymentSchedule[];
  commission?: number;
  agreementFiles: string[];
  status: 'Active' | 'Completed' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentSchedule {
  id: string;
  amount: number;
  dueDate: Date;
  paid: boolean;
  paidDate?: Date;
  notes?: string;
}

export interface Reminder {
  id: string;
  type: 'Payment' | 'Follow-up' | 'Call';
  title: string;
  description: string;
  dueDate: Date;
  completed: boolean;
  relatedTo: {
    type: 'Property' | 'Client' | 'Deal';
    id: string;
  };
  createdAt: Date;
}

export interface AppState {
  properties: Property[];
  clients: Client[];
  rentings: Renting[];
  deals: Deal[];
  reminders: Reminder[];
  isAuthenticated: boolean;
  searchTerm: string;
  activeModule: string;
}