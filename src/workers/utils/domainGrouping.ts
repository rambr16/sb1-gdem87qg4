import { cleanDomain } from './domainCleaner';

interface Contact {
  email: string;
  fullName: string;
  originalIndex: number;
  domain: string;
}

function isGenericEmail(email: string): boolean {
  const genericPrefixes = [
    'info', 'contact', 'sales', 'support', 'admin', 'hello', 'office',
    'marketing', 'help', 'service', 'enquiry', 'enquiries', 'general'
  ];
  const prefix = email.split('@')[0].toLowerCase();
  return genericPrefixes.some(p => prefix.includes(p));
}

function getValidFullName(row: any): string | null {
  const fullName = row.fullName?.trim() || 
    (row.firstName && row.lastName ? `${row.firstName} ${row.lastName}`.trim() : null) ||
    (row.first_name && row.last_name ? `${row.first_name} ${row.last_name}`.trim() : null);
  
  return fullName && fullName.length >= 3 ? fullName : null;
}

export function assignAlternateContacts(data: any[]): void {
  // Reset existing other_dm_name values
  data.forEach(row => row.other_dm_name = undefined);
  
  // Group contacts by domain
  const domainGroups = new Map<string, Contact[]>();
  
  // First pass: Create domain groups
  data.forEach((row, index) => {
    if (!row.email?.includes('@')) return;
    
    const fullName = getValidFullName(row);
    if (!fullName) return;
    
    const domain = row.email.split('@')[1].toLowerCase();
    const isGeneric = isGenericEmail(row.email);
    
    // Skip generic emails for grouping
    if (isGeneric) return;
    
    // Get all possible domains for this contact
    const domains = new Set<string>();
    domains.add(domain);
    
    if (row.website) {
      const websiteDomain = cleanDomain(row.website);
      if (websiteDomain) domains.add(websiteDomain);
    }
    
    // Add to all relevant domain groups
    domains.forEach(d => {
      if (!domainGroups.has(d)) {
        domainGroups.set(d, []);
      }
      
      const group = domainGroups.get(d)!;
      if (!group.some(contact => contact.email === row.email)) {
        group.push({
          email: row.email,
          fullName,
          originalIndex: index,
          domain: d
        });
      }
    });
  });
  
  // Second pass: Assign other_dm_name
  domainGroups.forEach(contacts => {
    if (contacts.length < 2) return;
    
    contacts.forEach((contact, index) => {
      // Get next contact in the group (circular)
      const nextContact = contacts[(index + 1) % contacts.length];
      
      // Update the original row
      const originalRow = data[contact.originalIndex];
      if (originalRow) {
        originalRow.other_dm_name = nextContact.fullName;
      }
    });
  });
  
  // Ensure other_dm_name is preserved in the final data
  data.forEach(row => {
    if (!row.other_dm_name) {
      row.other_dm_name = null; // Ensure the column exists even if empty
    }
  });
}