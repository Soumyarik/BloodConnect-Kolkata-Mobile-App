import { expect, test } from '@playwright/test';

test.describe('BloodConnect public web smoke tests', () => {
  test('home/login screen loads without visible errors', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByText('BloodConnect', { exact: true }).first()).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Sign Up' })).toBeVisible();
  });

  test('signup exposes all required profile fields', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await expect(page.getByLabel('Full name')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Confirm password')).toBeVisible();
    await expect(page.getByLabel('Phone number')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select state' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Select city' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Blood group O+' })).toBeVisible();
    await expect(page.getByLabel('Available to donate blood')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Create Account' })).toBeVisible();
  });

  test('state and city selectors work', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByRole('button', { name: 'Select state' }).click();
    const stateModal = page.getByRole('dialog');
    await expect(stateModal.getByText('Select State / UT', { exact: true })).toBeVisible();

    await stateModal.getByLabel('Search state').fill('West Bengal');
    const wbOption = stateModal.getByRole('button', { name: 'West Bengal', exact: true });
    await expect(wbOption).toBeVisible();
    await wbOption.click();

    await page.getByRole('button', { name: 'Select city' }).click();
    const cityModal = page.getByRole('dialog');
    await expect(cityModal.getByText('Select City', { exact: true })).toBeVisible();

    await cityModal.getByLabel('Search city').fill('Kolkata');
    await expect(cityModal.getByRole('button', { name: 'Kolkata', exact: true })).toBeVisible();
  });

  test('signup validates required phone before account creation', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    await page.getByLabel('Full name').fill('Playwright Test User');
    await page.getByLabel('Email').fill('playwright-invalid-test@example.com');
    await page.getByLabel('Password', { exact: true }).fill('test-password');
    await page.getByLabel('Confirm password').fill('test-password');

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

    await expect(page.getByText('Enter a valid 10-digit Indian mobile number.', { exact: true })).toBeVisible();
  });

  test('donor availability switch toggles', async ({ page }) => {
    await page.goto('/');
    await page.getByRole('tab', { name: 'Sign Up' }).click();

    const donorSwitch = page.getByLabel('Available to donate blood');
    await expect(donorSwitch).toBeVisible();
    await expect(donorSwitch).not.toBeChecked();
    await donorSwitch.click();
    await expect(donorSwitch).toBeChecked();
  });
});
