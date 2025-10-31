import express, { Request, Response } from 'express';
import fs from 'fs';
import path from 'path';
import { Book, ApiResponse, Reservation } from '../types';

const router = express.Router();
const BOOKS_FILE_PATH = path.join(__dirname, '../data/books.json');
const RESERVATIONS_FILE_PATH = path.join(__dirname, '../data/reservations.json');

// Helper function to read books from JSON file
const readBooks = (): Book[] => {
  try {
    const data = fs.readFileSync(BOOKS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading books file:', error);
    return [];
  }
};

// Helper function to write books to JSON file
const writeBooks = (books: Book[]): boolean => {
  try {
    fs.writeFileSync(BOOKS_FILE_PATH, JSON.stringify(books, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing books file:', error);
    return false;
  }
};

// Helper function to read reservations from JSON file
const readReservations = (): Reservation[] => {
  try {
    const data = fs.readFileSync(RESERVATIONS_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading reservations file:', error);
    return [];
  }
};

// Helper function to write reservations to JSON file
const writeReservations = (reservations: Reservation[]): boolean => {
  try {
    fs.writeFileSync(RESERVATIONS_FILE_PATH, JSON.stringify(reservations, null, 2));
    return true;
  } catch (error) {
    console.error('Error writing reservations file:', error);
    return false;
  }
};

// GET /api/books - Get all books
router.get('/books', (req: Request, res: Response) => {
  try {
    const books = readBooks();
    
    res.json({
      success: true,
      message: 'Books retrieved successfully',
      data: books
    } as ApiResponse<Book[]>);

  } catch (error) {
    console.error('Error getting books:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve books'
    } as ApiResponse);
  }
});

// POST /api/books - Add a new book
router.post('/books', (req: Request, res: Response) => {
  try {
    const { 
      title, 
      author, 
      year, 
      description = '', 
      genre = 'General', 
      isbn = '', 
      pages = 0, 
      publisher = '', 
      language = 'English',
      imageUrl = 'https://via.placeholder.com/300x400?text=No+Cover',
      totalCopies = 1 
    } = req.body;

    // Validate input
    if (!title || !author || !year) {
      return res.status(400).json({
        success: false,
        message: 'Title, author, and year are required'
      } as ApiResponse);
    }

    if (typeof year !== 'number' || year < 0 || year > new Date().getFullYear()) {
      return res.status(400).json({
        success: false,
        message: 'Invalid year provided'
      } as ApiResponse);
    }

    // Read existing books
    const books = readBooks();
    const bookId = Date.now().toString();

    // Create new book with all required fields
    const newBook: Book = {
      id: bookId,
      title: title.trim(),
      author: author.trim(),
      year: Number(year),
      dateAdded: new Date().toISOString().split('T')[0],
      imageUrl: imageUrl || 'https://via.placeholder.com/300x400?text=No+Cover',
      description: description.trim(),
      genre: genre.trim(),
      isbn: isbn.trim(),
      pages: Number(pages) || 0,
      publisher: publisher.trim(),
      language: language.trim(),
      available: true,
      totalCopies: Number(totalCopies) || 1,
      availableCopies: Number(totalCopies) || 1,
      location: `AUTO-${bookId.slice(-3)}`
    };

    // Add to books array
    books.push(newBook);

    // Save to file
    const saved = writeBooks(books);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save book'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      message: 'Book added successfully!',
      data: newBook
    } as ApiResponse<Book>);

  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add book'
    } as ApiResponse);
  }
});

// GET /api/books/:id - Get a specific book by ID
router.get('/books/:id', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const books = readBooks();
    const book = books.find(b => b.id === id);

    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Book retrieved successfully',
      data: book
    } as ApiResponse<Book>);

  } catch (error) {
    console.error('Error getting book:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve book'
    } as ApiResponse);
  }
});

