"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import type { FilterOptions } from "@/lib/types"

interface SortSelectProps {
  value?: FilterOptions["sortBy"]
  onChange: (value: FilterOptions["sortBy"]) => void
}

export function SortSelect({ value, onChange }: SortSelectProps) {
  return (
    <Select value={value || "popular"} onValueChange={onChange}>
      <SelectTrigger className="w-[180px]">
        <SelectValue placeholder="Sort by" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="popular">Most Popular</SelectItem>
        <SelectItem value="newest">Newest</SelectItem>
        <SelectItem value="price-asc">Price: Low to High</SelectItem>
        <SelectItem value="price-desc">Price: High to Low</SelectItem>
        <SelectItem value="name">Name: A to Z</SelectItem>
      </SelectContent>
    </Select>
  )
}
