import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'
import { sanitizeDescription } from './sanitize'

describe('sanitizeDescription', () => {
  it('removes script tags and their content', () => {
    const out = sanitizeDescription('<p>Hi</p><script>alert(1)</script>')
    expect(out).toBe('<p>Hi</p>')
    expect(out).not.toContain('alert(1)')
  })

  it('strips event-handler attributes', () => {
    expect(sanitizeDescription('<p onclick="x()">Hi</p>')).toBe('<p>Hi</p>')
  })

  it('drops javascript: hrefs', () => {
    const out = sanitizeDescription('<a href="javascript:alert(1)">x</a>')
    expect(out).not.toContain('href')
    expect(out).not.toContain('javascript')
    expect(out).toContain('x')
  })

  it('drops protocol-relative hrefs', () => {
    expect(sanitizeDescription('<a href="//evil.com">x</a>')).not.toContain('href')
  })

  it('removes style blocks', () => {
    const out = sanitizeDescription('<p>Hi</p><style>p{}</style>')
    expect(out).toBe('<p>Hi</p>')
  })

  it('keeps https href and forces rel', () => {
    const out = sanitizeDescription('<a href="https://saatva.com" target="_blank">x</a>')
    expect(out).toContain('href="https://saatva.com"')
    expect(out).toContain('rel="noopener noreferrer"')
    expect(out).not.toContain('target')
  })

  it('keeps mailto and overrides provided rel', () => {
    const out = sanitizeDescription('<a href="mailto:a@b.com" rel="opener">x</a>')
    expect(out).toContain('href="mailto:a@b.com"')
    expect(out).toContain('rel="noopener noreferrer"')
    expect(out).not.toContain('opener"')
  })

  it('keeps allowed tags', () => {
    const html = '<p><strong>a</strong><em>b</em><b>c</b><i>d</i><br /></p><ul><li>x</li></ul><ol><li>y</li></ol>'
    expect(sanitizeDescription(html)).toBe(html)
  })

  it('strips disallowed tags', () => {
    expect(sanitizeDescription('<p>a<img src="x" onerror="y()">b</p>')).toBe('<p>ab</p>')
    expect(sanitizeDescription('<p>a</p><iframe src="https://x.com"></iframe>')).toBe('<p>a</p>')
    expect(sanitizeDescription('<div>text</div>')).toBe('text')
  })

  it('passes the real upstream descriptions through unchanged', () => {
    const file = resolve(__dirname, '../../../../services/upstream/data/content-products.json')
    const items = JSON.parse(readFileSync(file, 'utf8')) as { handle: string; descriptionHtml: string }[]
    const wanted = ['saatva-classic', 'loom-and-leaf', 'Zenhaven']
    for (const handle of wanted) {
      const item = items.find((i) => i.handle === handle)
      expect(item, handle).toBeDefined()
      expect(sanitizeDescription(item!.descriptionHtml)).toBe(item!.descriptionHtml)
    }
  })

  it('returns null for only-disallowed markup', () => {
    expect(sanitizeDescription('<script>x</script>')).toBeNull()
    expect(sanitizeDescription('<style>p{}</style>  ')).toBeNull()
  })

  it('returns null for null, undefined and empty input', () => {
    expect(sanitizeDescription(null)).toBeNull()
    expect(sanitizeDescription(undefined)).toBeNull()
    expect(sanitizeDescription('')).toBeNull()
    expect(sanitizeDescription('   ')).toBeNull()
  })
})
