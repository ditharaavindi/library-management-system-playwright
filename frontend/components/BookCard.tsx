import React from 'react';
import Link from 'next/link';
import { Book } from '../types';

interface BookCardProps {
  book: Book;
}

const BookCard: React.FC<BookCardProps> = ({ book }) => {
  return (
    <Link href={`/books/${book.id}`}>
      <div className="book-card" data-testid={`book-${book.id}`}>
        <div className="book-image-container">
          <img 
            src={book.imageUrl} 
            alt={`Cover of ${book.title}`}
            className="book-cover"
            data-testid="book-image"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.src = 'https://via.placeholder.com/300x400?text=No+Cover';
            }}
          />
          <div className={`availability-badge ${book.available ? 'available' : 'unavailable'}`}>
            {book.available ? `${book.availableCopies} Available` : 'Not Available'}
          </div>
        </div>
        <div className="book-details">
          <h3 data-testid="book-title">{book.title}</h3>
          <p className="author" data-testid="book-author">by {book.author}</p>
          <p className="genre" data-testid="book-genre">{book.genre}</p>
          <p className="year" data-testid="book-year">Published: {book.year}</p>
          <p className="location" data-testid="book-location">Location: {book.location}</p>
        </div>
      </div>
    </Link>
  );
};

export default BookCard;