// POST /api/books/:id/reserve - Reserve a book
router.post('/books/:id/reserve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { userEmail, userName, reservationPeriod } = req.body;

    if (!userEmail || !userName || !reservationPeriod) {
      return res.status(400).json({
        success: false,
        message: 'User email, name, and reservation period are required'
      } as ApiResponse);
    }

    // Validate reservation period (1-30 days)
    if (reservationPeriod < 1 || reservationPeriod > 30) {
      return res.status(400).json({
        success: false,
        message: 'Reservation period must be between 1 and 30 days'
      } as ApiResponse);
    }

    // Read books and reservations
    const books = readBooks();
    const reservations = readReservations();

    // Find the book
    const book = books.find(b => b.id === id);
    if (!book) {
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      } as ApiResponse);
    }

    // Check if book is available
    if (!book.available || book.availableCopies <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Book is not available for reservation'
      } as ApiResponse);
    }

    // Check if user already has a pending reservation for this book
    const existingReservation = reservations.find(r => 
      r.bookId === id && r.userEmail === userEmail && r.status === 'pending'
    );

    if (existingReservation) {
      return res.status(400).json({
        success: false,
        message: 'You already have a pending reservation for this book'
      } as ApiResponse);
    }

    // Create new reservation
    const newReservation: Reservation = {
      id: Date.now().toString(),
      bookId: id,
      userId: userEmail, // Using email as user ID for simplicity
      userEmail: userEmail,
      userName: userName,
      bookTitle: book.title,
      requestDate: new Date().toISOString(),
      status: 'pending',
      reservationPeriod: reservationPeriod
    };

    // Add reservation
    reservations.push(newReservation);
    
    // Save reservations
    const saved = writeReservations(reservations);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to save reservation'
      } as ApiResponse);
    }

    res.status(201).json({
      success: true,
      message: 'Book reservation request submitted successfully! Waiting for librarian approval.',
      data: newReservation
    } as ApiResponse<Reservation>);

  } catch (error) {
    console.error('Error creating reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create reservation'
    } as ApiResponse);
  }
});

// GET /api/reservations - Get all reservations (for librarians)
router.get('/reservations', (req: Request, res: Response) => {
  try {
    const reservations = readReservations();
    
    res.json({
      success: true,
      message: 'Reservations retrieved successfully',
      data: reservations
    } as ApiResponse<Reservation[]>);

  } catch (error) {
    console.error('Error getting reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve reservations'
    } as ApiResponse);
  }
});

// PUT /api/reservations/:id/approve - Approve a reservation
router.put('/reservations/:id/approve', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { approvedBy, dueDate } = req.body;

    if (!approvedBy) {
      return res.status(400).json({
        success: false,
        message: 'Approver information is required'
      } as ApiResponse);
    }

    // Read reservations and books
    const reservations = readReservations();
    const books = readBooks();

    // Find reservation
    const reservationIndex = reservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      } as ApiResponse);
    }

    const reservation = reservations[reservationIndex];
    
    // Find the book and update availability
    const bookIndex = books.findIndex(b => b.id === reservation.bookId);
    if (bookIndex !== -1) {
      books[bookIndex].availableCopies = Math.max(0, books[bookIndex].availableCopies - 1);
      books[bookIndex].available = books[bookIndex].availableCopies > 0;
    }

    // Update reservation
    reservations[reservationIndex] = {
      ...reservation,
      status: 'approved',
      approvedBy,
      approvedDate: new Date().toISOString(),
      dueDate: dueDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks from now
    };

    // Save both files
    const reservationsSaved = writeReservations(reservations);
    const booksSaved = writeBooks(books);

    if (!reservationsSaved || !booksSaved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to approve reservation'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Reservation approved successfully',
      data: reservations[reservationIndex]
    } as ApiResponse<Reservation>);

  } catch (error) {
    console.error('Error approving reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to approve reservation'
    } as ApiResponse);
  }
});

// PUT /api/reservations/:id/reject - Reject a reservation
router.put('/reservations/:id/reject', (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { rejectedBy, notes } = req.body;

    // Read reservations
    const reservations = readReservations();

    // Find reservation
    const reservationIndex = reservations.findIndex(r => r.id === id);
    if (reservationIndex === -1) {
      return res.status(404).json({
        success: false,
        message: 'Reservation not found'
      } as ApiResponse);
    }

    // Update reservation
    reservations[reservationIndex] = {
      ...reservations[reservationIndex],
      status: 'rejected',
      approvedBy: rejectedBy,
      approvedDate: new Date().toISOString(),
      notes
    };

    // Save reservations
    const saved = writeReservations(reservations);

    if (!saved) {
      return res.status(500).json({
        success: false,
        message: 'Failed to reject reservation'
      } as ApiResponse);
    }

    res.json({
      success: true,
      message: 'Reservation rejected',
      data: reservations[reservationIndex]
    } as ApiResponse<Reservation>);

  } catch (error) {
    console.error('Error rejecting reservation:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to reject reservation'
    } as ApiResponse);
  }
});

// GET /api/reservations/user/:email - Get user's reservations
router.get('/reservations/user/:email', (req: Request, res: Response) => {
  try {
    const { email } = req.params;
    const reservations = readReservations();
    
    const userReservations = reservations.filter(r => r.userEmail === email);
    
    res.json({
      success: true,
      message: 'User reservations retrieved successfully',
      data: userReservations
    } as ApiResponse<Reservation[]>);

  } catch (error) {
    console.error('Error getting user reservations:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to retrieve user reservations'
    } as ApiResponse);
  }
});

export default router;