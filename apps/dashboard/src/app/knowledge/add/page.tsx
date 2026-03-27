export default function KnowledgeAddPage() {
  return (
    <div className="min-h-screen bg-[#0f0f12] p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold text-white mb-2">Bilgi Ekle</h1>
        <p className="text-zinc-400 mb-6">Doküman veya özel prompt ile bilgi bankasını genişlet.</p>

        <div className="bg-[#18181b] rounded-2xl border border-zinc-800/60 p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">Başlık</label>
            <input className="w-full px-4 py-2.5 bg-[#0f0f12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Örn: Kargo Süreçleri" />
          </div>
          <div>
            <label className="block text-sm font-medium text-zinc-300 mb-2">İçerik</label>
            <textarea className="w-full min-h-[160px] px-4 py-2.5 bg-[#0f0f12] border border-zinc-800 rounded-lg text-white placeholder-zinc-600 focus:ring-2 focus:ring-violet-500 focus:border-transparent" placeholder="Metin veya doküman özeti" />
          </div>
          <button className="px-5 py-2.5 bg-violet-600 hover:bg-violet-700 text-white font-medium rounded-lg transition-colors">Kaydet</button>
        </div>
      </div>
    </div>
  )
}
