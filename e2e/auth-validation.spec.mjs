import { expect, test } from '@playwright/test';

test.describe('BloodConnect authentication form validation', () => {
  test('1. Login with empty email/password', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Enter your email and password to continue.', { exact: true })).toBeVisible();
  });

  test('2. Signup password mismatch', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-mismatch-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('different-password');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await stateModal.getByLabel('Search state').fill('West Bengal');
    await stateModal.getByRole('button', { name: 'West Bengal', exact: true }).click();

    await page.getByRole('button', { name: 'Select city' }).click();
    const cityModal = page.getByRole('dialog');
    await cityModal.getByLabel('Search city').fill('Kolkata');
    await cityModal.getByRole('button', { name: 'Kolkata', exact: true }).click();

    await page.getByRole('button', { name: 'Blood group O+' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Passwords do not match.', { exact: true })).toBeVisible();
  });

  test('3. Signup short password', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-short-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('12345');
    await page.getByLabel('Confirm password').fill('12345');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await stateModal.getByLabel('Search state').fill('West Bengal');
    await stateModal.getByRole('button', { name: 'West Bengal', exact: true }).click();

    await page.getByRole('button', { name: 'Select city' }).click();
    const cityModal = page.getByRole('dialog');
    await cityModal.getByLabel('Search city').fill('Kolkata');
    await cityModal.getByRole('button', { name: 'Kolkata', exact: true }).click();

    await page.getByRole('button', { name: 'Blood group O+' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Password must be at least 6 characters.', { exact: true })).toBeVisible();
  });

  test('4. Missing full name', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Email').fill('playwright-noname-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('test-password');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await stateModal.getByLabel('Search state').fill('West Bengal');
    await stateModal.getByRole('button', { name: 'West Bengal', exact: true }).click();

    await page.getByRole('button', { name: 'Select city' }).click();
    const cityModal = page.getByRole('dialog');
    await cityModal.getByLabel('Search city').fill('Kolkata');
    await cityModal.getByRole('button', { name: 'Kolkata', exact: true }).click();

    await page.getByRole('button', { name: 'Blood group O+' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Enter your full name.', { exact: true })).toBeVisible();
  });

  test('5. Missing state', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-nostate-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('test-password');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Blood group O+' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Select your state.', { exact: true })).toBeVisible();
  });

  test('6. Missing city', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-nocity-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('test-password');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await stateModal.getByLabel('Search state').fill('West Bengal');
    await stateModal.getByRole('button', { name: 'West Bengal', exact: true }).click();

    await page.getByRole('button', { name: 'Blood group O+' }).click();
    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Select your city.', { exact: true })).toBeVisible();
  });

  test('7. Missing blood group', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-noblood-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('test-password');
    await page.getByLabel('Phone number').fill('9876543210');

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await stateModal.getByLabel('Search state').fill('West Bengal');
    await stateModal.getByRole('button', { name: 'West Bengal', exact: true }).click();

    await page.getByRole('button', { name: 'Select city' }).click();
    const cityModal = page.getByRole('dialog');
    await cityModal.getByLabel('Search city').fill('Kolkata');
    await cityModal.getByRole('button', { name: 'Kolkata', exact: true }).click();

    await page.getByRole('button', { name: 'Create Account' }).click();

    await expect(page.getByText('Select your blood group.', { exact: true })).toBeVisible();
  });

  test('8. Login ↔ Sign Up switching', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    await expect(page.getByText('Welcome back', { exact: true })).toBeVisible();

    await page.getByRole('button', { name: 'Login' }).click();
    await expect(page.getByText('Enter your email and password to continue.', { exact: true })).toBeVisible();

    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByLabel('Phone number')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select state' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select city' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
    await expect(page.getByText('Enter your email and password to continue.', { exact: true })).not.toBeVisible();

    await page.getByRole('tab', { name: 'Login' }).click();

    await expect(page.getByLabel('Full name')).not.toBeVisible();
    await expect(page.getByLabel('Confirm password')).not.toBeVisible();
    await expect(page.getByLabel('Phone number')).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Select state' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Select city' })).not.toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).not.toBeVisible();
    await expect(page.getByText('Enter your email and password to continue.', { exact: true })).not.toBeVisible();
  });
});
