import Image from "next/image";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import { ZoomIn } from "lucide-react";
import { IMessageResponse } from "@/DTO/IMessageResponse";
import { formatRelativeTime } from "@/lib/relativeTime";
import React from "react";

function ImageWithFallback({
    src,
    fallbackSrc,
    alt,
    width,
    height,
    className,
    unoptimized,
}: {
    src: string;
    fallbackSrc?: string | null;
    alt: string;
    width: number;
    height: number;
    className?: string;
    unoptimized?: boolean;
}) {
    const [loaded, setLoaded] = React.useState(false);

    React.useEffect(() => {
        setLoaded(false);
        if (!fallbackSrc || fallbackSrc === src) return;
        const img = new window.Image();
        img.onload = () => setLoaded(true);
        img.onerror = () => setLoaded(false);
        img.src = src;
        return () => {
            img.onload = null;
            img.onerror = null;
        };
    }, [src, fallbackSrc]);

    const displaySrc = !fallbackSrc || loaded ? src : fallbackSrc;
    return (
        <Image
            src={displaySrc}
            alt={alt}
            width={width}
            height={height}
            className={className}
            unoptimized={unoptimized}
        />
    );
}

export default function MessageBubble({
    msg,
    isSelf,
    onImageClick,
}: {
    msg: IMessageResponse;
    isSelf: boolean;
    onImageClick?: (src: string) => void;
}) {
    const displayName = isSelf ? 'You' : `@${msg.senderUsername}`
    const hasImage = msg.imageUrl != null && msg.imageUrl !== ''
    const hasGif = msg.gifUrl != null && msg.gifUrl !== ''
    const imageSrc = msg.imageUrl ?? ''
    const imageFallbackSrc = msg.optimisticImageUrl ?? null

    return (
        <div className={`flex gap-3 ${isSelf ? 'flex-row-reverse' : ''} mb-4`}>
            <Link href={`/users/${msg.senderUsername}`} className="shrink-0 hover:opacity-90 transition-opacity">
                <Avatar className="h-9 w-9">
                    <AvatarImage src={msg.senderImageUrl ?? undefined} alt={msg.senderUsername} />
                    <AvatarFallback className="text-xs">{msg.senderUsername.slice(0, 2).toUpperCase()}</AvatarFallback>
                </Avatar>
            </Link>
            <div className={`flex flex-col max-w-[75%] ${isSelf ? 'items-end' : 'items-start'}`}>
                <span className="text-xs text-muted-foreground mb-0.5">{displayName}</span>
                <div className={`rounded-2xl px-4 py-2 text-sm ${isSelf ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md'}`}>
                    {(msg.content ?? '').length > 0 && <span>{msg.content}</span>}

                    {hasImage && (
                        <div
                            className="mt-1 rounded-lg overflow-hidden max-w-[320px] cursor-zoom-in group relative"
                            onClick={() => onImageClick?.(imageSrc)}
                        >
                            <ImageWithFallback
                                src={imageSrc}
                                fallbackSrc={imageFallbackSrc}
                                alt=""
                                width={320}
                                height={320}
                                className="object-cover w-full transition-opacity group-hover:opacity-90"
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/40 rounded-full p-2">
                                    <ZoomIn size={20} className="text-white" />
                                </div>
                            </div>
                        </div>
                    )}

                    {hasGif && !hasImage && (
                        <div
                            className="mt-1 rounded-lg overflow-hidden max-w-[320px] cursor-zoom-in group relative"
                            onClick={() => onImageClick?.(msg.gifUrl!)}
                        >
                            <Image
                                src={msg.gifUrl!}
                                alt="GIF"
                                width={320}
                                height={320}
                                className="object-cover w-full transition-opacity group-hover:opacity-90"
                                unoptimized
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <div className="bg-black/40 rounded-full p-2">
                                    <ZoomIn size={20} className="text-white" />
                                </div>
                            </div>
                        </div>
                    )}
                </div>
                <span className="text-xs text-muted-foreground mt-0.5">{formatRelativeTime(msg.createdAt)}</span>
            </div>
        </div>
    )
}