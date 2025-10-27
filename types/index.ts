// types/index.ts - Global Type Definitions

export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin'
  createdAt: string
  updatedAt: string
}

export interface Product {
  id: string
  name: string
  description?: string
  price: number // in cents
  type: 'course' | 'ebook'
  category?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface Order {
  id: string
  userId: string
  items: OrderItem[]
  totalAmount: number
  currency: string
  status: 'pending' | 'paid' | 'failed' | 'refunded'
  paymentId?: string
  createdAt: string
  paidAt?: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  orderId: string
  productId: string
  quantity: number
  price: number
  createdAt: string
}

export interface CourseLesson {
  id: string
  title: string
  duration: string
  completed: boolean
  order: number
}

export interface UserProgress {
  id: string
  userId: string
  productId: string
  lessonId?: string
  completed: boolean
  progressPercentage: number
  lastAccessed: string
  createdAt: string
  updatedAt: string
}

export interface PaymentData {
  amount: {
    value: string
    currency: string
  }
  description: string
  redirectUrl: string
  webhookUrl: string
  metadata: {
    orderId: string
    userId: string
    products: string[]
  }
}

export interface MolliePaymentResponse {
  success: boolean
  paymentId?: string
  checkoutUrl?: string
  error?: string
}

export interface ContactFormData {
  name: string
  email: string
  subject: string
  message: string
}

export interface AuthResponse {
  success: boolean
  user?: User
  error?: string
}

export interface CartItem {
  id: string
  name: string
  price: number
  type: 'course' | 'ebook'
  description?: string
}

export interface CheckoutData {
  items: CartItem[]
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

// Component Props types
export interface PageProps {
  params?: { [key: string]: string }
  searchParams?: { [key: string]: string | string[] | undefined }
}

export interface LayoutProps {
  children: React.ReactNode
}

// Form types
export interface LoginFormData {
  email: string
  password: string
}

export interface RegisterFormData {
  name: string
  email: string
  password: string
}

// Error types
export interface AppError extends Error {
  code?: string
  statusCode?: number
  digest?: string
}

// Environment variables
export interface EnvConfig {
  MOLLIE_API_KEY: string
  NEXT_PUBLIC_BASE_URL: string
  JWT_SECRET: string
  DATABASE_URL?: string
  NODE_ENV: 'development' | 'production' | 'test'
}

