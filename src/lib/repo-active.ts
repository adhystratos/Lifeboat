import type { Repo } from './repo';
import { demoRepo } from './repo-demo';
import { supabaseRepo } from './repo-supabase';

let demo = false;

export function setDemoMode(on: boolean) {
  demo = on;
}

/** The data source for the current session: sample data or Supabase. */
export function repo(): Repo {
  return demo ? demoRepo : supabaseRepo;
}
