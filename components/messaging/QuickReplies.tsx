// components/messaging/QuickReplies.tsx
'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

interface QuickRepliesProps {
  shopId?: string
  userId?: string
  onSelectTemplate: (content: string) => void
}

export default function QuickReplies({ shopId, userId, onSelectTemplate }: QuickRepliesProps) {
  const [templates, setTemplates] = useState<any[]>([])
  const [showForm, setShowForm] = useState(false)
  const [newTemplate, setNewTemplate] = useState({ title: '', content: '', category: '' })

  useEffect(() => {
    fetchTemplates()
  }, [shopId, userId])

  const fetchTemplates = async () => {
    try {
      let query = supabase.from('quick_reply_templates').select('*')
      
      if (shopId) {
        query = query.eq('shop_id', shopId)
      } else if (userId) {
        query = query.eq('user_id', userId)
      }
      
      const { data } = await query.order('usage_count', { ascending: false })
      setTemplates(data || [])
    } catch (error) {
      console.error('Template yüklenemedi:', error)
    }
  }

  const handleCreateTemplate = async () => {
    if (!newTemplate.title || !newTemplate.content) return

    try {
      const { error } = await supabase
        .from('quick_reply_templates')
        .insert({
          ...(shopId ? { shop_id: shopId } : { user_id: userId }),
          title: newTemplate.title,
          content: newTemplate.content,
          category: newTemplate.category || 'general'
        })

      if (error) throw error

      setNewTemplate({ title: '', content: '', category: '' })
      setShowForm(false)
      fetchTemplates()
    } catch (error) {
      console.error('Template oluşturma hatası:', error)
    }
  }

  const handleUseTemplate = async (templateId: string, content: string) => {
    try {
      // Kullanım sayısını artır
      await supabase.rpc('increment_template_usage', { template_id: templateId })
      
      // Template'i seç
      onSelectTemplate(content)
    } catch (error) {
      console.error('Template kullanım hatası:', error)
    }
  }

  const categories = [
    { value: 'greeting', label: 'Selamlama', icon: '👋' },
    { value: 'price', label: 'Fiyat', icon: '💰' },
    { value: 'delivery', label: 'Teslimat', icon: '🚚' },
    { value: 'thanks', label: 'Teşekkür', icon: '🙏' },
    { value: 'followup', label: 'Takip', icon: '⏰' }
  ]

  return (
    <div className="border-t border-gray-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-sm font-medium text-gray-700">⚡ Hızlı Yanıtlar</h4>
        <button
          onClick={() => setShowForm(!showForm)}
          className="text-xs text-blue-600 hover:text-blue-800"
        >
          {showForm ? 'İptal' : '+ Yeni'}
        </button>
      </div>

      {/* Yeni template formu */}
      {showForm && (
        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
          <input
            type="text"
            placeholder="Template adı"
            value={newTemplate.title}
            onChange={(e) => setNewTemplate({...newTemplate, title: e.target.value})}
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
          />
          <textarea
            placeholder="Template içeriği"
            value={newTemplate.content}
            onChange={(e) => setNewTemplate({...newTemplate, content: e.target.value})}
            className="w-full mb-2 px-3 py-2 border border-gray-300 rounded text-sm"
            rows={2}
          />
          <div className="flex justify-between">
            <select
              value={newTemplate.category}
              onChange={(e) => setNewTemplate({...newTemplate, category: e.target.value})}
              className="text-sm border border-gray-300 rounded px-2 py-1"
            >
              <option value="">Kategori seç</option>
              {categories.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.icon} {cat.label}</option>
              ))}
            </select>
            <button
              onClick={handleCreateTemplate}
              className="bg-blue-600 text-white text-sm px-3 py-1 rounded"
            >
              Kaydet
            </button>
          </div>
        </div>
      )}

      {/* Template listesi */}
      <div className="flex flex-wrap gap-2">
        {templates.slice(0, 5).map((template) => (
          <button
            key={template.id}
            onClick={() => handleUseTemplate(template.id, template.content)}
            className="inline-flex items-center px-3 py-1.5 rounded-full text-sm bg-gray-100 hover:bg-gray-200 text-gray-800"
            title={template.content}
          >
            <span className="mr-1">
              {categories.find(c => c.value === template.category)?.icon || '💬'}
            </span>
            {template.title}
            {template.usage_count > 0 && (
              <span className="ml-2 text-xs text-gray-500">{template.usage_count}</span>
            )}
          </button>
        ))}
        
        {templates.length === 0 && !showForm && (
          <p className="text-sm text-gray-500 italic">
            Henüz hızlı yanıt şablonunuz yok. "+ Yeni" butonundan ekleyin.
          </p>
        )}
      </div>
    </div>
  )
}