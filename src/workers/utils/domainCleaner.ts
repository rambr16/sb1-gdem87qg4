export function cleanDomain(url: string): string | null {
  if (!url) return null;
  
  try {
    // Remove protocol and www
    let domain = url.toLowerCase()
      .replace(/^https?:\/\//i, '')
      .replace(/^www\./i, '');
    
    // Get the domain part only
    domain = domain.split('/')[0];
    
    // Basic domain validation
    if (domain.includes('.') && domain.length > 3) {
      return domain;
    }
    return null;
  } catch {
    return null;
  }
}