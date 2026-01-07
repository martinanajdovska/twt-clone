'use client'
import {
    Dialog,
    DialogContent,
    DialogTrigger,
} from "@/components/ui/dialog"
import { MessageCircle } from "lucide-react"
import TweetForm from "@/components/tweets/TweetForm"
import React, { useState } from "react"
import Tweet from "@/components/tweets/Tweet";
import {ITweetResponse} from "@/dtos/ITweetResponse";

const Reply = ({ tweet, username, repliesCount }: { tweet: ITweetResponse, username:string, repliesCount:number }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [repliesCountState, setRepliesCountState] = useState(repliesCount)

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <button className="flex items-center gap-1 group/reply hover:text-blue-500 transition-colors">
                    <div className="p-2 rounded-full group-hover/reply:bg-blue-500/10">
                        <MessageCircle size={18} />
                    </div>
                    <span className="text-sm">{repliesCountState}</span>
                </button>
            </DialogTrigger>

            <DialogContent className="sm:max-w-[600px] p-0 gap-0 border-gray-800">
                <div className="p-4">
                    <div className="relative">
                        <div className="absolute left-[20px] top-[40px] bottom-0 w-[2px] bg-border shadow-sm" />

                        <Tweet tweet={tweet} username={username} />
                    </div>
                    <div className="mt-2">
                        <TweetForm username={username} parentId={tweet.id} onSuccess={() => {
                            setIsOpen(false)
                            setRepliesCountState(prev => (prev + 1));
                            }
                        }
                        />
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default Reply;