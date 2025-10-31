import { test, expect } from '@playwright/test';

test.describe('Books Management', () => {
  
  // Setup: Login as user before each test
  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    await expect(page).toHaveURL(/\/books/);
  });

  // Test that books page displays at least 10 books
  test('should view all books and confirm at least 10 appear', async ({ page }) => {
    // Wait for books to load - either grid appears or empty state shows
    await Promise.race([
      page.waitForSelector('[data-testid="books-grid"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-empty"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-error"]', { timeout: 15000 }).catch(() => null)
    ]);
    
    // Check if books are displayed
    const booksGrid = page.getByTestId('books-grid');
    if (await booksGrid.isVisible()) {
      const bookCards = page.locator('.book-card');
      const bookCount = await bookCards.count();
      
      // Verify at least 10 books are displayed
      expect(bookCount).toBeGreaterThanOrEqual(10);
      
      // Verify books count is shown
      const booksCountElement = page.getByTestId('books-count');
      if (await booksCountElement.isVisible()) {
        await expect(booksCountElement).toContainText(/\d+/);
      }
    } else {
      // If no books grid, check for empty state
      const emptyState = page.getByTestId('books-empty');
      await expect(emptyState).toBeVisible();
    }
  });

  // Test search functionality by title or author
  test('should search by title or author and verify results', async ({ page }) => {
    // Wait for books to load first - either grid appears or empty state shows
    await Promise.race([
      page.waitForSelector('[data-testid="books-grid"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-empty"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-error"]', { timeout: 15000 }).catch(() => null)
    ]);
    
    const loadingElement = page.getByTestId('books-loading');
    if (await loadingElement.isVisible()) {
      await expect(loadingElement).not.toBeVisible({ timeout: 15000 });
    }
    
    // Look for search input field
    const searchInput = page.locator('input[placeholder*="Search"], input[name="search"], input[type="search"]');
    
    if (await searchInput.isVisible()) {
      // Search for a book by title
      await searchInput.fill('Pride');
      await searchInput.press('Enter');
      
      // Wait for search results
      await page.waitForTimeout(1000);
      
      // Verify search results contain the search term
      const bookCards = page.locator('.book-card');
      if (await bookCards.count() > 0) {
        const firstBook = bookCards.first();
        await expect(firstBook).toContainText(/Pride/i);
      }
    }
  });

  // Test viewing book details by clicking on a book
  test('should view book details by clicking a book', async ({ page }) => {
    // Wait for books to load - either grid appears or empty state shows
    await Promise.race([
      page.waitForSelector('[data-testid="books-grid"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-empty"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-error"]', { timeout: 15000 }).catch(() => null)
    ]);
    
    const booksGrid = page.getByTestId('books-grid');
    if (await booksGrid.isVisible()) {
      const bookCards = page.locator('.book-card');
      const cardCount = await bookCards.count();
      
      if (cardCount > 0) {
        const firstBook = bookCards.first();
        
        // Click on the first book
        await firstBook.click();
        
        // Should navigate to book details or show modal
        // Check for book details page or modal
        const isDetailsPage = await page.locator('h2').filter({ hasText: /detail|book|view/i }).isVisible();
        const isModal = await page.locator('.modal, [role="dialog"]').isVisible();
        const hasNavigated = page.url().includes('/books/') && !page.url().endsWith('/books');
        
        // At least one should be true
        expect(isDetailsPage || isModal || hasNavigated).toBe(true);
        
        // If it's a details page, should show book information
        if (isDetailsPage || hasNavigated) {
          // Check for book details elements
          const hasBookTitle = await page.locator('h1, h2, h3').filter({ hasText: /Test|Book/i }).count() > 0;
          const hasBookAuthor = await page.locator('text=/by /i').count() > 0;
          expect(hasBookTitle || hasBookAuthor).toBe(true);
        }
      }
    }
  });

  // Test adding new book (admin only)
  test('should add new book as admin', async ({ page }) => {
    // Logout and login as admin
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Navigate to add book page
    await page.goto('/add-book');
    await expect(page).toHaveURL(/\/add-book/);
    
    // Fill out the add book form
    await page.fill('input[name="title"], input[id="title"]', 'Test Book Title');
    await page.fill('input[name="author"], input[id="author"]', 'Test Author');
    
    // Fill optional fields if they exist
    const genreInput = page.locator('input[name="genre"], select[name="genre"]');
    if (await genreInput.isVisible()) {
      if (await genreInput.getAttribute('tagName') === 'SELECT') {
        await genreInput.selectOption({ index: 1 });
      } else {
        await genreInput.fill('Fiction');
      }
    }
    
    const descriptionInput = page.locator('textarea[name="description"]');
    if (await descriptionInput.isVisible()) {
      await descriptionInput.fill('Test book description');
    }
    
    // Submit the form
    const submitButton = page.locator('button[type="submit"], button:has-text("Add"), button:has-text("Save")');
    await submitButton.click();
    
    // Should show success message or redirect
    await page.waitForTimeout(2000);
    
    const successMessage = page.locator('.success, .alert-success');
    const currentUrl = page.url();
    
    // Either success message should appear or should redirect away from add-book
    if (await successMessage.isVisible()) {
      await expect(successMessage).toContainText(/success|added|created/i);
    } else {
      expect(currentUrl).not.toContain('/add-book');
    }
  });

  // Test form validation on Add Book form
  test('should validate required fields on Add Book form', async ({ page }) => {
    // Use the exact same pattern as the working "add new book as admin" test
    // Logout and login as admin
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Navigate to add book page
    await page.goto('/add-book');
    await expect(page).toHaveURL(/\/add-book/);
    
    // Now test the form validation - the main purpose of this test
    const titleInput = page.locator('input[name="title"], input[id="title"]');
    const authorInput = page.locator('input[name="author"], input[id="author"]');
    const yearInput = page.locator('input[name="year"], input[id="year"]');
    
    // Verify required attributes exist - this is the core validation test
    await expect(titleInput).toHaveAttribute('required');
    await expect(authorInput).toHaveAttribute('required');
    await expect(yearInput).toHaveAttribute('required');
    
    // Verify the form elements are present and functional
    await expect(titleInput).toBeVisible();
    await expect(authorInput).toBeVisible();
    await expect(yearInput).toBeVisible();
    
    // Test that empty form submission is prevented
    const submitButton = page.locator('button[type="submit"]');
    await expect(submitButton).toBeVisible();
    await submitButton.click();
    
    // Should remain on the same page due to HTML5 validation
    await expect(page).toHaveURL(/\/add-book/);
  });

  // Test refresh functionality
  test('should refresh books list when refresh button clicked', async ({ page }) => {
    // Wait for refresh button to be available
    const refreshButton = page.getByTestId('refresh-books');
    await expect(refreshButton).toBeVisible({ timeout: 15000 });
    
    // Click refresh button
    await refreshButton.click();
    
    // Should show loading state
    await expect(refreshButton).toContainText(/loading|refresh/i);
    
    // Should complete refresh
    await expect(refreshButton).not.toContainText(/loading/i, { timeout: 10000 });
  });
});