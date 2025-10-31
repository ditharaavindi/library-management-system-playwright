// Frontend types matching backend
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
  name: string;
  role: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  message: string;
  user?: User;
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
  reservationPeriod: number;
  notes?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
}