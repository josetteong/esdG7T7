import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

let toastId = 0

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const toast = useCallback((title, msg, type = 'success') => {
    const id = ++toastId
    setToasts((prev) => [...prev, { id, title, msg, type }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 5000)
  }, [])

  return (
    <ToastContext.Provider value={toast}>
      {children}
      <div className="fixed top-14 right-4 z-50 flex flex-col gap-2 pointer-events-none">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`bg-white border border-gray-200 rounded-lg px-4 py-2.5 text-sm max-w-xs pointer-events-auto shadow-sm animate-slide-in
              ${t.type === 'success' ? 'border-l-4 border-l-brand-600' : ''}
              ${t.type === 'warning' ? 'border-l-4 border-l-amber-400' : ''}
              ${t.type === 'error'   ? 'border-l-4 border-l-red-400'   : ''}
            `}
          >
            <p className="font-medium text-gray-900">{t.title}</p>
            {t.msg && <p className="text-xs text-gray-500 mt-0.5">{t.msg}</p>}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
