import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vllsahxfqcsxlrbqumlt.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_RiARyODw1D1hKkIUjhEJhw_g6Hx31vy';
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.test.runner@bloodconnect.test';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'Password123!';

const BASE_PROFILE = {
  full_name: 'Test E2E User',
  phone: '9876543210',
  blood_group: 'O+',
  state: 'West Bengal',
  city: 'Kolkata',
  area: null,
  date_of_birth: null,
  gender: null,
  donor_available: true,
  is_test_account: true,
};

async function resetTestProfile() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (authError || !auth?.user) {
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
      options: {
        data: {
          full_name: BASE_PROFILE.full_name,
          phone: BASE_PROFILE.phone,
          blood_group: BASE_PROFILE.blood_group,
          state: BASE_PROFILE.state,
          city: BASE_PROFILE.city,
          donor_available: true,
        },
      },
    });
    if (signUpError && !signUpError.message.includes('already registered')) {
      console.warn('Unable to create test user:', signUpError.message);
      return;
    }
    const userId = signUpData?.user?.id;
    if (userId) {
      await supabase.from('profiles').upsert({ id: userId, ...BASE_PROFILE });
    }
    return;
  }

  const userId = auth.user.id;
  await supabase.from('profiles').update(BASE_PROFILE).eq('id', userId);
  await supabase.from('emergency_contacts').delete().eq('user_id', userId);
}

async function loginAsTestUser(page) {
  await page.goto('/');

  const profileTab = page.getByLabel('Profile', { exact: true });
  const loginTab = page.getByRole('tab', { name: 'Login' });

  // Wait until either authenticated screen or login screen appears
  await expect(profileTab.or(loginTab)).toBeVisible({ timeout: 15000 });

  if (await profileTab.isVisible()) {
    return;
  }

  await loginTab.click();
  await page.getByLabel('Email').fill(TEST_EMAIL);
  await page.getByLabel('Password', { exact: true }).fill(TEST_PASSWORD);
  await page.getByRole('button', { name: 'Login', exact: true }).click();

  await expect(profileTab).toBeVisible({ timeout: 15000 });
}

async function openProfile(page) {
  await loginAsTestUser(page);
  const profileTab = page.getByLabel('Profile', { exact: true });
  await expect(profileTab).toBeVisible({ timeout: 15000 });
  await profileTab.click();
  await expect(page.getByText('Donor Availability', { exact: true })).toBeVisible({ timeout: 15000 });
}

async function clickButton(page, roleName, fallbackText) {
  const roleBtn = page.getByRole('button', { name: roleName });
  if (await roleBtn.count() > 0) {
    await roleBtn.first().scrollIntoViewIfNeeded();
    await roleBtn.first().click();
  } else {
    const textLocator = page.getByText(fallbackText || roleName, { exact: true });
    await textLocator.first().scrollIntoViewIfNeeded();
    await textLocator.first().click();
  }
}

async function openEmergencyContactModal(page) {
  const editBtn = page.getByRole('button', { name: 'Edit Emergency Contact' });
  const addBtn = page.getByRole('button', { name: 'Add Emergency Contact' });
  if (await editBtn.count() > 0) {
    await editBtn.first().scrollIntoViewIfNeeded();
    await editBtn.first().click();
  } else if (await addBtn.count() > 0) {
    await addBtn.first().scrollIntoViewIfNeeded();
    await addBtn.first().click();
  } else {
    const textBtn = page.getByText(/Add Emergency Contact|Edit Emergency Contact/);
    await textBtn.first().scrollIntoViewIfNeeded();
    await textBtn.first().click();
  }
}

async function confirmLogout(page) {
  const confirmBtn = page.getByRole('button', { name: 'Confirm Log Out' });
  if (await confirmBtn.count() > 0) {
    await confirmBtn.first().click();
  } else {
    const modalConfirm = page.getByText('Are you sure you want to log out?')
      .locator('xpath=ancestor::*[contains(@class, "r-")][last()]')
      .getByText('Log Out', { exact: true });
    await modalConfirm.last().click();
  }
}

async function closeEditProfileModal(page) {
  const cancelBtn = page.getByRole('button', { name: 'Cancel Edit Profile' });
  if (await cancelBtn.count() > 0) {
    await cancelBtn.first().click();
  } else {
    await page.locator('div:has-text("Edit Profile")').getByText('Cancel', { exact: true }).last().click();
  }
}

