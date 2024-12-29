interface EmailRow {
  email: string;
  fullName?: string;
  firstName?: string;
  lastName?: string;
  title?: string;
  phone?: string;
  [key: string]: any;
}

export function processEmailColumns(row: any): EmailRow[] {
  const results: EmailRow[] = [];
  const commonData = { ...row };
  
  // Remove email columns from common data
  for (let i = 1; i <= 3; i++) {
    delete commonData[`email_${i}`];
    delete commonData[`email_${i}_full_name`];
    delete commonData[`email_${i}_first_name`];
    delete commonData[`email_${i}_last_name`];
    delete commonData[`email_${i}_title`];
    delete commonData[`email_${i}_phone`];
  }
  
  for (let i = 1; i <= 3; i++) {
    const email = row[`email_${i}`];
    if (email?.trim()) {
      results.push({
        email: email.trim(),
        fullName: row[`email_${i}_full_name`],
        firstName: row[`email_${i}_first_name`],
        lastName: row[`email_${i}_last_name`],
        title: row[`email_${i}_title`],
        phone: row[`email_${i}_phone`],
        ...commonData
      });
    }
  }
  
  return results;
}