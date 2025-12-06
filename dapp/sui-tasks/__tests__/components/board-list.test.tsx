// __tests__/components/board-list.test.tsx
import React from 'react'
import { render, screen, waitFor } from '@testing-library/react'
import { BoardList } from '@/components/board-list'
import useSWR from 'swr'

jest.mock('swr')
jest.mock('@mysten/dapp-kit', () => ({
  useCurrentAccount: () => ({ address: '0x123' }),
}))

describe('BoardList Component', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should render loading state', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: undefined,
      isLoading: true,
    })

    render(<BoardList selectedBoardId={null} />)
    expect(screen.getByText(/loading/i)).toBeInTheDocument()
  })

  it('should render empty state when no boards', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: [],
      error: undefined,
      isLoading: false,
    })

    render(<BoardList selectedBoardId={null} />)
    expect(screen.getByText(/no boards/i)).toBeInTheDocument()
  })

  it('should render list of boards', async () => {
    const mockBoards = [
      {
        id: '0xboard1',
        name: 'Project Alpha',
        description: 'First project',
        createdAt: Date.now(),
        taskCounter: 5,
      },
      {
        id: '0xboard2',
        name: 'Project Beta',
        description: 'Second project',
        createdAt: Date.now(),
        taskCounter: 3,
      },
    ]

    ;(useSWR as jest.Mock).mockReturnValue({
      data: mockBoards,
      error: undefined,
      isLoading: false,
    })

    render(<BoardList selectedBoardId={null} />)

    await waitFor(() => {
      expect(screen.getByText('Project Alpha')).toBeInTheDocument()
      expect(screen.getByText('Project Beta')).toBeInTheDocument()
    })
  })

  it('should highlight selected board', async () => {
    const mockBoards = [
      {
        id: '0xboard1',
        name: 'Selected Board',
        description: 'Test',
        createdAt: Date.now(),
        taskCounter: 2,
      },
    ]

    ;(useSWR as jest.Mock).mockReturnValue({
      data: mockBoards,
      error: undefined,
      isLoading: false,
    })

    const { container } = render(<BoardList selectedBoardId="0xboard1" />)
    
    await waitFor(() => {
      const selectedCard = container.querySelector('[data-selected="true"]')
      expect(selectedCard).toBeInTheDocument()
    })
  })

  it('should render error state', () => {
    ;(useSWR as jest.Mock).mockReturnValue({
      data: undefined,
      error: new Error('Failed to fetch'),
      isLoading: false,
    })

    render(<BoardList selectedBoardId={null} />)
    expect(screen.getByText(/error/i)).toBeInTheDocument()
  })
})
