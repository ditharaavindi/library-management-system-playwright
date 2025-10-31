import express from 'express';
import fs from 'fs';
import path from 'path';
import { Reservation, ApiResponse } from '../types';

const router = express.Router();
const reservationsFilePath = path.join(__dirname, '../data/reservations.json');
const booksFilePath = path.join(__dirname, '../data/books.json');

// Helper function to read reservations
const readReservations = (): Reservation[] => {
  try {
    if (fs.existsSync(reservationsFilePath)) {
      const data = fs.readFileSync(reservationsFilePath, 'utf8');
      return JSON.parse(data);
    }
    return [];
  } catch (error) {
    console.error('Error reading reservations:', error);
    return [];
  }
};

// Helper function to write reservations
const writeReservations = (reservations: Reservation[]): void => {
  try {
    const dataDir = path.dirname(reservationsFilePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(reservationsFilePath, JSON.stringify(reservations, null, 2));
  } catch (error) {
    console.error('Error writing reservations:', error);
    throw error;
  }
};

// Helper function to read books
const readBooks = () => {
  try {
    const data = fs.readFileSync(booksFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books:', error);
    return [];
  }
};

// Helper function to write books
const writeBooks = (books: any[]) => {
  try {
    fs.writeFileSync(booksFilePath, JSON.stringify(books, null, 2));
  } catch (error) {
    console.error('Error writing books:', error);
    throw error;
  }
};

// Get all reservations
router.get('/', (req, res) => {
  try {
    const reservations = readReservations();
    const response: ApiResponse<Reservation[]> = {
      success: true,
      data: reservations,
      message: 'Reservations retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to retrieve reservations'
    };
    res.status(500).json(response);
  }
});

// Get reservations for a specific user
router.get('/user/:email', (req, res) => {
  try {
    const { email } = req.params;
    
    if (!email) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'User email is required'
      };
      return res.status(400).json(response);
    }

    const reservations = readReservations();
    const userReservations = reservations.filter(r => r.userEmail === email);

    const response: ApiResponse<Reservation[]> = {
      success: true,
      data: userReservations,
      message: 'User reservations retrieved successfully'
    };
    res.json(response);
  } catch (error) {
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to retrieve user reservations'
    };
    res.status(500).json(response);
  }
});

// Create a new reservation
router.post('/', (req, res) => {
  try {
    const { bookId, bookTitle, userName, userEmail, reservationPeriod } = req.body;

    if (!bookId || !bookTitle || !userName || !userEmail || !reservationPeriod) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Missing required fields: bookId, bookTitle, userName, userEmail, reservationPeriod'
      };
      return res.status(400).json(response);
    }

    // Validate reservation period (1-30 days)
    if (reservationPeriod < 1 || reservationPeriod > 30) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation period must be between 1 and 30 days'
      };
      return res.status(400).json(response);
    }

    // Check if book is available
    const books = readBooks();
    const book = books.find((b: any) => b.id === bookId);
    
    if (!book) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Book not found'
      };
      return res.status(404).json(response);
    }

    if (!book.available || book.availableCopies <= 0) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Book is not available for reservation'
      };
      return res.status(400).json(response);
    }

    const reservations = readReservations();
    
    // Check if user already has a pending or approved reservation for this book
    const existingReservation = reservations.find(r => 
      r.bookId === bookId && 
      r.userEmail === userEmail && 
      (r.status === 'pending' || r.status === 'approved')
    );

    if (existingReservation) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'You already have a reservation for this book'
      };
      return res.status(400).json(response);
    }

    const newReservation: Reservation = {
      id: Date.now().toString(),
      bookId,
      bookTitle,
      userName,
      userEmail,
      requestDate: new Date().toISOString(),
      status: 'pending',
      reservationPeriod
    };

    reservations.push(newReservation);
    writeReservations(reservations);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: newReservation,
      message: 'Reservation created successfully'
    };
    res.status(201).json(response);
  } catch (error) {
    console.error('Error creating reservation:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to create reservation'
    };
    res.status(500).json(response);
  }
});

