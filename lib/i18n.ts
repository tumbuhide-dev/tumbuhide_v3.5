"use client"

// Struktur untuk multi-language di masa depan
export type Locale = "id" | "en"

export const defaultLocale: Locale = "id"

// Struktur translations untuk masa depan
export interface Translations {
  common: {
    loading: string
    save: string
    cancel: string
    delete: string
    edit: string
    add: string
    back: string
    next: string
    previous: string
    submit: string
    close: string
    confirm: string
    success: string
    error: string
    warning: string
    info: string
  }
  auth: {
    login: string
    register: string
    logout: string
    email: string
    password: string
    confirmPassword: string
    forgotPassword: string
    rememberMe: string
    loginSuccess: string
    registerSuccess: string
    invalidCredentials: string
  }
  profile: {
    username: string
    fullName: string
    tagline: string
    location: string
    birthDate: string
    pronouns: string
    bio: string
    avatar: string
    cover: string
  }
  dashboard: {
    welcome: string
    stats: string
    quickActions: string
    manageProfile: string
    manageSocialLinks: string
    manageCustomLinks: string
    manageShowcase: string
    analytics: string
    settings: string
  }
  // ... akan ditambah sesuai kebutuhan
}

// Current translations (Indonesian only)
export const translations: Record<Locale, Translations> = {
  id: {
    common: {
      loading: "Memuat...",
      save: "Simpan",
      cancel: "Batal",
      delete: "Hapus",
      edit: "Edit",
      add: "Tambah",
      back: "Kembali",
      next: "Selanjutnya",
      previous: "Sebelumnya",
      submit: "Kirim",
      close: "Tutup",
      confirm: "Konfirmasi",
      success: "Berhasil",
      error: "Error",
      warning: "Peringatan",
      info: "Informasi",
    },
    auth: {
      login: "Masuk",
      register: "Daftar",
      logout: "Keluar",
      email: "Email",
      password: "Password",
      confirmPassword: "Konfirmasi Password",
      forgotPassword: "Lupa Password",
      rememberMe: "Ingat Saya",
      loginSuccess: "Berhasil masuk",
      registerSuccess: "Berhasil mendaftar",
      invalidCredentials: "Email atau password salah",
    },
    profile: {
      username: "Username",
      fullName: "Nama Lengkap",
      tagline: "Tagline",
      location: "Lokasi",
      birthDate: "Tanggal Lahir",
      pronouns: "Kata Ganti",
      bio: "Bio",
      avatar: "Foto Profil",
      cover: "Foto Cover",
    },
    dashboard: {
      welcome: "Selamat datang",
      stats: "Statistik",
      quickActions: "Aksi Cepat",
      manageProfile: "Kelola Profil",
      manageSocialLinks: "Kelola Social Links",
      manageCustomLinks: "Kelola Custom Links",
      manageShowcase: "Kelola Showcase",
      analytics: "Analytics",
      settings: "Pengaturan",
    },
  },
  en: {
    // English translations akan ditambah nanti
    common: {
      loading: "Loading...",
      save: "Save",
      cancel: "Cancel",
      delete: "Delete",
      edit: "Edit",
      add: "Add",
      back: "Back",
      next: "Next",
      previous: "Previous",
      submit: "Submit",
      close: "Close",
      confirm: "Confirm",
      success: "Success",
      error: "Error",
      warning: "Warning",
      info: "Info",
    },
    auth: {
      login: "Login",
      register: "Register",
      logout: "Logout",
      email: "Email",
      password: "Password",
      confirmPassword: "Confirm Password",
      forgotPassword: "Forgot Password",
      rememberMe: "Remember Me",
      loginSuccess: "Login successful",
      registerSuccess: "Registration successful",
      invalidCredentials: "Invalid email or password",
    },
    profile: {
      username: "Username",
      fullName: "Full Name",
      tagline: "Tagline",
      location: "Location",
      birthDate: "Birth Date",
      pronouns: "Pronouns",
      bio: "Bio",
      avatar: "Avatar",
      cover: "Cover Photo",
    },
    dashboard: {
      welcome: "Welcome",
      stats: "Statistics",
      quickActions: "Quick Actions",
      manageProfile: "Manage Profile",
      manageSocialLinks: "Manage Social Links",
      manageCustomLinks: "Manage Custom Links",
      manageShowcase: "Manage Showcase",
      analytics: "Analytics",
      settings: "Settings",
    },
  },
}

// Hook untuk menggunakan translations
export function useTranslations(locale: Locale = defaultLocale) {
  return translations[locale]
}

// Helper function untuk get text
export function t(key: string, locale: Locale = defaultLocale): string {
  const keys = key.split(".")
  let value: any = translations[locale]

  for (const k of keys) {
    value = value?.[k]
  }

  return value || key
}
