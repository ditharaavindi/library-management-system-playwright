import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import BookCard from '../components/BookCard';
import Navigation from '../components/Navigation';
import { Book, ApiResponse } from '../types';
import { getCurrentUser } from '../utils/auth';

export default function Books() {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchBooks();
    }
  }, [isAuthorized]);

  const checkAuth = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    setIsAuthorized(true);
  };

  const fetchBooks = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('/api/books');
      const data: ApiResponse<Book[]> = await response.json();

      if (data.success && data.data) {
        setBooks(data.data);
      } else {
        setError(data.message || 'Failed to load books');
      }
    } catch (err) {
      setError('Connection error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchBooks();
  };

  if (!isAuthorized) {
    return (
      <div>
        <Navigation />
        <main className="main">
          <div className="container">
            <div className="card">
              <div className="loading">
                <h3>Checking authentication...</h3>
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div>
      {/* Header */}
      <Navigation />

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ margin: 0 }}>Library Books</h2>
              <button 
                onClick={handleRefresh} 
                className="btn" 
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
                data-testid="refresh-books"
                disabled={loading}
              >
                {loading ? '🔄 Loading...' : '🔄 Refresh'}
              </button>
            </div>

            {error && (
              <div className="alert error" data-testid="books-error">
                {error}
              </div>
            )}

            {loading && (
              <div className="loading" data-testid="books-loading">
                <h3>Loading books...</h3>
                <p>Please wait while we fetch the library collection.</p>
              </div>
            )}

            {!loading && !error && books.length === 0 && (
              <div className="empty-state" data-testid="books-empty">
                <h3>📚 No Books Found</h3>
                <p>The library collection is empty. Add some books to get started!</p>
                <Link href="/add-book">
                  <button className="btn" style={{ width: 'auto', marginTop: '1rem' }}>
                    ➕ Add First Book
                  </button>
                </Link>
              </div>
            )}

            {!loading && !error && books.length > 0 && (
              <>
                <div style={{ marginBottom: '1rem', color: '#666' }}>
                  <p data-testid="books-count">
                    Total books: <strong>{books.length}</strong>
                  </p>
                </div>
                
                <div className="books-grid" data-testid="books-grid">
                  {books.map((book) => (
                    <BookCard key={book.id} book={book} />
                  ))}
                </div>

                <div style={{ marginTop: '2rem', textAlign: 'center' }}>
                  <Link href="/add-book">
                    <button className="btn" style={{ backgroundColor: '#28a745', width: 'auto' }}>
                      ➕ Add Another Book
                    </button>
                  </Link>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}