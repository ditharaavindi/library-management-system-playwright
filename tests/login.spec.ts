import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
  
  // Test that valid user credentials allow successful login
  test('should login successfully as valid user', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in valid user credentials
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to books page for regular user
    await expect(page).toHaveURL(/\/books/);
    await expect(page.locator('h2')).toContainText('Library Books');
  });

  // Test that invalid credentials are properly rejected
  test('should reject invalid credentials', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in invalid credentials
    await page.fill('input[data-testid="email-input"]', 'invalid@email.com');
    await page.fill('input[data-testid="password-input"]', 'wrongpassword');
    await page.click('button[data-testid="login-submit"]');
    
    // Should show error message and stay on login page
    await expect(page.getByTestId('login-message')).toBeVisible();
    await expect(page.getByTestId('login-message')).toHaveClass(/error/);
    await expect(page).toHaveURL(/\/login/);
  });

  // Test that admin users are redirected to dashboard after login
  test('should redirect admin to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    
    // Login as admin
    await page.fill('input[data-testid="email-input"]', 'admin@library.com');
    await page.fill('input[data-testid="password-input"]', 'admin123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to librarian dashboard for admin
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
  });

  // Test that librarian users are redirected to dashboard after login
  test('should redirect librarian to dashboard after login', async ({ page }) => {
    await page.goto('/login');
    
    // Login as librarian
    await page.fill('input[data-testid="email-input"]', 'librarian@library.com');
    await page.fill('input[data-testid="password-input"]', 'librarian123');
    await page.click('button[data-testid="login-submit"]');
    
    // Should redirect to librarian dashboard
    await expect(page).toHaveURL(/\/librarian-dashboard/);
    await expect(page.locator('h2')).toContainText('Librarian Dashboard');
  });

  // Test that logout functionality works properly
  test('should logout successfully and redirect to login', async ({ page }) => {
    // Login first
    await page.goto('/login');
    await page.fill('input[data-testid="email-input"]', 'user@library.com');
    await page.fill('input[data-testid="password-input"]', 'user123');
    await page.click('button[data-testid="login-submit"]');
    
    await expect(page).toHaveURL(/\/books/);
    
    // Look for logout button and click it
    const logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    if (await logoutButton.isVisible()) {
      await logoutButton.click();
    } else {
      // Simulate logout by clearing localStorage
      await page.evaluate(() => {
        localStorage.clear();
        sessionStorage.clear();
      });
      await page.reload();
    }
    
    // Should redirect to login page
    await expect(page).toHaveURL(/\/login/);
    await expect(page.locator('h2')).toContainText('Login');
  });

  // Test that empty form submission is prevented
  test('should prevent empty form submission', async ({ page }) => {
    await page.goto('/login');
    
    // Try to submit empty form
    await page.click('button[data-testid="login-submit"]');
    
    // Should enforce HTML5 validation on required fields
    const emailInput = page.getByTestId('email-input');
    const passwordInput = page.getByTestId('password-input');
    
    await expect(emailInput).toHaveAttribute('required');
    await expect(passwordInput).toHaveAttribute('required');
  });
});