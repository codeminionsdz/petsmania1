"use client"

import { useEffect, useState } from "react"

/**
 * Debug component to show what data is being loaded
 * Add this to your product creation page temporarily
 */
export function SubcategoryDebugger() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadData = async () => {
      try {
        const [categories, subcategories, brands] = await Promise.all([
          fetch("/api/categories").then((r) => r.json()),
          fetch("/api/subcategories").then((r) => r.json()),
          fetch("/api/admin/brands").then((r) => r.json()),
        ])

        setData({
          categories: {
            count: categories?.length || 0,
            sample: categories?.slice(0, 3),
            withChildren: categories?.filter((c: any) => c.children?.length > 0)?.length || 0,
          },
          subcategories: {
            count: subcategories?.length || 0,
            sample: subcategories?.slice(0, 5),
            byCategory: subcategories?.reduce((acc: any, sub: any) => {
              const key = sub.category_id || sub.categoryId || "NONE"
              if (!acc[key]) acc[key] = []
              acc[key].push(sub)
              return acc
            }, {}),
          },
          raw: {
            categories,
            subcategories,
          }
        })
      } catch (error) {
        setData({ error: error instanceof Error ? error.message : String(error) })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [])

  if (loading) return <div className="p-4 bg-blue-50 border border-blue-200 rounded">Loading...</div>

  return (
    <div className="p-4 bg-slate-100 border border-slate-300 rounded font-mono text-xs space-y-4">
      <div>
        <h3 className="font-bold text-sm mb-2">📊 Data Loaded:</h3>
        <pre className="bg-white p-2 rounded overflow-auto max-h-96">
          {JSON.stringify(data, null, 2)}
        </pre>
      </div>
    </div>
  )
}
