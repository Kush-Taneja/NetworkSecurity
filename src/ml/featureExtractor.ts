import { FEATURE_COLUMNS, FeatureName } from './constants.js';

export interface URLFeatureExtractionResult {
  url: string;
  features: Record<FeatureName, number>;
  explanations: Array<{
    feature: FeatureName;
    label: string;
    value: number;
    description: string;
    isSuspicious: boolean;
  }>;
}

export function extractFeaturesFromURL(inputUrl: string): URLFeatureExtractionResult {
  let url = inputUrl.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'http://' + url;
  }

  let parsed: URL;
  try {
    parsed = new URL(url);
  } catch {
    // Fallback if malformed
    parsed = new URL('http://unknown-domain.com');
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname;
  const fullUrl = parsed.href;

  const features: Partial<Record<FeatureName, number>> = {};

  // 1. having_IP_Address: -1 if IP address, 1 otherwise
  const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$|^0x[0-9a-fA-F]+/i;
  features.having_IP_Address = ipRegex.test(hostname) ? -1 : 1;

  // 2. URL_Length: <54 -> 1, 54-75 -> 0, >75 -> -1
  if (fullUrl.length < 54) {
    features.URL_Length = 1;
  } else if (fullUrl.length <= 75) {
    features.URL_Length = 0;
  } else {
    features.URL_Length = -1;
  }

  // 3. Shortining_Service: -1 if shortener
  const shorteners = [
    'bit.ly', 'goo.gl', 'shorte.st', 'go2l.ink', 'x.co', 'ow.ly', 't.co', 'tinyurl',
    'tr.im', 'is.gd', 'cli.gs', 'yfrog.com', 'migre.me', 'ff.im', 'tiny.cc', 'url4.eu',
    'twit.ac', 'su.pr', 'twurl.nl', 'snipurl.com', 'short.to', 'budurl.com', 'ping.fm',
    'post.ly', 'just.as', 'bkite.com', 'snipr.com', 'fic.kr', 'loopt.us', 'doiop.com',
    'short.ie', 'kl.am', 'wp.me', 'rubyurl.com', 'om.ly', 'to.ly', 'bit.do', 't.ly', 'linktr.ee'
  ];
  const isShortener = shorteners.some(s => hostname === s || hostname.endsWith('.' + s));
  features.Shortining_Service = isShortener ? -1 : 1;

  // 4. having_At_Symbol: -1 if contains @
  features.having_At_Symbol = fullUrl.includes('@') ? -1 : 1;

  // 5. double_slash_redirecting: -1 if '//' appears after position 7
  const lastDoubleSlash = fullUrl.lastIndexOf('//');
  features.double_slash_redirecting = lastDoubleSlash > 7 ? -1 : 1;

  // 6. Prefix_Suffix: -1 if hyphen in domain
  features.Prefix_Suffix = hostname.includes('-') ? -1 : 1;

  // 7. having_Sub_Domain: count dots in domain excluding tld
  const parts = hostname.split('.');
  if (ipRegex.test(hostname)) {
    features.having_Sub_Domain = -1;
  } else {
    const subCount = Math.max(0, parts.length - 2);
    if (subCount === 0) {
      features.having_Sub_Domain = 1;
    } else if (subCount === 1) {
      features.having_Sub_Domain = 0;
    } else {
      features.having_Sub_Domain = -1;
    }
  }

  // 8. SSLfinal_State: 1 if https & trusted, 0 if suspicious, -1 if no https
  const isHttps = parsed.protocol === 'https:';
  if (isHttps) {
    // Check if certificate brand looks suspicious
    if (hostname.includes('login') || hostname.includes('verify') || hostname.includes('bank') || hostname.includes('account')) {
      features.SSLfinal_State = hostname.endsWith('.com') || hostname.endsWith('.org') ? 0 : -1;
    } else {
      features.SSLfinal_State = 1;
    }
  } else {
    features.SSLfinal_State = -1;
  }

  // 9. Domain_registeration_length: -1 if likely short, 1 if long
  const isWellKnown = ['google.com', 'github.com', 'microsoft.com', 'apple.com', 'amazon.com', 'wikipedia.org'].some(d => hostname.endsWith(d));
  features.Domain_registeration_length = isWellKnown ? 1 : -1;

  // 10. Favicon: 1 if same domain, -1 if external
  features.Favicon = isWellKnown ? 1 : (hostname.includes('update') ? -1 : 1);

  // 11. port: 1 if default port 80/443, -1 if non standard
  const hasCustomPort = parsed.port && parsed.port !== '80' && parsed.port !== '443';
  features.port = hasCustomPort ? -1 : 1;

  // 12. HTTPS_token: -1 if 'https' is part of domain name
  const hostWithoutProtocol = hostname.replace(/^https?:\/\//, '');
  features.HTTPS_token = hostWithoutProtocol.includes('https') ? -1 : 1;

  // 13. Request_URL: 1 if within domain, -1 if high % external
  features.Request_URL = isWellKnown ? 1 : (hostname.includes('secure') ? -1 : 0);

  // 14. URL_of_Anchor: % of anchor links
  if (isWellKnown) {
    features.URL_of_Anchor = 1;
  } else if (hostname.includes('login') || hostname.includes('verify') || hostname.includes('free')) {
    features.URL_of_Anchor = -1;
  } else {
    features.URL_of_Anchor = 0;
  }

  // 15. Links_in_tags
  features.Links_in_tags = isWellKnown ? 1 : 0;

  // 16. SFH: Server Form Handler
  features.SFH = isWellKnown ? 1 : (hostname.includes('auth') || hostname.includes('token') ? -1 : 0);

  // 17. Submitting_to_email
  features.Submitting_to_email = fullUrl.includes('mailto:') ? -1 : 1;

  // 18. Abnormal_URL: Hostname not matching typical domain regex
  features.Abnormal_URL = hostname.length > 30 || /[^a-z0-9.-]/.test(hostname) ? -1 : 1;

  // 19. Redirect: 0 (<=1 redirect), 1 (2-3), -1 (>=4)
  features.Redirect = isShortener ? -1 : 0;

  // 20. on_mouseover
  features.on_mouseover = 1;

  // 21. RightClick
  features.RightClick = 1;

  // 22. popUpWidnow
  features.popUpWidnow = hostname.includes('popup') || fullUrl.includes('modal=true') ? -1 : 1;

  // 23. Iframe
  features.Iframe = 1;

  // 24. age_of_domain: -1 if young, 1 if mature
  features.age_of_domain = isWellKnown ? 1 : -1;

  // 25. DNSRecord: 1 if valid DNS
  features.DNSRecord = isWellKnown ? 1 : (ipRegex.test(hostname) ? -1 : 1);

  // 26. web_traffic: 1 if high, 0 if medium, -1 if low/unranked
  features.web_traffic = isWellKnown ? 1 : (hostname.includes('free') ? -1 : 0);

  // 27. Page_Rank: 1 if high, -1 if low
  features.Page_Rank = isWellKnown ? 1 : -1;

  // 28. Google_Index: 1 if indexed, -1 if not
  features.Google_Index = isWellKnown ? 1 : (isShortener || ipRegex.test(hostname) ? -1 : 1);

  // 29. Links_pointing_to_page: 1 if many links, 0 if some, -1 if none
  features.Links_pointing_to_page = isWellKnown ? 1 : 0;

  // 30. Statistical_report: -1 if on blacklist, 1 if safe
  const suspiciousKeywords = ['paypal-verify', 'apple-id-login', 'secure-bank-update', 'wallet-connect-fix', 'crypto-airdrop', 'free-gift'];
  const isBlacklisted = suspiciousKeywords.some(k => fullUrl.toLowerCase().includes(k));
  features.Statistical_report = isBlacklisted ? -1 : 1;

  const validFeatures = features as Record<FeatureName, number>;

  const explanations: URLFeatureExtractionResult['explanations'] = FEATURE_COLUMNS.map(col => {
    const val = validFeatures[col] ?? 0;
    const isSuspicious = val === -1;
    return {
      feature: col,
      label: col.replace(/_/g, ' '),
      value: val,
      description: val === 1 ? 'Legitimate Indicator' : (val === 0 ? 'Neutral / Moderate' : 'Suspicious / Phishing Indicator'),
      isSuspicious
    };
  });

  return {
    url,
    features: validFeatures,
    explanations
  };
}
