// lib/email-queue.ts
import { supabase } from './supabase'

export interface EmailQueueItem {
  id?: string
  type: string
  recipient: string
  subject: string
  data: any
  status: 'pending' | 'processing' | 'sent' | 'failed'
  attempts: number
  created_at?: string
  sent_at?: string
}

export class EmailQueue {
  static async addToQueue(item: Omit<EmailQueueItem, 'status' | 'attempts'>) {
    try {
      const { data, error } = await supabase
        .from('email_queue')
        .insert({
          type: item.type,
          recipient: item.recipient,
          subject: item.subject,
          data: item.data,
          status: 'pending',
          attempts: 0
        })
        .select()
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Email kuyruğa eklenemedi:', error)
      return null
    }
  }

  static async processQueue(limit: number = 50) {
    try {
      // Bekleyen email'leri al
      const { data: pendingEmails } = await supabase
        .from('email_queue')
        .select('*')
        .eq('status', 'pending')
        .lt('attempts', 3)
        .limit(limit)
        .order('created_at', { ascending: true })

      if (!pendingEmails || pendingEmails.length === 0) {
        return { processed: 0, success: 0, failed: 0 }
      }

      let success = 0
      let failed = 0

      for (const email of pendingEmails) {
        try {
          // Durumu processing'e çevir
          await supabase
            .from('email_queue')
            .update({ status: 'processing' })
            .eq('id', email.id)

          // Email gönder
          const response = await fetch('/api/send-email', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              to: email.recipient,
              template: email.type,
              data: email.data,
              subject: email.subject
            })
          })

          const result = await response.json()

          if (response.ok) {
            // Başarılı
            await supabase
              .from('email_queue')
              .update({
                status: 'sent',
                sent_at: new Date().toISOString()
              })
              .eq('id', email.id)
            success++
          } else {
            // Başarısız
            await supabase
              .from('email_queue')
              .update({
                attempts: email.attempts + 1,
                status: email.attempts >= 2 ? 'failed' : 'pending'
              })
              .eq('id', email.id)
            failed++
          }

          // Rate limiting
          if ((success + failed) % 10 === 0) {
            await new Promise(resolve => setTimeout(resolve, 1000))
          }

        } catch (error) {
          console.error(`Email işleme hatası (${email.id}):`, error)
          failed++
          
          await supabase
            .from('email_queue')
            .update({
              attempts: email.attempts + 1,
              status: 'failed'
            })
            .eq('id', email.id)
        }
      }

      return { processed: pendingEmails.length, success, failed }
    } catch (error) {
      console.error('Email queue işleme hatası:', error)
      return { processed: 0, success: 0, failed: 0 }
    }
  }

  static async getQueueStats() {
    try {
      const { data, error } = await supabase
        .rpc('get_email_queue_stats')

      if (error) throw error
      return data
    } catch (error) {
      console.error('Queue stats alınamadı:', error)
      return null
    }
  }
}