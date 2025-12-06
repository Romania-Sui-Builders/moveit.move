// __tests__/services/blockchain.service.test.ts
import { getBoardFromBlockchain, getTasksForBoard } from '@/services/blockchain.service'

// Mock SuiClient
jest.mock('@mysten/sui/client', () => ({
  SuiClient: jest.fn().mockImplementation(() => ({
    getObject: jest.fn(),
    getDynamicFields: jest.fn(),
    getDynamicFieldObject: jest.fn(),
  })),
}))

describe('Blockchain Service', () => {
  describe('getBoardFromBlockchain', () => {
    it('should return null for invalid board ID', async () => {
      const result = await getBoardFromBlockchain('')
      expect(result).toBeNull()
    })

    it('should parse board with task_ids structure', async () => {
      const mockBoard = {
        data: {
          content: {
            dataType: 'moveObject',
            fields: {
              id: { id: '0xboard123' },
              name: 'Test Board',
              description: 'Test Description',
              statuses: ['To Do', 'In Progress', 'Done'],
              task_counter: '5',
              task_ids: ['0xtask1', '0xtask2'],
              created_at: '1234567890',
              version: '1',
            },
          },
        },
      }

      const { SuiClient } = require('@mysten/sui/client')
      const mockGetObject = jest.fn().mockResolvedValue(mockBoard)
      SuiClient.mockImplementation(() => ({
        getObject: mockGetObject,
      }))

      const result = await getBoardFromBlockchain('0xboard123')

      expect(result).toMatchObject({
        id: '0xboard123',
        name: 'Test Board',
        description: 'Test Description',
        statuses: ['To Do', 'In Progress', 'Done'],
        taskCounter: 5,
        taskIds: ['0xtask1', '0xtask2'],
        createdAt: 1234567890,
        version: 1,
        tableId: undefined,
        tableSize: undefined,
      })
    })

    it('should identify legacy board with Table structure', async () => {
      const mockLegacyBoard = {
        data: {
          content: {
            dataType: 'moveObject',
            fields: {
              id: { id: '0xboard456' },
              name: 'Legacy Board',
              description: 'Old Board',
              statuses: ['To Do', 'Done'],
              task_counter: '3',
              tasks: {
                type: '0x2::table::Table<u64, Task>',
                fields: {
                  id: { id: '0xtable123' },
                  size: '3',
                },
              },
              created_at: '1234567890',
              version: '1',
            },
          },
        },
      }

      const { SuiClient } = require('@mysten/sui/client')
      const mockGetObject = jest.fn().mockResolvedValue(mockLegacyBoard)
      SuiClient.mockImplementation(() => ({
        getObject: mockGetObject,
      }))

      const result = await getBoardFromBlockchain('0xboard456')

      expect(result).toMatchObject({
        id: '0xboard456',
        name: 'Legacy Board',
        tableId: '0xtable123',
        tableSize: 3,
      })
    })
  })

  describe('getTasksForBoard', () => {
    it('should return empty array for boards with no tasks', async () => {
      const mockBoard = {
        id: '0xboard',
        taskIds: [],
        taskCounter: 0,
      }

      const result = await getTasksForBoard(mockBoard as any)
      expect(result).toEqual([])
    })

    it('should handle Table-based boards', async () => {
      const mockBoard = {
        id: '0xboard',
        tableId: '0xtable',
        tableSize: 2,
      }

      const { SuiClient } = require('@mysten/sui/client')
      const mockGetDynamicFields = jest.fn().mockResolvedValue({
        data: [
          { objectId: '0xfield1' },
          { objectId: '0xfield2' },
        ],
      })

      const mockGetDynamicFieldObject = jest.fn()
        .mockResolvedValueOnce({
          data: {
            content: {
              fields: {
                value: {
                  task_id: '0',
                  title: 'Task 1',
                  description: 'Description 1',
                  status: 'To Do',
                  assignees: ['0xuser1'],
                  effort: '5',
                  creator: '0xcreator',
                  created_at: '1000000',
                  updated_at: '1000000',
                  due_date: '2000000',
                  subtask_ids: [],
                  parent_task_id: null,
                },
              },
            },
          },
        })
        .mockResolvedValueOnce({
          data: {
            content: {
              fields: {
                value: {
                  task_id: '1',
                  title: 'Task 2',
                  description: 'Description 2',
                  status: 'Done',
                  assignees: ['0xuser2'],
                  effort: '3',
                  creator: '0xcreator',
                  created_at: '1100000',
                  updated_at: '1100000',
                  due_date: '0',
                  subtask_ids: [],
                  parent_task_id: null,
                },
              },
            },
          },
        })

      SuiClient.mockImplementation(() => ({
        getDynamicFields: mockGetDynamicFields,
        getDynamicFieldObject: mockGetDynamicFieldObject,
      }))

      const result = await getTasksForBoard(mockBoard as any)

      expect(result).toHaveLength(2)
      expect(result[0]).toMatchObject({
        taskId: 0,
        title: 'Task 1',
        status: 'To Do',
      })
      expect(result[1]).toMatchObject({
        taskId: 1,
        title: 'Task 2',
        status: 'Done',
      })
    })
  })
})
