import { NextResponse } from "next/server"
import { getSupabaseServerClient } from "@/lib/supabase/server"

// حذف كل المنتجات التي اسمها أو وصفها يحتوي على "dummy" أو "وهمي"
export async function DELETE() {
  const supabase = await getSupabaseServerClient()

  // ابحث عن المنتجات الوهمية
  const { data: products, error: fetchError } = await supabase
    .from("products")
    .select("id, name, description")
    .or('name.ilike.%dummy%,name.ilike.%وهمي%,description.ilike.%dummy%,description.ilike.%وهمي%')

  if (fetchError) {
    return NextResponse.json({ error: fetchError.message }, { status: 500 })
  }

  if (!products || products.length === 0) {
    return NextResponse.json({ deleted: 0 })
  }

  const ids = products.map((p: any) => p.id)

  // حذف الصور المرتبطة أولاً
  await supabase.from("product_images").delete().in("product_id", ids)

  // حذف المنتجات
  const { error: deleteError } = await supabase.from("products").delete().in("id", ids)

  if (deleteError) {
    return NextResponse.json({ error: deleteError.message }, { status: 500 })
  }

  return NextResponse.json({ deleted: ids.length })
}
