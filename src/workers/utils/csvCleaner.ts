export function cleanCSVData(data: any[]): any[] {
  // Ensure these columns are always preserved
  const preservedColumns = [
    'email',
    'fullName',
    'firstName',
    'lastName',
    'title',
    'phone',
    'mxProvider',
    'other_dm_name',
    'website',
    'company',
    'department'
  ];

  return data.map(row => {
    const cleanRow: any = {};
    
    // First, preserve our known good columns
    preservedColumns.forEach(col => {
      if (row[col] !== undefined) {
        cleanRow[col] = row[col];
      }
    });

    // Then add any other non-dummy columns with values
    Object.entries(row).forEach(([key, value]) => {
      if (
        !preservedColumns.includes(key) && // Skip already processed columns
        !key.match(/_\d+$/) && // Skip columns ending with _1, _2, etc.
        !key.match(/^\d+$/) && // Skip columns that are just numbers
        value !== null &&
        value !== undefined &&
        value !== ''
      ) {
        cleanRow[key] = value;
      }
    });

    return cleanRow;
  });
}