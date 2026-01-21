/**
 * Parses messy user input and extracts a normalized LinkedIn profile path.
 * 
 * @param input - Messy user input (URLs, paths, or text containing a LinkedIn profile path)
 * @returns Normalized profile path as "/in/<handle>" or null if no valid path found
 */
export function parseLinkedInProfilePath(input: string): `/in/${string}` | null {
  if (!input || input.length > 2048) {
    return null;
  }

  // Decode percent-encoding upfront (fall back to original if invalid)
  let decoded = input;
  try {
    decoded = decodeURIComponent(input);
  } catch {
    // Invalid encoding - use original input
  }

  const inIndex = decoded.toLowerCase().indexOf('in/');
  if (inIndex === -1) {
    return null;
  }

  // Delimiters that terminate handle extraction
  const delimiters = new Set([
    '/', '?', '#', '\\',           // URL/path delimiters
    ')', ']', '>',                 // closing brackets
    '.', ',', '…', '—', '–', '·',  // punctuation
  ]);

  // Extract handle - valid chars are Unicode letters, marks, numbers, hyphens, underscores
  let handle = '';
  for (let i = inIndex + 3; i < decoded.length; i++) {
    const char = decoded[i];
    
    if (/\s/.test(char) || delimiters.has(char)) break;
    if (!/[\p{L}\p{M}\p{N}\-_]/u.test(char)) break;
    
    handle += char;
  }
  
  return handle ? `/in/${handle.toLowerCase()}` as `/in/${string}` : null;
}
