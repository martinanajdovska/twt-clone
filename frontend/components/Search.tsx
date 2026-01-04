'use client';

import React, {useEffect, useRef, useState} from 'react';
import {useQuery} from '@tanstack/react-query';
import {useDebounce} from 'use-debounce';
import {useRouter, useSearchParams} from 'next/navigation';
import { Search as SearchIcon, User } from 'lucide-react';

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

const fetchUsers = async (searchTerm: string) => {
    if (!searchTerm) return [];

    const response = await fetch(`${BASE_URL}/api/users?search=${searchTerm}`, {
        method: 'GET',
        headers: {'Content-Type': 'application/json'},
        credentials: 'include'
    });

    if (!response.ok) throw new Error('Error getting user data');
    return response.json();
};

const Search = () => {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [inputValue, setInputValue] = useState(searchParams.get('search') || "");
    const [debouncedSearch] = useDebounce(inputValue, 700);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const {data, isLoading} = useQuery({
        queryKey: ['search', debouncedSearch],
        queryFn: () => fetchUsers(debouncedSearch),
        enabled: debouncedSearch.length > 0,
    });


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

    return (
        <div className="relative w-full" ref={containerRef}>
            <div className="relative group bg-secondary rounded-lg">
                <div className="absolute inset-y-0 -left-5 pl-4 flex items-center pointer-events-none">
                    <SearchIcon size={18} className="text-muted-foreground group-focus-within:text-primary transition-colors" />
                </div>
                <input
                    value={inputValue}
                    onChange={(e) => {
                        setInputValue(e.target.value);
                        setIsOpen(true);
                    }}
                    onFocus={() => setIsOpen(true)}
                    type="text"
                    placeholder="Search users..."
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
                    {data && data.length > 0 ? (
                        <div className="flex flex-col">
                            {data.map((username: string) => (
                                <button
                                    key={username}
                                    onClick={() => handleSelectUser(username)}
                                    className="px-4 py-3 hover:bg-muted flex items-center gap-3 transition-colors text-left"
                                >
                                    <div className="h-9 w-9 rounded-full bg-muted flex items-center justify-center shrink-0">
                                        <User size={18} className="text-muted-foreground" />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-sm text-foreground">@{username}</span>
                                        <span className="text-xs text-muted-foreground">View profile</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : !isLoading && (
                        <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                            No users found for <span className="font-bold text-foreground italic">&quot;{inputValue}&quot;</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default Search;