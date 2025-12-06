// components/Navigation.tsx
'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button, Flex, Text, Box, Separator } from '@radix-ui/themes';
import { Menu, X, Home, Columns, Info } from 'lucide-react';
import { WalletStatus } from './WalletStatus';

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navItems = [
    { href: '/', label: 'Home', icon: <Home className="w-4 h-4" /> },
    { href: '/boards', label: 'Boards', icon: <Columns className="w-4 h-4" /> },
    { href: '/about', label: 'About', icon: <Info className="w-4 h-4" /> },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-gray-1 border-b border-gray-6">
      <Flex
        justify="between"
        align="center"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16"
      >
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Box className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-9 to-indigo-9 flex items-center justify-center">
            <Text weight="bold" className="text-white">
              M
            </Text>
          </Box>
          <Text weight="bold" size="5" className="hidden sm:block">
            MoveIt
          </Text>
        </Link>

        {/* Desktop Navigation */}
        <Flex align="center" gap="4" className="hidden md:flex">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2 px-3 py-2 rounded-md transition-colors ${
                  isActive
                    ? 'bg-violet-3 text-violet-11'
                    : 'hover:bg-gray-3 text-gray-11'
                }`}
              >
                {item.icon}
                <Text weight="medium">{item.label}</Text>
              </Link>
            );
          })}
        </Flex>

        {/* Wallet Status */}
        <Flex align="center" gap="4">
          <WalletStatus />
          
          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </Button>
        </Flex>
      </Flex>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <Box className="md:hidden bg-gray-2 border-b border-gray-6">
          <Flex direction="column" py="2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-4 py-3 ${
                    isActive
                      ? 'bg-violet-3 text-violet-11'
                      : 'hover:bg-gray-3'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.icon}
                  <Text weight="medium">{item.label}</Text>
                </Link>
              );
            })}
          </Flex>
        </Box>
      )}
    </nav>
  );
}