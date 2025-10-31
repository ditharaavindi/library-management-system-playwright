import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import Navigation from '../../components/Navigation';
import { Book, ApiResponse, Reservation } from '../../types';
import { getCurrentUser } from '../../utils/auth';

export default function BookDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [book, setBook] = useState<Book | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reserving, setReserving] = useState(false);
  const [reservationMessage, setReservationMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showReservationModal, setShowReservationModal] = useState(false);
  const [reservationPeriod, setReservationPeriod] = useState(7); // Default 7 days

  useEffect(() => {
    // Check authentication first
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }

    if (id) {
      fetchBook();
    }
  }, [id, router]);

  const fetchBook = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/books/${id}`);
      const data: ApiResponse<Book> = await response.json();

      if (data.success && data.data) {
        setBook(data.data);
      } else {
        setError(data.message || 'Book not found');
      }
    } catch (err) {
      setError('Failed to load book details');
    } finally {
      setLoading(false);
    }
  };

  const handleReservation = async () => {
    if (!book) return;

    const currentUser = getCurrentUser();
    
    if (!currentUser) {
      router.push('/login');
      return;
    }
    
    try {
      setReserving(true);
      setReservationMessage(null);

      const response = await fetch(`/api/books/${book.id}/reserve`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userEmail: currentUser.email,
          userName: currentUser.name,
          reservationPeriod
        }),
      });

      const data: ApiResponse<Reservation> = await response.json();

      if (data.success) {
        setReservationMessage({ 
          type: 'success', 
          text: data.message || 'Reservation request submitted successfully!' 
        });
        setShowReservationModal(false);
        // Refresh book data to show updated availability
        await fetchBook();
      } else {
        setReservationMessage({ type: 'error', text: data.message });
      }
    } catch (err) {
      setReservationMessage({ type: 'error', text: 'Failed to submit reservation request' });
    } finally {
      setReserving(false);
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <main className="main">
          <div className="container">
            <div className="loading" data-testid="book-loading">
              <h3>Loading book details...</h3>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (error || !book) {
    return (
      <div>
        <Navigation />
        <main className="main">
          <div className="container">
            <div className="card">
              <h2>Book Not Found</h2>
              <p>{error}</p>
              <Link href="/books">
                <button className="btn" style={{ width: 'auto' }}>
                  ← Back to Books
                </button>
              </Link>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      <Navigation />

      <main className="main">
        <div className="container">
          <div style={{ marginBottom: '2rem' }}>
            <Link href="/books">
              <button className="btn" style={{ width: 'auto', backgroundColor: '#6c757d' }}>
                ← Back to Books
              </button>
            </Link>
          </div>

          <div className="book-detail-container" data-testid="book-detail">
            {reservationMessage && (
              <div 
                className={`alert ${reservationMessage.type}`} 
                data-testid="reservation-message"
                style={{ marginBottom: '2rem' }}
              >
                {reservationMessage.text}
              </div>
            )}

            <div className="book-detail-header">
              <div>
                <img 
                  src={book.imageUrl} 
                  alt={`Cover of ${book.title}`}
                  className="book-detail-image"
                  data-testid="book-detail-image"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
                  }}
                />
              </div>

              <div className="book-detail-info">
                <h1 data-testid="book-detail-title">{book.title}</h1>
                <p className="author" data-testid="book-detail-author">by {book.author}</p>
                <span className="genre-badge" data-testid="book-detail-genre">{book.genre}</span>

                <div className="book-meta">
                  <div className="meta-item">
                    <span className="meta-label">Published:</span>
                    <span className="meta-value" data-testid="book-detail-year">{book.year}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Pages:</span>
                    <span className="meta-value" data-testid="book-detail-pages">{book.pages}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Publisher:</span>
                    <span className="meta-value" data-testid="book-detail-publisher">{book.publisher}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Language:</span>
                    <span className="meta-value" data-testid="book-detail-language">{book.language}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">ISBN:</span>
                    <span className="meta-value" data-testid="book-detail-isbn">{book.isbn || 'N/A'}</span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">Location:</span>
                    <span className="meta-value" data-testid="book-detail-location">{book.location}</span>
                  </div>
                </div>

                <div className="availability-section">
                  <div 
                    className={`availability-status ${book.available ? 'available' : 'unavailable'}`}
                    data-testid="availability-status"
                  >
                    {book.available 
                      ? `📚 ${book.availableCopies} of ${book.totalCopies} copies available`
                      : '❌ Currently not available'
                    }
                  </div>
                  
                  {book.available ? (
                    <button 
                      className="reserve-btn"
                      onClick={() => setShowReservationModal(true)}
                      disabled={reserving}
                      data-testid="reserve-button"
                    >
                      {reserving ? 'Submitting...' : '📖 Reserve This Book'}
                    </button>
                  ) : (
                    <p style={{ color: '#666', marginTop: '1rem' }}>
                      This book is currently checked out. Please check back later.
                    </p>
                  )}
                </div>
              </div>
            </div>

            {book.description && (
              <div>
                <h3 style={{ marginBottom: '1rem', color: '#333' }}>Description</h3>
                <p className="book-description" data-testid="book-detail-description">
                  {book.description}
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Reservation Confirmation Modal */}
      {showReservationModal && (
        <div className="modal-overlay" data-testid="reservation-modal">
          <div className="modal">
            <h3>Reserve Book</h3>
            <p style={{ marginBottom: '1rem', color: '#666' }}>
              Reserve "{book.title}" by {book.author}
            </p>
            
            <div style={{ marginBottom: '1.5rem' }}>
              <label htmlFor="reservation-period" style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
                Reservation Period (days):
              </label>
              <select
                id="reservation-period"
                value={reservationPeriod}
                onChange={(e) => setReservationPeriod(Number(e.target.value))}
                style={{ 
                  width: '100%', 
                  padding: '0.5rem', 
                  border: '1px solid #ddd', 
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
                data-testid="reservation-period-select"
              >
                <option value={7}>1 week (7 days)</option>
                <option value={14}>2 weeks (14 days)</option>
                <option value={21}>3 weeks (21 days)</option>
                <option value={30}>1 month (30 days)</option>
              </select>
              <p style={{ fontSize: '0.8rem', color: '#888', marginTop: '0.5rem' }}>
                Choose how long you need this book (1-30 days)
              </p>
            </div>
            
            <p style={{ fontSize: '0.9rem', color: '#888', marginBottom: '1.5rem' }}>
              Your reservation will be submitted to the librarian for approval. 
              You will be notified once it's approved.
            </p>
            
            <div className="modal-buttons">
              <button 
                className="modal-btn secondary"
                onClick={() => setShowReservationModal(false)}
                disabled={reserving}
              >
                Cancel
              </button>
              <button 
                className="modal-btn primary"
                onClick={handleReservation}
                disabled={reserving}
                data-testid="confirm-reservation"
              >
                {reserving ? 'Submitting...' : 'Confirm Reservation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}