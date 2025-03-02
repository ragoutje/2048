export type StorageGetFunc = (key: string) => string | null
export type StorageSetFunc = (key: string, value: string) => void
export type StorageRemoveFunc = (key: string) => void
export type StorageClearFunc = () => void

export interface StorageServiceInterface {
    get: StorageGetFunc,
    set: StorageSetFunc,
    remove: StorageRemoveFunc,
    clear: StorageClearFunc,
}