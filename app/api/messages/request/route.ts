import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export const runtime = 'nodejs'

const REQUEST_WINDOW_MS = 10 * 60 * 1000
const REQUEST_LIMIT_PER_USER = 8
const REOPEN_COOLDOWN_MS = 5 * 60 * 1000

const inMemoryRateLimit = new Map<string, { count: number; resetTime: number }>()

type ThreadType = 'general' | 'social' | 'shop' | 'spot' | 'help' | 'reward' | 'trade'

const ALLOWED_THREAD_TYPES: ThreadType[] = [
  'general',
  'social',
  'shop',
  'spot',
  'help',
  'reward',
  'trade',
]

const UUID_REGEX =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i

function isValidUuid(value: string) {
  return UUID_REGEX.test(value)
}

function resolveThreadType(value?: string): ThreadType {
  if (value && ALLOWED_THREAD_TYPES.includes(value as ThreadType)) {
    return value as ThreadType
  }

  return 'general'
}

function getThreadTypeCandidates(threadType: ThreadType): ThreadType[] {
  if (threadType === 'reward') {
    return ['reward', 'help']
  }

  return [threadType]
}

function checkInMemoryRateLimit(userId: string) {
  const now = Date.now()
  const current = inMemoryRateLimit.get(userId)

  if (!current || now > current.resetTime) {
    inMemoryRateLimit.set(userId, {
      count: 1,
      resetTime: now + REQUEST_WINDOW_MS,
    })
    return true
  }

  if (current.count >= REQUEST_LIMIT_PER_USER) {
    return false
  }

  current.count += 1
  return true
}

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRole) {
    throw new Error('Supabase service role environment variables are missing')
  }

  return createClient(supabaseUrl, serviceRole)
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Yetkilendirme hatası' }, { status: 401 })
    }

    const token = authHeader.replace('Bearer ', '')
    const supabase = getSupabaseAdmin()

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser(token)

    if (authError || !user?.id) {
      return NextResponse.json({ error: 'Kullanıcı doğrulanamadı' }, { status: 401 })
    }

    const body = await request.json()
    const receiverId = String(body?.receiverId || '').trim()
    const content = String(body?.content || '').trim()
    const requestedThreadType = resolveThreadType(body?.threadType)
    const threadTypeCandidates = getThreadTypeCandidates(requestedThreadType)
    let activeThreadType = threadTypeCandidates[0]
    const senderId = user.id

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'Alıcı ve mesaj zorunludur' }, { status: 400 })
    }

    if (!isValidUuid(receiverId)) {
      return NextResponse.json({ error: 'Geçersiz alıcı kimliği' }, { status: 400 })
    }

    if (content.length > 2000) {
      return NextResponse.json({ error: 'Mesaj çok uzun' }, { status: 400 })
    }

    if (receiverId === senderId) {
      return NextResponse.json({ error: 'Kendinize mesaj talebi gönderemezsiniz' }, { status: 400 })
    }

    if (!checkInMemoryRateLimit(senderId)) {
      return NextResponse.json(
        { error: 'Çok sık deneme yapıyorsunuz. Lütfen biraz sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    const windowStart = new Date(Date.now() - REQUEST_WINDOW_MS).toISOString()
    const { count: recentPendingCount, error: recentPendingError } = await supabase
      .from('message_threads')
      .select('id', { count: 'exact', head: true })
      .eq('request_initiator_id', senderId)
      .eq('request_status', 'pending')
      .gte('updated_at', windowStart)

    if (recentPendingError) {
      throw recentPendingError
    }

    if ((recentPendingCount || 0) >= REQUEST_LIMIT_PER_USER) {
      return NextResponse.json(
        { error: 'Kısa sürede çok fazla talep gönderdiniz. Lütfen sonra tekrar deneyin.' },
        { status: 429 }
      )
    }

    const nowIso = new Date().toISOString()

    const { data: existingThread, error: existingThreadError } = await supabase
      .from('message_threads')
      .select('id, participant1_id, participant2_id, request_status, request_initiator_id, updated_at')
      .or(
        `and(participant1_id.eq.${senderId},participant2_id.eq.${receiverId}),and(participant1_id.eq.${receiverId},participant2_id.eq.${senderId})`
      )
      .in('thread_type', threadTypeCandidates)
      .eq('status', 'active')
      .order('last_message_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (existingThreadError) {
      throw existingThreadError
    }

    if (existingThread?.id) {
      if (existingThread.request_status === 'pending') {
        const isOwnPending = existingThread.request_initiator_id === senderId
        return NextResponse.json({
          threadId: existingThread.id,
          code: isOwnPending ? 'PENDING_ALREADY_SENT' : 'PENDING_FROM_OTHER_USER',
          message: isOwnPending
            ? 'Bu kullanıcıya mesajlaşma talebi zaten gönderildi. Onay bekleniyor.'
            : 'Bu kullanıcı size mesajlaşma talebi göndermiş. Önce talebi yanıtlayın.',
        })
      }

      if (existingThread.request_status === 'rejected') {
        if (
          existingThread.request_initiator_id === senderId &&
          existingThread.updated_at &&
          Date.now() - new Date(existingThread.updated_at).getTime() < REOPEN_COOLDOWN_MS
        ) {
          return NextResponse.json(
            { error: 'Talep çok kısa sürede tekrar gönderilemez. Lütfen biraz bekleyin.' },
            { status: 429 }
          )
        }

        const { error: reopenError } = await supabase
          .from('message_threads')
          .update({
            request_status: 'pending',
            request_initiator_id: senderId,
            request_message: content,
            request_responded_at: null,
            last_message_at: nowIso,
            last_message_preview: 'Mesajlaşma talebi gönderildi',
            updated_at: nowIso,
          })
          .eq('id', existingThread.id)

        if (reopenError) {
          throw reopenError
        }

        return NextResponse.json({
          threadId: existingThread.id,
          code: 'REQUEST_REOPENED',
          message: 'Mesajlaşma talebi yeniden gönderildi.',
        })
      }

      const { error: messageError } = await supabase
        .from('messages')
        .insert({
          thread_id: existingThread.id,
          sender_id: senderId,
          receiver_id: receiverId,
          content,
        })

      if (messageError) {
        throw messageError
      }

      return NextResponse.json({
        threadId: existingThread.id,
        code: 'MESSAGE_SENT',
        message: 'Mesaj gönderildi.',
      })
    }

    let thread: { id: string } | null = null
    let threadError: any = null

    for (const candidateType of threadTypeCandidates) {
      const insertResult = await supabase
        .from('message_threads')
        .insert({
          participant1_id: senderId,
          participant2_id: receiverId,
          thread_type: candidateType,
          status: 'active',
          request_status: 'pending',
          request_initiator_id: senderId,
          request_message: content,
          last_message_preview: 'Mesajlaşma talebi gönderildi',
          last_message_at: nowIso,
        })
        .select('id')
        .single()

      if (!insertResult.error && insertResult.data?.id) {
        thread = insertResult.data
        activeThreadType = candidateType
        threadError = null
        break
      }

      threadError = insertResult.error

      const isThreadTypeConstraintError =
        insertResult.error?.code === '23514' &&
        String(insertResult.error?.message || '').includes('message_threads_thread_type_check')

      if (!isThreadTypeConstraintError) {
        break
      }
    }

    if (threadError || !thread?.id) {
      throw threadError || new Error('Thread oluşturulamadı')
    }

    await supabase.from('thread_participants').insert([
      { thread_id: thread.id, user_id: senderId },
      { thread_id: thread.id, user_id: receiverId },
    ])

    return NextResponse.json({
      threadId: thread.id,
      code: 'REQUEST_CREATED',
      message:
        activeThreadType !== requestedThreadType
          ? 'Mesajlaşma talebi gönderildi (uyumluluk modunda). Karşı taraf onaylayınca sohbet açılacak.'
          : 'Mesajlaşma talebi gönderildi. Karşı taraf onaylayınca sohbet açılacak.',
    })
  } catch (error: any) {
    console.error('Message request endpoint error:', error)
    return NextResponse.json(
      {
        error: error?.message || 'Mesaj talebi işlenemedi',
      },
      { status: 500 }
    )
  }
}