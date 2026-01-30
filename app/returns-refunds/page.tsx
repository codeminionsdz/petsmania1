'use client'

import { RotateCcw, Clock, Package, DollarSign, AlertCircle, CheckCircle } from 'lucide-react'

export default function ReturnsRefundsPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-emerald-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">الاسترجاع واسترداد المبالغ</h1>
          <p className="text-green-100">سياسة الاسترجاع شفافة وعادلة</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Quick Summary */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <Clock className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">مدة الاسترجاع</p>
            <p className="text-2xl font-bold text-gray-900">14 يوم</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <RotateCcw className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">حالة المنتج</p>
            <p className="text-2xl font-bold text-gray-900">غير مستخدم</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <DollarSign className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">استرجاع المبلغ</p>
            <p className="text-2xl font-bold text-gray-900">100%</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <Package className="w-8 h-8 text-green-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">الحالة الأصلية</p>
            <p className="text-2xl font-bold text-gray-900">مطلوبة</p>
          </div>
        </div>

        {/* Return Policy */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">سياسة الاسترجاع</h2>
          
          <div className="space-y-4">
            <div className="p-6 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">متى يمكنك الاسترجاع؟</h3>
                  <p className="text-gray-700">
                    يمكنك استرجاع أي منتج خلال <strong>14 يوم</strong> من تاريخ استلام الطلب إذا كان المنتج:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>غير مستخدم وفي حالته الأصلية تماماً</li>
                    <li>الغلاف والعبوة سليمة لم تُفتح</li>
                    <li>لم يتم إزالة الملصقات أو التاريخ</li>
                    <li>بدون أي أثر استخدام أو ضرر</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex gap-3">
                <CheckCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">حالات الاسترجاع بلا رسوم</h3>
                  <p className="text-gray-700">
                    نتحمل كل تكاليف الاسترجاع والشحن العكسي في الحالات التالية:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>المنتج غير متطابق مع الوصف أو الصور</li>
                    <li>المنتج معيب أو تالف عند الاستقبال</li>
                    <li>انتهاء صلاحية المنتج قبل موعده</li>
                    <li>خطأ من طرفنا في الطلب (منتج خاطئ)</li>
                  </ul>
                </div>
              </div>
            </div>

            <div className="p-6 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex gap-3">
                <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
                <div className="text-right">
                  <h3 className="font-bold text-gray-900 text-lg mb-2">الاسترجاع برسوم الشحن</h3>
                  <p className="text-gray-700">
                    في حالة الاسترجاع العادي (تغيير رأي أو عدم الرضا) يتحمل العميل تكاليف الشحن العكسي:
                  </p>
                  <ul className="mt-3 space-y-2 text-gray-700 list-disc list-inside">
                    <li>تكاليف الشحن العكسي تُخصم من المبلغ المسترد</li>
                    <li>المبلغ المسترد = سعر المنتج - تكاليف الشحن</li>
                    <li>لا يمكن استرجاع العناصر المستخدمة أو المفتوحة</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Return Process */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">خطوات الاسترجاع</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">1</div>
                <div className="w-0.5 h-20 bg-green-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">اتصل بنا</h3>
                <p className="text-gray-600">اتصل بخدمة العملاء أو أرسل بريد إلكتروني مع سبب الاسترجاع</p>
                <p className="text-sm text-gray-500 mt-1">خلال 14 يوم من الاستقبال</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">2</div>
                <div className="w-0.5 h-20 bg-green-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">تأكيد الاسترجاع</h3>
                <p className="text-gray-600">نوافق على طلب الاسترجاع ونرسل لك رقم الاسترجاع ووسيلة الإرسال</p>
                <p className="text-sm text-gray-500 mt-1">خلال 24-48 ساعة</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">3</div>
                <div className="w-0.5 h-20 bg-green-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">إرسال المنتج</h3>
                <p className="text-gray-600">أرسل المنتج في عبوة آمنة مع الحفاظ على حالته الأصلية</p>
                <p className="text-sm text-gray-500 mt-1">رقم الاسترجاع مكتوب على الطرد</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-green-600 text-white flex items-center justify-center font-bold">4</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">استرجاع المبلغ</h3>
                <p className="text-gray-600">بعد تفقدنا للمنتج والتأكد من حالته، نرسل المبلغ إلى حسابك</p>
                <p className="text-sm text-gray-500 mt-1">خلال 5-7 أيام عمل</p>
              </div>
            </div>
          </div>
        </div>

        {/* Refund Timeline */}
        <div className="mb-12 p-6 bg-white border border-gray-200 rounded-lg">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">جدول زمني لاسترجاع المبلغ</h2>
          <div className="space-y-3">
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">من تاريخ الاستقبال</span>
              <span className="font-bold text-gray-900">حتى 14 يوم</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">من تاريخ الاتصال بنا</span>
              <span className="font-bold text-gray-900">24-48 ساعة</span>
            </div>
            <div className="flex justify-between items-center pb-3 border-b border-gray-200">
              <span className="text-gray-700">بعد إرسال المنتج إلينا</span>
              <span className="font-bold text-gray-900">5-7 أيام عمل</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-gray-700">المجموع الكلي من الاستقبال</span>
              <span className="font-bold text-green-600 text-lg">حتى 30 يوم</span>
            </div>
          </div>
        </div>

        {/* What We Don't Accept */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 mb-12">
          <h2 className="text-2xl font-bold text-red-900 mb-4">لا نقبل الاسترجاع في الحالات التالية</h2>
          <ul className="space-y-2 text-red-900">
            <li>✗ المنتجات المستخدمة أو المفتوحة</li>
            <li>✗ الأدوية التي تجاوزت فترة الاستخدام</li>
            <li>✗ المنتجات المعطوبة بسبب سوء الاستخدام</li>
            <li>✗ الطلبات المسترجعة بعد 14 يوم</li>
            <li>✗ المنتجات التي فقدت عبوتها الأصلية</li>
            <li>✗ المنتجات المعادة بدون رقم استرجاع</li>
          </ul>
        </div>

        {/* Contact */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">هل لديك استفسار؟</h3>
          <p className="text-gray-600 mb-4">
            فريقنا جاهز لمساعدتك بسرعة وكفاءة
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a
              href="/contact"
              className="flex-1 text-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-semibold"
            >
              اتصل بنا
            </a>
            <a
              href="mailto:petsmania@gmail.com"
              className="flex-1 text-center px-6 py-3 bg-white border border-green-600 text-green-600 rounded-lg hover:bg-green-50 transition-colors font-semibold"
            >
              أرسل بريد
            </a>
          </div>
        </div>
      </div>
    </main>
  )
}
