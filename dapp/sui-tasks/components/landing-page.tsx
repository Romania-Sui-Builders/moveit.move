"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { ConnectButton } from "@mysten/dapp-kit"
import {
  CheckCircle2,
  Users,
  Shield,
  Zap,
  LayoutDashboard,
  Lock,
  ArrowRight,
  Github,
  Twitter,
  BookOpen,
  Wallet,
} from "lucide-react"

export function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-1">
        {/* Hero Section */}
        <section className="container mx-auto px-4 py-24 lg:py-32">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
              <Shield className="h-4 w-4" />
              Built on Sui Blockchain
            </div>
            <h1 className="text-5xl lg:text-6xl font-bold tracking-tight text-balance">
              Decentralized Task Management for Modern Teams
            </h1>
            <p className="text-xl text-muted-foreground leading-relaxed text-pretty max-w-2xl mx-auto">
              MoveIt brings transparency, security, and true ownership to team collaboration. Manage boards, assign
              tasks, and track progress with blockchain-powered accountability.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <ConnectButton
                connectText={
                  <>
                    <Wallet className="h-5 w-5 mr-2" />
                    Connect Wallet to Start
                    <ArrowRight className="h-5 w-5 ml-2" />
                  </>
                }
                className="sui-connect-button text-lg px-8 h-12"
              />
              {/* <Button size="lg" variant="outline" className="gap-2 text-lg px-8 bg-transparent">
                <BookOpen className="h-5 w-5" />
                View Documentation
              </Button> */}
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="container mx-auto px-4 py-16 lg:py-24 bg-muted/30">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">Why Choose MoveIt?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Experience the next generation of project management with blockchain technology
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Lock className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Blockchain Security</h3>
                <p className="text-muted-foreground leading-relaxed">
                  All tasks and boards stored on Sui blockchain with cryptographic verification and immutable history.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <LayoutDashboard className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Configurable Boards</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Create custom workflows with flexible column configurations. Not just Kanban - build what works for
                  you.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Role-Based Access</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Fine-grained permissions with owner, admin, and member roles. Secure collaboration at scale.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Story Points & Priorities</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Plan sprints with story point estimation and priority levels from low to urgent.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">Drag & Drop</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Intuitive drag-and-drop interface for moving tasks between columns with real-time updates.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-card border-border hover:border-primary/50 transition-colors">
              <CardContent className="pt-6 space-y-3">
                <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold">True Ownership</h3>
                <p className="text-muted-foreground leading-relaxed">
                  You own your data. No central authority, no vendor lock-in. Export and migrate anytime.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* How It Works */}
        <section className="container mx-auto px-4 py-16 lg:py-24">
          <div className="text-center mb-12">
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">How It Works</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started with MoveIt in three simple steps
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold">
                1
              </div>
              <h3 className="text-xl font-semibold">Connect Your Wallet</h3>
              <p className="text-muted-foreground">
                Use any Sui-compatible wallet like Sui Wallet or Suiet to connect securely
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold">
                2
              </div>
              <h3 className="text-xl font-semibold">Create Your Board</h3>
              <p className="text-muted-foreground">
                Set up custom boards with configurable columns that match your workflow
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 text-primary text-2xl font-bold">
                3
              </div>
              <h3 className="text-xl font-semibold">Start Collaborating</h3>
              <p className="text-muted-foreground">
                Invite team members, create tasks, and track progress with blockchain transparency
              </p>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="container mx-auto px-4 py-16 lg:py-24 bg-gradient-to-b from-primary/5 to-transparent">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            <h2 className="text-4xl lg:text-5xl font-bold text-balance">Ready to decentralize your workflow?</h2>
            <p className="text-lg text-muted-foreground text-pretty">
              Connect your Sui wallet and start managing tasks on the blockchain in seconds. No credit card required.
            </p>
            {/* <Button size="lg" className="gap-2 text-lg px-8">
              <Shield className="h-5 w-5" />
              Get Started Now
              <ArrowRight className="h-5 w-5" />
            </Button> */}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border mt-16">
          <div className="container mx-auto px-4 py-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span>© 2025 MoveIt. Built on Sui Blockchain.</span>
              </div>
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon">
                  <Github className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <Twitter className="h-5 w-5" />
                </Button>
                <Button variant="ghost" size="icon">
                  <BookOpen className="h-5 w-5" />
                </Button>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  )
}
