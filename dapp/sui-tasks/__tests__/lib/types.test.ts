// __tests__/lib/types.test.ts
import {
  canManageMembers,
  canManageTasks,
  canDeleteBoard,
  canEditTask,
  type Member,
} from '@/lib/types'

describe('Permission Functions', () => {
  describe('canManageMembers', () => {
    it('should allow owner to manage members', () => {
      expect(canManageMembers('owner')).toBe(true)
    })

    it('should allow admin to manage members', () => {
      expect(canManageMembers('admin')).toBe(true)
    })

    it('should not allow regular member to manage members', () => {
      expect(canManageMembers('member')).toBe(false)
    })
  })

  describe('canManageTasks', () => {
    it('should allow owner to manage tasks', () => {
      expect(canManageTasks('owner')).toBe(true)
    })

    it('should allow admin to manage tasks', () => {
      expect(canManageTasks('admin')).toBe(true)
    })

    it('should not allow regular member to manage tasks', () => {
      expect(canManageTasks('member')).toBe(false)
    })
  })

  describe('canDeleteBoard', () => {
    it('should only allow owner to delete board', () => {
      expect(canDeleteBoard('owner')).toBe(true)
      expect(canDeleteBoard('admin')).toBe(false)
      expect(canDeleteBoard('member')).toBe(false)
    })
  })

  describe('canEditTask', () => {
    const userAddress = '0x123'
    const taskCreator = '0x123'
    const otherAddress = '0x456'

    it('should allow owner to edit any task', () => {
      expect(canEditTask('owner', taskCreator, userAddress)).toBe(true)
      expect(canEditTask('owner', otherAddress, userAddress)).toBe(true)
    })

    it('should allow admin to edit any task', () => {
      expect(canEditTask('admin', taskCreator, userAddress)).toBe(true)
      expect(canEditTask('admin', otherAddress, userAddress)).toBe(true)
    })

    it('should allow member to edit their own task', () => {
      expect(canEditTask('member', taskCreator, userAddress)).toBe(true)
    })

    it('should not allow member to edit others tasks', () => {
      expect(canEditTask('member', otherAddress, userAddress)).toBe(false)
    })
  })
})
