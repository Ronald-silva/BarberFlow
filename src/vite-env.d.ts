/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string
  readonly VITE_TWILIO_ACCOUNT_SID: string
  readonly VITE_TWILIO_AUTH_TOKEN: string
  readonly VITE_TWILIO_WHATSAPP_NUMBER: string
  readonly VITE_TWILIO_PHONE_NUMBER: string
  readonly VITE_PIX_KEY: string
  readonly VITE_BITCOIN_ADDRESS: string
  readonly VITE_BITCOIN_ENABLED: string
  readonly VITE_USDT_ADDRESS: string
  readonly VITE_USDT_ENABLED: string
  readonly VITE_SENTRY_DSN: string
  readonly VITE_ENVIRONMENT: string
  readonly PROD: boolean
  readonly DEV: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
