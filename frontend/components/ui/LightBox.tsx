'use client'

import { useEffect } from 'react'
import { X, Download } from 'lucide-react'
import { saveImageFromUrl } from '@/lib/saveImageFromUrl'

interface LightboxProps {
    src: string
    onClose: () => void
}

export default function Lightbox({ src, onClose }: LightboxProps) {
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
        window.addEventListener('keydown', handler)
        return () => window.removeEventListener('keydown', handler)
    }, [onClose])

    const handleDownload = async (e: React.MouseEvent) => {
        e.stopPropagation()
        try {
            await saveImageFromUrl(src)
        } catch (err) {
            window.open(src, '_blank')
        }
    }

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4"
            onClick={onClose}
        >
            <div className="absolute top-6 right-6 flex items-center gap-4 z-[110]">
                <button
                    onClick={handleDownload}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all flex items-center gap-2 px-3"
                    title="Save Image"
                >
                    <Download size={20} />
                    <span className="text-sm font-medium">Save</span>
                </button>

                <button
                    onClick={onClose}
                    className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
                    title="Close"
                >
                    <X size={24} />
                </button>
            </div>

            <div
                className="relative max-w-full max-h-full flex items-center justify-center"
                onClick={(e) => e.stopPropagation()}
            >
                <img
                    src={src}
                    alt="Expanded view"
                    className="rounded-lg object-contain max-w-[95vw] max-h-[95vh] shadow-2xl select-none"
                />
            </div>
        </div>
    )
}