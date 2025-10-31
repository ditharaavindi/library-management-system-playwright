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
cd library-management-system-playwright

# Install all dependencies (root, frontend, and backend)
npm run setup

# This command will:
# - Install root dependencies
# - Install backend dependencies
# - Install frontend dependencies
# - Install Playwright browsers for testing
```

**Alternative: Manual Installation**

```bash
# Install root dependencies
npm install

# Install backend dependencies
cd backend
npm install
cd ..

# Install frontend dependencies
cd frontend
npm install
cd ..

# Install Playwright browsers
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

The project includes a comprehensive Playwright test suite with **47 test cases** covering all application functionality across multiple test files.

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

#### 🎬 Using Playwright Codegen (Test Generator)

Playwright Codegen automatically generates test code by recording your actions in the browser.

**Important:** Start your application first before running codegen!

```bash
# Terminal 1: Start the application
npm run dev

# Terminal 2: Run codegen (in a new terminal)
npm run test:codegen
```

**What happens:**

1. Opens browser window at http://localhost:3000
2. Opens Playwright Inspector showing generated code
3. Records all your actions (clicks, typing, navigation)
4. Generates TypeScript test code automatically

**Example workflow:**

1. Codegen opens browser
2. Perform actions: Login → Browse books → Reserve book
3. Copy generated code from Playwright Inspector
4. Save to a test file and refine

**Advanced options:**

```bash
# Start from specific page
npx playwright codegen localhost:3000/login

# Use specific browser
npx playwright codegen localhost:3000 --browser=firefox

# Emulate mobile device
npx playwright codegen localhost:3000 --device="iPhone 14"

# Save directly to file
npx playwright codegen localhost:3000 --target typescript -o tests/new-test.spec.ts
```

**Common error:** If you get `ERR_CONNECTION_REFUSED`, make sure your app is running first with `npm run dev`.

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
# Access control tests (10 tests)
npx playwright test tests/access-control.spec.ts

# Book management tests (6 tests)
npx playwright test tests/books.spec.ts

# Dashboard tests (7 tests)
npx playwright test tests/dashboard.spec.ts

# Homepage tests (6 tests)
npx playwright test tests/homepage.spec.ts

# Login tests (6 tests)
npx playwright test tests/login.spec.ts

# Navigation tests (7 tests)
npx playwright test tests/navigation.spec.ts

# Reservation system tests (6 tests)
npx playwright test tests/reservations.spec.ts
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

The project includes **8 test files** with **47 comprehensive test cases**:

1. **access-control.spec.ts** (10 tests) - Role-based access control and route protection
2. **books.spec.ts** (6 tests) - Book browsing, searching, and management
3. **dashboard.spec.ts** (7 tests) - Librarian dashboard functionality and statistics
4. **homepage.spec.ts** (6 tests) - Homepage routing and authentication redirects
5. **login.spec.ts** (6 tests) - User authentication and login flows
6. **navigation.spec.ts** (7 tests) - Navigation links and responsive behavior
7. **reservations.spec.ts** (6 tests) - Book reservation system and workflows
8. **global-setup.ts** - Test environment initialization

### Test Case Breakdown by Category

#### 🔒 Access Control Tests (10 tests)

- Redirect to login when accessing protected routes without authentication
- Deny access to admin pages for regular users
- Ensure regular users can only access permitted pages
- Verify librarian access to dashboard and admin pages
- Verify admin access to all protected pages
- Test all protected routes require authentication
- Enforce role-based access control consistently
- Maintain access control after page refresh
- Handle direct URL access attempts properly
- Test URL manipulation and unauthorized access attempts

#### 📚 Book Management Tests (6 tests)

- View all books (verify at least 10 books displayed)
- Search books by title or author
- View book details by clicking a book
- Add new book as admin user
- Validate required fields on Add Book form
- Refresh books list functionality

#### 📊 Dashboard Tests (7 tests)

- Verify dashboard loads for admin users
- Verify dashboard loads for librarian users
- Display total reservations count with statistics
- Display book inventory statistics
- Navigate to reservation approval section
- Prevent regular users from accessing dashboard
- Handle dashboard loading states and errors properly

#### 🏠 Homepage Tests (6 tests)

- Auto-redirect unauthenticated users to login
- Redirect authenticated users to appropriate page
- Redirect admin users to dashboard
- Show role-appropriate navigation for regular users
- Navigate between Books and My Reservations pages
- Display proper loading state during redirects

#### 🔑 Login Tests (6 tests)

- Login successfully with valid user credentials
- Reject invalid credentials with error message
- Redirect admin to dashboard after login
- Redirect librarian to dashboard after login
- Logout successfully and redirect to login
- Prevent empty form submission with validation

