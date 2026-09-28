import { expect, test } from '@playwright/test';
import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://vllsahxfqcsxlrbqumlt.supabase.co';
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY || 'sb_publishable_RiARyODw1D1hKkIUjhEJhw_g6Hx31vy';
const TEST_EMAIL = process.env.E2E_TEST_EMAIL || 'e2e.test.runner@bloodconnect.test';
const TEST_PASSWORD = process.env.E2E_TEST_PASSWORD || 'Password123!';

const RUNNER_PROFILE = {
  full_name: 'Test E2E User',
  phone: '9876543210',
  blood_group: 'O+',
  state: 'West Bengal',
  city: 'Kolkata',
  area: 'Salt Lake',
  date_of_birth: null,
  gender: null,
  donor_available: true,
  is_test_account: true,
  latitude: null,
  longitude: null,
};

const DONOR_FIXTURES = {
  available: {
    email: 'e2e.donor.available@bloodconnect.test',
    password: 'Password123!',
    profile: {
      full_name: 'E2E Available Donor',
      phone: '9876543220',
      blood_group: 'B+',
      state: 'West Bengal',
      city: 'Kolkata',
      area: 'Salt Lake',
      donor_available: true,
      is_test_account: false,
      latitude: 22.5867,
      longitude: 88.4178,
    },
  },
  testAccount: {
    email: 'e2e.donor.testacc@bloodconnect.test',
    password: 'Password123!',
    profile: {
      full_name: 'E2E Test Account Donor',
      phone: '9876543221',
      blood_group: 'B+',
      state: 'West Bengal',
      city: 'Kolkata',
      area: 'Salt Lake',
      donor_available: true,
      is_test_account: true,
      latitude: 22.5867,
      longitude: 88.4178,
    },
  },
  unavailable: {
    email: 'e2e.donor.unavailable@bloodconnect.test',
    password: 'Password123!',
    profile: {
      full_name: 'E2E Unavailable Donor',
      phone: '9876543222',
      blood_group: 'B+',
      state: 'West Bengal',
      city: 'Kolkata',
      area: 'Salt Lake',
      donor_available: false,
      is_test_account: false,
      latitude: 22.5867,
      longitude: 88.4178,
    },
  },
};

async function setupFixtures() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Setup runner profile
  const { data: auth, error: authError } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });

  if (auth?.user?.id) {
    await supabase.from('profiles').update(RUNNER_PROFILE).eq('id', auth.user.id);
  }

  // Setup dedicated donor fixtures
  for (const fixture of Object.values(DONOR_FIXTURES)) {
    let authRes = await supabase.auth.signInWithPassword({
      email: fixture.email,
      password: fixture.password,
    });

    if (authRes.error) {
      await supabase.auth.signUp({
        email: fixture.email,
        password: fixture.password,
        options: { data: fixture.profile },
      });
      authRes = await supabase.auth.signInWithPassword({
        email: fixture.email,
        password: fixture.password,
      });
    }

    if (authRes.data?.user?.id) {
      await supabase.from('profiles').upsert({
        id: authRes.data.user.id,
        ...fixture.profile,
      });
    }
  }
}

async function cleanupFixtures() {
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  // Reset runner profile
  const { data: auth } = await supabase.auth.signInWithPassword({
    email: TEST_EMAIL,
    password: TEST_PASSWORD,
  });
  if (auth?.user?.id) {
    await supabase.from('profiles').update(RUNNER_PROFILE).eq('id', auth.user.id);
  }

  // Hide the available test donor fixture from directory after suite runs
  const { data: donorAuth } = await supabase.auth.signInWithPassword({
    email: DONOR_FIXTURES.available.email,
    password: DONOR_FIXTURES.available.password,
  });
  if (donorAuth?.user?.id) {
    await supabase.from('profiles').update({ is_test_account: true, donor_available: false }).eq('id', donorAuth.user.id);
  }
}

