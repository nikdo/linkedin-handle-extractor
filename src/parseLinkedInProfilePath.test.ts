import { describe, it, expect } from 'vitest';
import { parseLinkedInProfilePath } from './parseLinkedInProfilePath';

describe('parseLinkedInProfilePath', () => {
  describe('full LinkedIn URLs', () => {
    it('parses https URL', () => {
      expect(parseLinkedInProfilePath('https://www.linkedin.com/in/john-doe')).toBe('/in/john-doe');
    });

    it('parses http URL', () => {
      expect(parseLinkedInProfilePath('http://linkedin.com/in/jane-smith')).toBe('/in/jane-smith');
    });

    it('parses URL with trailing slash', () => {
      expect(parseLinkedInProfilePath('https://linkedin.com/in/user123/')).toBe('/in/user123');
    });

    it('parses URL with query params', () => {
      expect(parseLinkedInProfilePath('https://linkedin.com/in/some-user?utm_source=google')).toBe('/in/some-user');
    });

    it('parses URL with hash', () => {
      expect(parseLinkedInProfilePath('https://linkedin.com/in/another-user#section')).toBe('/in/another-user');
    });
  });

  describe('URLs without scheme', () => {
    it('parses www.linkedin.com', () => {
      expect(parseLinkedInProfilePath('www.linkedin.com/in/myprofile')).toBe('/in/myprofile');
    });

    it('parses linkedin.com', () => {
      expect(parseLinkedInProfilePath('linkedin.com/in/myprofile')).toBe('/in/myprofile');
    });
  });

  describe('LinkedIn subdomains', () => {
    it('parses cz.linkedin.com', () => {
      expect(parseLinkedInProfilePath('https://cz.linkedin.com/in/czech-user')).toBe('/in/czech-user');
    });

    it('parses m.linkedin.com', () => {
      expect(parseLinkedInProfilePath('https://m.linkedin.com/in/mobile-user')).toBe('/in/mobile-user');
    });

    it('parses mobile.linkedin.com', () => {
      expect(parseLinkedInProfilePath('https://mobile.linkedin.com/in/another-mobile')).toBe('/in/another-mobile');
    });
  });

  describe('path-only forms', () => {
    it('parses in/handle', () => {
      expect(parseLinkedInProfilePath('in/john-doe')).toBe('/in/john-doe');
    });

    it('parses /in/handle', () => {
      expect(parseLinkedInProfilePath('/in/jane-smith')).toBe('/in/jane-smith');
    });
  });

  describe('arbitrary text containing profile path', () => {
    it('extracts profile path from text', () => {
      expect(parseLinkedInProfilePath('Check out my profile at in/cool-person please!')).toBe('/in/cool-person');
    });

    it('handles text with URL embedded', () => {
      expect(parseLinkedInProfilePath('Contact me: https://linkedin.com/in/business-guy — thanks!')).toBe('/in/business-guy');
    });

    it('extracts first occurrence', () => {
      expect(parseLinkedInProfilePath('in/first-user and in/second-user')).toBe('/in/first-user');
    });
  });

  describe('in/ appearing inside another word', () => {
    it('matches in/boo from limpin/boo', () => {
      expect(parseLinkedInProfilePath('limpin/boo')).toBe('/in/boo');
    });

    it('matches in/handle from somethingin/handle', () => {
      expect(parseLinkedInProfilePath('somethingin/handle')).toBe('/in/handle');
    });
  });

  describe('case insensitivity of in/', () => {
    it('handles IN/', () => {
      expect(parseLinkedInProfilePath('IN/uppercase')).toBe('/in/uppercase');
    });

    it('handles In/', () => {
      expect(parseLinkedInProfilePath('In/mixedcase')).toBe('/in/mixedcase');
    });

    it('handles iN/', () => {
      expect(parseLinkedInProfilePath('iN/weirdcase')).toBe('/in/weirdcase');
    });
  });

  describe('handle terminators', () => {
    it('stops at /', () => {
      expect(parseLinkedInProfilePath('in/user/extra')).toBe('/in/user');
    });

    it('stops at ?', () => {
      expect(parseLinkedInProfilePath('in/user?param=value')).toBe('/in/user');
    });

    it('stops at #', () => {
      expect(parseLinkedInProfilePath('in/user#anchor')).toBe('/in/user');
    });

    it('stops at whitespace', () => {
      expect(parseLinkedInProfilePath('in/user is here')).toBe('/in/user');
    });

    it('stops at backslash', () => {
      expect(parseLinkedInProfilePath('in/user\\path')).toBe('/in/user');
    });

    it('stops at )', () => {
      expect(parseLinkedInProfilePath('(see in/user)')).toBe('/in/user');
    });

    it('stops at ]', () => {
      expect(parseLinkedInProfilePath('[in/user]')).toBe('/in/user');
    });

    it('stops at >', () => {
      expect(parseLinkedInProfilePath('<in/user>')).toBe('/in/user');
    });

    it('stops at .', () => {
      expect(parseLinkedInProfilePath('in/user.')).toBe('/in/user');
    });

    it('stops at ,', () => {
      expect(parseLinkedInProfilePath('in/user, another')).toBe('/in/user');
    });

    it('stops at …', () => {
      expect(parseLinkedInProfilePath('in/user…more')).toBe('/in/user');
    });

    it('stops at —', () => {
      expect(parseLinkedInProfilePath('in/user—dash')).toBe('/in/user');
    });

    it('stops at –', () => {
      expect(parseLinkedInProfilePath('in/user–endash')).toBe('/in/user');
    });

    it('stops at ·', () => {
      expect(parseLinkedInProfilePath('in/user·dot')).toBe('/in/user');
    });
  });

  describe('Unicode support', () => {
    it('handles Czech characters', () => {
      expect(parseLinkedInProfilePath('in/český-uživatel')).toBe('/in/český-uživatel');
    });

    it('handles Chinese characters', () => {
      expect(parseLinkedInProfilePath('in/名字')).toBe('/in/名字');
    });

    it('handles Russian characters', () => {
      expect(parseLinkedInProfilePath('in/пользователь')).toBe('/in/пользователь');
    });

    it('handles Arabic characters', () => {
      expect(parseLinkedInProfilePath('in/علي-بن-أحمد')).toBe('/in/علي-بن-أحمد');
    });

    it('handles mixed Unicode and ASCII', () => {
      expect(parseLinkedInProfilePath('in/john-doe-名字')).toBe('/in/john-doe-名字');
    });
  });

  describe('percent-encoding', () => {
    it('decodes percent-encoded handle', () => {
      expect(parseLinkedInProfilePath('in/john%2Ddoe')).toBe('/in/john-doe');
    });

    it('decodes unicode percent-encoding', () => {
      // %C4%8D is the UTF-8 encoding of č
      expect(parseLinkedInProfilePath('in/%C4%8Desk%C3%BD')).toBe('/in/český');
    });

    it('handles mixed encoded and plain characters', () => {
      expect(parseLinkedInProfilePath('in/user%40name')).toBe('/in/user@name');
    });

    it('stops at invalid percent-encoding', () => {
      // %GG is not valid hex, so % acts as a terminator
      expect(parseLinkedInProfilePath('in/user%GG')).toBe('/in/user');
    });

    it('stops at incomplete percent-encoding', () => {
      // %2 at end is incomplete, so % acts as a terminator
      expect(parseLinkedInProfilePath('in/user%2')).toBe('/in/user');
    });

    it('returns null for malformed UTF-8 in percent-encoding', () => {
      // %FF%FE is not valid UTF-8
      expect(parseLinkedInProfilePath('in/%FF%FE')).toBe(null);
    });
  });

  describe('empty handle rejection', () => {
    it('returns null for in/ at end of string', () => {
      expect(parseLinkedInProfilePath('in/')).toBe(null);
    });

    it('returns null for in/ followed by delimiter', () => {
      expect(parseLinkedInProfilePath('in/?')).toBe(null);
    });

    it('returns null for in/ followed by whitespace', () => {
      expect(parseLinkedInProfilePath('in/ space')).toBe(null);
    });
  });

  describe('no valid profile path', () => {
    it('returns null for empty string', () => {
      expect(parseLinkedInProfilePath('')).toBe(null);
    });

    it('returns null for unrelated text', () => {
      expect(parseLinkedInProfilePath('Hello, world!')).toBe(null);
    });

    it('returns null for in without slash', () => {
      expect(parseLinkedInProfilePath('I am in love')).toBe(null);
    });

    it('returns null for random URL', () => {
      expect(parseLinkedInProfilePath('https://google.com/search')).toBe(null);
    });
  });

  describe('edge cases', () => {
    it('handles multiple slashes before in/', () => {
      expect(parseLinkedInProfilePath('https://linkedin.com//in/user')).toBe('/in/user');
    });

    it('handles tab character as whitespace', () => {
      expect(parseLinkedInProfilePath('in/user\tnext')).toBe('/in/user');
    });

    it('handles newline as whitespace', () => {
      expect(parseLinkedInProfilePath('in/user\nnext')).toBe('/in/user');
    });

    it('handles hyphen-only handle', () => {
      expect(parseLinkedInProfilePath('in/-')).toBe('/in/-');
    });

    it('handles numeric handle', () => {
      expect(parseLinkedInProfilePath('in/123456789')).toBe('/in/123456789');
    });

    it('preserves case in handle', () => {
      expect(parseLinkedInProfilePath('in/John-DOE')).toBe('/in/John-DOE');
    });
  });

  describe('comprehensive test cases', () => {
    const cases = [
      // Canonical URLs
      { input: "https://www.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "http://www.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "https://linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "http://linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "www.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle", valid: true, handle: "handle" },

      // Subdomains
      { input: "cz.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "fr.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "de.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "m.linkedin.com/in/handle", valid: true, handle: "handle" },
      { input: "mobile.linkedin.com/in/handle", valid: true, handle: "handle" },

      // Trailing slash / separators
      { input: "linkedin.com/in/handle/", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle////", valid: true, handle: "handle" },

      // Query / fragment after handle
      { input: "linkedin.com/in/handle?trk=public_profile", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle#experience", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle/?originalSubdomain=cz", valid: true, handle: "handle" },
      {
        input: "linkedin.com/in/handle?lipi=urn%3Ali%3Apage%3Ad_flagship3_profile_view_base",
        valid: true,
        handle: "handle",
      },

      // Extra path after handle (ignored)
      { input: "linkedin.com/in/handle/details/experience", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle/recent-activity/all/", valid: true, handle: "handle" },
      { input: "linkedin.com/in/handle/overlay/contact-info/", valid: true, handle: "handle" },

      // Path-only shorthand
      { input: "in/handle", valid: true, handle: "handle" },
      { input: "/in/handle", valid: true, handle: "handle" },
      { input: "IN/handle", valid: true, handle: "handle" },
      { input: "/IN/handle", valid: true, handle: "handle" },

      // Extract from arbitrary text
      { input: "text in/handle text", valid: true, handle: "handle" },
      { input: "prefix/in/handle", valid: true, handle: "handle" },
      { input: "<https://www.linkedin.com/in/handle>", valid: true, handle: "handle" },
      { input: "(https://www.linkedin.com/in/handle)", valid: true, handle: "handle" },
      { input: "https://www.linkedin.com/in/handle).", valid: true, handle: "handle" },
      { input: " https://www.linkedin.com/in/handle ", valid: true, handle: "handle" },
      { input: "https://www.linkedin.com/in/handle,", valid: true, handle: "handle" },

      // Query/fragment in shorthand
      { input: "in/handle?x=y", valid: true, handle: "handle" },
      { input: "in/handle#frag", valid: true, handle: "handle" },
      { input: "in/handle/?x=y", valid: true, handle: "handle" },

      // Multiple matches: pick first
      { input: "foo in/first bar in/second", valid: true, handle: "first" },
      { input: "in/one in/two", valid: true, handle: "one" },

      // Unicode handles
      { input: "in/český-uživatel", valid: true, handle: "český-uživatel" },
      { input: "in/josé-garcía", valid: true, handle: "josé-garcía" },
      { input: "in/Łukasz-Żółć", valid: true, handle: "Łukasz-Żółć" },
      { input: "in/İstanbul-ş", valid: true, handle: "İstanbul-ş" },
      { input: "in/Živjo", valid: true, handle: "Živjo" },
      { input: "in/名字", valid: true, handle: "名字" },
      { input: "in/名-字", valid: true, handle: "名-字" },
      { input: "in/ユーザー名", valid: true, handle: "ユーザー名" },
      { input: "in/사용자", valid: true, handle: "사용자" },
      { input: "in/пользователь", valid: true, handle: "пользователь" },
      { input: "in/علي-بن-أحمد", valid: true, handle: "علي-بن-أحمد" },

      // Percent-encoded handles (decode recommended)
      { input: "in/%C4%8Desk%C3%BD-u%C5%BEivatel", valid: true, handle: "český-uživatel" },
      { input: "https://www.linkedin.com/in/jos%C3%A9-garc%C3%ADa", valid: true, handle: "josé-garcía" },
      { input: "https://www.linkedin.com/in/%C5%A1t%C4%9Bp%C3%A1n-%C5%99eh%C3%A1k-988589206/", valid: true, handle: "štěpán-řehák-988589206" },
      { input: "text in/%E5%90%8D%E5%AD%97 more", valid: true, handle: "名字" },
      { input: "in/handle%20with%20spaces", valid: true, handle: "handle with spaces" },

      // Non-ASCII punctuation ends handle
      { input: "Text: in/handle…", valid: true, handle: "handle" },
      { input: "Text: in/handle—more", valid: true, handle: "handle" },
      { input: "Text: in/handle–more", valid: true, handle: "handle" },
      { input: "in/handle·middle", valid: true, handle: "handle" },

      // Characters not allowed inside handle: stop at delimiter
      { input: "in/handle--with--dashes", valid: true, handle: "handle--with--dashes" },
      { input: "in/john.doe", valid: true, handle: "john" },
      { input: "in/john_doe", valid: true, handle: "john" },
      { input: "in/john doe", valid: true, handle: "john" },
      { input: "in/handle.", valid: true, handle: "handle" },
      { input: "in/handle..", valid: true, handle: "handle" },

      // Invalids
      { input: "in", valid: false, handle: null },
      { input: "IN", valid: false, handle: null },
      { input: "linkedin.com/in", valid: false, handle: null },
      { input: "linkedin.com/in?x=y", valid: false, handle: null },
      { input: "linkedin.com/in#frag", valid: false, handle: null },
      { input: "in/", valid: false, handle: null },
      { input: "in/ ", valid: false, handle: null },
      { input: "in/?trk=public_profile", valid: false, handle: null },
      { input: "in/#frag", valid: false, handle: null },
      { input: "text in/ more", valid: false, handle: null },
      { input: "text in/?x=y", valid: false, handle: null },
      { input: "text in/#frag", valid: false, handle: null },
      { input: "text in/, next", valid: false, handle: null },
      { input: "text in/) end", valid: false, handle: null },
      { input: "text in/> end", valid: false, handle: null },
      { input: "in\\handle", valid: false, handle: null },
      { input: "in:handle", valid: false, handle: null },
      { input: "in|handle", valid: false, handle: null },
      { input: "", valid: false, handle: null },
      { input: "   ", valid: false, handle: null },
      { input: "<>", valid: false, handle: null },
      // Note: current implementation matches "in/" anywhere, so these extract "handle"
      { input: "origin/handle", valid: true, handle: "handle" },
      { input: "begin/handle", valid: true, handle: "handle" },
      { input: "linkin/handle", valid: true, handle: "handle" },

      // More valids
      { input: "random IN/%C5%BDlu%C5%A5ou%C4%8Dk%C3%BD", valid: true, handle: "Žluťoučký" },
      { input: "text in/č-ž-ř-ď-ť-ň?x=y", valid: true, handle: "č-ž-ř-ď-ť-ň" },
      { input: "text in/名字/extra/path", valid: true, handle: "名字" },
      { input: "text in/handle))))", valid: true, handle: "handle" },
      { input: "text in/handle\\more", valid: true, handle: "handle" },
    ];

    describe('valid extraction', () => {
      it.each(cases)('$valid | $input', ({ input, valid }) => {
        const result = parseLinkedInProfilePath(input);
        expect(result !== null).toBe(valid);
      });
    });

    describe('handle extraction', () => {
      it.each(cases)('$handle | $input', ({ input, valid, handle }) => {
        const result = parseLinkedInProfilePath(input);
        if (!valid) {
          expect(result).toBeNull();
        } else {
          expect(result).toBe(`/in/${handle}`);
        }
      });
    });
  });
});