#### 🧭 Navigation Tests (7 tests)

- Verify navigation links for regular users
- Verify navigation links for librarian users
- Show admin features only for authorized users
- Show dashboard navigation only for authorized roles
- Reset session properly on logout
- Show proper navigation state and current page
- Handle responsive navigation behavior

#### 📖 Reservation Tests (6 tests)

- Reserve an available book as user
- Prevent double-reserving the same book
- Allow librarian to approve reservations
- Allow librarian to reject reservations
- Allow users to view updated reservation status
- Allow librarian to mark reservations as completed

### Test Execution Examples

#### Run Tests by Category

```bash
# Authentication and login tests
npx playwright test tests/login.spec.ts

# Access control and security tests
npx playwright test tests/access-control.spec.ts

# Book management tests
npx playwright test tests/books.spec.ts

# Reservation workflow tests
npx playwright test tests/reservations.spec.ts

# Dashboard and admin tests
npx playwright test tests/dashboard.spec.ts

# Navigation tests
npx playwright test tests/navigation.spec.ts

# Homepage and routing tests
npx playwright test tests/homepage.spec.ts
```

#### Run Tests by Pattern

```bash
# All login-related tests
npx playwright test -g "login"

# All access control tests
npx playwright test -g "access|redirect|unauthorized"

# All reservation tests
npx playwright test -g "reservation|reserve|approve|reject"

# All admin/librarian features
npx playwright test -g "admin|librarian|dashboard"
```

## 📁 Project Structure

```
library-management-system-playwright/
├── frontend/                    # Next.js React application
│   ├── components/              # Reusable React components
│   │   ├── BookCard.tsx         # Book display component
│   │   └── Navigation.tsx       # Navigation menu component
│   ├── pages/                   # Next.js pages
│   │   ├── _app.tsx             # App wrapper
│   │   ├── index.tsx            # Homepage with auth redirect
│   │   ├── login.tsx            # Login page
│   │   ├── books.tsx            # Books catalog page
│   │   ├── add-book.tsx         # Add book page (admin)
│   │   ├── my-reservations.tsx  # User reservations page
│   │   ├── librarian-dashboard.tsx  # Dashboard (librarian/admin)
│   │   └── books/               # Dynamic book routes
│   │       └── [id].tsx         # Individual book details
│   ├── styles/                  # CSS styling
│   │   └── globals.css          # Global styles
│   ├── utils/                   # Utility functions
│   │   └── auth.ts              # Authentication helpers
│   ├── types.ts                 # TypeScript type definitions
│   ├── package.json             # Frontend dependencies
│   ├── tsconfig.json            # TypeScript config
│   ├── next.config.js           # Next.js configuration
│   └── next-env.d.ts            # Next.js type declarations
├── backend/                     # Express.js API server
│   ├── src/                     # Backend source code
│   │   ├── app.ts               # Express app setup
│   │   ├── types.ts             # Type definitions
│   │   ├── routes/              # API route handlers
│   │   │   ├── auth.ts          # Authentication routes
│   │   │   ├── books.ts         # Book management routes
│   │   │   └── reservations.ts # Reservation routes
│   │   └── data/                # JSON data storage
│   │       ├── books.json       # Books database
│   │       └── reservations.json # Reservations database
│   ├── package.json             # Backend dependencies
│   └── tsconfig.json            # TypeScript config
├── tests/                       # Playwright E2E test suite
│   ├── access-control.spec.ts   # Access control tests (10 tests)
│   ├── books.spec.ts            # Book management tests (6 tests)
│   ├── dashboard.spec.ts        # Dashboard tests (7 tests)
│   ├── homepage.spec.ts         # Homepage tests (6 tests)
│   ├── login.spec.ts            # Login tests (6 tests)
│   ├── navigation.spec.ts       # Navigation tests (7 tests)
│   ├── reservations.spec.ts     # Reservation tests (6 tests)
│   └── global-setup.ts          # Test environment setup
├── playwright-report/           # Generated HTML test reports
│   └── index.html               # Test report viewer
├── test-results/                # Test execution artifacts
│   ├── junit.xml                # JUnit format results
│   └── results.json             # JSON format results
├── playwright.config.ts         # Playwright configuration
├── package.json                 # Root project dependencies
├── start.js                     # Node.js server startup script
├── start.sh                     # Shell script for startup
└── README.md                    # Project documentation
```

## 🌐 API Endpoints Reference

### Authentication Endpoints

- `POST /api/login` - User authentication and login

### Book Management Endpoints

- `GET /api/books` - Retrieve all books in the catalog
- `GET /api/books/:id` - Get detailed information for a specific book
- `POST /api/books` - Add a new book (admin/librarian only)
- `POST /api/books/:id/reserve` - Create a reservation for a specific book

