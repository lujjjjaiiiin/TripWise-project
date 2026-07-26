import { Home } from "@/pages/home"
import { Explore } from "@/pages/explore"
import { Planner } from "@/pages/planner"
import About from "@/pages/about"
import NotFound from "@/pages/not-found"
import { Route, Switch, Router as WouterRouter } from "wouter"
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { LanguageProvider } from "./lib/i18n"
import { Layout } from "./components/Layout"
import { IntroAnimation } from "./components/IntroAnimation"

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
})

function AppRoutes() {
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/explore" component={Explore} />
        <Route path="/planner" component={Planner} />
        <Route path="/about" component={About} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <IntroAnimation />
      <LanguageProvider>
        <WouterRouter base={import.meta.env.BASE_URL?.replace(/\/$/, '') || ''}>
          <AppRoutes />
        </WouterRouter>
        <Toaster />
      </LanguageProvider>
    </QueryClientProvider>
  )
}

export default App
