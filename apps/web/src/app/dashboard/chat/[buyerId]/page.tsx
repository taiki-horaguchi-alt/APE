'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { DashboardHeader } from '@/components/layout/DashboardHeader'
import { Card, CardContent } from '@/components/ui/Card'
import { createClient } from '@/lib/supabase/client'
import {
  ArrowLeft,
  Send,
  Loader2,
} from 'lucide-react'

interface MessageRow {
  id: string
  buyer_id: string
  organization_id: string
  sender_id: string
  content: string
  is_read: boolean
  created_at: string
}

function formatMessageTime(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleTimeString('ja-JP', { hour: '2-digit', minute: '2-digit' })
}

function formatMessageDate(dateStr: string) {
  const date = new Date(dateStr)
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

function groupMessagesByDate(messages: MessageRow[]) {
  const groups: { date: string; messages: MessageRow[] }[] = []

  for (const msg of messages) {
    const dateStr = new Date(msg.created_at).toLocaleDateString('ja-JP')
    const lastGroup = groups[groups.length - 1]

    if (lastGroup && lastGroup.date === dateStr) {
      lastGroup.messages = [...lastGroup.messages, msg]
    } else {
      groups.push({ date: dateStr, messages: [msg] })
    }
  }

  return groups
}

export default function ChatDetailPage() {
  const router = useRouter()
  const params = useParams()
  const buyerId = params.buyerId as string
  const supabase = createClient()

  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [buyerName, setBuyerName] = useState('')
  const [messages, setMessages] = useState<MessageRow[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [currentUserId, setCurrentUserId] = useState('')

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    async function loadData() {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('ログインが必要です')
        setCurrentUserId(user.id)

        // 取引先情報
        const { data: buyer, error: buyerError } = await supabase
          .from('buyers')
          .select('name')
          .eq('id', buyerId)
          .single()

        if (buyerError) throw buyerError
        setBuyerName(buyer.name)

        // メッセージ一覧
        const { data: msgs, error: msgError } = await supabase
          .from('messages')
          .select('*')
          .eq('buyer_id', buyerId)
          .order('created_at', { ascending: true })

        if (msgError) throw msgError
        setMessages(msgs ?? [])

        // 未読メッセージを既読に
        await supabase
          .from('messages')
          .update({ is_read: true })
          .eq('buyer_id', buyerId)
          .eq('is_read', false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [buyerId])

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`messages:${buyerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `buyer_id=eq.${buyerId}`,
        },
        (payload) => {
          const newMsg = payload.new as MessageRow
          setMessages((prev) => [...prev, newMsg])

          // 自分以外のメッセージは既読にする
          if (newMsg.sender_id !== currentUserId) {
            supabase
              .from('messages')
              .update({ is_read: true })
              .eq('id', newMsg.id)
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [buyerId, currentUserId])

  async function handleSend() {
    if (!newMessage.trim() || sending) return
    setSending(true)
    setError('')

    try {
      const { data: profile } = await supabase
        .from('users')
        .select('organization_id')
        .eq('id', currentUserId)
        .single()

      const { error: insertError } = await supabase
        .from('messages')
        .insert({
          buyer_id: buyerId,
          organization_id: profile?.organization_id ?? currentUserId,
          sender_id: currentUserId,
          content: newMessage.trim(),
        })

      if (insertError) throw insertError
      setNewMessage('')
      inputRef.current?.focus()
    } catch (err) {
      setError(err instanceof Error ? err.message : '送信に失敗しました')
    } finally {
      setSending(false)
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const messageGroups = groupMessagesByDate(messages)

  return (
    <div className="flex flex-col h-screen">
      <DashboardHeader
        title={buyerName}
        description="メッセージ"
      />

      {/* Back button */}
      <div className="px-6 pt-4">
        <button
          onClick={() => router.push('/dashboard/chat')}
          className="flex items-center gap-1 text-neutral-600 hover:text-neutral-900 transition-colors text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          一覧に戻る
        </button>
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-neutral-400">メッセージを送信して会話を始めましょう</p>
          </div>
        ) : (
          messageGroups.map((group) => (
            <div key={group.date}>
              {/* Date separator */}
              <div className="flex items-center justify-center mb-4">
                <span className="text-xs text-neutral-400 bg-neutral-100 px-3 py-1 rounded-full">
                  {formatMessageDate(group.messages[0].created_at)}
                </span>
              </div>

              {/* Messages */}
              <div className="space-y-3">
                {group.messages.map((msg) => {
                  const isOwn = msg.sender_id === currentUserId
                  return (
                    <div
                      key={msg.id}
                      className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-[70%] px-4 py-2.5 rounded-2xl ${
                          isOwn
                            ? 'bg-primary-500 text-white rounded-br-md'
                            : 'bg-neutral-100 text-neutral-800 rounded-bl-md'
                        }`}
                      >
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                        <p
                          className={`text-[10px] mt-1 ${
                            isOwn ? 'text-primary-200' : 'text-neutral-400'
                          }`}
                        >
                          {formatMessageTime(msg.created_at)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-6">
          <div className="p-2 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Input area */}
      <div className="border-t border-neutral-200 p-4">
        <div className="flex items-center gap-3 max-w-3xl mx-auto">
          <input
            ref={inputRef}
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="メッセージを入力..."
            className="flex-1 px-4 py-3 border border-neutral-200 rounded-full focus:ring-2 focus:ring-primary-500 focus:border-primary-500 outline-none"
            autoFocus
          />
          <button
            onClick={handleSend}
            disabled={sending || !newMessage.trim()}
            className="w-12 h-12 bg-primary-500 text-white rounded-full flex items-center justify-center hover:bg-primary-600 transition-colors disabled:opacity-50 flex-shrink-0"
          >
            {sending ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
