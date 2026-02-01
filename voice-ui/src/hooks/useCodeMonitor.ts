/**
 * useCodeMonitor - Polls extension for code context and detects typing pauses
 * Implements Channel 1 (continuous updates) and Channel 2 (typing pause reviews)
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { getContext } from '../api';

interface CodeContext {
    mode: string;
    fileName: string;
    language: string;
    fileContent: string;
    surroundingCode: string;
    cursorLine: number;
    totalLines: number;
    selectedText: string | null;
    recentChanges: string[];
    isTyping: boolean;
    lastChangeTime: number;
    secondsSinceLastChange: number;
    changesSinceLastPoll: string[];
    hasNewChanges: boolean;
}

interface UseCodeMonitorOptions {
    /** How often to poll for context updates (ms) */
    pollInterval?: number;
    /** Seconds of inactivity after typing before triggering a review */
    pauseThreshold?: number;
    /** Called every poll with fresh context (Channel 1) */
    onContextUpdate?: (context: CodeContext) => void;
    /** Called when user pauses typing (Channel 2) */
    onTypingPause?: (context: CodeContext) => void;
    /** Whether monitoring is enabled */
    enabled?: boolean;
}

interface UseCodeMonitorResult {
    context: CodeContext | null;
    isTyping: boolean;
    isConnected: boolean;
    error: string | null;
    /** Seconds since user last typed */
    secondsSinceLastChange: number;
}

export function useCodeMonitor(options: UseCodeMonitorOptions = {}): UseCodeMonitorResult {
    const {
        pollInterval = 4000,
        pauseThreshold = 5,
        onContextUpdate,
        onTypingPause,
        enabled = true,
    } = options;

    const [context, setContext] = useState<CodeContext | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Track whether we've already fired the pause callback for the current typing session
    const pauseFiredRef = useRef(false);
    // Track if user was typing in the previous poll
    const wasTypingRef = useRef(false);

    const pollContext = useCallback(async () => {
        if (!enabled) return;

        try {
            const newContext = await getContext() as CodeContext;
            setContext(newContext);
            setIsConnected(true);
            setError(null);

            // Channel 1: Always fire context update
            onContextUpdate?.(newContext);

            // Channel 2: Detect typing pause
            // Conditions:
            // 1. User is NOT currently typing
            // 2. There's been a change recently (secondsSinceLastChange < 60)
            // 3. Pause threshold has been reached
            // 4. We haven't already fired for this typing session
            // 5. There were changes in a previous poll (user was typing)

            const pauseReached = newContext.secondsSinceLastChange >= pauseThreshold;
            const recentActivity = newContext.secondsSinceLastChange >= 0 &&
                newContext.secondsSinceLastChange < 60;

            if (!newContext.isTyping && pauseReached && recentActivity && !pauseFiredRef.current) {
                // Fire the pause callback
                pauseFiredRef.current = true;
                onTypingPause?.(newContext);
            }

            // Reset pause fired flag when user starts typing again
            if (newContext.isTyping) {
                pauseFiredRef.current = false;
            }

            // Track typing state for next poll
            wasTypingRef.current = newContext.isTyping;

        } catch (err) {
            setIsConnected(false);
            setError(err instanceof Error ? err.message : 'Connection failed');
        }
    }, [enabled, onContextUpdate, onTypingPause, pauseThreshold]);

    useEffect(() => {
        if (!enabled) return;

        // Poll immediately
        pollContext();

        // Then poll on interval
        const interval = setInterval(pollContext, pollInterval);

        return () => clearInterval(interval);
    }, [enabled, pollContext, pollInterval]);

    return {
        context,
        isTyping: context?.isTyping ?? false,
        isConnected,
        error,
        secondsSinceLastChange: context?.secondsSinceLastChange ?? -1,
    };
}
