import { Expense } from '../types';
import { bubbleSortExpenses } from './sorting';

/**
 * Exports expenses to an RFC 4180-compliant CSV file with each item
 * positioned in its own column and individual line, sorted via Bubble Sort.
 * 
 * Includes the UTF-8 BOM (\uFEFF) to ensure Microsoft Excel and Windows
 * spreadsheet programs open columns distinctly without merging.
 */
export function exportExpensesToCSV(
  expenses: Expense[],
  sortBy: 'date' | 'amount' | 'title' | 'id' = 'date',
  order: 'asc' | 'desc' = 'desc',
  filename?: string
): void {
  if (!expenses || expenses.length === 0) {
    alert('No expense items to export.');
    return;
  }

  // 1. Sort records using the Bubble Sort algorithm
  const sortedExpenses = bubbleSortExpenses(expenses, sortBy, order);

  // 2. Define clear CSV column headers
  const headers = [
    'Transaction ID',
    'Date',
    'Item Description',
    'Category',
    'Amount (ZAR)',
    'Payment Method',
    'Notes',
  ];

  // 3. Format each expense into its own row and distinct columns
  const escapeCell = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const rows = sortedExpenses.map((exp) => [
    escapeCell(exp.id),
    escapeCell(exp.date),
    escapeCell(exp.title),
    escapeCell(exp.category_name),
    escapeCell(Number(exp.amount).toFixed(2)),
    escapeCell(exp.payment_method || 'Cash'),
    escapeCell(exp.notes || ''),
  ]);

  // 4. Calculate total for the summary row
  const totalAmount = sortedExpenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const summaryRow = [
    escapeCell('TOTAL'),
    escapeCell(''),
    escapeCell(`Total ${sortedExpenses.length} Items`),
    escapeCell(''),
    escapeCell(totalAmount.toFixed(2)),
    escapeCell(''),
    escapeCell(`Sorted by Bubble Sort (${sortBy.toUpperCase()} ${order.toUpperCase()})`),
  ];

  // 5. Assemble CSV with CRLF line breaks for universal Windows/Excel compatibility
  const headerLine = headers.map(escapeCell).join(',');
  const dataLines = rows.map((r) => r.join(',')).join('\r\n');
  const summaryLine = summaryRow.join(',');

  const csvContent =
    '\uFEFF' + // UTF-8 Byte Order Mark (BOM) for Excel
    headerLine +
    '\r\n' +
    dataLines +
    '\r\n' +
    summaryLine +
    '\r\n';

  // 6. Trigger client download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  const targetName =
    filename ||
    `student_expenses_bubble_sorted_${new Date().toISOString().slice(0, 10)}.csv`;

  link.setAttribute('href', url);
  link.setAttribute('download', targetName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

