import axios from 'axios';

/**
 * Fetch exchange rates for a given base currency.
 * Returns the rates object, or an empty object on failure.
 */
export async function fetchExchangeRates(baseCurrency = 'INR') {
  try {
    const { data } = await axios.get(
      `https://api.exchangerate-api.com/v4/latest/${baseCurrency}`
    );
    return data.rates || {};
  } catch (error) {
    console.error('Failed to fetch exchange rates:', error.message);
    return {};
  }
}

/**
 * Fetch top business headlines from India.
 * Returns an array of article objects, or [] on failure.
 */
export async function fetchFinancialNews() {
  try {
    const { data } = await axios.get(
      'https://newsapi.org/v2/top-headlines',
      {
        params: {
          category: 'business',
          apiKey: 'DEMO_KEY',
          country: 'in',
        },
      }
    );
    return data.articles || [];
  } catch (error) {
    console.error('Failed to fetch financial news:', error.message);
    return [];
  }
}
