import rawData from './indianLocations.json';

export type StateOption = {
  id: number;
  name: string;
  state_code: string;
  country_code: string;
};

export type CityOption = {
  id: number;
  name: string;
  state_code: string;
  country_code: string;
};

type LocationDatabase = {
  states: Array<{ id: number; name: string; state_code: string }>;
  citiesByState: Record<string, string[]>;
};

const database = rawData as LocationDatabase;

export const INDIA_STATES: StateOption[] = database.states.map((s) => ({
  id: s.id,
  name: s.name,
  state_code: s.state_code,
  country_code: 'IN',
}));

const STATE_BY_CODE = new Map<string, StateOption>();
const STATE_BY_NAME = new Map<string, StateOption>();

for (const s of INDIA_STATES) {
  if (s.state_code) {
    STATE_BY_CODE.set(s.state_code.toUpperCase(), s);
  }
  if (s.name) {
    STATE_BY_NAME.set(s.name.toLowerCase().trim(), s);
  }
}

export function findStateByName(name?: string | null): StateOption | undefined {
  if (!name) return undefined;
  return STATE_BY_NAME.get(name.trim().toLowerCase());
}

export function findStateByCode(code?: string | null): StateOption | undefined {
  if (!code) return undefined;
  return STATE_BY_CODE.get(code.trim().toUpperCase());
}

let cachedAllIndianCities: CityOption[] | null = null;

export function getAllIndianCities(): CityOption[] {
  if (!cachedAllIndianCities) {
    const list: CityOption[] = [];
    let nextId = 1;
    for (const [stateCode, cityNames] of Object.entries(database.citiesByState)) {
      for (const name of cityNames) {
        list.push({
          id: nextId++,
          name,
          state_code: stateCode,
          country_code: 'IN',
        });
      }
    }
    list.sort((a, b) => a.name.localeCompare(b.name));
    cachedAllIndianCities = list;
  }
  return cachedAllIndianCities;
}

export function inferStateFromCity(cityName?: string | null): StateOption | undefined {
  if (!cityName) return undefined;
  const lower = cityName.trim().toLowerCase();
  if (lower === 'kolkata' || lower === 'calcutta') {
    return STATE_BY_CODE.get('WB');
  }
  const allCities = getAllIndianCities();
  const match = allCities.find((c) => c.name.toLowerCase() === lower);
  if (match && match.state_code) {
    return STATE_BY_CODE.get(match.state_code.toUpperCase());
  }
  return undefined;
}

const cachedStateCities = new Map<string, CityOption[]>();

export function getCitiesForState(stateCode?: string | null): CityOption[] {
  if (!stateCode) {
    return getAllIndianCities();
  }
  const upperCode = stateCode.trim().toUpperCase();
  const cached = cachedStateCities.get(upperCode);
  if (cached) return cached;

  const names = database.citiesByState[upperCode] || [];
  let nextId = 1;
  const list: CityOption[] = names.map((name) => ({
    id: nextId++,
    name,
    state_code: upperCode,
    country_code: 'IN',
  }));
  cachedStateCities.set(upperCode, list);
  return list;
}

export const POPULAR_CITIES = [
  'Kolkata',
  'Howrah',
  'Durgapur',
  'Asansol',
  'Siliguri',
  'Bardhaman',
  'Kalyani',
  'Barasat',
  'Kharagpur',
  'Delhi',
  'Mumbai',
  'Bengaluru',
  'Hyderabad',
  'Chennai',
  'Pune',
];
