/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string
  // يمكنك إضافة متغيرات بيئية أخرى هنا
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

