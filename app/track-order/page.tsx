'use client'

import { useState, useEffect, useRef } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Search, Package, Truck, MapPin, Phone, Loader, AlertCircle, ArrowLeft, CheckCircle2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { formatPrice, formatDate } from '@/lib/format'
import { createBrowserClient } from '@supabase/ssr'

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-800',
  processing: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
  confirmed: 'bg-blue-100 text-blue-800',
}

const statusSteps = {
  pending: 1,
  confirmed: 1,
  processing: 2,
  shipped: 3,
  delivered: 4,
  cancelled: 0,
}

const statusLabels = {
  pending: 'قيد الانتظار',
  confirmed: 'تم التأكيد',
  processing: 'قيد المعالجة',
  shipped: 'تم الشحن',
  delivered: 'تم التسليم',
  cancelled: 'ملغى',
}

export default function TrackOrderPage() {
  const searchParams = useSearchParams()
  const orderId = searchParams.get('orderId')
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [notFound, setNotFound] = useState(false)
  const [needsAuth, setNeedsAuth] = useState(false)
  const [pendingOrder, setPendingOrder] = useState<any>(null)
  const [error, setError] = useState<string>('')
  const [wilayas, setWilayas] = useState<any[]>([])
  const [searchInput, setSearchInput] = useState('')
  const [showExample, setShowExample] = useState(!orderId)

  useEffect(() => {
    // Load wilayas
    const loadWilayas = async () => {
      try {
        const res = await fetch('/api/wilayas')
        const data = await res.json()
        if (data.success) {
          setWilayas(data.data)
        }
      } catch (err) {
        console.error('Error loading wilayas:', err)
      }
    }
    loadWilayas()
  }, [])

  useEffect(() => {
    if (orderId) {
      fetchOrder(orderId)
    }
  }, [orderId])

  const fetchOrder = async (id: string) => {
    try {
      setLoading(true)
      setNotFound(false)
      setError('')
      setOrder(null)

      // Use server API so RLS doesn't block read for guest tracking
      const res = await fetch(`/api/orders/track?id=${encodeURIComponent(id)}`)
      if (!res.ok) {
        setNotFound(true)
        return
      }

      const json = await res.json()
      const orderData = json.data

      if (!orderData) {
        setNotFound(true)
        return
      }

      // If server indicates auth is required for this order
      if (json.requiresAuth) {
        setNeedsAuth(true)
        // ✅ No guest verification - redirect to login/register directly
        setPendingOrder(orderData)
        return
      }

      // no auth required -> show order
      setOrder(orderData)
      setShowExample(false)
    } catch (err) {
      console.error('Error fetching order:', err)
      setError('فشل تحميل الطلب')
    } finally {
      setLoading(false)
    }
  }

  const getWilayaName = (wilayaId: string) => {
    if (!wilayaId) return ''
    const wilaya = wilayas.find(w => w.id === wilayaId)
    return wilaya?.name || wilayaId
  }

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchInput.trim()) {
      fetchOrder(searchInput.trim())
    }
  }

  return (
    <>
      <nav className='bg-secondary py-3'>
        <div className='container mx-auto px-4'>
          <ol className='flex items-center gap-2 text-sm'>
            <li>
              <Link href='/' className='text-muted-foreground hover:text-foreground transition-colors'>
                الرئيسية
              </Link>
            </li>
            <span className='text-muted-foreground'>/</span>
            <li className='text-foreground font-medium'>تتبع الطلب</li>
          </ol>
        </div>
      </nav>

      <main className='container mx-auto px-4 py-12'>
        <div className='max-w-4xl mx-auto'>
          {/* Search Box */}
          <div className='mb-12'>
            <form onSubmit={handleSearch} className='flex gap-2 mb-6'>
              <div className='flex-1'>
                <Input
                  type='text'
                  placeholder='أدخل رقم الطلب'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className='w-full'
                />
              </div>
              <Button type='submit' disabled={loading}>
                <Search className='w-4 h-4 mr-2' />
                بحث
              </Button>
            </form>
          </div>

          {/* Loading */}
          {loading && (
            <div className='text-center py-12'>
              <Loader className='h-8 w-8 mx-auto animate-spin text-primary' />
              <p className='text-muted-foreground mt-4'>جاري تحميل الطلب...</p>
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant='destructive' className='mb-6'>
              <AlertCircle className='h-4 w-4' />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Not Found */}
          {notFound && !loading && (
            <div className='text-center py-12'>
              <Package className='h-16 w-16 mx-auto text-muted-foreground mb-4' />
              <h2 className='text-2xl font-bold mb-2'>الطلب غير موجود</h2>
              <p className='text-muted-foreground mb-6'>تأكد من رقم الطلب والمحاولة مجدداً</p>
              <Button variant='outline' onClick={() => setNotFound(false)}>
                محاولة مرة أخرى
              </Button>
            </div>
          )}

          {/* Require auth prompt: login or register */}
          {needsAuth && (
            <div className='text-center py-12'>
              <AlertCircle className='h-16 w-16 mx-auto text-amber-500 mb-4' />
              <h2 className='text-2xl font-bold mb-2'>يرجى تسجيل الدخول</h2>
              <p className='text-muted-foreground mb-6'>لتتبع طلبك، يرجى تسجيل الدخول أو إنشاء حساب.</p>
              <div className='flex flex-col sm:flex-row gap-3 justify-center mb-4'>
                <Button asChild className='flex-1'>
                  <Link href={orderId ? `/login?redirect=${encodeURIComponent(`/track-order?orderId=${orderId}`)}` : '/login'}>تسجيل الدخول</Link>
                </Button>
                <Button asChild variant='outline' className='flex-1'>
                  <Link href={orderId ? `/register?orderId=${orderId}` : '/register'}>إنشاء حساب</Link>
                </Button>
              </div>
            </div>
          )}

          {/* Order Details */}
          {order && !loading && !needsAuth && (
            <div className='space-y-6'>
              {/* Order Header */}
              <div className='bg-card border border-border rounded-lg p-6'>
                <div className='flex items-start justify-between mb-4'>
                  <div>
                    <h1 className='text-2xl font-bold mb-2'>تتبع الطلب #{order.id?.substring(0, 8).toUpperCase()}</h1>
                    <p className='text-sm text-muted-foreground'>تم الإنشاء: {formatDate(order.created_at)}</p>
                  </div>
                  <span className={`px-4 py-2 rounded-full text-sm font-medium ${statusColors[order.status as keyof typeof statusColors] || 'bg-gray-100'}`}>
                    {statusLabels[order.status as keyof typeof statusLabels] || order.status}
                  </span>
                </div>

                {/* Order Progress */}
                <div className='mt-6'>
                  <div className='flex items-center justify-between mb-2'>
                    {[1, 2, 3, 4].map((step) => (
                      <div key={step} className='flex flex-col items-center'>
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-colors ${
                            step <= (statusSteps[order.status as keyof typeof statusSteps] || 0)
                              ? 'bg-primary text-primary-foreground'
                              : 'bg-muted text-muted-foreground'
                          }`}
                        >
                          {step}
                        </div>
                        <span className='text-xs text-center mt-2 text-muted-foreground'>
                          {step === 1 ? 'تم التأكيد' : step === 2 ? 'قيد المعالجة' : step === 3 ? 'تم الشحن' : 'تم التسليم'}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className='flex items-center'>
                    {[0, 1, 2, 3].map((gap) => (
                      <div
                        key={gap}
                        className={`flex-1 h-1 ${gap < ((statusSteps[order.status as keyof typeof statusSteps] || 0) - 1) ? 'bg-primary' : 'bg-muted'}`}
                      ></div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Shipping Address */}
              {order.shipping_address && (
                <div className='bg-card border border-border rounded-lg p-6'>
                  <div className='flex items-center gap-2 mb-4'>
                    <MapPin className='h-5 w-5 text-primary' />
                    <h2 className='text-lg font-semibold'>عنوان التوصيل</h2>
                  </div>
                  <div className='space-y-2 text-sm'>
                    <p>
                      <strong>الاسم:</strong> {order.shipping_address.firstName} {order.shipping_address.lastName}
                    </p>
                    <p>
                      <strong>الهاتف:</strong> {order.shipping_address.phone}
                    </p>
                    <p>
                      <strong>العنوان:</strong> {order.shipping_address.address}
                    </p>
                    <p>
                      <strong>الولاية:</strong> {getWilayaName(order.shipping_address.wilaya)}
                    </p>
                    <p>
                      <strong>البلدية:</strong> {order.shipping_address.municipality}
                    </p>
                    <p>
                      <strong>المدينة:</strong> {order.shipping_address.city}
                    </p>
                    {order.shipping_address.postalCode && (
                      <p>
                        <strong>الرمز البريدي:</strong> {order.shipping_address.postalCode}
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Order Items */}
              <div className='bg-card border border-border rounded-lg p-6'>
                <h2 className='text-lg font-semibold mb-4'>المنتجات</h2>
                <div className='space-y-4'>
                  {order.order_items?.map((item: any) => (
                    <div key={item.id} className='flex gap-4 pb-4 border-b border-border last:border-b-0'>
                      {item.products?.product_images?.[0] && (
                        <div className='relative w-20 h-20 bg-secondary rounded-md flex-shrink-0'>
                          <Image
                            src={item.products.product_images[0].url}
                            alt={item.product_name}
                            fill
                            className='object-contain p-2'
                          />
                        </div>
                      )}
                      <div className='flex-1'>
                        <h3 className='font-medium'>{item.product_name}</h3>
                        <p className='text-sm text-muted-foreground'>الكمية: {item.quantity}</p>
                        <p className='text-sm font-medium'>{formatPrice(item.product_price)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              <div className='bg-card border border-border rounded-lg p-6'>
                <h2 className='text-lg font-semibold mb-4'>ملخص الطلب</h2>
                <div className='space-y-3 text-sm border-b border-border pb-4'>
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>الإجمالي الفرعي</span>
                    <span>{formatPrice(order.subtotal)}</span>
                  </div>
                  {order.discount > 0 && (
                    <div className='flex justify-between text-green-600'>
                      <span>الخصم</span>
                      <span>-{formatPrice(order.discount)}</span>
                    </div>
                  )}
                  <div className='flex justify-between'>
                    <span className='text-muted-foreground'>التوصيل</span>
                    <span>{formatPrice(order.shipping)}</span>
                  </div>
                </div>
                <div className='flex justify-between font-semibold text-lg pt-4'>
                  <span>المجموع</span>
                  <span className='text-primary'>{formatPrice(order.total)}</span>
                </div>
              </div>

              {/* Tracking Number */}
              {order.tracking_number && (
                <Alert>
                  <Truck className='h-4 w-4' />
                  <AlertDescription>
                    <strong>رقم التتبع:</strong> {order.tracking_number}
                  </AlertDescription>
                </Alert>
              )}

              {/* Back Button */}
              <Button asChild variant='outline' className='w-full'>
                <Link href='/' className='flex items-center justify-center gap-2'>
                  <ArrowLeft className='h-4 w-4' />
                  العودة إلى الرئيسية
                </Link>
              </Button>
            </div>
          )}

          {/* Info Box */}
          {showExample && (
            <div className='bg-blue-50 border border-blue-200 rounded-lg p-6'>
              <h2 className='font-bold text-blue-900 mb-3'>💡 معلومات مهمة</h2>
              <ul className='space-y-2 text-blue-900 text-sm'>
                <li>✓ أدخل رقم طلبك لتتبع حالته</li>
                <li>✓ يمكنك تتبع الطلب في أي وقت من أي جهاز</li>
                <li>✓ التحديثات تظهر تلقائياً في الوقت الفعلي</li>
                <li>✓ إذا لم تكن لديك حساب، يمكنك تتبع طلبك من هنا مباشرة</li>
              </ul>
            </div>
          )}
        </div>
      </main>
    </>
  )
}
