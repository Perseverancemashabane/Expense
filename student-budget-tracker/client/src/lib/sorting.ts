import { Expense } from '../types';

/**
 * Classical Bubble Sort Algorithm for Expenses
 * 
 * Iteratively steps through the list, compares adjacent elements,
 * and swaps them if they are in the wrong order.
 * 
 * Time Complexity:
 *   - Worst case: O(n^2)
 *   - Best case: O(n) (with swapped optimization flag)
 *   - Average case: O(n^2)
 * Space Complexity: O(1) auxiliary space (in-place swapping on a cloned array)
 */
export function bubbleSortExpenses(
  items: Expense[],
  sortBy: 'date' | 'amount' | 'title' | 'id' = 'date',
  order: 'asc' | 'desc' = 'asc'
): Expense[] {
  const arr = [...items];
  const n = arr.length;
  let swapped: boolean;

  for (let i = 0; i < n - 1; i++) {
    swapped = false;
    for (let j = 0; j < n - i - 1; j++) {
      let shouldSwap = false;

      if (sortBy === 'amount') {
        shouldSwap =
          order === 'asc'
            ? Number(arr[j].amount) > Number(arr[j + 1].amount)
            : Number(arr[j].amount) < Number(arr[j + 1].amount);
      } else if (sortBy === 'title') {
        const cmp = arr[j].title.localeCompare(arr[j + 1].title);
        shouldSwap = order === 'asc' ? cmp > 0 : cmp < 0;
      } else if (sortBy === 'id') {
        shouldSwap =
          order === 'asc'
            ? arr[j].id > arr[j + 1].id
            : arr[j].id < arr[j + 1].id;
      } else {
        // Default: Sort by date
        const cmp = arr[j].date.localeCompare(arr[j + 1].date);
        shouldSwap = order === 'asc' ? cmp > 0 : cmp < 0;
      }

      if (shouldSwap) {
        // Swap adjacent elements
        const temp = arr[j];
        arr[j] = arr[j + 1];
        arr[j + 1] = temp;
        swapped = true;
      }
    }

    // Optimization: If no elements were swapped in this pass, the array is already sorted
    if (!swapped) break;
  }

  return arr;
}

