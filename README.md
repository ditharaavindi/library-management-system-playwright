# 📚 Library Management System

A comprehensive library management application with user authentication, book catalog management, and reservation system - demonstrating modern web development with end-to-end testing using Playwright.

## 🏗️ Architecture

This is a full-stack TypeScript application consisting of:

- **Frontend**: Next.js with React and TypeScript
- **Backend**: Express.js API with TypeScript
- **Database**: JSON file storage (no external database required)
- **Testing**: Playwright E2E test suite with cross-browser support

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- npm

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd library-management-system

# Install dependencies for both frontend and backend
npm run setup

# Install Playwright browsers (required for testing)
npx playwright install
```

### Running the Application

```bash
# Start both frontend and backend
npm run dev

# Or start individually:
npm run dev:backend    # Backend only (port 5001)
npm run dev:frontend   # Frontend only (port 3000)
```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5001

### Default Users

The system comes with pre-configured users:

**Admin User:**

- Email: `admin@library.com`
- Password: `admin123`
- Role: Administrator (can add/manage books)

**Regular User:**

- Email: `user@library.com`
- Password: `user123`
- Role: Member (can reserve books)

**Librarian:**

- Email: `librarian@library.com`
- Password: `librarian123`
- Role: Librarian (can manage reservations)

## 📱 Using the Application

### User Authentication & Navigation

1. **Login**: Navigate to the homepage and you'll be redirected to the login page
2. **User Roles**: Different users have different capabilities:
   - **Members**: Browse books, make reservations, view their reservations
   - **Administrators**: All member features plus add new books
   - **Librarians**: Manage reservation approvals and view all reservations

### Book Management

1. **Browse Books**: View the complete book catalog with search and filtering
2. **Search**: Use the search bar to find books by title
3. **Book Details**: Click on any book to view detailed information
4. **Add Books** (Admin only): Use the "Add Book" feature to expand the catalog

### Reservation System

1. **Make Reservations**: Click "Reserve" on available books and set reservation period
2. **Reservation Period**: Users can specify how long they need the book (1-30 days)
3. **Track Status**: View reservation status (Pending, Approved, Rejected, Completed, Returned)
4. **Librarian Dashboard**: Librarians can approve/reject reservations
5. **Return Management**: Librarians can mark books as returned and remove reservations
6. **My Reservations**: Members can view their reservation history with time periods

### Responsive Design

- The application works seamlessly on desktop, tablet, and mobile devices
- Navigation adapts to screen size with mobile-friendly menus
- All features are accessible across different devices

## 🧪 Comprehensive Testing Guide

### Playwright E2E Test Suite

The project includes a comprehensive Playwright test suite with **329 tests** across **47 test cases** covering all application functionality.

#### Quick Start Testing

```bash
# Run complete test suite
npm run test

# Run with UI mode for interactive testing
npm run test:ui

# Run tests in headed mode (visible browser)
npm run test:headed
```

#### Browser-Specific Testing

```bash
# Test on specific browsers
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Test on all browsers in parallel
npm run test:all-browsers
```

#### Mobile & Responsive Testing

```bash
# Test mobile responsiveness
npm run test:mobile

# Test mobile responsiveness
npx playwright test --project="mobile"
```

#### Debug & Development Tools

```bash
# Generate tests interactively
npm run test:codegen

# Debug mode with step-through
npm run test:debug

# Run tests with trace collection
npx playwright test --trace=on

# Slow motion debugging
npx playwright test --project=debug
```

#### Test Reports & Documentation

```bash
# Generate HTML report
npm run test:report

# View report in browser
npx playwright show-report

# Export JSON results
npx playwright test --reporter=json --output-file=results.json
```

### Individual Test File Execution

```bash
# Basic functionality tests (login, navigation, startup)
npx playwright test tests/basic-functionality.spec.ts

# Book management and search tests
npx playwright test tests/book-management.spec.ts

# Reservation system tests
npx playwright test tests/reservation-system.spec.ts

