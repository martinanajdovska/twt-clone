'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useDebounce } from 'use-debounce';
import { useRouter, useSearchParams } from 'next/navigation';
import { Search as SearchIcon, User } from 'lucide-react';
import { fetchUsers } from "@/api-calls/users-api";
import { fetchTweetsBySearchTerm } from '@/api-calls/tweets-api';
import { ITweetResponse } from '@/DTO/ITweetResponse';

const Search = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [inputValue, setInputValue] = useState(searchParams.get('search') || "");
    const [debouncedSearch] = useDebounce(inputValue, 700);
    const [isOpen, setIsOpen] = useState(false);
    const [highlightedIndex, setHighlightedIndex] = useState(0);
    const containerRef = useRef<HTMLDivElement>(null);
    const [tab, setTab] = useState<'users' | 'tweets'>('users');

    const { data: users = [], isLoading: usersLoading } = useQuery({
        queryKey: ['search-users', debouncedSearch],
        queryFn: () => fetchUsers(debouncedSearch),
        enabled: debouncedSearch.length > 0 && tab === 'users',
    });

    const { data: tweets = [], isLoading: tweetsLoading } = useQuery({
        queryKey: ['search-tweets', debouncedSearch],
        queryFn: () => fetchTweetsBySearchTerm(debouncedSearch),
        enabled: debouncedSearch.length > 0 && tab === 'tweets',
    });

    const isLoading = usersLoading || tweetsLoading;
    const activeData = tab === 'users' ? users : tweets;

    useEffect(() => {
        setHighlightedIndex(0);
    }, [users.length, tweets.length]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSelectUser = (username: string) => {
        setIsOpen(false);
        setInputValue("");
        router.push(`/users/${username}`);
    };

    const handleSelectTweet = (id: number) => {
        setIsOpen(false);
        setInputValue("");
        router.push(`/tweets/${id}`);
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (!isOpen || activeData.length === 0) return;
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.min(i + 1, activeData.length - 1));
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setHighlightedIndex((i) => Math.max(i - 1, 0));
        } else if (e.key === 'Enter') {
            e.preventDefault();
            if (tab === 'users') handleSelectUser(users[highlightedIndex]);
            else handleSelectTweet(tweets[highlightedIndex].id);
        } else if (e.key === 'Escape') {
            setIsOpen(false);
        }
    };

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative group bg-secondary rounded-lg">
                <div className="absolute inset-y-0 -left-5 pl-4 flex items-center pointer-events-none">
                    <SearchIcon size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    value={inputValue}
                    onChange={(e) => { setInputValue(e.target.value); setIsOpen(true); }}
                    onFocus={() => setIsOpen(true)}
                    onKeyDown={handleKeyDown}
                    type="text"
                    placeholder="Search..."
                    className="w-full bg-muted/50 border-none rounded-full py-2.5 pl-11 pr-10 text-sm focus:bg-background focus:ring-2 focus:ring-primary transition-all placeholder:text-muted-foreground outline-none"
                />
                {isLoading && (
                    <div className="absolute right-3 top-2.5">
                        <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full" />
                    </div>
                )}
            </div>

            {isOpen && inputValue.length > 0 && (
                <div className="absolute mt-2 w-full bg-card border border-border rounded-xl shadow-2xl z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="flex border-b border-border">
                        <button
                            onClick={() => { setTab('users'); setHighlightedIndex(0); }}
                            className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'users' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Users
                        </button>
                        <button
                            onClick={() => { setTab('tweets'); setHighlightedIndex(0); }}
                            className={`flex-1 py-2 text-sm font-semibold transition-colors ${tab === 'tweets' ? 'border-b-2 border-primary text-primary' : 'text-muted-foreground hover:text-foreground'}`}
                        >
                            Tweets
                        </button>
                    </div>

                    {tab === 'users' && (
                        <div className="flex flex-col">
                            {users.length > 0 ? users.map((username: string, i: number) => (
                                <button
                                    key={username}
                                    type="button"
                                    onClick={() => handleSelectUser(username)}
                                    className={`px-4 py-3 flex items-center gap-3 transition-colors text-left ${i === highlightedIndex ? '!bg-primary/15 ring-inset ring-2 ring-primary/40' : 'hover:bg-muted'}`}
                                >
                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <User size={18} className="text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground">@{username}</span>
                                        <span className="text-xs text-muted-foreground">View profile</span>
                                    </div>
                                </button>
                            )) : !isLoading && (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No users found for <span className="font-bold text-foreground italic">&quot;{inputValue}&quot;</span>
                                </div>
                            )}
                        </div>
                    )}

                    {tab === 'tweets' && (
                        <div className="flex flex-col">
                            {tweets.length > 0 ? tweets.map((tweet: ITweetResponse, i: number) => (
                                <button
                                    key={tweet.id}
                                    type="button"
                                    onClick={() => handleSelectTweet(tweet.id)}
                                    className={`px-4 py-3 flex flex-col gap-1 transition-colors text-left ${i === highlightedIndex ? '!bg-primary/15 ring-inset ring-2 ring-primary/40' : 'hover:bg-muted'}`}
                                >
                                    <span className="font-bold text-sm text-foreground">@{tweet.username}</span>
                                    <span className="text-sm text-muted-foreground line-clamp-2">{tweet.content}</span>
                                </button>
                            )) : !isLoading && (
                                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                                    No tweets found for <span className="font-bold text-foreground italic">&quot;{inputValue}&quot;</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;