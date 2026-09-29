/**
 * Converts an array of objects to CSV format and triggers browser download
 */
export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  rows: T[],
  columns: { header: string; key: keyof T | ((row: T) => any) }[]
) {
  if (!rows || rows.length === 0) {
    alert('No data to export.');
    return;
  }

  // Generate headers
  const headerRow = columns.map(c => `"${c.header.replace(/"/g, '""')}"`).join(',');

  // Generate data rows
  const dataRows = rows.map(row => {
    return columns
      .map(col => {
        let val: any;
        if (typeof col.key === 'function') {
          val = col.key(row);
        } else {
          val = row[col.key];
        }
        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }
        return `"${val.replace(/"/g, '""')}"`;
      })
      .join(',');
  });

  const csvContent = [headerRow, ...dataRows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\.csv$/, '')}_${new Date().toISOString().slice(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
