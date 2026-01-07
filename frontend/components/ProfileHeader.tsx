'use client'
import Follow from "@/components/Follow";
import React, {useRef, useState} from "react";
import {useQuery, useQueryClient} from "@tanstack/react-query";
import {fetchProfileHeader} from "@/api-calls/users-api";
import {Avatar, AvatarFallback, AvatarImage} from "@/components/ui/avatar";
import {useEditProfilePicture} from "@/hooks/useEditProfilePicture";
import {Camera, Loader2} from "lucide-react";

const ProfileHeader =  ({username, token, isSelf}: {username:string, token:string, isSelf:boolean}) => {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const queryClient = useQueryClient();

    const { data, isLoading } = useQuery({
        queryKey: ['profileHeader', username],
        queryFn: () => fetchProfileHeader({username}),
    });

    const { mutate: editProfilePicture, isPending } = useEditProfilePicture(username);

    if (isLoading) return <div>Loading...</div>;

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPreviewUrl(URL.createObjectURL(file));

            const formData = new FormData();
            formData.append("image", file);
            editProfilePicture(formData, {
                onSuccess: () => {
                    queryClient.invalidateQueries({ queryKey: ['profileHeader', username] });
                    setPreviewUrl(null)
                }
            });
        }
    }

    const triggerFileInput = () => {
        if (isSelf && !isPending) {
            fileInputRef.current?.click();
        }
    };


    return (
        <div className="bg-card border-x border-b border-border p-6 space-y-4 shadow-sm">
            <div className="flex items-center justify-between">
                <div className="flex items-center">
                    <div className="relative group">
                        <div
                            onClick={triggerFileInput}
                            className={`relative h-20 w-20 overflow-hidden rounded-full border-2 border-background shadow-md ${isSelf ? 'cursor-pointer' : ''}`}
                        >
                            <Avatar className="h-full w-full">
                                <AvatarImage src={previewUrl || data.imageUrl} className="object-cover" />
                                <AvatarFallback className="text-xl bg-accent">
                                    {username.charAt(0).toUpperCase()}
                                </AvatarFallback>
                            </Avatar>

                            {isSelf && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    {isPending ? (
                                        <Loader2 className="text-white animate-spin" size={24} />
                                    ) : (
                                        <Camera className="text-white" size={24} />
                                    )}
                                </div>
                            )}
                        </div>

                        <input
                            type="file"
                            ref={fileInputRef}
                            accept="image/*"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </div>

                    <div className="flex-col">
                        {data.followsYou && (
                            <p className="inline-block bg-muted text-muted-foreground text-[11px] px-1.5 py-0.5 rounded font-medium mt-1 uppercase tracking-wider">
                                Follows you
                            </p>
                        )}
                        <h1 className="text-2xl tracking-tight font-bold ml-3">{username}</h1>

                    </div>
                </div>
                <div>

                </div>

                {!isSelf && (
                    <div className="shrink-0">
                        <Follow username={username} isFollowed={data.followed} token={token} />
                    </div>
                )}
            </div>

            <div className="flex gap-6 items-center pt-2 ">
                <div className="flex gap-1 items-center hover:underline cursor-pointer decoration-muted-foreground/50">
                    <span className="font-bold text-foreground">{data.following}</span>
                    <span className="text-muted-foreground text-sm">Following</span>
                </div>
                <div className="flex gap-1 items-center hover:underline cursor-pointer decoration-muted-foreground/50">
                    <span className="font-bold text-foreground">{data.followers}</span>
                    <span className="text-muted-foreground text-sm">Followers</span>
                </div>

            </div>
        </div>
    );
};

export default ProfileHeader;