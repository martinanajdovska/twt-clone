'use client'

import React, { useState } from 'react'
import Feed from '@/components/tweets/Feed'
import { MessageCircle, Heart, ImageIcon } from 'lucide-react'

const TABS: { id: string; label: string; icon?: React.ReactNode }[] = [
    { id: 'tweets', label: 'Tweets' },
    { id: 'replies', label: 'Replies', icon: <MessageCircle size={18} /> },
    { id: 'likes', label: 'Likes', icon: <Heart size={18} /> },
    { id: 'media', label: 'Media', icon: <ImageIcon size={18} /> },
]

export default function ProfileFeed({
    profileUsername,
    currentUsername,
}: {
    profileUsername: string
    currentUsername: string
}) {
    const [activeTab, setActiveTab] = useState<string>('tweets')

    return (
        <div className="w-full">
            <div className="flex border-b border-border">
                {TABS.map((tab) => {
                    const isActive = activeTab === tab.id
                    return (
                        <button
                            key={tab.id}
                            type="button"
                            onClick={() => setActiveTab(tab.id)}
                            aria-current={isActive ? 'true' : undefined}
                            className={`flex-1 flex items-center justify-center gap-2 py-4 text-[15px] font-medium transition-colors relative hover:bg-muted/30 ${isActive
                                ? 'text-foreground'
                                : 'text-muted-foreground'
                                }`}
                        >
                            {tab.icon && <span className="shrink-0">{tab.icon}</span>}
                            <span>{tab.label}</span>
                            {isActive && (
                                <span
                                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"
                                    aria-hidden
                                />
                            )}
                        </button>
                    )
                })}
            </div>
            <div className="min-h-[200px]">
                <Feed
                    username={currentUsername}
                    isProfile={true}
                    profileTab={activeTab}
                    profileUsername={profileUsername}
                />
            </div>
        </div>
    )
}
