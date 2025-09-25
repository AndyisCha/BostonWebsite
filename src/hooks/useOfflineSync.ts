import { useState, useEffect, useCallback } from 'react';

interface OfflineAction {
  id: string;
  url: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  data?: any;
  headers?: Record<string, string>;
  timestamp: number;
  priority: 'low' | 'medium' | 'high';
  retryCount: number;
  maxRetries: number;
}

interface SyncProgress {
  progress: any[];
  answers: any[];
  bookmarks: string[];
  preferences: any;
}

interface UseOfflineSyncReturn {
  isOnline: boolean;
  isSyncing: boolean;
  pendingActions: number;
  queueAction: (action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => void;
  syncNow: () => Promise<void>;
  clearQueue: () => void;
  getSyncProgress: () => SyncProgress;
}

const STORAGE_KEYS = {
  OFFLINE_QUEUE: 'offline_sync_queue',
  SYNC_PROGRESS: 'sync_progress_data',
  LAST_SYNC: 'last_sync_timestamp'
};

export const useOfflineSync = (): UseOfflineSyncReturn => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isSyncing, setIsSyncing] = useState(false);
  const [pendingActions, setPendingActions] = useState(0);

  // Initialize offline queue
  useEffect(() => {
    const savedQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
    if (savedQueue) {
      try {
        const queue: OfflineAction[] = JSON.parse(savedQueue);
        setPendingActions(queue.length);
      } catch (error) {
        console.error('Failed to parse offline queue:', error);
        localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
      }
    }
  }, []);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto-sync when coming back online
      setTimeout(() => {
        syncNow();
      }, 1000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Queue an action for later execution
  const queueAction = useCallback((action: Omit<OfflineAction, 'id' | 'timestamp' | 'retryCount'>) => {
    const newAction: OfflineAction = {
      ...action,
      id: `action_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      retryCount: 0,
      maxRetries: action.maxRetries || 3
    };

    try {
      const existingQueue = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      const queue: OfflineAction[] = existingQueue ? JSON.parse(existingQueue) : [];

      queue.push(newAction);

      // Sort by priority and timestamp
      queue.sort((a, b) => {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;
        return a.timestamp - b.timestamp;
      });

      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(queue));
      setPendingActions(queue.length);

      console.log('Queued offline action:', newAction);
    } catch (error) {
      console.error('Failed to queue offline action:', error);
    }
  }, []);

  // Execute queued actions
  const syncNow = useCallback(async () => {
    if (!isOnline || isSyncing) return;

    setIsSyncing(true);

    try {
      const queueData = localStorage.getItem(STORAGE_KEYS.OFFLINE_QUEUE);
      if (!queueData) {
        setIsSyncing(false);
        return;
      }

      const queue: OfflineAction[] = JSON.parse(queueData);
      const successfulActions: string[] = [];
      const failedActions: OfflineAction[] = [];

      console.log(`Starting sync of ${queue.length} queued actions...`);

      // Process actions sequentially to avoid overwhelming the server
      for (const action of queue) {
        try {
          const response = await executeAction(action);

          if (response.ok) {
            successfulActions.push(action.id);
            console.log(`Successfully executed action: ${action.id}`);
          } else {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
          }
        } catch (error) {
          console.error(`Failed to execute action ${action.id}:`, error);

          // Retry logic
          if (action.retryCount < action.maxRetries) {
            failedActions.push({
              ...action,
              retryCount: action.retryCount + 1
            });
          } else {
            console.warn(`Max retries exceeded for action: ${action.id}`);
          }
        }

        // Small delay between actions
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      // Update queue with only failed actions
      localStorage.setItem(STORAGE_KEYS.OFFLINE_QUEUE, JSON.stringify(failedActions));
      setPendingActions(failedActions.length);

      // Update last sync timestamp
      localStorage.setItem(STORAGE_KEYS.LAST_SYNC, Date.now().toString());

      console.log(`Sync completed. Success: ${successfulActions.length}, Failed: ${failedActions.length}`);

      // Register background sync for remaining actions if supported
      if (failedActions.length > 0 && 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
        try {
          const registration = await navigator.serviceWorker.ready;
          await registration.sync.register('background-sync-offline-actions');
        } catch (error) {
          console.log('Background sync registration failed:', error);
        }
      }

    } catch (error) {
      console.error('Sync process failed:', error);
    } finally {
      setIsSyncing(false);
    }
  }, [isOnline, isSyncing]);

  // Execute a single action
  const executeAction = async (action: OfflineAction): Promise<Response> => {
    const { url, method, data, headers = {} } = action;

    const fetchOptions: RequestInit = {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    if (data && ['POST', 'PUT', 'PATCH'].includes(method)) {
      fetchOptions.body = JSON.stringify(data);
    }

    return fetch(url, fetchOptions);
  };

  // Clear all queued actions
  const clearQueue = useCallback(() => {
    localStorage.removeItem(STORAGE_KEYS.OFFLINE_QUEUE);
    setPendingActions(0);
    console.log('Offline queue cleared');
  }, []);

  // Get sync progress data
  const getSyncProgress = useCallback((): SyncProgress => {
    const savedProgress = localStorage.getItem(STORAGE_KEYS.SYNC_PROGRESS);

    if (savedProgress) {
      try {
        return JSON.parse(savedProgress);
      } catch (error) {
        console.error('Failed to parse sync progress:', error);
      }
    }

    return {
      progress: [],
      answers: [],
      bookmarks: [],
      preferences: {}
    };
  }, []);

  return {
    isOnline,
    isSyncing,
    pendingActions,
    queueAction,
    syncNow,
    clearQueue,
    getSyncProgress
  };
};

// Utility functions for common sync operations
export const syncUserProgress = async (progressData: any[]) => {
  const { queueAction, isOnline } = useOfflineSync();

  if (isOnline) {
    try {
      const response = await fetch('/api/user/sync-progress', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ progress: progressData })
      });

      if (!response.ok) {
        throw new Error('Failed to sync progress online');
      }

      return response.json();
    } catch (error) {
      // Queue for offline sync
      queueAction({
        url: '/api/user/sync-progress',
        method: 'POST',
        data: { progress: progressData },
        priority: 'high',
        maxRetries: 5
      });
      throw error;
    }
  } else {
    // Queue immediately if offline
    queueAction({
      url: '/api/user/sync-progress',
      method: 'POST',
      data: { progress: progressData },
      priority: 'high',
      maxRetries: 5
    });
  }
};

export const syncUserAnswers = async (answers: any[]) => {
  const { queueAction, isOnline } = useOfflineSync();

  if (isOnline) {
    try {
      const response = await fetch('/api/user/sync-answers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers })
      });

      if (!response.ok) {
        throw new Error('Failed to sync answers online');
      }

      return response.json();
    } catch (error) {
      queueAction({
        url: '/api/user/sync-answers',
        method: 'POST',
        data: { answers },
        priority: 'medium',
        maxRetries: 3
      });
      throw error;
    }
  } else {
    queueAction({
      url: '/api/user/sync-answers',
      method: 'POST',
      data: { answers },
      priority: 'medium',
      maxRetries: 3
    });
  }
};

export const syncBookmarks = async (bookmarks: string[]) => {
  const { queueAction, isOnline } = useOfflineSync();

  if (isOnline) {
    try {
      const response = await fetch('/api/user/bookmarks', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookmarks })
      });

      if (!response.ok) {
        throw new Error('Failed to sync bookmarks online');
      }

      return response.json();
    } catch (error) {
      queueAction({
        url: '/api/user/bookmarks',
        method: 'PUT',
        data: { bookmarks },
        priority: 'low',
        maxRetries: 2
      });
      throw error;
    }
  } else {
    queueAction({
      url: '/api/user/bookmarks',
      method: 'PUT',
      data: { bookmarks },
      priority: 'low',
      maxRetries: 2
    });
  }
};

// Store data locally for offline use
export const storeOfflineData = (key: string, data: any) => {
  try {
    const syncData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_PROGRESS) || '{}');
    syncData[key] = data;
    localStorage.setItem(STORAGE_KEYS.SYNC_PROGRESS, JSON.stringify(syncData));
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
};

// Get offline data
export const getOfflineData = (key: string): any => {
  try {
    const syncData = JSON.parse(localStorage.getItem(STORAGE_KEYS.SYNC_PROGRESS) || '{}');
    return syncData[key];
  } catch (error) {
    console.error('Failed to get offline data:', error);
    return null;
  }
};

export default useOfflineSync;