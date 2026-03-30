export default function Modal({ open, onClose, title, children, footer }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/35">
      <div className="bg-white rounded-xl border border-gray-200 p-6 w-[90%] max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-base font-medium">{title}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-700 text-lg px-1">
            ×
          </button>
        </div>
        <div>{children}</div>
        {footer && <div className="mt-5 flex gap-2 justify-end flex-wrap">{footer}</div>}
      </div>
    </div>
  )
}
