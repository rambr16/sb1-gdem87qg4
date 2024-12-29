import { checkMXProvider } from './utils/mxProvider';
import { processEmailColumns } from './utils/emailProcessor';
import { assignAlternateContacts } from './utils/domainGrouping';
import { cleanCSVData } from './utils/csvCleaner';

async function processData(data: any[]): Promise<any[]> {
  if (!Array.isArray(data) || data.length === 0) {
    throw new Error('Invalid CSV data');
  }

  try {
    self.postMessage({ type: 'progress', progress: 10, stage: 'Analyzing CSV structure...' });
    
    const hasMultipleEmailColumns = 'email_1' in data[0];
    let processedData = hasMultipleEmailColumns
      ? data.flatMap(processEmailColumns)
      : data.map(row => ({
          email: row.email,
          fullName: row.full_name || row.fullName,
          firstName: row.first_name || row.firstName,
          lastName: row.last_name || row.lastName,
          title: row.title,
          phone: row.phone,
          website: row.website,
          ...row
        }));

    self.postMessage({ type: 'progress', progress: 30, stage: 'Cleaning data...' });
    processedData = cleanCSVData(processedData);

    self.postMessage({ type: 'progress', progress: 40, stage: 'Removing duplicates...' });
    
    // Remove duplicates
    const uniqueEmails = new Set();
    processedData = processedData.filter(row => {
      if (!row.email?.trim()) return false;
      const email = row.email.toLowerCase().trim();
      if (uniqueEmails.has(email)) return false;
      uniqueEmails.add(email);
      return true;
    });

    self.postMessage({ type: 'progress', progress: 50, stage: 'Processing MX records...' });
    
    // Process in batches of 10 for better performance
    const batchSize = 10;
    const domainCache = new Map();
    
    for (let i = 0; i < processedData.length; i += batchSize) {
      const batch = processedData.slice(i, i + batchSize);
      
      await Promise.all(batch.map(async row => {
        const domain = row.email.split('@')[1];
        if (!domainCache.has(domain)) {
          domainCache.set(domain, await checkMXProvider(domain));
        }
        row.mxProvider = domainCache.get(domain);
      }));
      
      const progress = 50 + (i / processedData.length) * 40;
      self.postMessage({ 
        type: 'progress',
        progress,
        stage: `Processing MX records (${i + batch.length}/${processedData.length})...`
      });
    }

    self.postMessage({ type: 'progress', progress: 90, stage: 'Assigning alternate contacts...' });
    assignAlternateContacts(processedData);

    // Final cleanup to remove any unwanted columns
    processedData = cleanCSVData(processedData);

    return processedData;
  } catch (error) {
    throw new Error(`Processing failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

self.onmessage = async (e) => {
  try {
    const result = await processData(e.data);
    self.postMessage({
      type: 'complete',
      data: result
    });
  } catch (error) {
    self.postMessage({
      type: 'error',
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }
};