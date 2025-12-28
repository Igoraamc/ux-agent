const BLOCKED_URL_PATTERNS: RegExp[] = [
  // ===== LOCAL/INTERNAL NETWORKS =====
  /^https?:\/\/localhost/i,
  /^https?:\/\/127\.\d+\.\d+\.\d+/, // Loopback
  /^https?:\/\/0\.0\.0\.0/,
  /^https?:\/\/\[::1\]/, // IPv6 loopback
  /^https?:\/\/10\.\d+\.\d+\.\d+/, // Private Class A
  /^https?:\/\/172\.(1[6-9]|2\d|3[01])\./, // Private Class B
  /^https?:\/\/192\.168\./, // Private Class C
  /^https?:\/\/169\.254\./, // Link-local
  /^https?:\/\/\.local/i, // mDNS local domains

  // ===== DANGEROUS PROTOCOLS =====
  /^file:\/\//i, // Local filesystem
  /^ftp:\/\//i, // FTP
  /^data:/i, // Data URLs (XSS vector)
  /^javascript:/i, // JS execution
  /^about:/i, // Browser internals

  // ===== ANONYMITY/DARK WEB =====
  /\.onion$/i, // Tor hidden services
  /\.i2p$/i, // I2P network

  // ===== CLOUD METADATA SERVICES =====
  /^https?:\/\/169\.254\.169\.254/, // AWS/GCP/Azure metadata
  /^https?:\/\/metadata\.google/i, // GCP metadata
  /^https?:\/\/metadata\.azure/i, // Azure metadata
  /^https?:\/\/100\.100\.100\.200/, // Alibaba Cloud metadata

  // ===== INTERNAL SERVICES =====
  /^https?:\/\/kubernetes/i, // K8s internal
  /^https?:\/\/.*\.internal/i, // Generic internal domains
  /^https?:\/\/.*\.corp/i, // Corporate internal
  /^https?:\/\/.*\.local/i, // Local network

  // ===== SENSITIVE SERVICES =====
  /^https?:\/\/.*phpmyadmin/i, // Database admin
  /^https?:\/\/.*adminer/i, // Database admin
  /^https?:\/\/.*wp-admin/i, // WordPress admin
  /^https?:\/\/.*:22(\/|$)/, // SSH port
  /^https?:\/\/.*:3389(\/|$)/, // RDP port
  /^https?:\/\/.*:5432(\/|$)/, // PostgreSQL
  /^https?:\/\/.*:3306(\/|$)/, // MySQL
  /^https?:\/\/.*:6379(\/|$)/, // Redis
  /^https?:\/\/.*:27017(\/|$)/, // MongoDB
  /^https?:\/\/.*:9200(\/|$)/, // Elasticsearch

  // ===== URL MANIPULATION =====
  /^https?:\/\/.*@/, // Credentials in URL
  /%00/, // Null byte injection
  /%2e%2e/i, // Encoded path traversal
  /\.\.\//, // Path traversal
];

export function validateUrl(url: string): { valid: boolean; reason?: string } {
  if (!/^https?:\/\//i.test(url)) {
    return { valid: false, reason: "URL must use HTTP or HTTPS protocol" };
  }

  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (pattern.test(url)) {
      return { valid: false, reason: "URL matches blocked pattern" };
    }
  }

  try {
    const parsed = new URL(url);
    if (!parsed.hostname || parsed.hostname.length === 0) {
      return { valid: false, reason: "Invalid hostname" };
    }
  } catch {
    return { valid: false, reason: "Invalid URL format" };
  }

  return { valid: true };
}
