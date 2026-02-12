// components/social/StoriesBar.tsx - BASİT
'use client'

export default function StoriesBar() {
  const stories = [
    { id: 1, user: 'Ahmet', hasNew: true },
    { id: 2, user: 'Zeynep', hasNew: false },
    { id: 3, user: 'Mehmet', hasNew: true },
    { id: 4, user: 'Ayşe', hasNew: false },
    { id: 5, user: 'Can', hasNew: true },
  ]

  return (
    <div className="bg-white rounded-xl shadow p-4 mb-6">
      <div className="flex space-x-4 overflow-x-auto pb-2">
        {/* Kendi story */}
        <button className="flex-shrink-0 text-center">
          <div className="w-20 h-20 rounded-full border-4 border-blue-500 flex items-center justify-center text-2xl bg-gradient-to-br from-blue-400 to-purple-500 text-white">
            +
          </div>
          <div className="text-xs mt-2">Sen</div>
        </button>

        {/* Diğer story'ler */}
        {stories.map((story) => (
          <button key={story.id} className="flex-shrink-0 text-center">
            <div className={`w-20 h-20 rounded-full ${story.hasNew ? 'border-4 border-green-500' : 'border-2 border-gray-300'}`}>
              <div className="w-full h-full rounded-full bg-gradient-to-br from-pink-400 to-orange-500"></div>
            </div>
            <div className="text-xs mt-2 truncate w-20">{story.user}</div>
          </button>
        ))}
      </div>
    </div>
  )
}