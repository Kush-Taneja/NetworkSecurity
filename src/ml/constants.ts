export const FEATURE_COLUMNS = [
  "having_IP_Address",
  "URL_Length",
  "Shortining_Service",
  "having_At_Symbol",
  "double_slash_redirecting",
  "Prefix_Suffix",
  "having_Sub_Domain",
  "SSLfinal_State",
  "Domain_registeration_length",
  "Favicon",
  "port",
  "HTTPS_token",
  "Request_URL",
  "URL_of_Anchor",
  "Links_in_tags",
  "SFH",
  "Submitting_to_email",
  "Abnormal_URL",
  "Redirect",
  "on_mouseover",
  "RightClick",
  "popUpWidnow",
  "Iframe",
  "age_of_domain",
  "DNSRecord",
  "web_traffic",
  "Page_Rank",
  "Google_Index",
  "Links_pointing_to_page",
  "Statistical_report"
] as const;

export type FeatureName = typeof FEATURE_COLUMNS[number];

export interface FeatureMeta {
  name: FeatureName;
  label: string;
  category: 'URL & Domain' | 'Security & Certificate' | 'Page Content & Behavior' | 'Reputation & External';
  description: string;
  weight: number; // relative importance in phishing detection
  phishingValueExplanation: string;
}

export const FEATURE_METADATA: Record<FeatureName, FeatureMeta> = {
  having_IP_Address: {
    name: "having_IP_Address",
    label: "IP Address in Hostname",
    category: "URL & Domain",
    description: "Whether the URL uses an explicit IP address instead of a domain name (e.g. http://192.168.1.1/login).",
    weight: 0.85,
    phishingValueExplanation: "-1: Raw IP used to conceal domain identity."
  },
  URL_Length: {
    name: "URL_Length",
    label: "URL Character Length",
    category: "URL & Domain",
    description: "Length of the full URL string. Phishers often create excessively long URLs to hide malicious parameters.",
    weight: 0.65,
    phishingValueExplanation: "-1: Excessively long URL (>75 characters)."
  },
  Shortining_Service: {
    name: "Shortining_Service",
    label: "URL Shortener Service",
    category: "URL & Domain",
    description: "Use of URL shorteners (bit.ly, tinyurl, t.co) to obscure actual destination host.",
    weight: 0.78,
    phishingValueExplanation: "-1: Uses shortening service to mask destination."
  },
  having_At_Symbol: {
    name: "having_At_Symbol",
    label: "@ Symbol in URL",
    category: "URL & Domain",
    description: "Browsers ignore everything before '@' and connect to the domain following it, deceiving users.",
    weight: 0.88,
    phishingValueExplanation: "-1: '@' symbol used to trick browser credential authentication."
  },
  double_slash_redirecting: {
    name: "double_slash_redirecting",
    label: "Double Slash Redirection",
    category: "URL & Domain",
    description: "Appearance of '//' within the path redirects the user away from initial URL host.",
    weight: 0.72,
    phishingValueExplanation: "-1: '//' placed after position 7 redirects request."
  },
  Prefix_Suffix: {
    name: "Prefix_Suffix",
    label: "Domain Hyphen Prefix/Suffix",
    category: "URL & Domain",
    description: "Dash/hyphen in domain name (e.g. paypal-security-update.com) mimicking real organizations.",
    weight: 0.92,
    phishingValueExplanation: "-1: Hyphen (-) used in domain name to simulate official brand."
  },
  having_Sub_Domain: {
    name: "having_Sub_Domain",
    label: "Subdomain Nesting Level",
    category: "URL & Domain",
    description: "Number of dot-separated subdomains (e.g. login.secure.verify.paypal.fake.com).",
    weight: 0.94,
    phishingValueExplanation: "-1: Multi-level subdomains used to spoof legitimate brand prefix."
  },
  SSLfinal_State: {
    name: "SSLfinal_State",
    label: "SSL / TLS Certificate State",
    category: "Security & Certificate",
    description: "Validity, trusted CA issuer, and certificate age of HTTPS connection.",
    weight: 0.98,
    phishingValueExplanation: "-1: No HTTPS or untrusted self-signed certificate."
  },
  Domain_registeration_length: {
    name: "Domain_registeration_length",
    label: "Domain Registration Tenure",
    category: "Reputation & External",
    description: "Remaining registration period for the domain. Phishing domains are rarely registered for >1 year.",
    weight: 0.82,
    phishingValueExplanation: "-1: Domain registered for only ≤1 year."
  },
  Favicon: {
    name: "Favicon",
    label: "External Favicon Source",
    category: "Page Content & Behavior",
    description: "Whether the favicon image is loaded from an external third-party domain.",
    weight: 0.55,
    phishingValueExplanation: "-1: Favicon loaded from external untrusted host."
  },
  port: {
    name: "port",
    label: "Non-Standard Port Usage",
    category: "Security & Certificate",
    description: "Whether the URL connects over unusual non-standard ports (outside 80/443).",
    weight: 0.68,
    phishingValueExplanation: "-1: Opens connection on unusual network ports."
  },
  HTTPS_token: {
    name: "HTTPS_token",
    label: "HTTPS Token in Domain Part",
    category: "URL & Domain",
    description: "String 'https' embedded in domain name (e.g. http://https-paypal.com) to mislead users.",
    weight: 0.87,
    phishingValueExplanation: "-1: 'https' word embedded into domain name."
  },
  Request_URL: {
    name: "Request_URL",
    label: "External Request URL Assets",
    category: "Page Content & Behavior",
    description: "% of external images, videos, and sounds loaded from other domains.",
    weight: 0.79,
    phishingValueExplanation: "-1: High % of external media assets loaded from different domains."
  },
  URL_of_Anchor: {
    name: "URL_of_Anchor",
    label: "Anchor (<a>) Link Destinations",
    category: "Page Content & Behavior",
    description: "% of anchor links pointing to external domains, javascript:void(0), or #.",
    weight: 0.96,
    phishingValueExplanation: "-1: ≥67% of page links point to external or blank targets."
  },
  Links_in_tags: {
    name: "Links_in_tags",
    label: "Links in <Meta>, <Script>, <Link>",
    category: "Page Content & Behavior",
    description: "% of resource links inside HTML head tags pointing to external domains.",
    weight: 0.81,
    phishingValueExplanation: "-1: Heavy external domain references in HTML headers."
  },
  SFH: {
    name: "SFH",
    label: "Server Form Handler Action",
    category: "Page Content & Behavior",
    description: "Form action attribute value (e.g. blank, about:blank, or third-party server handler).",
    weight: 0.95,
    phishingValueExplanation: "-1: Form sends credentials to about:blank or external server."
  },
  Submitting_to_email: {
    name: "Submitting_to_email",
    label: "Form Submit to Email (mailto:)",
    category: "Page Content & Behavior",
    description: "Use of server-side mail() or client mailto: to exfiltrate user credentials.",
    weight: 0.84,
    phishingValueExplanation: "-1: User inputs submitted directly to email recipient."
  },
  Abnormal_URL: {
    name: "Abnormal_URL",
    label: "Abnormal Host URL Structure",
    category: "URL & Domain",
    description: "Whether the hostname is included in the WHOIS identity / certificate identity.",
    weight: 0.86,
    phishingValueExplanation: "-1: Host identity not found in WHOIS database."
  },
  Redirect: {
    name: "Redirect",
    label: "HTTP Redirect Hop Count",
    category: "Security & Certificate",
    description: "Number of automated HTTP redirect hops before reaching final destination.",
    weight: 0.70,
    phishingValueExplanation: "-1: ≥4 redirection hops observed."
  },
  on_mouseover: {
    name: "on_mouseover",
    label: "Status Bar Spoofing (onMouseOver)",
    category: "Page Content & Behavior",
    description: "JavaScript altering window.status to show fake URL when hovering over links.",
    weight: 0.73,
    phishingValueExplanation: "-1: JS onmouseover overwrites status bar link preview."
  },
  RightClick: {
    name: "RightClick",
    label: "Disabled Right Click",
    category: "Page Content & Behavior",
    description: "JavaScript event handlers preventing user right-click context menu (inspect source).",
    weight: 0.69,
    phishingValueExplanation: "-1: Context menu blocked to hide malicious page source."
  },
  popUpWidnow: {
    name: "popUpWidnow",
    label: "Credential Input Pop-up Window",
    category: "Page Content & Behavior",
    description: "Pop-up window with input fields prompting for personal/login details.",
    weight: 0.74,
    phishingValueExplanation: "-1: Prompts login credentials inside floating popup."
  },
  Iframe: {
    name: "Iframe",
    label: "Invisible IFrame Injection",
    category: "Page Content & Behavior",
    description: "Invisible or transparent <iframe> tag embedding another site.",
    weight: 0.83,
    phishingValueExplanation: "-1: Hidden iframe used for clickjacking or silent credential harvest."
  },
  age_of_domain: {
    name: "age_of_domain",
    label: "Domain Age",
    category: "Reputation & External",
    description: "Time elapsed since initial domain creation in WHOIS registry.",
    weight: 0.89,
    phishingValueExplanation: "-1: Newly registered domain (<6 months old)."
  },
  DNSRecord: {
    name: "DNSRecord",
    label: "DNS Record Validation",
    category: "Reputation & External",
    description: "Whether the domain has valid A/AAAA and MX records in authoritative DNS.",
    weight: 0.90,
    phishingValueExplanation: "-1: No valid authoritative DNS record exists."
  },
  web_traffic: {
    name: "web_traffic",
    label: "Web Traffic & Alexa Rank",
    category: "Reputation & External",
    description: "Global web traffic volume and ranking tier.",
    weight: 0.91,
    phishingValueExplanation: "-1: Zero traffic or unranked domain."
  },
  Page_Rank: {
    name: "Page_Rank",
    label: "PageRank Authority",
    category: "Reputation & External",
    description: "Measure of the domain importance based on external link graph.",
    weight: 0.80,
    phishingValueExplanation: "-1: PageRank < 0.2 (low web authority)."
  },
  Google_Index: {
    name: "Google_Index",
    label: "Google Search Index Status",
    category: "Reputation & External",
    description: "Whether the target webpage is crawled and indexed in Google search results.",
    weight: 0.87,
    phishingValueExplanation: "-1: Webpage not indexed in Google search index."
  },
  Links_pointing_to_page: {
    name: "Links_pointing_to_page",
    label: "Inbound Backlinks Count",
    category: "Reputation & External",
    description: "Number of external websites linking to this specific page.",
    weight: 0.76,
    phishingValueExplanation: "-1: Zero inbound links pointing to webpage."
  },
  Statistical_report: {
    name: "Statistical_report",
    label: "Threat Intelligence & Blacklist Status",
    category: "Reputation & External",
    description: "Matching against known PhishTank, StopBadware, and Spamhaus threat intelligence feeds.",
    weight: 0.97,
    phishingValueExplanation: "-1: Matched in active threat intelligence blacklist feeds."
  }
};
