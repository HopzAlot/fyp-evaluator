import type { ReactNode } from "react";

export type DataTableColumn<TItem> = {
  key: string;
  header: string;
  className?: string;
  render: (item: TItem) => ReactNode;
};

type DataTableProps<TItem> = {
  columns: DataTableColumn<TItem>[];
  data: TItem[];
  getRowKey: (item: TItem) => string;
  emptyMessage?: string;
  loading?: boolean;
  loadingMessage?: string;
  minWidth?: string;
};

export function DataTable<TItem>({
  columns,
  data,
  getRowKey,
  emptyMessage = "No records found",
  loading = false,
  loadingMessage = "Loading records",
  minWidth = "860px",
}: DataTableProps<TItem>) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-sm" style={{ minWidth }}>
        <thead className="border-b border-border bg-surface-muted text-xs uppercase text-muted">
          <tr>
            {columns.map((column) => (
              <th
                key={column.key}
                className={`px-5 py-3 font-semibold ${column.className ?? ""}`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {loading ? (
            <tr>
              <td className="px-5 py-4 text-muted" colSpan={columns.length}>
                {loadingMessage}
              </td>
            </tr>
          ) : null}
          {!loading && data.length === 0 ? (
            <tr>
              <td className="px-5 py-4 text-muted" colSpan={columns.length}>
                {emptyMessage}
              </td>
            </tr>
          ) : null}
          {!loading
            ? data.map((item) => (
                <tr key={getRowKey(item)} className="align-top">
                  {columns.map((column) => (
                    <td
                      key={column.key}
                      className={`px-5 py-4 ${column.className ?? ""}`}
                    >
                      {column.render(item)}
                    </td>
                  ))}
                </tr>
              ))
            : null}
        </tbody>
      </table>
    </div>
  );
}
