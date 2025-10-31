import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import { getCurrentUser } from '../utils/auth';

interface Reservation {
  id: string;
  bookId: string;
  bookTitle: string;
  userName: string;
  userEmail: string;
  requestDate: string;
  status: 'pending' | 'approved' | 'rejected' | 'completed';
  approvedBy?: string;
  approvedDate?: string;
  rejectedBy?: string;
  rejectedDate?: string;
  completedDate?: string;
  dueDate?: string;
  notes?: string;
}

export default function MyReservations() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    // Check authentication
    const currentUser = getCurrentUser();
    if (!currentUser) {
      router.push('/login');
      return;
    }
    setUser(currentUser);
    
    // Fetch user's reservations
    fetchUserReservations(currentUser.email);
  }, [router]);

  const fetchUserReservations = async (userEmail: string) => {
    try {
      const response = await fetch(`/api/reservations/user/${encodeURIComponent(userEmail)}`);
      const data = await response.json();

      if (data.success) {
        setReservations(data.data || []);
      } else {
        setMessage({ type: 'error', text: data.message || 'Failed to load reservations' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', text: '⏳ Pending' },
      approved: { color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', text: '✅ Approved' },
      rejected: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', text: '❌ Rejected' },
      completed: { color: '#6b7280', bg: 'rgba(107, 114, 128, 0.1)', text: '🏁 Completed' }
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;

    return (
      <span style={{
        backgroundColor: config.bg,
        color: config.color,
        padding: '0.375rem 0.75rem',
        borderRadius: '0.5rem',
        fontSize: '0.875rem',
        fontWeight: '500',
        border: `1px solid ${config.color}33`
      }}>
        {config.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diffTime = due.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)} days overdue`;
    } else if (diffDays === 0) {
      return 'Due today';
    } else {
      return `${diffDays} days remaining`;
    }
  };

  if (loading) {
    return (
      <div>
        <Navigation />
        <main className="main">
          <div className="container">
            <div className="card" style={{ textAlign: 'center' }}>
              <div style={{ 
                border: '4px solid #f3f3f3',
                borderTop: '4px solid #3498db',
                borderRadius: '50%',
                width: '40px',
                height: '40px',
                animation: 'spin 2s linear infinite',
                margin: '0 auto 1rem'
              }}></div>
              <p>Loading your reservations...</p>
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
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <h2>📚 My Reservations</h2>
              <button 
                onClick={() => router.push('/books')}
                className="btn"
                style={{ width: 'auto', padding: '0.5rem 1rem' }}
              >
                Browse Books
              </button>
            </div>

            {message && (
              <div className={`alert ${message.type}`}>
                {message.text}
              </div>
            )}

            {reservations.length === 0 ? (
              <div style={{ 
                textAlign: 'center', 
                padding: '3rem 1rem',
                backgroundColor: '#1a202c',
                borderRadius: '12px',
                border: '1px solid #2d3748'
              }}>
                <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
                <h3 style={{ color: '#e6e6e6', marginBottom: '0.5rem' }}>No Reservations Yet</h3>
                <p style={{ color: '#a0aec0', marginBottom: '1.5rem' }}>
                  You haven't made any book reservations. Browse our collection to reserve books!
                </p>
                <button 
                  onClick={() => router.push('/books')}
                  className="btn"
                  style={{ width: 'auto' }}
                >
                  🔍 Browse Books
                </button>
              </div>
            ) : (
              <div style={{ display: 'grid', gap: '1.5rem' }}>
                {reservations.map((reservation) => (
                  <div 
                    key={reservation.id}
                    style={{
                      backgroundColor: '#1a202c',
                      border: '1px solid #2d3748',
                      borderRadius: '12px',
                      padding: '1.5rem',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                      <div style={{ flex: 1 }}>
                        <h3 style={{ color: '#e6e6e6', marginBottom: '0.5rem', fontSize: '1.25rem' }}>
                          📖 {reservation.bookTitle}
                        </h3>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
                          {getStatusBadge(reservation.status)}
                          <span style={{ color: '#a0aec0', fontSize: '0.875rem' }}>
                            🗓️ Requested: {formatDate(reservation.requestDate)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Status Details */}
                    <div style={{ marginTop: '1rem' }}>
                      {reservation.status === 'pending' && (
                        <div style={{ 
                          backgroundColor: 'rgba(245, 158, 11, 0.05)',
                          border: '1px solid rgba(245, 158, 11, 0.2)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <p style={{ color: '#f59e0b', fontSize: '0.875rem', margin: 0 }}>
                            ⏳ Your reservation is awaiting librarian approval. You'll be notified once it's processed.
                          </p>
                        </div>
                      )}

                      {reservation.status === 'approved' && (
                        <div style={{ 
                          backgroundColor: 'rgba(16, 185, 129, 0.05)',
                          border: '1px solid rgba(16, 185, 129, 0.2)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <p style={{ color: '#10b981', fontSize: '0.875rem', margin: 0 }}>
                              ✅ Approved by {reservation.approvedBy} on {formatDate(reservation.approvedDate!)}
                            </p>
                            {reservation.dueDate && (
                              <p style={{ color: '#e6e6e6', fontSize: '0.875rem', margin: 0 }}>
                                📅 Due: {formatDate(reservation.dueDate)} 
                                <span style={{ 
                                  color: new Date(reservation.dueDate) < new Date() ? '#ef4444' : '#10b981',
                                  marginLeft: '0.5rem',
                                  fontWeight: '500'
                                }}>
                                  ({getDaysRemaining(reservation.dueDate)})
                                </span>
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {reservation.status === 'rejected' && (
                        <div style={{ 
                          backgroundColor: 'rgba(239, 68, 68, 0.05)',
                          border: '1px solid rgba(239, 68, 68, 0.2)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <div style={{ display: 'grid', gap: '0.5rem' }}>
                            <p style={{ color: '#ef4444', fontSize: '0.875rem', margin: 0 }}>
                              ❌ Rejected by {reservation.rejectedBy} on {formatDate(reservation.rejectedDate!)}
                            </p>
                            {reservation.notes && (
                              <p style={{ color: '#a0aec0', fontSize: '0.875rem', margin: 0 }}>
                                📝 Note: {reservation.notes}
                              </p>
                            )}
                          </div>
                        </div>
                      )}

                      {reservation.status === 'completed' && (
                        <div style={{ 
                          backgroundColor: 'rgba(107, 114, 128, 0.05)',
                          border: '1px solid rgba(107, 114, 128, 0.2)',
                          borderRadius: '8px',
                          padding: '1rem'
                        }}>
                          <p style={{ color: '#6b7280', fontSize: '0.875rem', margin: 0 }}>
                            🏁 Book returned on {formatDate(reservation.completedDate!)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Summary Statistics */}
            {reservations.length > 0 && (
              <div style={{ 
                marginTop: '2rem', 
                padding: '1.5rem',
                backgroundColor: '#1a202c',
                borderRadius: '12px',
                border: '1px solid #2d3748'
              }}>
                <h3 style={{ color: '#e6e6e6', marginBottom: '1rem' }}>📊 Reservation Summary</h3>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '1rem' }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#3b82f6' }}>
                      {reservations.length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>Total</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#f59e0b' }}>
                      {reservations.filter(r => r.status === 'pending').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>Pending</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#10b981' }}>
                      {reservations.filter(r => r.status === 'approved').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>Approved</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#6b7280' }}>
                      {reservations.filter(r => r.status === 'completed').length}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: '#a0aec0' }}>Completed</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}