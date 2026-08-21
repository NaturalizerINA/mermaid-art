import React from "react"
import { 
  ArrowRight, 
  Layers, 
  Palette, 
  MessageSquare, 
  Database, 
  Hash, 
  GitBranch,
  Split
} from "lucide-react"
import { Button } from "@/components/ui/button"

interface SnippetBarProps {
  onInsertSnippet: (snippet: string) => void
}

export const SnippetBar: React.FC<SnippetBarProps> = ({ onInsertSnippet }) => {
  const snippets = [
    { label: "A --> B", icon: ArrowRight, code: "    A[Node A] --> B[Node B]\n", tooltip: "Solid Arrow" },
    { label: "A -.-> B", icon: Split, code: "    A -.->|Dotted Link| B\n", tooltip: "Dotted Arrow" },
    { label: "A ==> B", icon: ArrowRight, code: "    A ==>|Thick Link| B\n", tooltip: "Thick Arrow" },
    { label: "subgraph", icon: Layers, code: "    subgraph GroupName[\"Group Title\"]\n        Node1 --> Node2\n    end\n", tooltip: "Subgraph Box" },
    { label: "classDef", icon: Palette, code: "    classDef highlight fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;\n    class NodeA highlight;\n", tooltip: "Custom CSS Style" },
    { label: "autonumber", icon: Hash, code: "    autonumber\n", tooltip: "Auto-numbering" },
    { label: "Note over", icon: MessageSquare, code: "    Note over User,App: Important Note\n", tooltip: "Sequence Note" },
    { label: "ER Entity", icon: Database, code: "    TABLE_NAME {\n        uuid id PK\n        string name\n        timestamp created_at\n    }\n", tooltip: "ER Entity Table" },
    { label: "gitGraph", icon: GitBranch, code: "gitGraph\n    commit\n    branch feature\n    checkout feature\n    commit\n    checkout main\n    merge feature\n", tooltip: "Git Graph Skeleton" },
  ]

  return (
    <div className="h-9 px-3 border-b bg-muted/30 flex items-center space-x-1.5 overflow-x-auto no-scrollbar select-none text-xs">
      <span className="text-[11px] text-muted-foreground font-medium mr-1 uppercase tracking-wider">Snippets:</span>
      {snippets.map((snip, idx) => {
        const Icon = snip.icon
        return (
          <Button
            key={idx}
            variant="ghost"
            size="xs"
            onClick={() => onInsertSnippet(snip.code)}
            title={snip.tooltip}
            className="h-6 px-2 text-[11px] bg-background/60 hover:bg-accent border border-border/40 font-mono gap-1 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <Icon className="w-3 h-3 text-primary/70" />
            <span>{snip.label}</span>
          </Button>
        )
      })}
    </div>
  )
}