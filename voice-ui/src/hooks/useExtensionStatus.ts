/**
 * Hook to poll extension status every 3 seconds
 */

import { useState, useEffect, useCallback } from 'react';
import { getStatus } from '../api';

interface UseExtensionStatusResult {
    isConnected: boolean;
    mode: string;
    error: string | null;
}

export function useExtensionStatus(): UseExtensionStatusResult {
    const [isConnected, setIsConnected] = useState(false);
    const [mode, setMode] = useState('navigator');
    const [error, setError] = useState<string | null>(null);

    const checkStatus = useCallback(async () => {
        try {
            const status = await getStatus();
            setIsConnected(status.active);
            setMode(status.mode);
            setError(null);
        } catch (err) {
            setIsConnected(false);
            setError(err instanceof Error ? err.message : 'Connection failed');
        }
    }, []);

    useEffect(() => {
        // Check immediately
        checkStatus();

        // Then poll every 3 seconds
        const interval = setInterval(checkStatus, 3000);

        // Cleanup on unmount
        return () => clearInterval(interval);
    }, [checkStatus]);

    return { isConnected, mode, error };
}
