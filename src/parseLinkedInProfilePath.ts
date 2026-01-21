/**
 * Parses messy user input and extracts a normalized LinkedIn profile path.
 * 
 * @param input - Messy user input (URLs, paths, or text containing a LinkedIn profile path)
 * @returns Normalized profile path as "/in/<handle>" or null if no valid path found
 */
export function parseLinkedInProfilePath(input: string): `/in/${string}` | null {
  // Find the first occurrence of "in/" (case-insensitive)
  const lowerInput = input.toLowerCase();
  const inIndex = lowerInput.indexOf('in/');
  
  if (inIndex === -1) {
    return null;
  }

  // Start scanning the handle from after "in/"
  const startIndex = inIndex + 3; // length of "in/"
  
  // Delimiters that terminate the handle
  const delimiters = new Set([
    '/', '?', '#', '\\',           // URL/path delimiters
    ')', ']', '>',                 // closing brackets
    '.', ',', '…', '—', '–', '·',  // punctuation
  ]);
  
  let handle = '';
  let i = startIndex;
  
  while (i < input.length) {
    const char = input[i];
    
    // Check for whitespace
    if (/\s/.test(char)) {
      break;
    }
    
    // Check for delimiters
    if (delimiters.has(char)) {
      break;
    }
    
    // Check for percent-encoding (%XX)
    if (char === '%') {
      if (i + 2 < input.length && /^[0-9A-Fa-f]{2}$/.test(input.slice(i + 1, i + 3))) {
        handle += input.slice(i, i + 3);
        i += 3;
        continue;
      } else {
        // Invalid percent encoding - treat as delimiter
        break;
      }
    }
    
    // Check if it's a valid handle character:
    // - Unicode letters (\p{L})
    // - Unicode marks (\p{M})
    // - Unicode numbers (\p{N})
    // - ASCII hyphen (-)
    if (/[\p{L}\p{M}\p{N}\-]/u.test(char)) {
      handle += char;
      i++;
      continue;
    }
    
    // Any other character is a delimiter
    break;
  }
  
  // Reject empty handle
  if (handle === '') {
    return null;
  }
  
  // If handle contains %, try to decode URI components
  if (handle.includes('%')) {
    try {
      handle = decodeURIComponent(handle);
    } catch {
      // Decoding failed - invalid percent encoding
      return null;
    }
  }
  
  return `/in/${handle}` as `/in/${string}`;
}