async function closeEmergencyContactModal(page) {
  const cancelBtn = page.getByRole('button', { name: 'Cancel Emergency Contact' });
  if (await cancelBtn.count() > 0) {
    await cancelBtn.first().click();
  } else {
    await page.locator('div:has-text("Emergency Contact")').getByText('Cancel', { exact: true }).last().click();
  }
}

test.describe('BloodConnect authenticated Profile E2E tests', () => {
  test.beforeAll(async () => {
    await resetTestProfile();
  });

  test.afterAll(async () => {
    await resetTestProfile();
  });

  test('1. Profile page opens and displays key user information', async ({ page }) => {
    await openProfile(page);

    await expect(page.getByText('Test E2E User', { exact: true })).toBeVisible();
    await expect(page.getByText('Kolkata, West Bengal', { exact: false })).toBeVisible();
    await expect(page.getByText('O+', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('Available to Donate', { exact: true })).toBeVisible();

    await expect(page.getByText('Donor Availability', { exact: true })).toBeVisible();
    await expect(page.getByText('Blood Information', { exact: true })).toBeVisible();
    await expect(page.getByText('Emergency Contact', { exact: true })).toBeVisible();
    await expect(page.getByText('Donation History', { exact: true })).toBeVisible();
  });

  test('2. Edit Profile opens with all editable fields present', async ({ page }) => {
    await openProfile(page);

    await clickButton(page, 'Edit Profile');

    await expect(page.getByText('Edit Profile', { exact: true }).first()).toBeVisible();
    await expect(page.getByPlaceholder('Your name')).toBeVisible();
    await expect(page.getByPlaceholder('Your phone number')).toBeVisible();
    await expect(page.getByPlaceholder('City')).toBeVisible();
    await expect(page.getByPlaceholder('Area or locality')).toBeVisible();
    await expect(page.getByPlaceholder('YYYY-MM-DD')).toBeVisible();
    await expect(page.getByPlaceholder('Gender')).toBeVisible();

    await closeEditProfileModal(page);
  });

  test('3. Profile field editing updates displayed values', async ({ page }) => {
    await openProfile(page);

    await clickButton(page, 'Edit Profile');

    await page.getByPlaceholder('Your name').fill('Updated Test User');
    await page.getByPlaceholder('Your phone number').fill('9876543211');
    await page.getByPlaceholder('City').fill('Howrah');
    await page.getByPlaceholder('Area or locality').fill('Shibpur');
    await page.getByPlaceholder('YYYY-MM-DD').fill('1995-05-15');
    await page.getByPlaceholder('Gender').fill('Male');

    await clickButton(page, 'Blood group B+', 'B+');
    await clickButton(page, 'Save Changes');

    await expect(page.getByText('Updated Test User', { exact: true })).toBeVisible();
    await expect(page.getByText('Howrah, West Bengal, Shibpur', { exact: false })).toBeVisible();
    await expect(page.getByText('B+', { exact: true }).first()).toBeVisible();
    await expect(page.getByText('1995-05-15', { exact: true })).toBeVisible();
    await expect(page.getByText('Male', { exact: true })).toBeVisible();
  });

  test('4. Profile persistence maintains saved values across reload', async ({ page }) => {
    await openProfile(page);

    await clickButton(page, 'Edit Profile');

    await page.getByPlaceholder('Area or locality').fill('Salt Lake Sector V');
    await clickButton(page, 'Save Changes');

    await expect(page.getByText('Howrah, West Bengal, Salt Lake Sector V', { exact: true })).toBeVisible();

    await page.reload();
    await openProfile(page);

    await expect(page.getByText('Howrah, West Bengal, Salt Lake Sector V', { exact: true })).toBeVisible();
  });

  test('5. Donor availability switch toggles and persists state', async ({ page }) => {
    await openProfile(page);

    const donorSwitch = page.getByRole('switch');
    await expect(donorSwitch).toBeVisible();

    const initialChecked = await donorSwitch.isChecked();

    const updateResponse = page.waitForResponse(
      (resp) => resp.url().includes('/rest/v1/profiles') && resp.request().method() === 'PATCH'
    );
    await donorSwitch.click();
    await updateResponse;

    if (initialChecked) {
      await expect(donorSwitch).not.toBeChecked();
      await expect(page.getByText('Currently Unavailable', { exact: true })).toBeVisible();
    } else {
      await expect(donorSwitch).toBeChecked();
      await expect(page.getByText('Available to Donate', { exact: true })).toBeVisible();
    }

    await page.reload();
    await openProfile(page);

    const reloadedSwitch = page.getByRole('switch');
    if (initialChecked) {
      await expect(reloadedSwitch).not.toBeChecked();
      await expect(page.getByText('Currently Unavailable', { exact: true })).toBeVisible();
      // Restore back to available
      const restoreResponse = page.waitForResponse(
        (resp) => resp.url().includes('/rest/v1/profiles') && resp.request().method() === 'PATCH'
      );
      await reloadedSwitch.click();
      await restoreResponse;
      await expect(reloadedSwitch).toBeChecked();
    } else {
      await expect(reloadedSwitch).toBeChecked();
      await expect(page.getByText('Available to Donate', { exact: true })).toBeVisible();
    }
  });

  test('6. Emergency contact can be added and displayed', async ({ page }) => {
    await openProfile(page);
    await openEmergencyContactModal(page);

    await expect(page.getByText('Emergency Contact', { exact: true }).first()).toBeVisible();
    await page.getByPlaceholder('Contact name').fill('Jane Doe');
    await page.getByPlaceholder('Contact phone number').fill('9876543210');
    await page.getByPlaceholder('For example, sibling').fill('Sister');

    await clickButton(page, 'Save Contact');

    await expect(page.getByText('Jane Doe', { exact: true })).toBeVisible();
    await expect(page.getByText('Sister • 9876543210', { exact: true })).toBeVisible();
  });

  test('7. Donation history modal opens and handles records safely', async ({ page }) => {
    await openProfile(page);

    const dialogPromise = page.waitForEvent('dialog').then(async (dialog) => {
      const msg = dialog.message();
      await dialog.accept();
      return msg;
    });

    await clickButton(page, 'View Full History');
    const msg = await dialogPromise;

    expect(msg).toContain('Donation History');
  });

  test('8. Profile validation handles missing emergency contact fields', async ({ page }) => {
    await openProfile(page);
    await openEmergencyContactModal(page);

    await expect(page.getByText('Emergency Contact', { exact: true }).first()).toBeVisible();

    await page.getByPlaceholder('Contact name').fill('');
    await page.getByPlaceholder('Contact phone number').fill('');
    await page.getByPlaceholder('For example, sibling').fill('');

    const dialogPromise = page.waitForEvent('dialog').then(async (dialog) => {
      const msg = dialog.message();
      await dialog.accept();
      return msg;
    });

    await clickButton(page, 'Save Contact');
    const msg = await dialogPromise;

    expect(msg).toContain('Missing details');
    expect(msg).toContain('Please complete all emergency contact fields.');

    await closeEmergencyContactModal(page);
  });

  test('9. Logout returns user to authentication screen and clears protected profile', async ({ page }) => {
    await openProfile(page);

    await clickButton(page, 'Log Out');

    await expect(page.getByText('Are you sure you want to log out?', { exact: true })).toBeVisible();

    await confirmLogout(page);

    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByText('Welcome back', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Profile', { exact: true })).not.toBeVisible();
  });

  test('10. Session persistence restores session across reload, and logout clears session', async ({ page }) => {
    await loginAsTestUser(page);

    await page.reload();

    const profileTab = page.getByLabel('Profile', { exact: true });
    await expect(profileTab).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('tab', { name: 'Login' })).not.toBeVisible();

    await profileTab.click();
    await expect(page.getByText('Donor Availability', { exact: true })).toBeVisible({ timeout: 15000 });

    await clickButton(page, 'Log Out');
    await confirmLogout(page);

    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible({ timeout: 15000 });

    // Verify session remains cleared across page reload
    await page.reload();
    await expect(page.getByRole('tab', { name: 'Login' })).toBeVisible({ timeout: 15000 });
    await expect(page.getByLabel('Profile', { exact: true })).not.toBeVisible();
  });
});
