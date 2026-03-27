import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f]">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 -left-40 w-96 h-96 bg-blue-500/15 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-0 left-1/2 w-[600px] h-[400px] bg-gradient-to-t from-blue-900/20 to-transparent blur-3xl"></div>
      </div>

      {/* Navigation */}
      <header className="relative z-10 border-b border-white/5 backdrop-blur-sm bg-black/20">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.289 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <span className="text-xl font-bold text-white">ReplyAI</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-gray-400 hover:text-white transition-colors text-sm">Özellikler</a>
            <a href="#pricing" className="text-gray-400 hover:text-white transition-colors text-sm">Fiyatlandırma</a>
            <a href="#contact" className="text-gray-400 hover:text-white transition-colors text-sm">İletişim</a>
            <Link href="/dashboard" className="px-5 py-2 bg-white/10 hover:bg-white/20 border border-white/10 rounded-lg text-white text-sm transition-all">
              Giriş Yap
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10">
        <section className="max-w-7xl mx-auto px-6 py-32 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-full mb-8">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            <span className="text-gray-300 text-sm">AI destekli müşteri hizmetleri</span>
          </div>
          
          <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
            Müşteri Mesajlarını
            <span className="bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent"> AI Yanıtlasın</span>
          </h1>
          
          <p className="text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
            Trendyol, Hepsiburada ve Instagram&apos;dan gelen müşteri sorularını yapay zeka ile otomatik yanıtlayın. 
            7/24 hiçbir mesajı kaçırmayın.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/dashboard" className="px-8 py-4 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold rounded-xl transition-all transform hover:scale-105 shadow-lg shadow-blue-500/25">
              Ücretsiz Başla
            </Link>
            <a href="#demo" className="px-8 py-4 bg-white/5 hover:bg-white/10 border border-white/10 text-white font-semibold rounded-xl transition-all">
              Demo İzle
            </a>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto mt-20 pt-10 border-t border-white/10">
            <div>
              <div className="text-3xl font-bold text-white">%99.9</div>
              <div className="text-gray-500 text-sm mt-1">Yanıt Oranı</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">10K+</div>
              <div className="text-gray-500 text-sm mt-1">Aktif Mağaza</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-white">%70</div>
              <div className="text-gray-500 text-sm mt-1">Zaman Tasarrufu</div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Neden ReplyAI?</h2>
            <p className="text-gray-400 max-w-xl mx-auto">İşletmenizi büyütmek için ihtiyacınız olan tüm araçlar tek bir platformda.</p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Anlık Yanıtlar</h3>
              <p className="text-gray-400 text-sm">Müşteri mesajlarına anında AI yanıtı. Hiçbir soru cevapsız kalmaz.</p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-green-500/20 to-emerald-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Güvenli Onay</h3>
              <p className="text-gray-400 text-sm">Yanıtları manuel onaylayın veya otomatik gönderin. Tam kontrol sizde.</p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Çoklu Platform</h3>
              <p className="text-gray-400 text-sm">Trendyol, Hepsiburada, Instagram - hepsi tek panelde.</p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-500/20 to-red-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Akıllı Öğrenme</h3>
              <p className="text-gray-400 text-sm">Yapay zeka sürekli öğrenir ve yanıtlarınızı geliştirir.</p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Detaylı Analitik</h3>
              <p className="text-gray-400 text-sm">Performansınızı takip edin, raporlarınızı inceleyin.</p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-all group">
              <div className="w-12 h-12 bg-gradient-to-br from-pink-500/20 to-rose-500/20 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <svg className="w-6 h-6 text-pink-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Güvenli Veri</h3>
              <p className="text-gray-400 text-sm">Verileriniz şifrelenir ve güvenli sunucularda saklanır.</p>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="max-w-7xl mx-auto px-6 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Basit Fiyatlandırma</h2>
            <p className="text-gray-400">İhtiyacınıza göre plan seçin. istediğiniz zaman değiştirin.</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-2">Başlangıç</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺0</span>
                <span className="text-gray-500">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  100K AI token/ay
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  1 Platform
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Onay Modu
                </li>
              </ul>
              <Link href="/dashboard" className="block w-full py-3 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors">
                Başla
              </Link>
            </div>

            {/* Growth - Popular */}
            <div className="p-8 bg-gradient-to-b from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-2xl relative">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-purple-500 to-blue-500 text-white text-sm font-medium rounded-full">
                Popüler
              </div>
              <h3 className="text-xl font-semibold text-white mb-2">Büyüme</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺499</span>
                <span className="text-gray-500">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  500K AI token/ay
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  2 Platform
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Detaylı Analitik
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Öncelik Destek
                </li>
              </ul>
              <Link href="/dashboard" className="block w-full py-3 text-center bg-gradient-to-r from-purple-500 to-blue-500 text-white rounded-xl hover:opacity-90 transition-opacity">
                Şimdi Al
              </Link>
            </div>

            {/* Pro */}
            <div className="p-8 bg-white/5 border border-white/10 rounded-2xl">
              <h3 className="text-xl font-semibold text-white mb-2">Pro</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold text-white">₺1499</span>
                <span className="text-gray-500">/ay</span>
              </div>
              <ul className="space-y-3 mb-8">
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Sınırsız AI Token
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Tüm Platformlar
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  Özel Entegrasyon
                </li>
                <li className="flex items-center gap-3 text-gray-300">
                  <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                  7/24 Destek
                </li>
              </ul>
              <Link href="/dashboard" className="block w-full py-3 text-center border border-white/20 text-white rounded-xl hover:bg-white/10 transition-colors">
                İletişime Geç
              </Link>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-20">
          <div className="p-12 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-white/10 rounded-3xl text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Hemen Başlayın</h2>
            <p className="text-gray-300 mb-8 max-w-xl mx-auto">5 dakika içinde hesabınızı oluşturun ve AI destekli müşteri hizmetlerini deneyimleyin.</p>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-8 py-4 bg-white text-gray-900 font-semibold rounded-xl hover:bg-gray-100 transition-colors">
              Ücretsiz Deneyin
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </Link>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.289 3 11c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="text-white font-semibold">ReplyAI</span>
            </div>
            <div className="flex items-center gap-8 text-gray-400 text-sm">
              <a href="#" className="hover:text-white transition-colors">Gizlilik</a>
              <a href="#" className="hover:text-white transition-colors">Kullanım Şartları</a>
              <a href="#" className="hover:text-white transition-colors">İletişim</a>
            </div>
            <div className="text-gray-500 text-sm">
              © 2024 ReplyAI. Tüm hakları saklıdır.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}



