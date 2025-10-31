import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Navigation from '../components/Navigation';
import { LoginRequest, LoginResponse } from '../types';
import { getCurrentUser } from '../utils/auth';

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState<LoginRequest>({
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  // Check if user is already logged in and redirect accordingly
  useEffect(() => {
    const user = getCurrentUser();
    if (user) {
      // If user is already logged in, redirect based on their role
      switch (user.role) {
        case 'admin':
        case 'librarian':
          router.push('/librarian-dashboard');
          break;
        case 'user':
          router.push('/books');
          break;
        default:
          router.push('/books');
      }
    }
  }, [router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);

    try {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data: LoginResponse = await response.json();

      if (data.success && data.user) {
        // Store user info for demo purposes
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userRole', data.user.role);
        
        setMessage({ type: 'success', text: `Welcome ${data.user.name}! Redirecting...` });
        
        // Role-based redirection
        setTimeout(() => {
          const userRole = data.user?.role;
          switch (userRole) {
            case 'admin':
            case 'librarian':
              window.location.href = '/librarian-dashboard';
              break;
            case 'user':
              window.location.href = '/books';
              break;
            default:
              window.location.href = '/books';
          }
        }, 1500);
      } else {
        setMessage({ type: 'error', text: data.message });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Connection error. Please try again.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <Navigation />

      {/* Main Content */}
      <main className="main">
        <div className="container">
          <div className="card">
            <h2>Login</h2>

            {message && (
              <div 
                className={`alert ${message.type}`} 
                data-testid="login-message"
              >
                {message.text}
              </div>
            )}

            <form onSubmit={handleSubmit} className="form" data-testid="login-form">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                  data-testid="email-input"
                  placeholder="admin@library.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  data-testid="password-input"
                  placeholder="admin123"
                />
              </div>

              <button
                type="submit"
                className="btn"
                disabled={loading}
                data-testid="login-submit"
              >
                {loading ? 'Logging in...' : 'Login'}
              </button>
            </form>

            <div style={{ marginTop: '2rem', padding: '2rem', backgroundColor: '#1a202c', border: '1px solid #2d3748', borderRadius: '12px' }}>
              <h3 style={{ marginBottom: '1rem', color: '#e6e6e6' }}>Demo Credentials</h3>
              <div style={{ fontSize: '0.9rem', color: '#a0aec0', textAlign: 'left' }}>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: '#3b82f6' }}>Admin:</strong> admin@library.com / admin123</p>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: '#10b981' }}>Librarian:</strong> librarian@library.com / librarian123</p>
                <p style={{ margin: '0.5rem 0' }}><strong style={{ color: '#f59e0b' }}>User:</strong> user@library.com / user123</p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}