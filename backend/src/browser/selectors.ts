export const INTERACTIVE_SELECTORS = [
  'button',
  'a[href]',
  'input',
  'select',
  'textarea',
  '[role="button"]',
  '[role="link"]',
  '[onclick]',
];

export function getUniqueSelector(el: any): string {
  const id = el.getAttribute('id');
  if (id) {
    return `${el.tagName.toLowerCase()}#${id}`;
  }

  const dataTestid = el.getAttribute('data-testid');
  if (dataTestid) {
    return `${el.tagName.toLowerCase()}[data-testid="${dataTestid}"]`;
  }

  const tagName = el.tagName.toLowerCase();

  const name = el.getAttribute('name');
  if (name) {
    return `${tagName}[name="${name}"]`;
  }

  const href = el.getAttribute('href');
  if (href) {
    return `${tagName}[href="${href}"]`;
  }

  const textContent = el.textContent?.trim();
  if (textContent) {
    return `${tagName}:has-text("${textContent}")`;
  }

  return '';
}

export function getElementAttributes(el: any): Record<string, string> {
  const attrs: Record<string, string> = {};
  for (let i = 0; i < el.attributes.length; i++) {
    const attr = el.attributes[i];
    if (attr) {
      attrs[attr.name] = attr.value;
    }
  }
  return attrs;
}
