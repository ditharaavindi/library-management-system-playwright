import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import { Book, ApiResponse } from '../types';
import { getCurrentUser } from '../utils/auth';

export default function AddBook() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    year: new Date().getFullYear()
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = () => {
    const user = getCurrentUser();
    if (!user) {
      router.push('/login');
      return;
    }
    if (user.role !== 'admin' && user.role !== 'librarian') {
      router.push('/books');
      return;
    }
    setIsAuthorized(true);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'year' ? parseInt(value) || 0 : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/books', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: ApiResponse<Book> = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
        // Reset form
        setFormData({
          title: '',
          author: '',
          year: new Date().getFullYear()
        });
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return (
      <div>
        <Navigation />
        <main className="main">
          <div className="container">
            <div className="card">
              <div className="loading">
                <h3>Checking permissions...</h3>
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
            <h2>Add New Book</h2>

            {message && (
              <div 
                className={`alert ${message.type}`} 
                data-testid="add-book-message"
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form" data-testid="add-book-form">
              <div className="form-group">
                <label htmlFor="title">Book Title *</label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                  data-testid="title-input"
                  placeholder="Enter book title"
                />
              </div>

              <div className="form-group">
                <label htmlFor="author">Author *</label>
                <input
                  type="text"
                  id="author"
                  name="author"
                  value={formData.author}
                  onChange={handleInputChange}
                  required
                  data-testid="author-input"
                  placeholder="Enter author name"
                />
              </div>

              <div className="form-group">
                <label htmlFor="year">Publication Year *</label>
                <input
                  type="number"
                  id="year"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  required
                  min="1000"
                  max={new Date().getFullYear()}
                  data-testid="year-input"
                  placeholder={new Date().getFullYear().toString()}
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={loading}
                data-testid="add-book-submit"
              >
                {loading ? 'Adding Book...' : 'Add Book'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', textAlign: 'center' }}>
              <Link href="/books">
                <button className="btn" style={{ backgroundColor: '#28a745', width: 'auto' }}>
                  📖 View All Books
                </button>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}