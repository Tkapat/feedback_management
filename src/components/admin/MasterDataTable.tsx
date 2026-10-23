"use client";
import DataTable from "@/components/ui/DataTable";

interface Props {
  items: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
}

export default function MasterDataTable({ items, onEdit, onDelete }: Props) {
  return (
    <DataTable items={items}>
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="border-b border-slate-200">
            <th className="pb-3 pl-2 text-xs font-semibold uppercase tracking-wider text-ink-500">Name</th>
            <th className="pb-3 text-xs font-semibold uppercase tracking-wider text-ink-500">Code</th>
            <th className="pb-3 pr-2 text-right text-xs font-semibold uppercase tracking-wider text-ink-500">Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item._id} className="border-b border-slate-100 transition-colors hover:bg-slate-50">
              <td className="py-3.5 pl-2 text-sm font-medium text-ink-900">{item.name}</td>
              <td className="py-3.5 text-sm text-ink-500">{item.code || "—"}</td>
              <td className="py-3.5 pr-2 text-right">
                <button
                  onClick={() => onEdit(item._id)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-primary-600 transition-colors hover:bg-primary-50"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(item._id)}
                  className="rounded-lg px-2.5 py-1.5 text-xs font-semibold text-red-600 transition-colors hover:bg-red-50"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </DataTable>
  );
}