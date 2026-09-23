import { useEffect } from "react";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Route, Switch } from "wouter";
import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Assessment from "./pages/Assessment";
import Reports from "./pages/Reports";
import Insights from "./pages/Insights";
import Auth from "./pages/Auth";
import Admin from "./pages/Admin";
import Profile from "./pages/Profile";
import Assistant from "./pages/Assistant";
import Settings from "./pages/Settings";
import DailyLog from "./pages/DailyLog";
import NotFound from "./pages/NotFound";

function Router() {
  return <Switch><Route path="/" component={Home}/><Route path="/auth" component={Auth}/><Route path="/dashboard" component={Dashboard}/><Route path="/assessment" component={Assessment}/><Route path="/daily-log" component={DailyLog}/><Route path="/reports" component={Reports}/><Route path="/insights" component={Insights}/><Route path="/assistant" component={Assistant}/><Route path="/admin" component={Admin}/><Route path="/profile" component={Profile}/><Route path="/settings" component={Settings}/><Route path="/404" component={NotFound}/><Route component={NotFound}/></Switch>;
}

function SlashFreeCopy() {
  useEffect(() => {
    const clean = (value: string) => value.replace(/^(\s*)\/\s+/, "$1").replace(/(\d+)\s*\/\s*(\d+)/g, "$1 of $2").replace(/\s+\/\s+/g, " · ");
    const sanitizeText = (text: Text) => {
      const parent = text.parentElement;
      if (!parent || ["SCRIPT", "STYLE", "TEXTAREA"].includes(parent.tagName)) return;
      const next = clean(text.data);
      if (next !== text.data) text.data = next;
    };
    const sanitize = (root: Node) => {
      if (root.nodeType === Node.TEXT_NODE) sanitizeText(root as Text);
      const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
      const nodes: Text[] = [];
      while (walker.nextNode()) nodes.push(walker.currentNode as Text);
      nodes.forEach(sanitizeText);
    };
    sanitize(document.body);
    const observer = new MutationObserver(records => records.forEach(record => {
      if (record.type === "characterData") sanitizeText(record.target as Text);
      record.addedNodes.forEach(sanitize);
    }));
    observer.observe(document.body, { childList: true, characterData: true, subtree: true });
    return () => observer.disconnect();
  }, []);
  return null;
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="dark" switchable><TooltipProvider><Toaster/><SlashFreeCopy/><Router/></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
