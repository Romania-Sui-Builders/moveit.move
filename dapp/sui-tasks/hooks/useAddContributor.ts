import { useMutation, useQueryClient } from "@tanstack/react-query"
import { useSignAndExecuteTransaction, useSuiClient } from "@mysten/dapp-kit"
import { Transaction } from "@mysten/sui/transactions"

const PACKAGE_ID = process.env.NEXT_PUBLIC_PACKAGE_ID!

interface AddContributorData {
  adminCapId: string
  boardId: string
  contributorAddress: string
}

export function useAddContributor() {
  const client = useSuiClient()
  const { mutateAsync: signAndExecute } = useSignAndExecuteTransaction()
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (data: AddContributorData) => {
      const { adminCapId, boardId, contributorAddress } = data

      const tx = new Transaction()
      
      tx.moveCall({
        target: `${PACKAGE_ID}::moveit::add_contributor`,
        arguments: [
          tx.object(adminCapId),
          tx.object(boardId),
          tx.pure.address(contributorAddress),
        ],
      })

      const result = await signAndExecute({
        transaction: tx,
      })

      await client.waitForTransaction({
        digest: result.digest,
      })

      return result
    },
    onSuccess: () => {
      // Invalidate contributor caps query so it refetches
      queryClient.invalidateQueries({ queryKey: ["contributorCaps"] })
    },
  })
}
