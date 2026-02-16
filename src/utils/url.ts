/**
 * URL utility functions for handling URLs with special characters including Greek letters
 */

/**
 * Validates if a string is a valid URL
 * @param urlString - The URL string to validate
 * @returns true if valid, false otherwise
 */
export function isValidUrl(urlString: string): boolean {
  if (!urlString || urlString.trim() === '') {
    return false;
  }

  try {
    const url = new URL(urlString);
    // Check if protocol is http or https
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Normalizes and encodes a URL properly for opening
 * Handles Greek letters and special characters in different URL parts
 * @param urlString - The URL to normalize
 * @returns Properly encoded URL or the original if invalid
 */
export function normalizeUrl(urlString: string): string {
  if (!urlString || urlString.trim() === '') {
    return urlString;
  }

  try {
    // Try to parse the URL
    const url = new URL(urlString);

    // The URL constructor automatically handles encoding
    // Return the href which has proper encoding
    return url.href;
  } catch {
    // If URL parsing fails, it might be missing protocol
    // Try adding https:// if it looks like a domain
    if (!urlString.includes('://')) {
      try {
        const urlWithProtocol = new URL('https://' + urlString);
        return urlWithProtocol.href;
      } catch {
        // Return original if still invalid
        return urlString;
      }
    }
    return urlString;
  }
}

/**
 * Safely opens a URL in a new window/tab
 * Properly encodes Greek letters and special characters
 * @param urlString - The URL to open
 * @param target - Window target (default '_blank')
 * @returns The window object or null if failed
 */
export function safeOpenUrl(urlString: string, target: string = '_blank'): Window | null {
  if (!urlString) {
    console.error('Cannot open empty URL');
    return null;
  }

  try {
    const normalizedUrl = normalizeUrl(urlString);

    if (!isValidUrl(normalizedUrl)) {
      console.error('Invalid URL:', urlString);
      return null;
    }

    return window.open(normalizedUrl, target, 'noopener,noreferrer');
  } catch (error) {
    console.error('Error opening URL:', error);
    return null;
  }
}

/**
 * Extracts the hostname from a URL for favicon fetching
 * Handles IDN (Internationalized Domain Names) with Greek letters
 * @param urlString - The URL string
 * @returns The hostname or empty string if invalid
 */
export function extractHostname(urlString: string): string {
  if (!urlString || urlString.trim() === '') {
    return '';
  }

  try {
    const url = new URL(urlString);
    return url.hostname;
  } catch {
    // Try adding protocol if missing
    if (!urlString.includes('://')) {
      try {
        const url = new URL('https://' + urlString);
        return url.hostname;
      } catch {
        return '';
      }
    }
    return '';
  }
}

/**
 * Generates a safe ID from a title that may contain Greek letters or special characters
 * @param title - The title to convert to an ID
 * @returns A safe ID string
 */
export function generateSafeId(title: string): string {
  if (!title) {
    return '';
  }

  return title
    .trim()
    // Replace forward slashes with hyphens (path separator)
    .replaceAll('/', '-')
    // Replace multiple spaces with single hyphen
    .replaceAll(/\s+/g, '-')
    // Remove special characters that could cause issues in paths/URLs
    // Keep: letters (including Greek), numbers, hyphens, underscores
    .replaceAll(/[^\p{L}\p{N}\-_]/gu, '-')
    // Replace multiple hyphens with single hyphen
    .replaceAll(/-+/g, '-')
    // Remove leading/trailing hyphens
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

/**
 * Gets the favicon URL for a given website URL
 * @param urlString - The URL of the website
 * @param size - The size of the favicon (default 128)
 * @returns The Google favicon service URL
 */
export function getFaviconUrl(urlString: string, size: number = 128): string {
  const hostname = extractHostname(urlString);

  if (!hostname) {
    return '';
  }

  // Google's favicon service handles IDN domains automatically
  return `https://www.google.com/s2/favicons?sz=${size}&domain=${encodeURIComponent(hostname)}`;
}
