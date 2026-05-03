
'use client'
import { useCurrentLocale } from '@/hooks/useCurrentLocale'

const dgText = {
  tr: { title: 'Günlük Hedefler', desc: 'Her gün toplulukta aktif ol, görevleri tamamla ve ekstra puanlar kazan! Günlük hedeflerini tamamlayarak rozet ve ödüller kazanabilirsin.', todayTitle: 'Bugünün Görevleri', tasks: ['1 yeni spot oluştur', '2 farklı spota yardım et', '1 sosyal paylaşım yap', 'Bir spotu favorilerine ekle', 'Toplamda 10 puan kazan'], leaderboard: 'Lider Tablosunu Gör' },
  en: { title: 'Daily Goals', desc: 'Be active in the community every day, complete tasks and earn extra points! Complete your daily goals to earn badges and rewards.', todayTitle: 'Today\'s Tasks', tasks: ['Create 1 new spot', 'Help 2 different spots', 'Make 1 social post', 'Add a spot to favorites', 'Earn 10 points in total'], leaderboard: 'View Leaderboard' },
  de: { title: 'Tägliche Ziele', desc: 'Sei jeden Tag in der Community aktiv, erfülle Aufgaben und verdiene Extrapunkte! Erfülle deine Tagesziele, um Abzeichen und Belohnungen zu verdienen.', todayTitle: 'Heutige Aufgaben', tasks: ['1 neuen Spot erstellen', '2 verschiedenen Spots helfen', '1 sozialen Post machen', 'Einen Spot zu Favoriten hinzufügen', 'Insgesamt 10 Punkte verdienen'], leaderboard: 'Rangliste anzeigen' },
  fr: { title: 'Objectifs quotidiens', desc: 'Soyez actif dans la communauté chaque jour, accomplissez des tâches et gagnez des points supplémentaires !', todayTitle: 'Tâches d\'aujourd\'hui', tasks: ['Créer 1 nouveau spot', 'Aider 2 spots différents', 'Faire 1 publication sociale', 'Ajouter un spot aux favoris', 'Gagner 10 points au total'], leaderboard: 'Voir le classement' },
  es: { title: 'Metas diarias', desc: '¡Sé activo en la comunidad cada día, completa tareas y gana puntos extra! Completa tus metas diarias para ganar insignias y recompensas.', todayTitle: 'Tareas de hoy', tasks: ['Crear 1 nuevo spot', 'Ayudar a 2 spots diferentes', 'Hacer 1 publicación social', 'Agregar un spot a favoritos', 'Ganar 10 puntos en total'], leaderboard: 'Ver tabla de líderes' },
  ru: { title: 'Ежедневные цели', desc: 'Будьте активны в сообществе каждый день, выполняйте задачи и зарабатывайте дополнительные очки!', todayTitle: 'Задачи на сегодня', tasks: ['Создать 1 новый спот', 'Помочь 2 разным спотам', 'Сделать 1 социальную публикацию', 'Добавить спот в избранное', 'Заработать 10 очков всего'], leaderboard: 'Просмотреть рейтинг' },
} as const

export default function DailyGoalsPage() {
  const locale = useCurrentLocale()
  const t = dgText[locale as keyof typeof dgText] ?? dgText.tr
  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-blue-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">{t.desc}</p>
          <div className="bg-blue-50 border-l-4 border-blue-400 p-6 rounded-xl mb-8">
            <h2 className="text-2xl font-bold text-blue-800 mb-2">{t.todayTitle}</h2>
            <ul className="list-disc pl-6 text-gray-700 space-y-2">
              {t.tasks.map((task, i) => <li key={i}>{task}</li>)}
            </ul>
          </div>
          <div className="text-center mt-8">
            <a href="/leaderboard" className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg text-lg transition">
              {t.leaderboard}
            </a>
          </div>
        </div>
      </main>
    </div>
  )
}
