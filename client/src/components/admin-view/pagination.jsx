import {ChevronLeft, ChevronRight} from "lucide-react";
import {Button} from "@/components/ui/button.jsx";

function Pagination({page, pageCount, onPageChange}) {
  if (pageCount <= 1) return null;

  // Ko'rsatiladigan sahifa raqamlari (joriy atrofida)
  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pageCount, start + 4);
  for (let i = Math.max(1, end - 4); i <= end; i++) pages.push(i);

  return (
    <div className="mt-6 flex items-center justify-center gap-1.5">
      <Button
        variant="outline"
        size="icon"
        disabled={page === 1}
        onClick={() => onPageChange(page - 1)}
        className="h-9 w-9 rounded-full border-sand text-mocha hover:bg-cream disabled:opacity-40"
      >
        <ChevronLeft className="h-4 w-4"/>
      </Button>

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onPageChange(p)}
          className={`grid h-9 min-w-9 place-items-center rounded-full px-3 text-sm font-medium transition-colors ${
            p === page
              ? "bg-espresso text-ivory"
              : "border border-sand text-mocha hover:bg-cream"
          }`}
        >
          {p}
        </button>
      ))}

      <Button
        variant="outline"
        size="icon"
        disabled={page === pageCount}
        onClick={() => onPageChange(page + 1)}
        className="h-9 w-9 rounded-full border-sand text-mocha hover:bg-cream disabled:opacity-40"
      >
        <ChevronRight className="h-4 w-4"/>
      </Button>
    </div>
  );
}

export default Pagination;
