/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL?: string;
  readonly VITE_SUPABASE_ANON_KEY?: string;
  readonly VITE_PROFILE_API_URL?: string;
  readonly VITE_PROJECTS_API_URL?: string;
  readonly VITE_PROJECT_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
