// __tests__/utils/format.test.ts
import { truncateAddress, formatTimestamp, calculateEffortPercentage } from '@/utils/format'

describe('Utility Functions', () => {
  describe('truncateAddress', () => {
    it('should truncate long Sui addresses', () => {
      const address = '0x1234567890abcdef1234567890abcdef1234567890abcdef'
      const result = truncateAddress(address)
      expect(result).toBe('0x1234...cdef')
    })

    it('should handle short addresses', () => {
      const address = '0x123'
      const result = truncateAddress(address, 4)
      expect(result).toBe('0x123')
    })

    it('should customize truncation length', () => {
      const address = '0x1234567890abcdef'
      const result = truncateAddress(address, 6)
      expect(result).toBe('0x123456...cdef')
    })
  })

  describe('formatTimestamp', () => {
    it('should format Unix timestamp to readable date', () => {
      const timestamp = 1704067200000 // Jan 1, 2024
      const result = formatTimestamp(timestamp)
      expect(result).toMatch(/Jan|1|2024/)
    })

    it('should handle relative time for recent dates', () => {
      const now = Date.now()
      const result = formatTimestamp(now)
      expect(result).toMatch(/just now|seconds ago|minutes ago/)
    })
  })

  describe('calculateEffortPercentage', () => {
    it('should calculate completion percentage', () => {
      expect(calculateEffortPercentage(50, 100)).toBe(50)
      expect(calculateEffortPercentage(75, 100)).toBe(75)
    })

    it('should handle edge cases', () => {
      expect(calculateEffortPercentage(0, 100)).toBe(0)
      expect(calculateEffortPercentage(100, 100)).toBe(100)
      expect(calculateEffortPercentage(50, 0)).toBe(0)
    })

    it('should round to nearest integer', () => {
      expect(calculateEffortPercentage(33, 100)).toBe(33)
      expect(calculateEffortPercentage(67, 100)).toBe(67)
    })
  })
})
