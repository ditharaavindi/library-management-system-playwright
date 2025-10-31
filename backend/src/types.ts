// Backend data models and types
export interface Book {
  id: string;
  title: string;
  author: string;
  year: number;
  dateAdded: string;
  imageUrl: string;
  description: string;
  genre: string;
  isbn: string;
  pages: number;
  publisher: string;
  language: string;
  available: boolean;
  totalCopies: number;
  availableCopies: number;
  location: string;
}

export interface User {
  email: string;
  password: string;
  name: string;
  role: 'admin' | 'librarian' | 'user';
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: {
    email: string;
    name: string;
    role: string;
  };
}

export interface Reservation {
  id: string;
  bookId: string;
  userId?: string;
  userEmail: string;
  userName: string;
  bookTitle: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed' | 'returned';
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  completedDate?: string;
  returnedDate?: string;
  dueDate?: string;
  reservationPeriod: number; // days (1-30)
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}