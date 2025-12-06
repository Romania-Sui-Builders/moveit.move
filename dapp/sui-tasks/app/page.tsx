// app/page.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useCurrentAccount } from '@mysten/dapp-kit';
import {
  Button,
  Heading,
  Text,
  Flex,
  Box,
  Container,
  Grid,
  Card,
} from '@radix-ui/themes';
import {
  Shield,
  Lock,
  BarChart3,
  ArrowRight,
  Users,
  CheckCircle,
  Clock,
} from 'lucide-react';
import { WalletStatus } from '@/components/WalletStatus';

export default function HomePage() {
  const account = useCurrentAccount();
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null);

  const features = [
    {
      icon: <Shield className="w-8 h-8" />,
      title: 'On-Chain Ownership',
      description: 'Your boards and tasks are stored immutably on the Sui blockchain',
      color: 'from-violet-9 to-indigo-9',
    },
    {
      icon: <Lock className="w-8 h-8" />,
      title: 'Cryptographic Access Control',
      description: 'Fine-grained permissions managed through Sui capabilities',
      color: 'from-blue-9 to-cyan-9',
    },
    {
      icon: <BarChart3 className="w-8 h-8" />,
      title: 'Transparent & Auditable',
      description: 'Every action is recorded and verifiable on the blockchain',
      color: 'from-green-9 to-emerald-9',
    },
  ];

  const steps = [
    {
      number: '1',
      title: 'Connect Wallet',
      description: 'Connect your Sui wallet to get started',
      icon: <Users className="w-6 h-6" />,
    },
    {
      number: '2',
      title: 'Create a Board',
      description: 'Set up a board and invite team members',
      icon: <CheckCircle className="w-6 h-6" />,
    },
    {
      number: '3',
      title: 'Coordinate Tasks',
      description: 'Manage tasks with cryptographic permissions',
      icon: <Clock className="w-6 h-6" />,
    },
  ];

  return (
    <div className="space-y-16">
      {/* Hero Section */}
      <Container size="4" className="text-center space-y-8">
        <Box className="space-y-4">
          <Heading size="9" className="bg-gradient-to-r from-violet-11 to-indigo-11 bg-clip-text text-transparent">
            Decentralized Work Coordination on Sui
          </Heading>
          <Text size="5" color="gray" className="max-w-2xl mx-auto">
            Own your tasks. Trust the blockchain. Coordinate work with transparent, 
            cryptographic access control powered by Sui.
          </Text>
        </Box>

        <Flex gap="4" justify="center" align="center">
          {account ? (
            <Link href="/boards">
              <Button size="3" variant="solid" className="cursor-pointer">
                Go to Boards
                <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          ) : (
            <Box className="flex items-center gap-4">
              <Text size="2" color="gray">
                Connect wallet to start
              </Text>
              <WalletStatus />
            </Box>
          )}
        </Flex>
      </Container>

      {/* Features Section */}
      <Container size="4">
        <Heading size="6" align="center" mb="8">
          Why Choose MoveIt?
        </Heading>
        <Grid columns={{ initial: '1', md: '3' }} gap="6">
          {features.map((feature, index) => (
            <Card
              key={index}
              size="3"
              className={`relative overflow-hidden transition-all duration-300 ${
                hoveredFeature === index ? 'shadow-xl scale-105' : ''
              }`}
              onMouseEnter={() => setHoveredFeature(index)}
              onMouseLeave={() => setHoveredFeature(null)}
            >
              <Box className={`absolute inset-0 bg-gradient-to-br ${feature.color} opacity-5`} />
              <Flex direction="column" align="center" gap="4" className="relative">
                <Box
                  className={`p-3 rounded-lg bg-gradient-to-br ${feature.color}`}
                >
                  {feature.icon}
                </Box>
                <Heading size="4" align="center">
                  {feature.title}
                </Heading>
                <Text size="2" color="gray" align="center">
                  {feature.description}
                </Text>
              </Flex>
            </Card>
          ))}
        </Grid>
      </Container>

      {/* How It Works Section */}
      <Container size="4">
        <Heading size="6" align="center" mb="8">
          How It Works
        </Heading>
        <Grid columns={{ initial: '1', md: '3' }} gap="8">
          {steps.map((step, index) => (
            <Flex key={index} direction="column" align="center" gap="4">
              <Box className="relative">
                <Box className="w-16 h-16 rounded-full bg-violet-3 flex items-center justify-center">
                  <Text size="6" weight="bold" className="text-violet-11">
                    {step.number}
                  </Text>
                </Box>
                {index < steps.length - 1 && (
                  <Box className="hidden md:block absolute top-1/2 left-full w-8 h-0.5 bg-violet-6 -translate-y-1/2" />
                )}
              </Box>
              <Box className="space-y-2 text-center">
                <Heading size="4">{step.title}</Heading>
                <Text size="2" color="gray">
                  {step.description}
                </Text>
              </Box>
            </Flex>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Container size="3" className="text-center">
        <Card size="4" className="bg-gradient-to-br from-gray-2 to-gray-3">
          <Box className="space-y-6">
            <Heading size="5">Ready to decentralize your workflow?</Heading>
            <Text size="3" color="gray">
              Join teams and DAOs already using MoveIt for transparent, 
              on-chain task coordination.
            </Text>
            <Flex gap="4" justify="center">
              {account ? (
                <Link href="/boards">
                  <Button size="3" variant="solid" className="cursor-pointer">
                    Get Started
                    <ArrowRight className="ml-2 w-4 h-4" />
                  </Button>
                </Link>
              ) : (
                <WalletStatus />
              )}
            </Flex>
          </Box>
        </Card>
      </Container>
    </div>
  );
}