import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { Reservation, ApiResponse } from '../types';
import Navigation from '../components/Navigation';

export default function LibrarianDashboard() {
  const router = useRouter();
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [authLoading, setAuthLoading] = useState(true);

  useEffect(() => {
    checkAuthorization();
  }, []);

  useEffect(() => {
    if (isAuthorized) {
      fetchReservations();
    }
  }, [isAuthorized]);

  const checkAuthorization = () => {
    try {
      const userRole = localStorage.getItem('userRole');
      const userEmail = localStorage.getItem('userEmail');
      
      // Check if user is logged in and has librarian or admin role
      if (!userEmail || !userRole) {
        // Not logged in
        setError('Please log in to access the librarian dashboard');
        setAuthLoading(false);
        setTimeout(() => {
          router.push('/login');
        }, 2000);
        return;
      }

      if (userRole !== 'librarian' && userRole !== 'admin') {
        // Logged in but not authorized
        setError('Access denied. Only librarians and administrators can access this page.');
        setAuthLoading(false);
        setTimeout(() => {
          router.push('/');
        }, 3000);
        return;
      }

      // Authorized
      setIsAuthorized(true);
      setAuthLoading(false);
    } catch (err) {
      setError('Authorization check failed');
      setAuthLoading(false);
      setTimeout(() => {
        router.push('/login');
      }, 2000);
    }
  };

  const fetchReservations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/reservations');
      const data: ApiResponse<Reservation[]> = await response.json();

      if (data.success && data.data) {
        setReservations(data.data);
      } else {
        setError(data.message || 'Failed to load reservations');
      }
    } catch (err) {
      setError('Failed to load reservations');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveReservation = async (reservationId: string) => {
    try {
      setProcessingId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}/approve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          approvedBy: localStorage.getItem('userName') || 'Librarian',
          dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString() // 2 weeks
        }),
      });

      const data: ApiResponse<Reservation> = await response.json();

      if (data.success) {
        await fetchReservations(); // Refresh the list
      } else {
        setError(data.message || 'Failed to approve reservation');
      }
    } catch (err) {
      setError('Failed to approve reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectReservation = async (reservationId: string) => {
    try {
      setProcessingId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}/reject`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rejectedBy: localStorage.getItem('userName') || 'Librarian',
          notes: 'Rejected by librarian'
        }),
      });

      const data: ApiResponse<Reservation> = await response.json();

      if (data.success) {
        await fetchReservations(); // Refresh the list
      } else {
        setError(data.message || 'Failed to reject reservation');
      }
    } catch (err) {
      setError('Failed to reject reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReturnBook = async (reservationId: string) => {
    try {
      setProcessingId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}/return`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data: ApiResponse<Reservation> = await response.json();

      if (data.success) {
        await fetchReservations(); // Refresh the list
      } else {
        setError(data.message || 'Failed to return book');
      }
    } catch (err) {
      setError('Failed to return book');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRemoveReservation = async (reservationId: string) => {
    if (!confirm('Are you sure you want to remove this reservation? This action cannot be undone.')) {
      return;
    }

    try {
      setProcessingId(reservationId);

      const response = await fetch(`/api/reservations/${reservationId}`, {
        method: 'DELETE',
      });

      const data: ApiResponse<null> = await response.json();

      if (data.success) {
        await fetchReservations(); // Refresh the list
      } else {
        setError(data.message || 'Failed to remove reservation');
      }
    } catch (err) {
      setError('Failed to remove reservation');
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusClasses = {
      pending: 'status-badge pending',
      approved: 'status-badge approved',
      rejected: 'status-badge rejected',
      completed: 'status-badge completed',
      returned: 'status-badge returned'
    };

    return (
      <span className={statusClasses[status as keyof typeof statusClasses] || 'status-badge'}>
        {status.toUpperCase()}
      </span>
    );
  };

  const pendingReservations = reservations.filter(r => r.status === 'pending');
  const approvedReservations = reservations.filter(r => r.status === 'approved');
  const otherReservations = reservations.filter(r => r.status !== 'pending' && r.status !== 'approved');

  return (
    <div>
      <Navigation />

      <main className="main">
        <div className="container">
          <div className="card">
            <h2>📋 Librarian Dashboard</h2>
            
            {authLoading ? (
              <div className="loading" data-testid="auth-loading">
                <h3>Checking permissions...</h3>
              </div>
            ) : !isAuthorized ? (
              <div className="alert error" data-testid="unauthorized-error">
                {error}
              </div>
            ) : (
              <>
                {error && (
                  <div className="alert error" data-testid="dashboard-error">
                    {error}
                  </div>
                )}

                {loading ? (
                  <div className="loading" data-testid="dashboard-loading">
                    <h3>Loading reservations...</h3>
                  </div>
                ) : (
              <>
                {/* Pending Reservations - Needs Action */}
                <div className="dashboard-section">
                  <h3 style={{ color: '#dc3545', marginBottom: '1rem' }}>
                    🔔 Pending Reservations ({pendingReservations.length})
                  </h3>
                  {pendingReservations.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No pending reservations</p>
                  ) : (
                    <div className="reservations-grid" data-testid="pending-reservations">
                      {pendingReservations.map((reservation) => (
                        <div key={reservation.id} className="reservation-card pending-card">
                          <div className="reservation-header">
                            <h4>{reservation.bookTitle}</h4>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <p><strong>Requested by:</strong> {reservation.userName}</p>
                          <p><strong>Email:</strong> {reservation.userEmail}</p>
                          <p><strong>Request Date:</strong> {new Date(reservation.requestDate).toLocaleDateString()}</p>
                          
                          <div className="reservation-actions">
                            <button
                              className="btn-approve"
                              onClick={() => handleApproveReservation(reservation.id)}
                              disabled={processingId === reservation.id}
                              data-testid={`approve-${reservation.id}`}
                            >
                              {processingId === reservation.id ? 'Processing...' : '✅ Approve'}
                            </button>
                            <button
                              className="btn-reject"
                              onClick={() => handleRejectReservation(reservation.id)}
                              disabled={processingId === reservation.id}
                              data-testid={`reject-${reservation.id}`}
                            >
                              {processingId === reservation.id ? 'Processing...' : '❌ Reject'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Approved Reservations */}
                <div className="dashboard-section">
                  <h3 style={{ color: '#28a745', marginBottom: '1rem' }}>
                    ✅ Approved Reservations ({approvedReservations.length})
                  </h3>
                  {approvedReservations.length === 0 ? (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>No approved reservations</p>
                  ) : (
                    <div className="reservations-grid" data-testid="approved-reservations">
                      {approvedReservations.map((reservation) => (
                        <div key={reservation.id} className="reservation-card approved-card">
                          <div className="reservation-header">
                            <h4>{reservation.bookTitle}</h4>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <p><strong>Reader:</strong> {reservation.userName}</p>
                          <p><strong>Approved by:</strong> {reservation.approvedBy}</p>
                          <p><strong>Due Date:</strong> {reservation.dueDate ? new Date(reservation.dueDate).toLocaleDateString() : 'N/A'}</p>
                          {(reservation as any).reservationPeriod && (
                            <p><strong>Period:</strong> {(reservation as any).reservationPeriod} days</p>
                          )}
                          <div className="reservation-actions">
                            <button
                              className="btn-return"
                              onClick={() => handleReturnBook(reservation.id)}
                              disabled={processingId === reservation.id}
                              data-testid={`return-${reservation.id}`}
                            >
                              {processingId === reservation.id ? 'Processing...' : '📤 Mark Returned'}
                            </button>
                            <button
                              className="btn-remove"
                              onClick={() => handleRemoveReservation(reservation.id)}
                              disabled={processingId === reservation.id}
                              data-testid={`remove-${reservation.id}`}
                            >
                              {processingId === reservation.id ? 'Processing...' : '🗑️ Remove'}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Other Reservations (Rejected, Completed) */}
                {otherReservations.length > 0 && (
                  <div className="dashboard-section">
                    <h3 style={{ color: '#6c757d', marginBottom: '1rem' }}>
                      📝 Other Reservations ({otherReservations.length})
                    </h3>
                    <div className="reservations-grid" data-testid="other-reservations">
                      {otherReservations.map((reservation) => (
                        <div key={reservation.id} className="reservation-card other-card">
                          <div className="reservation-header">
                            <h4>{reservation.bookTitle}</h4>
                            {getStatusBadge(reservation.status)}
                          </div>
                          <p><strong>Reader:</strong> {reservation.userName}</p>
                          <p><strong>Status:</strong> {reservation.status}</p>
                          {reservation.notes && (
                            <p><strong>Notes:</strong> {reservation.notes}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Statistics */}
                <div className="dashboard-stats">
                  <h3 style={{ marginBottom: '1rem' }}>📊 Statistics</h3>
                  <div className="stats-grid">
                    <div className="stat-card">
                      <div className="stat-number">{reservations.length}</div>
                      <div className="stat-label">Total Reservations</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{pendingReservations.length}</div>
                      <div className="stat-label">Pending Review</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{approvedReservations.length}</div>
                      <div className="stat-label">Currently Borrowed</div>
                    </div>
                    <div className="stat-card">
                      <div className="stat-number">{reservations.filter(r => r.status === 'completed').length}</div>
                      <div className="stat-label">Completed</div>
                    </div>
                  </div>
                </div>
                </>
              )}
            </>
            )}
          </div>
        </div>
      </main>

      <style jsx>{`
        .dashboard-section {
          margin-bottom: 3rem;
          padding-bottom: 2rem;
          border-bottom: 1px solid #e9ecef;
        }

        .reservations-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 1.5rem;
        }

        .reservation-card {
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s;
        }

        .reservation-card:hover {
          transform: translateY(-2px);
        }

        .pending-card {
          background: #fff3cd;
          border-left: 4px solid #ffc107;
        }

        .approved-card {
          background: #d4edda;
          border-left: 4px solid #28a745;
        }

        .other-card {
          background: #f8f9fa;
          border-left: 4px solid #6c757d;
        }

        .reservation-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
        }

        .reservation-header h4 {
          margin: 0;
          color: #333;
          flex: 1;
          margin-right: 1rem;
        }

        .status-badge {
          padding: 0.25rem 0.5rem;
          border-radius: 12px;
          font-size: 0.75rem;
          font-weight: 600;
          text-transform: uppercase;
          white-space: nowrap;
        }

        .status-badge.pending {
          background: #fff3cd;
          color: #856404;
          border: 1px solid #ffeeba;
        }

        .status-badge.approved {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .status-badge.rejected {
          background: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .status-badge.completed {
          background: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        }

        .status-badge.returned {
          background: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .reservation-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1rem;
        }

        .btn-approve, .btn-reject, .btn-return, .btn-remove {
          padding: 0.5rem 1rem;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: opacity 0.2s;
        }

        .btn-approve {
          background: #28a745;
          color: white;
        }

        .btn-reject {
          background: #dc3545;
          color: white;
        }

        .btn-return {
          background: #17a2b8;
          color: white;
        }

        .btn-remove {
          background: #fd7e14;
          color: white;
        }

        .btn-approve:hover, .btn-reject:hover, .btn-return:hover, .btn-remove:hover {
          opacity: 0.9;
        }

        .btn-approve:disabled, .btn-reject:disabled, .btn-return:disabled, .btn-remove:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
        }

        .stat-card {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 1.5rem;
          border-radius: 8px;
          text-align: center;
        }

        .stat-number {
          font-size: 2rem;
          font-weight: bold;
          margin-bottom: 0.5rem;
        }

        .stat-label {
          font-size: 0.9rem;
          opacity: 0.9;
        }

        @media (max-width: 768px) {
          .reservations-grid {
            grid-template-columns: 1fr;
          }
          
          .reservation-header {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      `}</style>
    </div>
  );
}