/**
 * Static country data for testing address forms and location-based features
 *
 * @module test-data/static/countries
 */

/**
 * Country data structure
 */
export type Country = {
  /** ISO 3166-1 alpha-2 code */
  code: string;
  /** Country name */
  name: string;
  /** ISO 3166-1 alpha-3 code */
  code3?: string;
  /** Phone country code */
  phoneCode?: string;
  /** Currency code (ISO 4217) */
  currency?: string;
};

/**
 * Commonly used countries for testing
 */
export const COUNTRIES: Country[] = [
  {
    code: 'US',
    code3: 'USA',
    name: 'United States',
    phoneCode: '+1',
    currency: 'USD',
  },
  {
    code: 'CA',
    code3: 'CAN',
    name: 'Canada',
    phoneCode: '+1',
    currency: 'CAD',
  },
  {
    code: 'GB',
    code3: 'GBR',
    name: 'United Kingdom',
    phoneCode: '+44',
    currency: 'GBP',
  },
  {
    code: 'DE',
    code3: 'DEU',
    name: 'Germany',
    phoneCode: '+49',
    currency: 'EUR',
  },
  {
    code: 'FR',
    code3: 'FRA',
    name: 'France',
    phoneCode: '+33',
    currency: 'EUR',
  },
  {
    code: 'AU',
    code3: 'AUS',
    name: 'Australia',
    phoneCode: '+61',
    currency: 'AUD',
  },
  {
    code: 'JP',
    code3: 'JPN',
    name: 'Japan',
    phoneCode: '+81',
    currency: 'JPY',
  },
  {
    code: 'IN',
    code3: 'IND',
    name: 'India',
    phoneCode: '+91',
    currency: 'INR',
  },
];

/**
 * US states for address testing
 */
export const US_STATES = [
  { code: 'AL', name: 'Alabama' },
  { code: 'AK', name: 'Alaska' },
  { code: 'AZ', name: 'Arizona' },
  { code: 'AR', name: 'Arkansas' },
  { code: 'CA', name: 'California' },
  { code: 'CO', name: 'Colorado' },
  { code: 'CT', name: 'Connecticut' },
  { code: 'DE', name: 'Delaware' },
  { code: 'FL', name: 'Florida' },
  { code: 'GA', name: 'Georgia' },
  { code: 'NY', name: 'New York' },
  { code: 'TX', name: 'Texas' },
  // Add more as needed
];

/**
 * Canadian provinces for address testing
 */
export const CANADIAN_PROVINCES = [
  { code: 'AB', name: 'Alberta' },
  { code: 'BC', name: 'British Columbia' },
  { code: 'MB', name: 'Manitoba' },
  { code: 'NB', name: 'New Brunswick' },
  { code: 'NL', name: 'Newfoundland and Labrador' },
  { code: 'NT', name: 'Northwest Territories' },
  { code: 'NS', name: 'Nova Scotia' },
  { code: 'NU', name: 'Nunavut' },
  { code: 'ON', name: 'Ontario' },
  { code: 'PE', name: 'Prince Edward Island' },
  { code: 'QC', name: 'Quebec' },
  { code: 'SK', name: 'Saskatchewan' },
  { code: 'YT', name: 'Yukon' },
];
