// jest.setup.js
import '@testing-library/jest-dom'

// Mock environment variables
process.env.NEXT_PUBLIC_PACKAGE_ID = '0x3304b82bbac32db08c67a6c938739b85aedf3a6be5aeba92d8bcdfd6d5e0605b'
process.env.NEXT_PUBLIC_ADMIN_CAP_ID = '0x8c024cf2ab47fe0bd9c7e08bb8f68ee78b4b90b29dfc9b6f6fed547ec0bf69a9'
process.env.NEXT_PUBLIC_CLOCK_ID = '0x6'
process.env.NEXT_PUBLIC_NETWORK = 'testnet'
process.env.NEXT_PUBLIC_INDEXER_URL = 'http://localhost:3001'

// Mock fetch globally
global.fetch = jest.fn()

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      pathname: '/',
      query: {},
      asPath: '/',
    }
  },
  usePathname() {
    return '/'
  },
  useSearchParams() {
    return new URLSearchParams()
  },
}))

// Mock SWR
jest.mock('swr', () => ({
  __esModule: true,
  default: jest.fn(() => ({
    data: undefined,
    error: undefined,
    isLoading: false,
    mutate: jest.fn(),
  })),
}))
