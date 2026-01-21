import { describe, it, expect } from 'vitest';
import { parseLinkedInProfilePath } from './parseLinkedInProfilePath';

describe('parseLinkedInProfilePath', () => {
  describe('full LinkedIn URLs', () => {
    const cases: [string, string][] = [
      ['https://www.linkedin.com/in/john-doe', '/in/john-doe'],
      ['http://www.linkedin.com/in/john-doe', '/in/john-doe'],
      ['https://linkedin.com/in/jane-smith', '/in/jane-smith'],
      ['http://linkedin.com/in/jane-smith', '/in/jane-smith'],
      ['https://linkedin.com/in/user123/', '/in/user123'],
      ['https://linkedin.com/in/some-user?utm_source=google', '/in/some-user'],
      ['https://linkedin.com/in/another-user#section', '/in/another-user'],
      ['https://linkedin.com//in/user', '/in/user'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('URLs without scheme', () => {
    const cases: [string, string][] = [
      ['www.linkedin.com/in/myprofile', '/in/myprofile'],
      ['linkedin.com/in/myprofile', '/in/myprofile'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('LinkedIn subdomains', () => {
    const cases: [string, string][] = [
      ['https://cz.linkedin.com/in/czech-user', '/in/czech-user'],
      ['https://m.linkedin.com/in/mobile-user', '/in/mobile-user'],
      ['https://mobile.linkedin.com/in/another-mobile', '/in/another-mobile'],
      ['cz.linkedin.com/in/handle', '/in/handle'],
      ['fr.linkedin.com/in/handle', '/in/handle'],
      ['de.linkedin.com/in/handle', '/in/handle'],
      ['m.linkedin.com/in/handle', '/in/handle'],
      ['mobile.linkedin.com/in/handle', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('path-only forms', () => {
    const cases: [string, string][] = [
      ['in/john-doe', '/in/john-doe'],
      ['/in/jane-smith', '/in/jane-smith'],
      ['IN/handle', '/in/handle'],
      ['/IN/handle', '/in/handle'],
      ['In/mixedcase', '/in/mixedcase'],
      ['iN/weirdcase', '/in/weirdcase'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('arbitrary text containing profile path', () => {
    const cases: [string, string][] = [
      ['Check out my profile at in/cool-person please!', '/in/cool-person'],
      ['Contact me: https://linkedin.com/in/business-guy — thanks!', '/in/business-guy'],
      ['text in/handle text', '/in/handle'],
      ['prefix/in/handle', '/in/handle'],
      ['<https://www.linkedin.com/in/handle>', '/in/handle'],
      ['(https://www.linkedin.com/in/handle)', '/in/handle'],
      ['https://www.linkedin.com/in/handle).', '/in/handle'],
      [' https://www.linkedin.com/in/handle ', '/in/handle'],
      ['https://www.linkedin.com/in/handle,', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('in/ appearing inside another word', () => {
    const cases: [string, string][] = [
      ['limpin/boo', '/in/boo'],
      ['somethingin/handle', '/in/handle'],
      ['origin/handle', '/in/handle'],
      ['begin/handle', '/in/handle'],
      ['linkin/handle', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('trailing slashes and separators', () => {
    const cases: [string, string][] = [
      ['linkedin.com/in/handle/', '/in/handle'],
      ['linkedin.com/in/handle////', '/in/handle'],
      ['in/user/extra', '/in/user'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('query and fragment parameters', () => {
    const cases: [string, string][] = [
      ['linkedin.com/in/handle?trk=public_profile', '/in/handle'],
      ['linkedin.com/in/handle#experience', '/in/handle'],
      ['linkedin.com/in/handle/?originalSubdomain=cz', '/in/handle'],
      ['linkedin.com/in/handle?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base', '/in/handle'],
      ['in/handle?x=y', '/in/handle'],
      ['in/handle#frag', '/in/handle'],
      ['in/handle/?x=y', '/in/handle'],
      ['in/user?param=value', '/in/user'],
      ['in/user#anchor', '/in/user'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('extra path after handle', () => {
    const cases: [string, string][] = [
      ['linkedin.com/in/handle/details/experience', '/in/handle'],
      ['linkedin.com/in/handle/recent-activity/all/', '/in/handle'],
      ['linkedin.com/in/handle/overlay/contact-info/', '/in/handle'],
      ['text in/名字/extra/path', '/in/名字'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('multiple matches picks first', () => {
    const cases: [string, string][] = [
      ['in/first-user and in/second-user', '/in/first-user'],
      ['foo in/first bar in/second', '/in/first'],
      ['in/one in/two', '/in/one'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('handle terminators', () => {
    const cases: [string, string][] = [
      ['in/user is here', '/in/user'],
      ['in/user\\path', '/in/user'],
      ['(see in/user)', '/in/user'],
      ['[in/user]', '/in/user'],
      ['<in/user>', '/in/user'],
      ['in/user.', '/in/user'],
      ['in/user, another', '/in/user'],
      ['in/user…more', '/in/user'],
      ['in/user—dash', '/in/user'],
      ['in/user–endash', '/in/user'],
      ['in/user·dot', '/in/user'],
      ['in/user\tnext', '/in/user'],
      ['in/user\nnext', '/in/user'],
      ['text in/handle))))', '/in/handle'],
      ['text in/handle\\more', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('non-ASCII punctuation ends handle', () => {
    const cases: [string, string][] = [
      ['Text: in/handle…', '/in/handle'],
      ['Text: in/handle—more', '/in/handle'],
      ['Text: in/handle–more', '/in/handle'],
      ['in/handle·middle', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('characters that stop handle parsing', () => {
    const cases: [string, string][] = [
      ['in/john.doe', '/in/john'],
      ['in/john doe', '/in/john'],
      ['in/handle.', '/in/handle'],
      ['in/handle..', '/in/handle'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('valid handle characters', () => {
    const cases: [string, string][] = [
      ['in/handle--with--dashes', '/in/handle--with--dashes'],
      ['in/-', '/in/-'],
      ['in/123456789', '/in/123456789'],
      ['in/John-DOE', '/in/John-DOE'],
      ['in/john_doe', '/in/john_doe'],
      ['in/user_name_123', '/in/user_name_123'],
      ['in/_underscore_', '/in/_underscore_'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('Unicode handles', () => {
    const cases: [string, string][] = [
      ['in/český-uživatel', '/in/český-uživatel'],
      ['in/josé-garcía', '/in/josé-garcía'],
      ['in/Łukasz-Żółć', '/in/Łukasz-Żółć'],
      ['in/İstanbul-ş', '/in/İstanbul-ş'],
      ['in/Živjo', '/in/Živjo'],
      ['in/名字', '/in/名字'],
      ['in/名-字', '/in/名-字'],
      ['in/ユーザー名', '/in/ユーザー名'],
      ['in/사용자', '/in/사용자'],
      ['in/пользователь', '/in/пользователь'],
      ['in/علي-بن-أحمد', '/in/علي-بن-أحمد'],
      ['in/john-doe-名字', '/in/john-doe-名字'],
      ['text in/č-ž-ř-ď-ť-ň?x=y', '/in/č-ž-ř-ď-ť-ň'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('percent-encoded handles', () => {
    const cases: [string, string][] = [
      ['in/john%2Ddoe', '/in/john-doe'],
      ['in/%C4%8Desk%C3%BD', '/in/český'],
      ['in/%C4%8Desk%C3%BD-u%C5%BEivatel', '/in/český-uživatel'],
      ['https://www.linkedin.com/in/jos%C3%A9-garc%C3%ADa', '/in/josé-garcía'],
      ['https://www.linkedin.com/in/%C5%A1t%C4%9Bp%C3%A1n-%C5%99eh%C3%A1k-988589206/', '/in/štěpán-řehák-988589206'],
      ['text in/%E5%90%8D%E5%AD%97 more', '/in/名字'],
      ['random IN/%C5%BDlu%C5%A5ou%C4%8Dk%C3%BD', '/in/Žluťoučký'],
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('percent-encoding edge cases', () => {
    const cases: [string, string | null][] = [
      ['in/user%GG', '/in/user'],   // invalid encoding, % stops extraction on original
      ['in/user%2', '/in/user'],    // incomplete encoding, % stops extraction on original
      ['in/%FF%FE', null],          // invalid UTF-8 sequence, decode fails, no in/ in original
      // Decoded special chars act as delimiters (extracts valid prefix)
      ['in/handle%20with%20spaces', '/in/handle'], // %20 = space
      ['in/user%2Fname', '/in/user'],              // %2F = /
      ['in/user%40name', '/in/user'],              // %40 = @
      ['in/user%3Fname', '/in/user'],              // %3F = ?
      ['in/hello%23world', '/in/hello'],           // %23 = #
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('empty handle rejection', () => {
    const cases: [string, null][] = [
      ['in/', null],
      ['in/?', null],
      ['in/ space', null],
      ['linkedin.com/in', null],
      ['linkedin.com/in?x=y', null],
      ['linkedin.com/in#frag', null],
      ['in/?trk=public_profile', null],
      ['in/#frag', null],
      ['text in/ more', null],
      ['text in/?x=y', null],
      ['text in/#frag', null],
      ['text in/, next', null],
      ['text in/) end', null],
      ['text in/> end', null],
    ];

    it.each(cases)('%s → null', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('no valid profile path', () => {
    const cases: [string, null][] = [
      ['', null],
      ['   ', null],
      ['<>', null],
      ['Hello, world!', null],
      ['I am in love', null],
      ['https://google.com/search', null],
      ['in', null],
      ['IN', null],
      ['in\\handle', null],
      ['in:handle', null],
      ['in|handle', null],
    ];

    it.each(cases)('%s → null', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });

  describe('input length limits', () => {
    const cases: [string, string | null][] = [
      ['in/' + 'a'.repeat(100), '/in/' + 'a'.repeat(100)],
      ['in/' + 'a'.repeat(2000), '/in/' + 'a'.repeat(2000)],
      ['a'.repeat(2048), null], // no in/ but at limit
      ['a'.repeat(2049), null], // over limit, rejected early
    ];

    it.each(cases)('%s → %s', (input, expected) => {
      expect(parseLinkedInProfilePath(input)).toBe(expected);
    });
  });
});
