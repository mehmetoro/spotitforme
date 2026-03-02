// components/shop/mobile/ShopMobileActions.tsx
export default function ShopMobileActions({ 
  shopId,
  onContact,
  onFollow,
  onShare 
}: { 
  shopId: string,
  onContact: () => void,
  onFollow: () => void,
  onShare: () => void 
}) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-around">
      <button onClick={onContact}>💬 İletişim</button>
      <button onClick={onFollow}>❤️ Takip</button>
      <button onClick={onShare}>📤 Paylaş</button>
    </div>
  )
}