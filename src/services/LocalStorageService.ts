import { StorageGetFunc, StorageRemoveFunc, StorageClearFunc, StorageServiceInterface, StorageSetFunc } from "./StorageService.types";

export const get: StorageGetFunc = (key: string): string | null => localStorage.getItem(key);

export const set: StorageSetFunc = (key: string, value: string): void => localStorage.setItem(key, value);

export const remove: StorageRemoveFunc = (key: string): void => localStorage.removeItem(key);

export const clear: StorageClearFunc = (): void => localStorage.clear();

export const LocalStorageService: StorageServiceInterface = {
    get,
    set,
    remove,
    clear
}