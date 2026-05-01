"use client";

import { useRouter } from "next/navigation";
import { Search } from "lucide-react";
import { useState } from "react";

export function AdminCustomerSearch({ defaultValue }: { defaultValue?: string }) {
  const router = useRouter();
  const [value, setValue] = useState(defaultValue ?? "");

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (value.trim()) params.set("search", value.trim());
    router.push(`/admin/customers?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="relative max-w-md">
      <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-faint" />
      <input
        type="text"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder="Search by name or email…"
        className="w-full bg-surface-lowest border border-outline/15 rounded-sm pl-9 pr-4 py-2.5 text-sm text-on-surface placeholder:text-on-surface-faint outline-none focus:border-primary transition-colors"
      />
    </form>
  );
}