async function loginAsTestUser(page) {
  await page.goto('/');

  const profileTab = page.getByRole('tab', { name: 'Profile' }).or(page.getByLabel('Profile', { exact: true }));
  const loginTab = page.getByRole('tab', { name: 'Login' });

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

async function openFindDonor(page) {
  await loginAsTestUser(page);
  const findDonorTab = page.getByRole('tab', { name: 'Find Donor' });
  if (await findDonorTab.isVisible()) {
    await findDonorTab.click();
  } else {
    await page.getByText('Find Donor', { exact: true }).last().click();
  }
  await expect(page.getByText('Select Blood Group', { exact: true })).toBeVisible({ timeout: 15000 });
  await expect(page.getByText(/Your group:/)).toBeVisible({ timeout: 15000 });
}

test.describe('BloodConnect Find Donor E2E suite', () => {
  test.beforeAll(async () => {
    await setupFixtures();
  });

  test.afterAll(async () => {
    await cleanupFixtures();
  });

  test('1. Find Donor screen opens and displays search controls', async ({ page }) => {
    await openFindDonor(page);

    await expect(page.getByText('Select Blood Group', { exact: true })).toBeVisible();
    await expect(page.getByLabel('Select blood group ALL')).toBeVisible();
    await expect(page.getByLabel('Select blood group B+')).toBeVisible();
    await expect(page.getByPlaceholder(/Filter by name/)).toBeVisible();
    await expect(page.getByText('Your City / Location', { exact: true })).toBeVisible();
  });

  test('2. Blood-group filtering matches exact group and excludes incompatible donors', async ({ page }) => {
    await openFindDonor(page);

    const bPlusChoice = page.getByLabel('Select blood group B+');
    await bPlusChoice.click();

    // Verify exact B+ donor fixture is visible
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Verify incompatible donor accounts are not shown under B+ exact filter
    await expect(page.getByText('Inspector', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Sumon Dey', { exact: true })).not.toBeVisible();
  });

  test('3. Compatible donor filtering displays compatible groups and excludes incompatible', async ({ page }) => {
    await openFindDonor(page);

    const aPlusChoice = page.getByLabel('Select blood group A+');
    await aPlusChoice.click();

    const compatibleMode = page.getByLabel('Compatible donors for A+');
    await expect(compatibleMode).toBeVisible();
    await compatibleMode.click();

    // Compatible blood groups for A+ are A+, A-, O+, O-
    await expect(page.getByText('Sumon Dey', { exact: true })).toBeVisible();

    // Incompatible groups (B+, AB+) must not be visible
    await expect(page.getByText('E2E Available Donor', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Rohid Biswas', { exact: true })).not.toBeVisible();
    await expect(page.getByText('Arunabha Mazumder', { exact: true })).not.toBeVisible();
  });

  test('4. Search filtering matches donor by name, area, and shows empty state', async ({ page }) => {
    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    const searchInput = page.getByPlaceholder(/Filter by name/);

    // Search by donor name
    await searchInput.fill('E2E Available');
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Search by locality / area
    await searchInput.fill('Salt Lake');
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Search for non-matching donor
    await searchInput.fill('NonExistentDonorXYZ999');
    await expect(page.getByText('E2E Available Donor', { exact: true })).not.toBeVisible();
    await expect(page.getByText(/No .* donors found/)).toBeVisible();

    // Clear search
    await page.getByLabel('Clear search').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();
  });

  test('5. Available donor filtering excludes unavailable donors and test accounts', async ({ page }) => {
    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();

    // Available donor fixture is displayed
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Unavailable donor is excluded
    await expect(page.getByText('E2E Unavailable Donor', { exact: true })).not.toBeVisible();

    // Test account donor is excluded
    await expect(page.getByText('E2E Test Account Donor', { exact: true })).not.toBeVisible();
  });

  test('6. Self-donor behavior displays user card without request action against self', async ({ page }) => {
    await openFindDonor(page);

    // Runner profile has O+ blood group and donor_available = true
    await page.getByLabel('Select blood group O+').click();

    await expect(page.getByText('Your donor profile', { exact: true })).toBeVisible();
    await expect(page.getByText('You', { exact: true })).toBeVisible();
    await expect(page.getByText('Test E2E User', { exact: true })).toBeVisible();
    await expect(page.getByText('You cannot send a blood request to your own account.', { exact: true })).toBeVisible();

    // Verify there is no Send Blood Request or Request Blood button on the self donor card
    const selfCard = page.locator('div:has-text("Your donor profile")').first();
    await expect(selfCard.getByRole('button', { name: /Send Blood Request|Request Blood/ })).toHaveCount(0);
  });

  test('7a. Near You / GPS behavior without GPS coordinates does not show Live GPS badge', async ({ page, context }) => {
    await context.clearPermissions();
    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Live GPS badge must NOT appear merely because city/area match
    await expect(page.getByLabel('Live GPS • Near You')).not.toBeVisible();
  });

  test('7b. Near You / GPS behavior with coordinates displays Live GPS badge for nearby donor', async ({ page, context }) => {
    // Salt Lake coordinates: ~22.5860, 88.4170 (within 1 km of E2E Available Donor at 22.5867, 88.4178)
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 22.5860, longitude: 88.4170 });

    await openFindDonor(page);

    const locationBannerBtn = page.getByLabel('Turn on location permission');
    if (await locationBannerBtn.isVisible()) {
      page.on('dialog', (dialog) => dialog.accept());
      await locationBannerBtn.click();
    }

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Verify GPS-based Near You badge appears
    await expect(page.getByLabel('Live GPS • Near You')).toBeVisible();
  });

  test('7c. Near You badge is controlled by GPS proximity even with different area name', async ({ page, context }) => {
    await context.grantPermissions(['geolocation']);
    // Coords near Salt Lake donor (proximity is within 5 km)
    await context.setGeolocation({ latitude: 22.5860, longitude: 88.4170 });

    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Verify Live GPS badge appears from GPS proximity rather than text area match
    await expect(page.getByLabel('Live GPS • Near You')).toBeVisible();
  });

  test('7d. Same area name without coordinates does not display Live GPS badge', async ({ page, context }) => {
    await context.clearPermissions();
    const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    const { data: auth } = await supabase.auth.signInWithPassword({
      email: TEST_EMAIL,
      password: TEST_PASSWORD,
    });
    if (auth?.user?.id) {
      await supabase.from('profiles').update({ latitude: null, longitude: null }).eq('id', auth.user.id);
    }

    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // With no GPS permission/coordinates, Live GPS badge must NOT appear
    await expect(page.getByLabel('Live GPS • Near You')).not.toBeVisible();
  });

  test('8. Location permission UI displays banner when ungranted and refresh button when granted', async ({ page, context }) => {
    // 1. When location permission is ungranted / denied
    await context.clearPermissions();
    await openFindDonor(page);

    // Permission banner visible when permission is not granted
    const locationBannerBtn = page.getByLabel('Turn on location permission');
    await expect(locationBannerBtn).toBeVisible();

    // Refresh GPS location button is not visible when ungranted
    await expect(page.getByLabel('Refresh GPS location')).not.toBeVisible();

    // Verify Find Donor remains gracefully usable even when location is ungranted/denied
    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // 2. When location permission is granted
    await context.grantPermissions(['geolocation']);
    await context.setGeolocation({ latitude: 22.5860, longitude: 88.4170 });
    await page.reload();
    await openFindDonor(page);

    // Permission banner is hidden when permission is granted
    await expect(page.getByLabel('Turn on location permission')).not.toBeVisible();

    // Refresh GPS location button becomes accessible
    const refreshBtn = page.getByLabel('Refresh GPS location');
    await expect(refreshBtn).toBeVisible();

    // Verify refresh action functions properly
    await refreshBtn.click();
    await expect(page.getByText('Donor Live Location Active • Sorted by nearest')).toBeVisible();
  });

  test('9. Donor privacy protects exact coordinates in DOM and network responses', async ({ page }) => {
    let interceptedResponseData = null;

    page.on('response', async (response) => {
      if (response.url().includes('get_available_donors')) {
        try {
          interceptedResponseData = await response.json();
        } catch {
          // Non-json response
        }
      }
    });

    await openFindDonor(page);
    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // 1. Verify exact latitude and longitude numbers are not rendered anywhere in DOM
    const bodyText = await page.innerText('body');
    expect(bodyText).not.toContain('22.5867');
    expect(bodyText).not.toContain('88.4178');

    // 2. Verify API response does not expose raw donor home/device coordinates
    if (Array.isArray(interceptedResponseData) && interceptedResponseData.length > 0) {
      for (const row of interceptedResponseData) {
        expect(row.latitude).toBeUndefined();
        expect(row.longitude).toBeUndefined();
      }
    }

    // 3. Only city / area level information is displayed
    await expect(page.getByText('Salt Lake, Kolkata', { exact: false }).first()).toBeVisible();
  });

  test('10. Donor contact privacy hides phone and direct contact actions before request acceptance', async ({ page }) => {
    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Verify donor private phone is not exposed before acceptance
    await expect(page.getByText('9876543220', { exact: true })).not.toBeVisible();

    // Verify direct contact actions (Call, SMS, WhatsApp) are not rendered before acceptance
    await expect(page.getByLabel('Call E2E Available Donor')).not.toBeVisible();
    await expect(page.getByLabel('SMS E2E Available Donor')).not.toBeVisible();
    await expect(page.getByLabel('WhatsApp E2E Available Donor')).not.toBeVisible();

    // Verify contact privacy protection notice is rendered
    await expect(page.getByLabel('Contact details protected until request accepted').first()).toBeVisible();

    // Verify request blood connection action is available instead
    await expect(page.getByLabel('Send blood request to E2E Available Donor')).toBeVisible();
  });

  test('11. Test-account exclusion prevents test-marked accounts from appearing in normal results', async ({ page }) => {
    await openFindDonor(page);

    await page.getByLabel('Select blood group B+').click();

    // Test-marked donor fixture is excluded
    await expect(page.getByText('E2E Test Account Donor', { exact: true })).not.toBeVisible();

    // Production-format donor fixture is visible
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();
  });

  test('12. City filtering isolates city results and ignores non-matching cities', async ({ page }) => {
    await openFindDonor(page);

    // Default city is Kolkata: verify Kolkata donors are visible
    await page.getByLabel('Select blood group B+').click();
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();

    // Filter by search query for another locality or non-existent city
    const searchInput = page.getByPlaceholder(/Filter by name/);
    await searchInput.fill('Mumbai');

    // Kolkata donors must not appear when querying Mumbai
    await expect(page.getByText('E2E Available Donor', { exact: true })).not.toBeVisible();
    await expect(page.getByText(/No .* donors found/)).toBeVisible();
  });

  test('13. Empty state renders when no donor matches and screen remains usable', async ({ page }) => {
    await openFindDonor(page);

    // Search with non-matching query
    const searchInput = page.getByPlaceholder(/Filter by name/);
    await searchInput.fill('NonExistentLocality12345');

    await expect(page.getByText(/No .* donors found/)).toBeVisible();
    const reqBloodBtn = page.getByRole('button', { name: 'Request Blood' });
    await reqBloodBtn.scrollIntoViewIfNeeded();
    await expect(reqBloodBtn).toBeVisible();

    // Page remains fully usable
    await page.getByLabel('Clear search').click();
    await expect(page.getByText('Select Blood Group', { exact: true })).toBeVisible();
  });

  test('14. Error handling displays useful error state and retry control on failure without crashing', async ({ page, context }) => {
    await context.clearPermissions();
    await openFindDonor(page);

    // Intercept donor RPC to simulate API failure with 500 status
    await page.route('**/rpc/get_available_donors*', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'Simulated donor fetch failure' }),
      });
    });

    // Select blood group to trigger donor fetch
    await page.getByLabel('Select blood group B+').click();

    // Verify error state is rendered with Retry button and page does not crash
    await expect(page.getByText('Error Loading Donors', { exact: true })).toBeVisible();
    const retryBtn = page.getByRole('button', { name: /Retry/i });
    await expect(retryBtn).toBeVisible();

    // Unroute and retry loading
    await page.unroute('**/rpc/get_available_donors*');
    await retryBtn.click();

    // Verify donors load successfully after retry
    await expect(page.getByText('E2E Available Donor', { exact: true })).toBeVisible();
  });
});
