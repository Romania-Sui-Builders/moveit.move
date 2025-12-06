// components/BoardCard.tsx
"use client";

import Link from "next/link";
import { Card, Heading, Text, Flex, Badge, Box } from "@radix-ui/themes";
import { Users, Calendar } from "lucide-react";
import { formatRelativeTime, truncateAddress } from "@/utils/sui";
import type { Board } from "@/types/board";

interface BoardCardProps {
  board: Board;
}

export function BoardCard({ board }: BoardCardProps) {
  return (
    <Link href={`/boards/${board.id}`}>
      <Card
        size="3"
        className="h-full cursor-pointer hover:shadow-lg transition-all duration-300 hover:scale-[1.02] hover:border-violet-6"
      >
        <Box className="space-y-4">
          <Heading size="4" className="line-clamp-1">
            {board.name}
          </Heading>

          <Text size="2" color="gray" className="line-clamp-2 h-10">
            {board.description || "No description"}
          </Text>

          <Flex gap="4" align="center">
            <Badge color="violet" variant="soft">
              <Users className="w-3 h-3 mr-1" />
              {board.memberCount} member{board.memberCount !== 1 ? "s" : ""}
            </Badge>

            <Badge color="gray" variant="soft">
              <Calendar className="w-3 h-3 mr-1" />
              {formatRelativeTime(board.createdAt)}
            </Badge>
          </Flex>

          <Flex align="center" gap="2">
            <Text size="1" color="gray">
              Owner:
            </Text>
            <Badge variant="outline">{truncateAddress(board.owner)}</Badge>
          </Flex>
        </Box>
      </Card>
    </Link>
  );
}
