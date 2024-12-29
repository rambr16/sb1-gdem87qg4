export async function checkMXProvider(domain: string): Promise<string> {
  try {
    const response = await fetch(`https://dns.google/resolve?name=${domain}&type=mx`);
    if (!response.ok) {
      throw new Error('MX lookup failed');
    }
    
    const data = await response.json();
    
    if (data.Answer) {
      const mxRecord = data.Answer[0].data.toLowerCase();
      if (mxRecord.includes('google') || mxRecord.includes('gmail')) return 'google';
      if (mxRecord.includes('outlook') || mxRecord.includes('microsoft')) return 'outlook';
      return 'others';
    }
    return 'unknown';
  } catch {
    return 'unknown';
  }
}