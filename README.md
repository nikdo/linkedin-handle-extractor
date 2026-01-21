# linkedin-handle-extractor

Extract normalized LinkedIn profile paths from messy user input.

## Install

```bash
npm install linkedin-handle-extractor
```

## Usage

```ts
import { parseLinkedInProfilePath } from 'linkedin-handle-extractor';

parseLinkedInProfilePath('https://www.linkedin.com/in/john-doe?utm=123');
// → '/in/john-doe'

parseLinkedInProfilePath('Check my profile: in/jane-smith');
// → '/in/jane-smith'

parseLinkedInProfilePath('invalid input');
// → null
```

## Features

- Handles full URLs, paths, and embedded text
- Supports Unicode handles and percent-encoding
- Case-insensitive `in/` matching
- Returns `null` for invalid input

## Demo

Open `index.html` in a browser (requires `npm run build` first).

## License

MIT
