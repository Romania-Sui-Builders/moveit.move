"use client"

import type React from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { UserPlus, AlertCircle, CheckCircle2 } from "lucide-react"
import { useAddContributor } from "@/hooks/useAddContributor"

interface AddContributorFormProps {
  boardId: string
  adminCapId: string
}

export function AddContributorForm({ boardId, adminCapId }: AddContributorFormProps) {
  const [contributorAddress, setContributorAddress] = useState("")
  const { mutate: addContributor, isPending, isSuccess, isError, error } = useAddContributor()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!contributorAddress.trim()) {
      return
    }

    addContributor({
      adminCapId,
      boardId,
      contributorAddress: contributorAddress.trim(),
    }, {
      onSuccess: () => {
        setContributorAddress("")
      }
    })
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <UserPlus className="h-5 w-5" />
          Add Contributor
        </CardTitle>
        <CardDescription>
          Grant a user contributor access to this board. They will receive a ContributorCap that allows them to create and manage tasks.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="contributor-address">Contributor Address</Label>
            <Input
              id="contributor-address"
              placeholder="0x..."
              value={contributorAddress}
              onChange={(e) => setContributorAddress(e.target.value)}
              disabled={isPending}
              required
            />
            <p className="text-xs text-muted-foreground">
              Enter the Sui address of the user you want to add as a contributor
            </p>
          </div>

          {isError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Failed to add contributor: {error?.message || "Unknown error"}
              </AlertDescription>
            </Alert>
          )}

          {isSuccess && (
            <Alert>
              <CheckCircle2 className="h-4 w-4" />
              <AlertDescription>
                Contributor added successfully! They can now create and manage tasks on this board.
              </AlertDescription>
            </Alert>
          )}

          <Button type="submit" disabled={isPending || !contributorAddress.trim()}>
            {isPending ? "Adding..." : "Add Contributor"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
