import type { ReactNode } from "react";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Column<T> {
  key: keyof T | string;
  header: string;
  render?: (_item: T) => ReactNode;
  sortable?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  keyExtractor: (_item: T) => string;
  onSort?: (_key: keyof T) => void;
  sortKey?: keyof T;
  sortDirection?: "asc" | "desc";
  onRowClick?: (_item: T) => void;
}

export function DataTable<T>({ data, columns, keyExtractor, onSort, sortKey, sortDirection, onRowClick }: DataTableProps<T>) {
  return (
    <div className="card-base overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 dark:border-white/10 bg-gray-50/50 dark:bg-white/[0.02]">
              {columns.map((col) => (
                <th
                  key={String(col.key)}
                  onClick={() => col.sortable && onSort?.(col.key as keyof T)}
                  className={cn(
                    "px-5 py-3.5 text-left text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400",
                    col.sortable && "cursor-pointer select-none hover:text-gray-700 dark:hover:text-gray-200",
                    col.className
                  )}
                >
                  <span className="inline-flex items-center gap-1">
                    {col.header}
                    {col.sortable && (sortKey === col.key ? (sortDirection === "asc" ? <ArrowUp className="h-3 w-3" /> : <ArrowDown className="h-3 w-3" />) : <ArrowUpDown className="h-3 w-3 opacity-40" />)}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-white/5">
            {data.map((item) => (
              <tr
                key={keyExtractor(item)}
                onClick={() => onRowClick?.(item)}
                className={cn("hover:bg-gray-50/70 dark:hover:bg-white/[0.03] transition-colors", onRowClick && "cursor-pointer")}
              >
                {columns.map((col) => (
                  <td key={String(col.key)} className={cn("px-5 py-3.5 text-gray-700 dark:text-gray-300", col.className)}>
                    {col.render ? col.render(item) : String((item as Record<string, unknown>)[col.key as string] ?? "")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {data.length === 0 && <div className="p-10 text-center text-sm text-gray-400">No records found.</div>}
    </div>
  );
}
