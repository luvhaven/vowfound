import { DemoBadge } from "@/components/site/demo-badge";

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => React.ReactNode;
  numeric?: boolean;
}

export function AdminTable<T extends { id?: string; is_demo?: boolean }>({
  rows,
  columns,
  empty,
}: {
  rows: T[];
  columns: Column<T>[];
  empty: string;
}) {
  if (rows.length === 0) {
    return (
      <div className="rounded-[12px] border border-hairline bg-onink/[0.02] px-6 py-14">
        <p className="engraved text-rose">No records</p>
        <p className="mt-3 text-[16px] text-onink-dim">{empty}</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-[12px] border border-hairline bg-onink/[0.018] px-5">
      <table className="w-full min-w-[46rem] border-collapse text-left">
        <thead>
          <tr className="border-b border-hairline">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={`engraved py-4 pr-6 font-normal text-onink-faint ${
                  column.numeric ? "text-right" : ""
                }`}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr
              key={row.id ?? i}
              className="border-b border-hairline transition-colors hover:bg-onink/[0.035]"
            >
              {columns.map((column, ci) => (
                <td
                  key={column.key}
                  className={`py-4 pr-6 align-top text-[15px] text-onink-dim ${
                    column.numeric ? "numeral text-right" : ""
                  }`}
                >
                  {column.render(row)}
                  {ci === 0 && row.is_demo && (
                    <span className="ml-3 inline-block align-middle">
                      <DemoBadge tone="ink" />
                    </span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
