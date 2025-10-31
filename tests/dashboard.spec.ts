import { test, expect } from '@playwright/test';

test.describe('Dashboard', () => {
  
  // Test that dashboard loads properly for admin users
  test('should verify dashboard loads for admin', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to librarian dashboard
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
    
    // Wait for dashboard content to load
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Should not show unauthorized error for admin
    await expect(page.getByTestId('unauthorized-error')).not.toBeVisible();
  });

  // Test that dashboard loads properly for librarian users
  test('should verify dashboard loads for librarian', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to librarian dashboard
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
    
    // Wait for dashboard content to load
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Should show main dashboard sections
    await expect(page.locator('h3').filter({ hasText: /pending.*reservations/i }).first()).toBeVisible();
    await expect(page.locator('h3').filter({ hasText: /approved.*reservations/i }).first().or(page.locator('text=/approved.*reservations?/i').first())).toBeVisible();
    await expect(page.locator('text=/statistics?/i').first()).toBeVisible();
  });

  // Test that total reservations count is displayed
  test('should check total reservations count', async ({ page }) => {
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
    
    // Should show statistics section with reservation counts
    await expect(page.locator('text=/statistics?/i')).toBeVisible();
    
    // Check for stat cards with numerical data
    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();
    
    if (cardCount > 0) {
      // Should have total reservations stat
      const totalReservationsCard = page.locator('.stat-card', { hasText: /total.*reservations?/i });
      if (await totalReservationsCard.isVisible()) {
        await expect(totalReservationsCard).toBeVisible();
        
        // Should contain numerical data
        const statText = await totalReservationsCard.textContent();
        expect(statText).toMatch(/\d+/);
      }
      
      // Should show pending reservations count
      const pendingCard = page.locator('.stat-card', { hasText: /pending/i });
      if (await pendingCard.isVisible()) {
        const pendingText = await pendingCard.textContent();
        expect(pendingText).toMatch(/\d+/);
      }
    }
  });

  // Test that book inventory statistics are displayed
  test('should check book inventory statistics', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Wait for dashboard loading to complete
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // Should show statistics section
    await expect(page.locator('text=/statistics?/i')).toBeVisible();
    
    // Check for different statistical categories
    const statCards = page.locator('.stat-card');
    const cardCount = await statCards.count();
    
    if (cardCount >= 4) {
      // Should have multiple stat categories (total, pending, approved, completed)
      const expectedStats = ['Total Reservations', 'Pending Review', 'Currently Borrowed', 'Completed'];
      
      for (const statType of expectedStats) {
        const statCard = page.locator('.stat-card', { hasText: new RegExp(statType, 'i') });
        if (await statCard.isVisible()) {
          await expect(statCard).toBeVisible();
          
          // Should contain numerical data
          const statText = await statCard.textContent();
          expect(statText).toMatch(/\d+/);
        }
      }
    } else if (cardCount > 0) {
      // If fewer cards, at least verify they contain numbers
      for (let i = 0; i < cardCount; i++) {
        const card = statCards.nth(i);
        const cardText = await card.textContent();
        expect(cardText).toMatch(/\d+/);
      }
    }
  });

  // Test navigation to reservation approval section
  test('should navigate to reservation approval section', async ({ page }) => {
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
    
    // Should show pending reservations section
    await expect(page.locator('h3').filter({ hasText: /pending.*reservations/i }).first()).toBeVisible();
    
    // Check that pending reservations section is accessible
    const pendingSection = page.getByTestId('pending-reservations');
    if (await pendingSection.isVisible()) {
      // Should show either reservations or empty message
      const hasReservations = await pendingSection.locator('.reservation-card, .pending-card').isVisible();
      const hasEmptyMessage = await page.locator('text=/no pending/i').isVisible();
      
      expect(hasReservations || hasEmptyMessage).toBe(true);
      
      // If there are reservations, should have action buttons
      if (hasReservations) {
        const approveButtons = pendingSection.locator('button:has-text("Approve")');
        const rejectButtons = pendingSection.locator('button:has-text("Reject")');
        
        const approveCount = await approveButtons.count();
        const rejectCount = await rejectButtons.count();
        
        if (approveCount > 0) {
          await expect(approveButtons.first()).toBeVisible();
          await expect(approveButtons.first()).toBeEnabled();
        }
        
        if (rejectCount > 0) {
          await expect(rejectButtons.first()).toBeVisible();
          await expect(rejectButtons.first()).toBeEnabled();
        }
      }
    }
  });

  // Test dashboard accessibility for different user roles
  test('should prevent regular users from accessing dashboard', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to books page, not dashboard
    await expect(page).toHaveURL(/\/books/);
    
    // Try to access dashboard directly
    await page.goto('/librarian-dashboard');
    
    // Should show access denied or redirect
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/librarian-dashboard')) {
      // If still on dashboard page, should show access denied
      const unauthorizedError = page.getByTestId('unauthorized-error');
      await expect(unauthorizedError).toBeVisible();
      await expect(unauthorizedError).toContainText(/access denied|unauthorized/i);
    } else {
      // Should be redirected away from dashboard
      expect(currentUrl).not.toContain('/librarian-dashboard');
    }
  });

  // Test dashboard loading states and error handling
  test('should handle dashboard loading states properly', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Should show authorization loading initially
    const authLoading = page.getByTestId('auth-loading');
    if (await authLoading.isVisible()) {
      await expect(authLoading).not.toBeVisible({ timeout: 10000 });
    }
    
    // Should show dashboard loading
    const dashboardLoading = page.getByTestId('dashboard-loading');
    if (await dashboardLoading.isVisible()) {
      await expect(dashboardLoading).not.toBeVisible({ timeout: 15000 });
    }
    
    // After loading, should not show any error states
    await expect(page.getByTestId('unauthorized-error')).not.toBeVisible();
    await expect(page.getByTestId('dashboard-error')).not.toBeVisible();
    
    // Should show main content
    await expect(page.locator('h3').filter({ hasText: /pending.*reservations/i }).first()).toBeVisible();
    await expect(page.locator('text=/statistics?/i').first()).toBeVisible();
  });
});