// components/DailyChallenges.tsx - DÜZELTİLMİŞ
'use client'

import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase'

// Type definitions
interface Challenge {
  id: string
  title: string
  description: string
  challenge_type: string
  reward_points: number
  target_count: number
  is_active: boolean
  start_date: string
  end_date: string
}

interface Progress {
  id: string
  user_id: string
  challenge_id: string
  progress_count: number
  is_completed: boolean
  completed_at: string | null
}

export default function DailyChallenges() {
  const [challenges, setChallenges] = useState<Challenge[]>([])
  const [userProgress, setUserProgress] = useState<Record<string, number>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchChallenges()
  }, [])

  const fetchChallenges = async () => {
    try {
      const [{ data: challengesData }, { data: user }] = await Promise.all([
        supabase
          .from('daily_challenges')
          .select('*')
          .eq('is_active', true)
          .order('reward_points', { ascending: false }),
        supabase.auth.getUser()
      ])

      if (user.user) {
        const { data: progressData } = await supabase
          .from('user_challenge_progress')
          .select('*')
          .eq('user_id', user.user.id)

        const progressMap: Record<string, number> = {}
        
        // DÜZELTİLMİŞ KISIM - Tip tanımlandı
        progressData?.forEach((p: Progress) => {
          progressMap[p.challenge_id] = p.progress_count
        })

        setUserProgress(progressMap)
      }

      setChallenges(challengesData || [])
    } catch (error) {
      console.error('Challenges yüklenemedi:', error)
    } finally {
      setLoading(false)
    }
  }

  const getChallengeIcon = (type: string) => {
    switch(type) {
      case 'sighting': return '👁️'
      case 'social': return '👥'
      case 'completion': return '✅'
      case 'streak': return '🔥'
      default: return '🎯'
    }
  }

  return (
    <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl shadow-lg p-6 border border-blue-100">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-900">🎯 Günlük Hedefler</h2>
          <p className="text-gray-600">Tamamla, puan kazan!</p>
        </div>
        <div className="text-3xl">🏆</div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse bg-white bg-opacity-50 rounded-lg p-4">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {challenges.map((challenge) => {
            const progress = userProgress[challenge.id] || 0
            const percentage = Math.min(100, (progress / challenge.target_count) * 100)
            const isCompleted = progress >= challenge.target_count

            return (
              <div 
                key={challenge.id}
                className={`bg-white rounded-lg p-4 border-2 ${
                  isCompleted ? 'border-green-500 bg-green-50' : 'border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className="text-2xl">
                      {getChallengeIcon(challenge.challenge_type)}
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900">{challenge.title}</h4>
                      <p className="text-sm text-gray-600">{challenge.description}</p>
                      
                      {/* Progress */}
                      <div className="mt-2">
                        <div className="flex justify-between text-sm mb-1">
                          <span className="text-gray-600">
                            {progress} / {challenge.target_count}
                          </span>
                          <span className="font-medium text-green-600">
                            +{challenge.reward_points} puan
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              isCompleted 
                                ? 'bg-green-500' 
                                : 'bg-gradient-to-r from-blue-500 to-purple-500'
                            }`}
                            style={{ width: `${percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Durum */}
                  <div className="text-right">
                    {isCompleted ? (
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        ✅ Tamamlandı
                      </span>
                    ) : (
                      <button className="px-3 py-1 bg-blue-100 text-blue-800 hover:bg-blue-200 rounded-full text-sm font-medium">
                        Başla
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Tüm hedefler tamamlandıysa */}
      {challenges.length > 0 && 
       challenges.every(c => (userProgress[c.id] || 0) >= c.target_count) && (
        <div className="mt-6 p-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg text-center">
          <div className="text-3xl mb-2">🎉</div>
          <h3 className="font-bold text-lg">Tüm Hedefler Tamamlandı!</h3>
          <p className="text-green-100">
            Harikasın! Yarın yeni hedeflerle devam et.
          </p>
        </div>
      )}
    </div>
  )
}