### Reservation Management Endpoints

- `GET /api/reservations` - Get all reservations (librarian/admin)
- `GET /api/reservations/user/:email` - Get reservations for a specific user
- `POST /api/reservations` - Create a new book reservation
- `PUT /api/reservations/:id/approve` - Approve a pending reservation (librarian)
- `PUT /api/reservations/:id/reject` - Reject a pending reservation (librarian)
- `PUT /api/reservations/:id/complete` - Mark a reservation as completed (librarian)
- `PUT /api/reservations/:id/return` - Mark a book as returned (librarian)
- `DELETE /api/reservations/:id` - Remove a reservation (librarian)

### System Endpoints

- `GET /health` - Backend health check and status
- `GET /` - API information and available endpoints list

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

✅ **47 Comprehensive Test Cases** across **8 Test Files** covering:

- ✅ **Access Control** (10 tests) - Route protection, role-based access, authentication guards
- ✅ **Book Management** (6 tests) - Browse, search, add books, form validation
- ✅ **Dashboard** (7 tests) - Admin/librarian dashboard, statistics, loading states
- ✅ **Homepage** (6 tests) - Authentication redirects, role-based routing
- ✅ **Login** (6 tests) - Authentication flows, credential validation, logout
- ✅ **Navigation** (7 tests) - Menu links, responsive design, session management
- ✅ **Reservations** (6 tests) - Book reservations, approval workflow, status tracking
- ✅ **Cross-Browser Testing** - Chromium, Firefox, WebKit compatibility
- ✅ **Mobile Testing** - iPhone 14 emulation for responsive design

## ✨ Project Features

### What's Included

✅ **Complete Full-Stack Application**

- ✅ Next.js frontend with TypeScript
- ✅ Express.js backend with TypeScript
- ✅ JSON file-based database (no external DB needed)
- ✅ User authentication with role-based access control
- ✅ Responsive design for all devices

✅ **User Roles & Permissions**

- ✅ **Regular Users**: Browse books, search, make reservations, view reservation history
- ✅ **Librarians**: All user features + approve/reject reservations, mark returns
- ✅ **Admins**: All features + add new books to the system

✅ **Core Functionality**

- ✅ Book catalog with search and filtering
- ✅ Book details page with complete information
- ✅ Reservation system with approval workflow
- ✅ Reservation period selection (1-30 days)
- ✅ Librarian dashboard with statistics
- ✅ User reservation tracking and history
- ✅ Book availability management

✅ **Testing Infrastructure**

- ✅ 47 comprehensive Playwright E2E tests
- ✅ Cross-browser testing (Chromium, Firefox, WebKit)
- ✅ Mobile device testing (iPhone 14)
- ✅ Automated test reporting (HTML, JUnit, JSON)
- ✅ CI/CD ready configuration
- ✅ Test retry mechanisms for reliability

### API Endpoints

The backend provides the following RESTful API endpoints:

#### Authentication

- `POST /api/login` - User authentication

#### Books

- `GET /api/books` - Retrieve all books
- `GET /api/books/:id` - Get specific book details
- `POST /api/books` - Add new book (admin/librarian only)
- `POST /api/books/:id/reserve` - Create reservation for a book

#### Reservations

- `GET /api/reservations` - Get all reservations
- `GET /api/reservations/user/:email` - Get user's reservations
- `POST /api/reservations` - Create new reservation
- `PUT /api/reservations/:id/approve` - Approve pending reservation
- `PUT /api/reservations/:id/reject` - Reject pending reservation
- `PUT /api/reservations/:id/complete` - Mark as completed
- `PUT /api/reservations/:id/return` - Mark book as returned
- `DELETE /api/reservations/:id` - Remove reservation

#### Health Check

- `GET /health` - Backend health check
- `GET /` - API information and endpoint list

### Data Storage

The application uses JSON files for data persistence:

- `backend/src/data/books.json` - Book catalog
- `backend/src/data/reservations.json` - Reservation records

### Browser Compatibility

Tested and working on:

- ✅ Chrome/Chromium (latest)
- ✅ Firefox (latest)
- ✅ Safari/WebKit (latest)
- ✅ Mobile Safari (iOS)
- ✅ Mobile Chrome (Android)

### Test Projects Configuration

The Playwright configuration includes:

- **chromium** - Desktop Chrome testing
- **firefox** - Desktop Firefox testing
- **webkit** - Desktop Safari testing
- **mobile** - iPhone 14 emulation (selected tests)
- **debug** - Debug mode with slow motion

## 📄 License

This project is for educational and demonstration purposes.
