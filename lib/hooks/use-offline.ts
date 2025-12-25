"use client"

import { useEffect, useState } from "react"

export function useServiceWorker() {
  const [isInstalled, setIsInstalled] = useState(false)
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
      return
    }

    // Register service worker
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => {
        console.log('[PWA] Service worker registered')
        setRegistration(reg)
        setIsInstalled(true)

        // Check for updates
        reg.addEventListener('updatefound', () => {
          const newWorker = reg.installing
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setIsUpdateAvailable(true)
              }
            })
          }
        })
      })
      .catch((error) => {
        console.error('[PWA] Service worker registration failed:', error)
      })

    // Listen for controller change (new SW activated)
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      window.location.reload()
    })
  }, [])

  const updateServiceWorker = () => {
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' })
    }
  }

  return {
    isInstalled,
    isUpdateAvailable,
    updateServiceWorker
  }
}

export function useOfflineStatus() {
  const [isOnline, setIsOnline] = useState(true)

  useEffect(() => {
    if (typeof window === 'undefined') return

    setIsOnline(navigator.onLine)

    const handleOnline = () => setIsOnline(true)
    const handleOffline = () => setIsOnline(false)

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return isOnline
}

// IndexedDB helper for offline data
const DB_NAME = 'chaoslingua-offline'
const DB_VERSION = 1

interface OfflineStore {
  sessions: { id: string; data: unknown; synced: boolean }[]
  errors: { id: string; data: unknown; synced: boolean }[]
  content: { id: string; data: unknown }[]
}

export function useOfflineStorage() {
  const [db, setDb] = useState<IDBDatabase | null>(null)

  useEffect(() => {
    if (typeof window === 'undefined') return

    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onerror = () => {
      console.error('[IndexedDB] Failed to open database')
    }

    request.onsuccess = () => {
      setDb(request.result)
    }

    request.onupgradeneeded = (event) => {
      const database = (event.target as IDBOpenDBRequest).result

      // Create object stores
      if (!database.objectStoreNames.contains('sessions')) {
        database.createObjectStore('sessions', { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains('errors')) {
        database.createObjectStore('errors', { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains('content')) {
        database.createObjectStore('content', { keyPath: 'id' })
      }
      if (!database.objectStoreNames.contains('syncQueue')) {
        database.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
    }
  }, [])

  const saveToStore = async (storeName: keyof OfflineStore, data: unknown & { id: string }) => {
    if (!db) return

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readwrite')
      const store = transaction.objectStore(storeName)
      const request = store.put(data)

      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  const getFromStore = async <T>(storeName: keyof OfflineStore, id: string): Promise<T | null> => {
    if (!db) return null

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.get(id)

      request.onsuccess = () => resolve(request.result || null)
      request.onerror = () => reject(request.error)
    })
  }

  const getAllFromStore = async <T>(storeName: keyof OfflineStore): Promise<T[]> => {
    if (!db) return []

    return new Promise((resolve, reject) => {
      const transaction = db.transaction(storeName, 'readonly')
      const store = transaction.objectStore(storeName)
      const request = store.getAll()

      request.onsuccess = () => resolve(request.result)
      request.onerror = () => reject(request.error)
    })
  }

  const addToSyncQueue = async (action: string, data: unknown) => {
    if (!db) return

    return new Promise<void>((resolve, reject) => {
      const transaction = db.transaction('syncQueue', 'readwrite')
      const store = transaction.objectStore('syncQueue')
      const request = store.add({ action, data, timestamp: Date.now() })

      request.onsuccess = () => {
        // Request background sync if available
        if ('serviceWorker' in navigator && 'sync' in window) {
          navigator.serviceWorker.ready.then((registration) => {
            // @ts-ignore - SyncManager types
            registration.sync?.register(`sync-${action}`)
          })
        }
        resolve()
      }
      request.onerror = () => reject(request.error)
    })
  }

  return {
    isReady: !!db,
    saveToStore,
    getFromStore,
    getAllFromStore,
    addToSyncQueue
  }
}
