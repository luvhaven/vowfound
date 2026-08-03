import { AdminTable } from "@/components/admin/table";
import { PRODUCTS, formatPrice } from "@/lib/products";
import { WorkspaceHeader } from "@/components/ui/workspace-header";

export default function AdminPlansPage() {
  const rows = PRODUCTS.map((p) => ({ id: p.slug, ...p }));

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Commercial catalogue"
        title="Plans"
        body="The catalogue is held in code and mirrored into the plans table. This internal view shows both currencies; customers see exactly one."
        detail={`${rows.length} live products`}
      />
      <div className="mt-10">
        <AdminTable
          rows={rows}
          empty="No plans."
          columns={[
            { key: "name", header: "Plan", render: (r) => r.name },
            { key: "shape", header: "Shape", render: (r) => r.shape },
            {
              key: "ngn",
              header: "NGN",
              render: (r) => formatPrice(r.price.NGN, "NGN"),
              numeric: true,
            },
            {
              key: "usd",
              header: "USD",
              render: (r) => formatPrice(r.price.USD, "USD"),
              numeric: true,
            },
            {
              key: "application",
              header: "Entry",
              render: (r) => (r.applicationOnly ? "Application" : "Open"),
            },
          ]}
        />
      </div>
    </div>
  );
}
