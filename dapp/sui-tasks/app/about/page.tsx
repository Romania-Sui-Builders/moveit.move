// app/about/page.tsx
import {
  Heading,
  Text,
  Flex,
  Box,
  Container,
  Separator,
  Link,
} from "@radix-ui/themes";
import { ExternalLink, Github, Twitter } from "lucide-react";

export default function AboutPage() {
  return (
    <Container size="3" className="space-y-8">
      <Box className="space-y-4">
        <Heading size="8">About MoveIt</Heading>
        <Text size="3" color="gray">
          MoveIt is a decentralized work coordination platform built on the Sui
          blockchain. We empower teams and DAOs to coordinate work transparently
          with cryptographic access control and on-chain ownership.
        </Text>
      </Box>

      <Separator size="4" />

      <Box className="space-y-4">
        <Heading size="5">Our Mission</Heading>
        <Text>
          To revolutionize how teams coordinate work by leveraging blockchain
          technology for transparency, security, and true digital ownership. We
          believe that work coordination should be trustless, verifiable, and
          owned by the participants.
        </Text>
      </Box>

      <Box className="space-y-4">
        <Heading size="5">How It Works</Heading>
        <Box className="space-y-3">
          <Text>
            1. <strong>Create a Board</strong>: Deploy a Board object on Sui
            with your team details.
          </Text>
          <Text>
            2. <strong>Manage Permissions</strong>: Use Sui capabilities to
            grant admin or contributor access to team members.
          </Text>
          <Text>
            3. <strong>Coordinate Tasks</strong>: Create, update, and track
            tasks with all actions recorded on-chain.
          </Text>
          <Text>
            4. <strong>Audit Everything</strong>: Every action is transparent
            and verifiable on the Sui Explorer.
          </Text>
        </Box>
      </Box>

      <Box className="space-y-4">
        <Heading size="5">Technology Stack</Heading>
        <Box className="space-y-3">
          <Text>
            • <strong>Sui Blockchain</strong>: For on-chain storage and smart
            contracts
          </Text>
          <Text>
            • <strong>Move Language</strong>: For secure and efficient smart
            contracts
          </Text>
          <Text>
            • <strong>Next.js 16</strong>: For the frontend application
          </Text>
          <Text>
            • <strong>Radix UI</strong>: For accessible and beautiful components
          </Text>
          <Text>
            • <strong>dApp Kit</strong>: For seamless wallet integration
          </Text>
        </Box>
      </Box>

      <Separator size="4" />

      <Box className="space-y-4">
        <Heading size="5">Open Source</Heading>
        <Text>
          MoveIt is completely open source. We believe in transparency and
          community collaboration. Feel free to contribute, audit, or fork our
          codebase.
        </Text>
        <Flex gap="4">
          <Link
            href="https://github.com/moveit-dapp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-violet-11 hover:text-violet-12 transition-colors"
          >
            <Github className="w-5 h-5" />
            GitHub Repository
          </Link>
          <Link
            href="https://twitter.com/moveitdapp"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-violet-11 hover:text-violet-12 transition-colors"
          >
            <Twitter className="w-5 h-5" />
            Twitter
          </Link>
          <Link
            href="https://docs.sui.io"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-violet-11 hover:text-violet-12 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
            Sui Documentation
          </Link>
        </Flex>
      </Box>

      <Separator size="4" />

      <Box className="space-y-4">
        <Heading size="5">Disclaimer</Heading>
        <Text size="2" color="gray">
          MoveIt is currently in beta and deployed on Sui testnet. While we
          strive for security and reliability, please use at your own risk.
          Always verify transactions on Sui Explorer and ensure you understand
          the permissions you&apos;re granting.
        </Text>
      </Box>
    </Container>
  );
}