// Approve a reservation
router.put('/:id/approve', (req, res) => {
  try {
    const { id } = req.params;
    const { approvedBy, dueDate } = req.body;

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation not found'
      };
      return res.status(404).json(response);
    }

    const reservation = reservations[reservationIndex];

    if (reservation.status !== 'pending') {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Only pending reservations can be approved'
      };
      return res.status(400).json(response);
    }

    // Update book availability
    const books = readBooks();
    const bookIndex = books.findIndex((b: any) => b.id === reservation.bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies = Math.max(0, books[bookIndex].availableCopies - 1);
      books[bookIndex].available = books[bookIndex].availableCopies > 0;
      writeBooks(books);
    }

    // Update reservation
    reservation.status = 'approved';
    reservation.approvedBy = approvedBy;
    reservation.approvedDate = new Date().toISOString();
    reservation.dueDate = dueDate;

    reservations[reservationIndex] = reservation;
    writeReservations(reservations);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      message: 'Reservation approved successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error approving reservation:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to approve reservation'
    };
    res.status(500).json(response);
  }
});

// Reject a reservation
router.put('/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    const { rejectedBy, notes } = req.body;

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation not found'
      };
      return res.status(404).json(response);
    }

    const reservation = reservations[reservationIndex];

    if (reservation.status !== 'pending') {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Only pending reservations can be rejected'
      };
      return res.status(400).json(response);
    }

    // Update reservation
    reservation.status = 'rejected';
    reservation.rejectedBy = rejectedBy;
    reservation.rejectedDate = new Date().toISOString();
    reservation.notes = notes;

    reservations[reservationIndex] = reservation;
    writeReservations(reservations);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      message: 'Reservation rejected successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error rejecting reservation:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to reject reservation'
    };
    res.status(500).json(response);
  }
});

// Mark reservation as completed (book returned)
router.put('/:id/complete', (req, res) => {
  try {
    const { id } = req.params;

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation not found'
      };
      return res.status(404).json(response);
    }

    const reservation = reservations[reservationIndex];

    if (reservation.status !== 'approved') {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Only approved reservations can be completed'
      };
      return res.status(400).json(response);
    }

    // Update book availability (return the book)
    const books = readBooks();
    const bookIndex = books.findIndex((b: any) => b.id === reservation.bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies += 1;
      books[bookIndex].available = true;
      writeBooks(books);
    }

    // Update reservation
    reservation.status = 'completed';
    reservation.completedDate = new Date().toISOString();

    reservations[reservationIndex] = reservation;
    writeReservations(reservations);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      message: 'Reservation completed successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error completing reservation:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to complete reservation'
    };
    res.status(500).json(response);
  }
});

// Remove reservation when book is returned (librarian only)
router.delete('/:id', (req, res) => {
  try {
    const { id } = req.params;

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation not found'
      };
      return res.status(404).json(response);
    }

    const reservation = reservations[reservationIndex];

    // Update book availability if the reservation was approved
    if (reservation.status === 'approved') {
      const books = readBooks();
      const bookIndex = books.findIndex((b: any) => b.id === reservation.bookId);
      
      if (bookIndex !== -1) {
        books[bookIndex].availableCopies += 1;
        books[bookIndex].available = true;
        writeBooks(books);
      }
    }

    // Remove the reservation
    reservations.splice(reservationIndex, 1);
    writeReservations(reservations);

    const response: ApiResponse<null> = {
      success: true,
      data: null,
      message: 'Reservation removed successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error removing reservation:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to remove reservation'
    };
    res.status(500).json(response);
  }
});

// Mark reservation as returned (new status)
router.put('/:id/return', (req, res) => {
  try {
    const { id } = req.params;

    const reservations = readReservations();
    const reservationIndex = reservations.findIndex(r => r.id === id);

    if (reservationIndex === -1) {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Reservation not found'
      };
      return res.status(404).json(response);
    }

    const reservation = reservations[reservationIndex];

    if (reservation.status !== 'approved') {
      const response: ApiResponse<null> = {
        success: false,
        data: null,
        message: 'Only approved reservations can be returned'
      };
      return res.status(400).json(response);
    }

    // Update book availability (return the book)
    const books = readBooks();
    const bookIndex = books.findIndex((b: any) => b.id === reservation.bookId);
    
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies += 1;
      books[bookIndex].available = true;
      writeBooks(books);
    }

    // Update reservation status to returned
    reservation.status = 'returned';
    reservation.returnedDate = new Date().toISOString();

    reservations[reservationIndex] = reservation;
    writeReservations(reservations);

    const response: ApiResponse<Reservation> = {
      success: true,
      data: reservation,
      message: 'Book returned successfully'
    };
    res.json(response);
  } catch (error) {
    console.error('Error returning book:', error);
    const response: ApiResponse<null> = {
      success: false,
      data: null,
      message: 'Failed to return book'
    };
    res.status(500).json(response);
  }
});

export default router;