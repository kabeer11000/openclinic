import { atom } from 'nanostores';
import { User } from 'firebase/auth';

export const $user = atom<User | null>(null);
export const $loading = atom<boolean>(true);