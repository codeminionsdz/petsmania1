'use client'

import { Truck, Package, MapPin, Calendar, Shield, AlertCircle } from 'lucide-react'

export default function ShippingDeliveryPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-orange-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">الشحن والتوصيل</h1>
          <p className="text-orange-100">توصيل سريع وآمن في جميع أنحاء الجزائر</p>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <Truck className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">متوسط وقت التوصيل</p>
            <p className="text-2xl font-bold text-gray-900">1-5 أيام</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <MapPin className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">جميع الولايات</p>
            <p className="text-2xl font-bold text-gray-900">58 ولاية</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <Package className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">تتبع الشحنة</p>
            <p className="text-2xl font-bold text-gray-900">حقيقي</p>
          </div>
          <div className="p-6 bg-white rounded-lg border border-gray-200 text-center">
            <Shield className="w-8 h-8 text-orange-600 mx-auto mb-2" />
            <p className="text-sm text-gray-600">تأمين الشحنة</p>
            <p className="text-2xl font-bold text-gray-900">مضمون</p>
          </div>
        </div>

        {/* Shipping Rates */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">رسوم الشحن</h2>
          <p className="text-gray-600 mb-4">
            تختلف رسوم الشحن حسب الولاية والوزن. سيتم عرض الرسوم النهائية لك قبل تأكيد الطلب:
          </p>
          
          <div className="overflow-x-auto">
            <table className="w-full text-right">
              <thead>
                <tr className="bg-orange-100 border-b-2 border-orange-300">
                  <th className="px-4 py-3 font-bold text-gray-900">الرسم</th>
                  <th className="px-4 py-3 font-bold text-gray-900">التصنيف</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gray-200 hover:bg-orange-50">
                  <td className="px-4 py-3 text-gray-700">500 - 800 دج</td>
                  <td className="px-4 py-3 text-gray-700">شرق الجزائر (الولايات القريبة)</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-orange-50">
                  <td className="px-4 py-3 text-gray-700">800 - 1200 دج</td>
                  <td className="px-4 py-3 text-gray-700">وسط الجزائر</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-orange-50">
                  <td className="px-4 py-3 text-gray-700">1200 - 1800 دج</td>
                  <td className="px-4 py-3 text-gray-700">غرب الجزائر</td>
                </tr>
                <tr className="border-b border-gray-200 hover:bg-orange-50">
                  <td className="px-4 py-3 text-gray-700">1500 - 2500 دج</td>
                  <td className="px-4 py-3 text-gray-700">الجنوب والمناطق النائية</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="mt-4 p-4 bg-blue-50 border-l-4 border-blue-500 rounded text-right">
            <p className="text-sm text-blue-900">
              💡 <strong>نصيحة:</strong> اطلب ما قيمته 5000 دج أو أكثر واستفد من توصيل مجاني في بعض الحالات!
            </p>
          </div>
        </div>

        {/* Timeline */}
        <div className="mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">عملية التوصيل</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">1</div>
                <div className="w-0.5 h-20 bg-orange-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">تأكيد الطلب</h3>
                <p className="text-gray-600">نتحقق من الطلب ونجهز المنتجات للشحن</p>
                <p className="text-sm text-gray-500 mt-1">مدة 12-24 ساعة</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">2</div>
                <div className="w-0.5 h-20 bg-orange-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">تسليم الشحنة</h3>
                <p className="text-gray-600">نسلم الشحنة إلى شركة التوصيل وترسل لك رقم التتبع</p>
                <p className="text-sm text-gray-500 mt-1">تحصل على البريد الإلكتروني فوراً</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">3</div>
                <div className="w-0.5 h-20 bg-orange-200 my-2"></div>
              </div>
              <div className="pb-8">
                <h3 className="font-bold text-gray-900 text-lg">في الطريق</h3>
                <p className="text-gray-600">تتبع شحنتك في الوقت الفعلي عبر الرابط المُرسل</p>
                <p className="text-sm text-gray-500 mt-1">1-5 أيام حسب الموقع</p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-full bg-orange-600 text-white flex items-center justify-center font-bold">4</div>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">التسليم</h3>
                <p className="text-gray-600">استقبل طلبك وتفقده قبل الدفع أو أكمل الدفع حسب اختيارك</p>
                <p className="text-sm text-gray-500 mt-1">دفع عند الاستلام أو تحويل بنكي</p>
              </div>
            </div>
          </div>
        </div>

        {/* Important Notes */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <div className="flex gap-3">
            <AlertCircle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" />
            <div className="text-right">
              <h3 className="font-bold text-amber-900 text-lg mb-3">ملاحظات مهمة</h3>
              <ul className="space-y-2 text-amber-900 text-sm">
                <li>✓ تتفقد الشحنة قبل الدفع - لا تدفع إلا بعد التأكد من المنتجات</li>
                <li>✓ احفظ رقم التتبع لمتابعة شحنتك بسهولة</li>
                <li>✓ في حالة التأخير أو الضرر، اتصل بنا فوراً</li>
                <li>✓ لا نشحن يوم الجمعة والعطل الرسمية</li>
                <li>✓ الشحن يعتمد على الأحوال الجوية والأوضاع الأمنية</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Contact */}
        <div className="mt-12 text-center">
          <p className="text-gray-600 mb-4">هل لديك أي استفسارات حول الشحن؟</p>
          <a
            href="/contact"
            className="inline-block px-8 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-semibold"
          >
            اتصل بنا الآن
          </a>
        </div>
      </div>
    </main>
  )
}
