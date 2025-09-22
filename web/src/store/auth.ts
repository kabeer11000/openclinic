import { signal, type Signal } from '@builder.io/qwik';
import type { User } from 'firebase/auth';

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const authState: Signal<AuthState> = signal<AuthState>({
  user: null,
  loading: true,
  error: null,
});