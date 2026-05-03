
"use client";
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import AdminThreadLoader from '@/components/messaging/AdminThreadLoader';
import { useCurrentLocale } from '@/hooks/useCurrentLocale';

const contactText = {
  tr: {
    title: 'İletişim',
    subtitle: 'Sorularınız, önerileriniz veya destek talepleriniz için bize ulaşabilirsiniz. Doğrudan',
    emailSuffix: 'adresine mail atın.',
    loading: 'Yükleniyor...',
    chatTitle: 'Admin ile Mesajlaş',
    loginRequired: 'Mesajlaşmak için giriş yapmalısınız.',
  },
  en: {
    title: 'Contact',
    subtitle: 'For questions, suggestions or support requests, you can reach us. Send an email directly to',
    emailSuffix: '.',
    loading: 'Loading...',
    chatTitle: 'Message Admin',
    loginRequired: 'You must be logged in to send messages.',
  },
  de: {
    title: 'Kontakt',
    subtitle: 'Bei Fragen, Vorschlägen oder Supportanfragen können Sie uns kontaktieren. Senden Sie eine E-Mail direkt an',
    emailSuffix: '.',
    loading: 'Wird geladen...',
    chatTitle: 'Admin kontaktieren',
    loginRequired: 'Sie müssen angemeldet sein, um Nachrichten zu senden.',
  },
  fr: {
    title: 'Contact',
    subtitle: 'Pour vos questions, suggestions ou demandes d\'assistance, contactez-nous. Envoyez un e-mail directement à',
    emailSuffix: '.',
    loading: 'Chargement...',
    chatTitle: 'Contacter l\'admin',
    loginRequired: 'Vous devez être connecté pour envoyer des messages.',
  },
  es: {
    title: 'Contacto',
    subtitle: 'Para preguntas, sugerencias o solicitudes de soporte, puede contactarnos. Envíe un correo directamente a',
    emailSuffix: '.',
    loading: 'Cargando...',
    chatTitle: 'Contactar al admin',
    loginRequired: 'Debes iniciar sesión para enviar mensajes.',
  },
  ru: {
    title: 'Контакты',
    subtitle: 'По вопросам, предложениям или заявкам в поддержку вы можете связаться с нами. Напишите нам напрямую на',
    emailSuffix: '.',
    loading: 'Загрузка...',
    chatTitle: 'Написать администратору',
    loginRequired: 'Для отправки сообщений необходимо войти в систему.',
  },
} as const
type ContactLocale = keyof typeof contactText

export default function ContactPage() {
  const locale = useCurrentLocale()
  const t = contactText[(locale as ContactLocale) in contactText ? (locale as ContactLocale) : 'tr']
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getUser().then(async ({ data }) => {
      const authId = data.user?.id;
      console.log('auth.users.id:', authId);
      if (!authId) {
        setUserId(null);
        setLoading(false);
        return;
      }
      // user_profiles tablosundan id'yi çek
      const { data: profiles } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('user_id', authId)
        .single();
      if (profiles && profiles.id) {
        setUserId(profiles.id);
        console.log('user_profiles.id:', profiles.id);
      } else {
        setUserId(null);
      }
      setLoading(false);
    });
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-cyan-50 to-white">
      <main className="container-custom py-8 md:py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-lg p-8">
          <h1 className="text-4xl font-bold text-center text-cyan-700 mb-6">{t.title}</h1>
          <p className="text-lg text-gray-700 text-center mb-8">
            {t.subtitle} <a href="mailto:help@spotitforme.com" className="text-cyan-600 underline">help@spotitforme.com</a> {t.emailSuffix}
          </p>
          {loading ? (
            <div className="text-center py-8">{t.loading}</div>
          ) : userId ? (
            <div className="mb-8">
              <h2 className="text-2xl font-semibold text-cyan-700 mb-4 text-center">{t.chatTitle}</h2>
              <AdminThreadLoader userId={userId} />
            </div>
          ) : (
            <div className="text-center text-red-600 py-8">{t.loginRequired}</div>
          )}
          <div className="mt-10 text-center text-sm text-gray-500">
            {/* Diğer iletişim bilgileri veya açıklamalar buraya eklenebilir */}
          </div>
        </div>
      </main>
    </div>
  );
}
