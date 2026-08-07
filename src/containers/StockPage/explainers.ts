// Hand-written beginner explainers for well-known tickers.
//
// No data source carries a company description, so these are authored copy.
// Symbols without an entry simply don't render the card — the page must never
// invent a description for a company it knows nothing about.
//
// TODO: replace with a per-company description field (or a fundamentals
// provider) so this scales past a hand-maintained list.
export interface Explainer {
  /** Plain-language summary. `emphasis` is highlighted inline where it appears. */
  body: string;
  emphasis?: string;
  tags: string[];
}

export const EXPLAINERS: Record<string, Explainer> = {
  NVDA: {
    body: "NVIDIA designs the chips that power video games, AI, and data centres. Think of it as selling the shovels during a gold rush — when companies race to build AI, most of them buy NVIDIA's hardware.",
    emphasis: 'shovels during a gold rush',
    tags: ['Technology', 'Semiconductors', 'High volatility', 'AI exposure'],
  },
  AAPL: {
    body: 'Apple sells iPhones, Macs and a growing pile of subscriptions. Most of its money still comes from hardware, but services like iCloud and the App Store are the steadier, higher-margin half of the business.',
    emphasis: 'steadier, higher-margin half',
    tags: ['Technology', 'Consumer hardware', 'Dividend payer'],
  },
  MSFT: {
    body: 'Microsoft sells software to businesses — Windows, Office, and above all Azure, its cloud platform. Its revenue is mostly recurring subscriptions, which tends to make it less jumpy than hardware companies.',
    emphasis: 'mostly recurring subscriptions',
    tags: ['Technology', 'Cloud', 'Lower volatility'],
  },
  TSLA: {
    body: 'Tesla makes electric cars, batteries and solar hardware. Its share price often moves on expectations about the future — self-driving, robotics, energy — rather than on how many cars it sold last quarter.',
    emphasis: 'expectations about the future',
    tags: ['Automotive', 'Clean energy', 'High volatility'],
  },
  AMZN: {
    body: 'Amazon is two businesses in one: the online store you know, and AWS, which rents computing power to other companies. AWS is much smaller in revenue but produces most of the profit.',
    emphasis: 'produces most of the profit',
    tags: ['E-commerce', 'Cloud', 'Consumer'],
  },
  GOOGL: {
    body: 'Alphabet is Google. The overwhelming majority of its money comes from advertising on Search and YouTube, so its results tend to track how much businesses are spending on ads.',
    emphasis: 'track how much businesses are spending on ads',
    tags: ['Technology', 'Advertising', 'Search'],
  },
  META: {
    body: 'Meta runs Facebook, Instagram and WhatsApp, and earns almost everything from advertising. It also spends heavily on virtual and augmented reality, which loses money today as a bet on the future.',
    emphasis: 'a bet on the future',
    tags: ['Technology', 'Advertising', 'Social media'],
  },
  KO: {
    body: 'Coca-Cola sells drinks in almost every country on earth. It is a classic defensive stock — people keep buying soft drinks in good times and bad, so its sales move less with the economy.',
    emphasis: 'classic defensive stock',
    tags: ['Consumer staples', 'Dividend payer', 'Lower volatility'],
  },
  DIS: {
    body: 'Disney owns film studios, theme parks, and Disney+. Parks and cruises are its most profitable arm, while streaming has been an expensive land grab for subscribers.',
    emphasis: 'expensive land grab',
    tags: ['Media', 'Entertainment', 'Consumer'],
  },
  AMD: {
    body: 'AMD designs processors and graphics chips, competing directly with Intel and NVIDIA. It has no factories of its own — it designs chips and pays others to manufacture them.',
    emphasis: 'no factories of its own',
    tags: ['Technology', 'Semiconductors', 'High volatility'],
  },
  SHOP: {
    body: 'Shopify provides the software that lets anyone run an online store. It grows when small merchants grow, so its results follow overall e-commerce spending fairly closely.',
    emphasis: 'follow overall e-commerce spending',
    tags: ['Technology', 'E-commerce', 'High volatility'],
  },
  ABNB: {
    body: 'Airbnb runs the marketplace for short-term stays and takes a cut of each booking. It owns almost no property itself — its costs stay low as bookings rise.',
    emphasis: 'owns almost no property itself',
    tags: ['Travel', 'Marketplace', 'Consumer'],
  },
};

export const explainerFor = (symbol: string): Explainer | null =>
  EXPLAINERS[symbol?.toUpperCase()] ?? null;
