import sanitizeHtml from 'sanitize-html'

// The provider documents this HTML as trusted; it's third-party, so we sanitize anyway.
const OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ['p', 'strong', 'em', 'b', 'i', 'ul', 'ol', 'li', 'br', 'a'],
  allowedAttributes: { a: ['href', 'rel'] },
  allowedSchemes: ['http', 'https', 'mailto'],
  allowedSchemesAppliedToAttributes: ['href'],
  allowProtocolRelative: false,
  disallowedTagsMode: 'discard',
  transformTags: {
    a: (tagName, attribs) => ({
      tagName,
      attribs: { ...(attribs.href !== undefined ? { href: attribs.href } : {}), rel: 'noopener noreferrer' },
    }),
  },
}

export function sanitizeDescription(html: string | null | undefined): string | null {
  if (!html) return null
  const clean = sanitizeHtml(html, OPTIONS).trim()
  return clean === '' ? null : clean
}