# Session management and network tests
npx playwright test tests/session-network.spec.ts

# Visual and cross-browser tests
npx playwright test tests/visual-cross-browser.spec.ts
```

### Run Tests by Category

```bash
# Authentication tests
npx playwright test -g "Authentication"

# Book search and filtering
npx playwright test -g "Book Search"

# Reservation workflow
npx playwright test -g "Reservation"

# Admin/Librarian features
npx playwright test -g "Librarian|Admin"

# Visual testing
npx playwright test -g "Visual|Screenshot"

# Mobile responsiveness
npx playwright test -g "responsive|mobile"
```

### Parallel & Performance Testing

```bash
# Parallel test execution
npx playwright test --workers=4

# Isolation between contexts
npx playwright test tests/session-network.spec.ts -g "parallel contexts"

# Automatic retry on flaky tests
npx playwright test --retries=3

# Headless mode for speed
npx playwright test --headed=false
```

## 📊 Detailed Test Coverage

### Test Files & Categories

1. **basic-functionality.spec.ts** - Application startup, authentication, and navigation
2. **book-management.spec.ts** - Book search, filtering, and admin management features
3. **reservation-system.spec.ts** - Book reservations and librarian approval workflow
4. **session-network.spec.ts** - User session management and network handling
5. **visual-cross-browser.spec.ts** - Visual testing, cross-browser compatibility, and mobile support

### Comprehensive Test Case Mapping

#### Application Loading & Startup (Tests 1-5)

| Test # | Description                       | Command                                           |
| ------ | --------------------------------- | ------------------------------------------------- |
| 1      | Verify app loads successfully     | `npx playwright test -g "Verify app loads"`       |
| 2      | Verify auto-redirect to login     | `npx playwright test -g "auto-redirect"`          |
| 3      | Login with valid user credentials | `npx playwright test -g "valid user credentials"` |
| 4      | Login with invalid credentials    | `npx playwright test -g "invalid credentials"`    |
| 5      | Login with admin credentials      | `npx playwright test -g "admin credentials"`      |

#### Auto-Wait & Network (Tests 6-10, 37-40)

- Auto-wait for Login button
- Wait for network completion
- Wait for page navigation
- Auto-wait for book list loading
- CORS validation
- Slow network auto-wait handling
- API mocking and stubbing

#### Book Management (Tests 10-16, 26-27)

- Book search functionality
- Add new book (admin only)
- Form validation and error handling
- Duplicate book prevention
- Book details by ID
- Filter by author and genre
- Role-based access control

#### Reservation System (Tests 17-25)

- Reserve available books
- Prevent unavailable booking
- Reservation lifecycle management
- Librarian approval/rejection workflow
- Dashboard functionality and pagination
- Reservation status tracking

#### Session Management (Tests 30-36)

- User navigation restrictions
- Admin navigation access
- My Reservations page access
- Multi-user session isolation
- Session persistence and security

#### Visual & Cross-Browser Testing (Tests 41-50)

- Screenshot capture and comparison
- Cross-browser UI consistency
- Chromium, Firefox, WebKit compatibility
- iPhone and iPad emulation
- Responsive design validation

#### Performance & CI/CD (Tests 51-60)

- Parallel test execution
- Automatic retry mechanisms
- Video recording for debugging
- Codegen test generation
- HTML report generation
- JSON export functionality
- CI/CD integration with GitHub Actions

### Test Execution Examples

#### Authentication Flow Testing

```bash
# Login scenarios (Tests 3-5)
npx playwright test tests/basic-functionality.spec.ts -g "Authentication"
```

#### Session Management Testing

```bash
# Session persistence & security (Tests 33-36)
npx playwright test tests/session-network.spec.ts -g "Session Management"
```

#### Network & API Testing

```bash
# API integration tests (Tests 37-40)
npx playwright test tests/session-network.spec.ts -g "Network and API"
```

#### Visual Testing

```bash
# Screenshot testing
npx playwright test tests/visual-cross-browser.spec.ts -g "screenshot"

