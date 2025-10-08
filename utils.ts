/**
 * Decodes HTML entities in a string (e.g., &amp; -> &).
 * This uses the browser's DOM parser for safe decoding.
 * @param text The string containing HTML entities.
 * @returns The decoded string.
 */
export const decodeHTMLEntities = (text: string): string => {
  if (typeof text !== 'string' || !text) return '';
  try {
    const parser = new DOMParser();
    const decodedString = parser.parseFromString(`<!doctype html><body>${text}`, 'text/html').body.textContent;
    return decodedString || '';
  } catch (error)
    {
    console.error("Failed to decode HTML entities:", error);
    return text; // Return original text on failure
  }
};
