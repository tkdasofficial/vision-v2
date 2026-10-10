import { useState, type ReactNode } from "react";
import { ArrowLeft, Menu } from "lucide-react";
import { useNavigate } from "@/lib/router-compat";
import { useChatHistory } from "@/context/ChatHistoryContext";
import DesktopSidebar from "./DesktopSidebar";
import MobileSidebar from "./MobileSidebar";
import PageHeader from "./PageHeader";

export default function WorkspaceShell({ title, children, actions, backTo }: { title: string; children: ReactNode; actions?: ReactNode; backTo?: string }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const { history } = useChatHistory();
  const props = { onNewChat: () => navigate("/app/new"), onSelectChat: (id: string) => navigate(`/app/chat/${id}`), chatHistory: history, isMainChat: false };
  return <div className="flex h-[100dvh] overflow-hidden bg-background">
    <DesktopSidebar {...props} /><MobileSidebar {...props} open={open} onClose={() => setOpen(false)} />
    <main className="flex min-w-0 flex-1 flex-col">
      <PageHeader title={title} backTo={backTo} onMenu={backTo ? undefined : () => setOpen(true)} menuClassName="lg:hidden" actions={actions} />
      <div className="flex-1 overflow-y-auto px-4 py-6 sm:px-8"><div className="mx-auto max-w-4xl">{children}</div></div>
    </main>
  </div>;
}