# Cross-browser visual comparison
npx playwright test tests/visual-cross-browser.spec.ts -g "UI consistency"
```

## 📁 Project Structure

```
library-management-system/
├── frontend/              # Next.js React application
│   ├── components/        # Reusable React components
│   ├── pages/            # Next.js pages and API routes
│   ├── styles/           # CSS and styling files
│   ├── utils/            # Utility functions and helpers
│   └── types.ts          # TypeScript type definitions
├── backend/              # Express.js API server
│   └── src/              # Backend source code
│       ├── routes/       # API route handlers
│       ├── models/       # Data models and types
│       ├── middleware/   # Express middleware
│       └── utils/        # Backend utility functions
├── tests/                # Playwright E2E tests
│   ├── basic-functionality.spec.ts
│   ├── book-management.spec.ts
│   ├── reservation-system.spec.ts
│   ├── session-network.spec.ts
│   └── visual-cross-browser.spec.ts
├── playwright-report/    # Generated test reports
├── test-results/         # Test execution artifacts
├── playwright.config.ts  # Playwright configuration
└── package.json         # Project dependencies and scripts
```

## 🌐 API Endpoints

### Authentication

- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/profile` - Get user profile

### Books

- `GET /api/books` - Get all books
- `GET /api/books/:id` - Get book by ID
- `POST /api/books` - Add new book (admin only)
- `GET /api/books/search?title=` - Search books by title

### Reservations

- `GET /api/reservations` - Get user's reservations
- `POST /api/reservations` - Create new reservation with time period
- `GET /api/reservations/all` - Get all reservations (librarian)
- `PUT /api/reservations/:id` - Update reservation status
- `DELETE /api/reservations/:id` - Remove reservation when book returned (librarian)

### Health Check

- `GET /health` - Backend health check

## 💡 Development Tips

### Playwright Best Practices

1. **Use auto-waiting** - Let Playwright handle timing automatically
2. **Write resilient selectors** - Prefer user-visible text over CSS selectors
3. **Test user flows** - Focus on real user scenarios
4. **Leverage debugging tools** - Use trace viewer and codegen
5. **Run tests in CI** - Ensure consistent test execution

### Configuration Options

```bash
# Run specific test file
npx playwright test tests/basic-functionality.spec.ts

# Run tests matching pattern
npx playwright test -g "login"

# Run with custom timeout
npx playwright test --timeout=60000

# Run with specific worker count
npx playwright test --workers=2

# Set base URL
PLAYWRIGHT_BASE_URL=http://localhost:3000 npx playwright test

# Enable debug mode
DEBUG=pw:api npx playwright test
```

## 🛠️ Troubleshooting

### Common Issues

1. **Port conflicts**: Ensure ports 3000 and 5001 are available
2. **Node version**: Use Node.js v16 or higher
3. **Dependencies**: Run `npm run setup` to install all packages
4. **Browser installation**: Playwright will auto-install browsers on first run

### Debug Commands

```bash
# Check application health
curl http://localhost:5001/health

# View detailed test output
DEBUG=pw:api npx playwright test

# Run tests with trace
npx playwright test --trace=on

# Show test report
npx playwright show-report
```

## 📋 Test Coverage Summary

✅ **329 Comprehensive Tests** across **47 Test Cases** covering:

- ✅ Application Loading & Navigation (5 tests)
- ✅ Authentication & Authorization (8 tests)
- ✅ Auto-Wait Mechanisms (6 tests)
- ✅ Book Management (8 tests)
- ✅ Reservation System (9 tests)
- ✅ Session Management (4 tests)
- ✅ Network & API Integration (4 tests)
- ✅ Visual & Screenshot Testing (3 tests)
- ✅ Cross-Browser Compatibility (3 tests)
- ✅ Mobile & Responsive Design (2 tests)
- ✅ Performance & Parallel Testing (3 tests)
- ✅ Debug & Development Tools (5 tests)
- ✅ CI/CD & Reporting (3 tests)

## 📄 License

This project is for educational and demonstration purposes.
