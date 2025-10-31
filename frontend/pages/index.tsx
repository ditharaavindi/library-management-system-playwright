import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { getCurrentUser } from '../utils/auth';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // Check if user is already logged in
    const user = getCurrentUser();
    
    if (user) {
      // If user is logged in, redirect based on their role
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
    } else {
      // If not logged in, redirect to login page
      router.push('/login');
    }
  }, [router]);

  // Show loading while redirecting
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100vh',
      backgroundColor: '#1a1a2e',
      color: '#ffffff'
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ 
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #3498db',
          borderRadius: '50%',
          width: '40px',
          height: '40px',
          animation: 'spin 2s linear infinite',
          margin: '0 auto 1rem'
        }}></div>
        <p>Loading Library Management System...</p>
      </div>
      
      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}