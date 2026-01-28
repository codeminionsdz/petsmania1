'use client'

import { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FAQItem {
  id: string
  question: string
  answer: string
  category: string
}

const FAQs: FAQItem[] = [
  {
    id: '1',
    category: 'Products',
    question: 'هل جميع المنتجات أصلية؟',
    answer: 'نعم، جميع منتجاتنا أصلية 100% ونقوم باستيرادها من الموزعين الرسميين معتمدة. كل منتج يأتي مع ضمان الجودة والأصالة.',
  },
  {
    id: '2',
    category: 'Products',
    question: 'كيف أتأكد من انتهاء صلاحية المنتج؟',
    answer: 'نعرض تاريخ انتهاء الصلاحية بوضوح على صفحة المنتج. جميع منتجاتنا لديها صلاحية كافية عند الشراء (لا تقل عن 6 أشهر).',
  },
  {
    id: '3',
    category: 'Delivery',
    question: 'ما هو وقت التوصيل؟',
    answer: 'وقت التوصيل يعتمد على الولاية وحالة الطقس. عادة ما يستغرق من 1 إلى 5 أيام عمل. ستتلقى رقم تتبع الشحنة عند إرسال طلبك.',
  },
  {
    id: '4',
    category: 'Delivery',
    question: 'هل توصلون في جميع ولايات الجزائر؟',
    answer: 'نعم، نوصل في جميع ولايات الجزائر (58 ولاية) مع رسوم توصيل مختلفة حسب المسافة. يمكنك اختيار ولايتك عند الطلب لرؤية رسوم التوصيل.',
  },
  {
    id: '5',
    category: 'Payment',
    question: 'ما هي طرق الدفع المتاحة؟',
    answer: 'نتقبل الدفع عند الاستلام (CCP) أو التحويل البنكي. يمكنك اختيار الطريقة المناسبة لك أثناء عملية الدفع.',
  },
  {
    id: '6',
    category: 'Payment',
    question: 'هل آمان التسوق عندكم؟',
    answer: 'نعم، جميع معلوماتك الشخصية محمية بأحدث تقنيات التشفير. نستخدم Supabase الموثوق به عالمياً لحماية بيانات العملاء.',
  },
  {
    id: '7',
    category: 'Returns',
    question: 'ما هي سياسة الاسترجاع؟',
    answer: 'يمكنك استرجاع أي منتج خلال 14 يوم من استلام الطلب إذا كان غير مستخدم وفي حالته الأصلية. تواصل معنا عبر البريد الإلكتروني أو الهاتف.',
  },
  {
    id: '8',
    category: 'Returns',
    question: 'من يدفع تكاليف الاسترجاع؟',
    answer: 'في حالة العيب في المنتج أو الخطأ من طرفنا، نتحمل تكاليف الاسترجاع. في حالات الاسترجاع العادية، يتحمل العميل تكاليف الشحو العكسي.',
  },
  {
    id: '9',
    category: 'Promos',
    question: 'كيف أستخدم كود الخصم؟',
    answer: 'أدخل كود الخصم في صفحة الدفع في الحقل المخصص قبل تأكيد الطلب. سيظهر الخصم تلقائياً إذا كان الكود صحيحاً ساري المفعول.',
  },
  {
    id: '10',
    category: 'Account',
    question: 'كيف أنشئ حساب؟',
    answer: 'اضغط على "إنشاء حساب" واملأ بياناتك (الاسم والبريد والكلمة السرية). ستتلقى رابط تفعيل البريد الإلكتروني. لا داعي لإنشاء حساب للشراء كضيف.',
  },
]

interface CategoryGroup {
  [key: string]: FAQItem[]
}

export default function FAQsPage() {
  const [openId, setOpenId] = useState<string | null>(null)

  const groupedFAQs: CategoryGroup = FAQs.reduce((acc, faq) => {
    if (!acc[faq.category]) {
      acc[faq.category] = []
    }
    acc[faq.category].push(faq)
    return acc
  }, {} as CategoryGroup)

  const toggleFAQ = (id: string) => {
    setOpenId(openId === id ? null : id)
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-400 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl font-bold mb-2">الأسئلة الشائعة</h1>
          <p className="text-blue-100">اجد الإجابات على أكثر الأسئلة المطروحة</p>
        </div>
      </div>

      {/* FAQs Content */}
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        {Object.entries(groupedFAQs).map(([category, items]) => (
          <div key={category} className="mb-12">
            {/* Category Title */}
            <h2 className="text-2xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-blue-200">
              {category === 'Products' && 'المنتجات'}
              {category === 'Delivery' && 'التوصيل والشحن'}
              {category === 'Payment' && 'الدفع'}
              {category === 'Returns' && 'الاسترجاع'}
              {category === 'Promos' && 'العروضات والخصومات'}
              {category === 'Account' && 'الحساب'}
            </h2>

            {/* FAQ Items */}
            <div className="space-y-4">
              {items.map((faq) => (
                <div
                  key={faq.id}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  {/* Question */}
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="w-full px-6 py-4 flex items-center justify-between bg-white hover:bg-blue-50 transition-colors text-right"
                  >
                    <ChevronDown
                      className={cn(
                        'w-5 h-5 text-blue-600 transition-transform flex-shrink-0',
                        openId === faq.id && 'rotate-180'
                      )}
                    />
                    <h3 className="text-lg font-semibold text-gray-900 flex-1 mr-4">
                      {faq.question}
                    </h3>
                  </button>

                  {/* Answer */}
                  {openId === faq.id && (
                    <div className="px-6 py-4 bg-blue-50 border-t border-gray-200">
                      <p className="text-gray-700 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Contact Support */}
        <div className="mt-16 p-8 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl border border-blue-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">لم تجد ما تبحث عنه؟</h3>
          <p className="text-gray-600 mb-4">
            فريقنا جاهز لمساعدتك في أي استفسار إضافي
          </p>
          <a
            href="/contact"
            className="inline-block px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            اتصل بنا
          </a>
        </div>
      </div>
    </main>
  )
}
