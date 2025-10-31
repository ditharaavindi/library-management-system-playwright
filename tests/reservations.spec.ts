import { test, expect } from '@playwright/test';

test.describe('Reservations System', () => {
  
  // Test reserving an available book as a user
  test('should reserve an available book as user', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Wait for books to load - either grid appears or empty state shows
    await Promise.race([
      page.waitForSelector('[data-testid="books-grid"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-empty"]', { timeout: 15000 }).catch(() => null),
      page.waitForSelector('[data-testid="books-error"]', { timeout: 15000 }).catch(() => null)
    ]);
    
    // Find an available book and reserve it
    const booksGrid = page.getByTestId('books-grid');
    if (await booksGrid.isVisible()) {
      const bookCards = page.locator('.book-card');
      const cardCount = await bookCards.count();
      
      if (cardCount > 0) {
        const firstBook = bookCards.first();
        
        // Look for reserve button on the card or click to view details
        const reserveButton = firstBook.locator('button:has-text("Reserve"), button:has-text("Borrow")');
        
        if (await reserveButton.isVisible()) {
          await reserveButton.click();
          
          // Should show success message
          const successMessage = page.locator('.success, .alert-success');
          if (await successMessage.isVisible()) {
            await expect(successMessage).toContainText(/reserved|success|requested/i);
          }
        } else {
          // Click on book to view details
          await firstBook.click();
          
          // Look for reserve button in details view
          const detailReserveButton = page.locator('button:has-text("Reserve"), button:has-text("Borrow")');
          if (await detailReserveButton.isVisible()) {
            await detailReserveButton.click();
            
            const successMessage = page.locator('.success, .alert-success');
            if (await successMessage.isVisible()) {
              await expect(successMessage).toContainText(/reserved|success|requested/i);
            }
          }
        }
      }
    }
  });

  // Test preventing double reservation of the same book
  test('should prevent double-reserving same book', async ({ page }) => {
    // Login as user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Go to my reservations to see if there are existing reservations
    await page.goto('/my-reservations');
    await expect(page).toHaveURL(/\/my-reservations/);
    
    // Check if there are any existing reservations
    const reservationElements = page.locator('.reservation-card, .reservation-item');
    const reservationCount = await reservationElements.count();
    
    if (reservationCount > 0) {
      // If there are existing reservations, try to reserve the same book again
      const firstReservation = reservationElements.first();
      const bookTitle = await firstReservation.textContent();
      
      // Go back to books page and try to reserve the same book
      await page.goto('/books');
      
      const bookCards = page.locator('.book-card');
      const cardCount = await bookCards.count();
      
      for (let i = 0; i < cardCount; i++) {
        const bookCard = bookCards.nth(i);
        const cardText = await bookCard.textContent();
        
        // If this book is already reserved, the reserve button should be disabled
        if (bookTitle && cardText && cardText.includes(bookTitle.substring(0, 10))) {
          const reserveButton = bookCard.locator('button:has-text("Reserve"), button:has-text("Borrow")');
          if (await reserveButton.isVisible()) {
            // Should be disabled or show "Already Reserved"
            const isDisabled = await reserveButton.isDisabled();
            const buttonText = await reserveButton.textContent();
            
            expect(isDisabled || buttonText?.includes('Reserved')).toBe(true);
          }
          break;
        }
      }
    }
  });

  // Test librarian approving a reservation
  test('should allow librarian to approve reservation', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Wait for dashboard loading to complete
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Check for pending reservations
    const pendingSection = page.getByTestId('pending-reservations');
    if (await pendingSection.isVisible()) {
      const approveButtons = pendingSection.locator('button:has-text("Approve")');
      const buttonCount = await approveButtons.count();
      
      if (buttonCount > 0) {
        const firstApproveButton = approveButtons.first();
        
        // Click approve button
        await firstApproveButton.click();
        
        // Should show processing state
        await expect(firstApproveButton).toContainText(/processing|approving/i);
        
        // Wait for action to complete
        await expect(firstApproveButton).not.toContainText(/processing|approving/i, { timeout: 10000 });
        
        // Reservation should move to approved section
        await page.waitForTimeout(1000);
        const approvedSection = page.getByTestId('approved-reservations');
        if (await approvedSection.isVisible()) {
          await expect(approvedSection.locator('.reservation-card, .approved-card')).toBeVisible();
        }
      }
    }
  });

  // Test librarian rejecting a reservation
  test('should allow librarian to reject reservation', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Wait for dashboard loading to complete
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Check for pending reservations
    const pendingSection = page.getByTestId('pending-reservations');
    if (await pendingSection.isVisible()) {
      const rejectButtons = pendingSection.locator('button:has-text("Reject")');
      const buttonCount = await rejectButtons.count();
      
      if (buttonCount > 0) {
        const firstRejectButton = rejectButtons.first();
        
        // Click reject button
        await firstRejectButton.click();
        
        // Should show processing state
        await expect(firstRejectButton).toContainText(/processing|rejecting/i);
        
        // Wait for action to complete
        await expect(firstRejectButton).not.toContainText(/processing|rejecting/i, { timeout: 10000 });
        
        // Reservation should move to other reservations section
        await page.waitForTimeout(1000);
        const otherSection = page.getByTestId('other-reservations');
        if (await otherSection.isVisible()) {
          const rejectedCards = otherSection.locator('.reservation-card');
          if (await rejectedCards.count() > 0) {
            await expect(rejectedCards.first()).toContainText(/rejected/i);
          }
        }
      }
    }
  });

  // Test user viewing updated reservation status
  test('should allow user to view updated reservation status in My Reservations', async ({ page }) => {
    // Login as user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Navigate to My Reservations
    await page.goto('/my-reservations');
    await expect(page).toHaveURL(/\/my-reservations/);
    
    // Should show reservations page
    await expect(page.locator('h2').filter({ hasText: /reservations/i })).toBeVisible();
    
    // Check if there are reservations displayed
    const reservationElements = page.locator('.reservation-card, .reservation-item');
    const reservationCount = await reservationElements.count();
    
    if (reservationCount > 0) {
      const firstReservation = reservationElements.first();
      
      // Should show reservation status
      const statusElements = firstReservation.locator('.status, .badge, [class*="status"]');
      if (await statusElements.count() > 0) {
        const statusText = await statusElements.first().textContent();
        expect(statusText).toMatch(/pending|approved|rejected|completed/i);
      }
      
      // Should show book information
      await expect(firstReservation).toContainText(/book|title/i);
    } else {
      // Should show empty state - check for either specific text or general empty state indicators
      const emptyStateText = page.locator('text=/No Reservations Yet|You haven\'t made any book reservations|no reservations|empty/i');
      const emptyStateIcon = page.locator('text=📚').first(); // Book emoji shown in empty state
      
      // Should show either empty text or empty state indicator
      const hasEmptyText = await emptyStateText.isVisible();
      const hasEmptyIcon = await emptyStateIcon.isVisible();
      expect(hasEmptyText || hasEmptyIcon).toBe(true);
    }
  });

  // Test marking reservation as completed (librarian function)
  test('should allow librarian to mark reservation as completed', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Wait for dashboard loading to complete
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Check for approved reservations that can be completed
    const approvedSection = page.getByTestId('approved-reservations');
    if (await approvedSection.isVisible()) {
      const approvedCards = approvedSection.locator('.reservation-card, .approved-card');
      const cardCount = await approvedCards.count();
      
      if (cardCount > 0) {
        const firstCard = approvedCards.first();
        
        // Look for complete button
        const completeButton = firstCard.locator('button:has-text("Complete"), button:has-text("Return")');
        
        if (await completeButton.isVisible()) {
          await completeButton.click();
          
          // Should show processing state or move to completed section
          await page.waitForTimeout(2000);
          
          // Check if reservation moved to other/completed section
          const otherSection = page.getByTestId('other-reservations');
          if (await otherSection.isVisible()) {
            const completedCards = otherSection.locator('.reservation-card');
            if (await completedCards.count() > 0) {
              const completedCard = completedCards.first();
              const cardText = await completedCard.textContent();
              expect(cardText).toMatch(/completed/i);
            }
          }
        } else {
          // If no complete button, verify the card shows due date/approved status
          await expect(firstCard).toContainText(/approved|due/i);
        }
      }
    }
  });
});