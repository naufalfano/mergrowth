import { useState, useRef, useEffect } from "react";
import { Search } from "lucide-react";

interface Product {
  product_id: number;
  product_name: string;
}

interface ProductSelectProps {
  products: Product[];
  value: number | undefined;
  onChange: (id: number) => void;
  className?: string;
}

export default function ProductSelect({
  products,
  value,
  onChange,
  className = "",
}: ProductSelectProps) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const selected = products.find((p) => p.product_id === value);

  const filtered = query.trim()
    ? products.filter((p) =>
        p.product_name.toLowerCase().includes(query.toLowerCase())
      )
    : products;

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
        setQuery("");
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div
        className="flex items-center gap-2 w-full border rounded-xl px-4 py-3 bg-white cursor-pointer hover:border-gray-400 transition"
        onClick={() => setOpen((prev) => !prev)}
      >
        <Search size={14} className="text-gray-400 shrink-0" />
        {open ? (
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onClick={(e) => e.stopPropagation()}
            placeholder="Search product..."
            className="flex-1 outline-none text-sm bg-transparent"
          />
        ) : (
          <span className="flex-1 text-sm truncate">
            {selected?.product_name ?? (
              <span className="text-gray-400">Select a product</span>
            )}
          </span>
        )}
      </div>

      {open && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-200 rounded-xl shadow-lg max-h-52 overflow-y-auto">
          {filtered.length === 0 ? (
            <div className="px-4 py-3 text-sm text-gray-400">
              No products found
            </div>
          ) : (
            filtered.map((p) => (
              <button
                key={p.product_id}
                type="button"
                onMouseDown={() => {
                  onChange(p.product_id);
                  setQuery("");
                  setOpen(false);
                }}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 transition ${
                  p.product_id === value
                    ? "font-medium text-blue-600"
                    : "text-gray-700"
                }`}
              >
                {p.product_name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
