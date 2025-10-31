import { test, expect } from '@playwright/test';

test.describe('Access Control', () => {
  
  // Test that accessing /books without login redirects to login page
  test('should redirect to login when accessing /books without authentication', async ({ page }) => {
    // Try to access books page without logging in
    await page.goto('/books');
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Login');
  });

  // Test that accessing /add-book as regular user is denied
  test('should deny access to /add-book for regular users', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Try to access add-book page directly
    await page.goto('/add-book');
    
    // Should either redirect or show access denied
    await page.waitForTimeout(2000);
    const currentUrl = page.url();
    
    if (currentUrl.includes('/add-book')) {
      // If still on add-book page, should show access denied
      const accessDenied = page.locator('text=/access denied|unauthorized|permission/i');
      await expect(accessDenied).toBeVisible();
    } else {
      // Should be redirected away from add-book page
      expect(currentUrl).not.toContain('/add-book');
      // Most likely redirected to login or books page
      expect(currentUrl).toMatch(/\/login|\/books/);
    }
  });

  // Test that regular users can only access permitted pages
  test('should ensure regular users only see permitted pages', async ({ page }) => {
    // Login as regular user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // User should be able to access books page
    await page.goto('/books');
    await expect(page).toHaveURL(/\/books/);
    await expect(page.locator('h2')).toContainText('Library Books');
    
    // User should be able to access my reservations
    await page.goto('/my-reservations');
    await expect(page).toHaveURL(/\/my-reservations/);
    await expect(page.locator('h2').filter({ hasText: /reservations/i }).first()).toBeVisible();
    
    // User should NOT be able to access librarian dashboard
    await page.goto('/librarian-dashboard');
    await page.waitForTimeout(2000);
    
    const currentUrl = page.url();
    if (currentUrl.includes('/librarian-dashboard')) {
      // If still on dashboard, should show access denied
      const accessDenied = page.locator('text=/access denied|unauthorized|permission/i');
      await expect(accessDenied).toBeVisible();
    } else {
      // Should be redirected away
      expect(currentUrl).not.toContain('/librarian-dashboard');
    }
  });

  // Test that librarians can access their permitted pages
  test('should ensure librarians can access their permitted pages', async ({ page }) => {
    // Login as librarian
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Librarian should be able to access dashboard
    await page.goto('/librarian-dashboard');
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
    
    // Librarian should be able to access add-book page
    await page.goto('/add-book');
    await expect(page).toHaveURL(/\/add-book/);
    await expect(page.locator('h2').filter({ hasText: /add.*book/i }).first()).toBeVisible();
    
    // Librarian should be able to access books page
    await page.goto('/books');
    await expect(page).toHaveURL(/\/books/);
    await expect(page.locator('h2')).toContainText('Library Books');
    
    // Librarian should be able to access reservations (if implemented)
    await page.goto('/my-reservations');
    await expect(page).toHaveURL(/\/my-reservations/);
  });

  // Test that admin users can access all pages
  test('should ensure admin users can access all permitted pages', async ({ page }) => {
    // Login as admin
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    // Admin should be able to access dashboard
    await page.goto('/librarian-dashboard');
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
    
    // Admin should be able to access add-book page
    await page.goto('/add-book');
    await expect(page).toHaveURL(/\/add-book/);
    await expect(page.locator('h2').filter({ hasText: /add.*book/i }).first()).toBeVisible();
    
    // Admin should be able to access books page
    await page.goto('/books');
    await expect(page).toHaveURL(/\/books/);
    await expect(page.locator('h2')).toContainText('Library Books');
    
    // Admin should be able to access all reservation management features
    await page.goto('/my-reservations');
    await expect(page).toHaveURL(/\/my-reservations/);
  });

  // Test that unauthenticated users are redirected from all protected routes
  test('should redirect unauthenticated users from all protected routes', async ({ page }) => {
    const protectedRoutes = [
      '/books',
      '/add-book',
      '/librarian-dashboard',
      '/my-reservations'
    ];
    
    for (const route of protectedRoutes) {
      // Try to access each protected route without authentication
      await page.goto(route);
      
      // Should redirect to login page
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
      await expect(page.locator('h2')).toContainText('Login');
    }
  });

  // Test role-based access control enforcement
  test('should enforce role-based access control consistently', async ({ page }) => {
    // Test user role restrictions
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Store user role in context
    const userRole = await page.evaluate(() => localStorage.getItem('userRole'));
    expect(userRole).toBe('user');
    
    // User should not be able to access admin functions
    await page.goto('/add-book');
    await page.waitForTimeout(2000);
    
    if (page.url().includes('/add-book')) {
      const accessDenied = page.locator('text=/access denied|unauthorized|permission/i');
      await expect(accessDenied).toBeVisible();
    } else {
      expect(page.url()).not.toContain('/add-book');
    }
    
    // Logout and test librarian role
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
    
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    
    const librarianRole = await page.evaluate(() => localStorage.getItem('userRole'));
    expect(librarianRole).toBe('librarian');
    
    // Librarian should be able to access admin functions
    await page.goto('/add-book');
    await expect(page).toHaveURL(/\/add-book/);
  });

  // Test session persistence and access control
  test('should maintain access control after page refresh', async ({ page }) => {
    // Login as user
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Refresh the page
    await page.reload();
    
    // Should still maintain session and access control
    const currentUrl = page.url();
    
    if (currentUrl.includes('/books')) {
      // If still on books page, session persisted
      await expect(page.locator('h2')).toContainText('Library Books');
      
      // Try to access restricted page - should still be blocked
      await page.goto('/add-book');
      await page.waitForTimeout(2000);
      
      if (page.url().includes('/add-book')) {
        const accessDenied = page.locator('text=/access denied|unauthorized|permission/i');
        await expect(accessDenied).toBeVisible();
      } else {
        expect(page.url()).not.toContain('/add-book');
      }
    } else if (currentUrl.includes('/login')) {
      // Session didn't persist, but access control still works
      await expect(page.locator('h2')).toContainText('Login');
      
      // Should not be able to access protected routes
      await page.goto('/books');
      await expect(page).toHaveURL(/\/login/);
    }
  });

  // Test direct URL access attempts
  test('should handle direct URL access attempts properly', async ({ page }) => {
    const restrictedPaths = [
      '/librarian-dashboard',
      '/add-book'
    ];
    
    // Without authentication, all should redirect to login
    for (const path of restrictedPaths) {
      await page.goto(path);
      await expect(page).toHaveURL(/\/login/, { timeout: 10000 });
    }
    
    // With user authentication, admin paths should be blocked
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    for (const path of restrictedPaths) {
      await page.goto(path);
      await page.waitForTimeout(2000);
      
      if (page.url().includes(path)) {
        // Should show access denied
        const accessDenied = page.locator('text=/access denied|unauthorized|permission/i');
        await expect(accessDenied).toBeVisible();
      } else {
        // Should be redirected away
        expect(page.url()).not.toContain(path);
      }
    }
  });
});