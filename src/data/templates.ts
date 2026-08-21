export interface DiagramTemplate {
  id: string
  title: string
  category: "flowchart" | "sequence" | "database" | "architecture" | "project" | "data" | "markdown"
  description: string
  code: string
  isMarkdown?: boolean
}

export const TEMPLATES: DiagramTemplate[] = [
  {
    id: "cloud-architecture",
    title: "Cloud Microservices Architecture",
    category: "architecture",
    description: "Multi-tier cloud system with API Gateway, Services, Cache & DB",
    code: `flowchart TB
    %% Styling
    classDef client fill:#3b82f6,stroke:#1d4ed8,stroke-width:2px,color:#fff;
    classDef gateway fill:#8b5cf6,stroke:#6d28d9,stroke-width:2px,color:#fff;
    classDef service fill:#10b981,stroke:#047857,stroke-width:2px,color:#fff;
    classDef storage fill:#f59e0b,stroke:#b45309,stroke-width:2px,color:#fff;

    subgraph Clients["Client Layer"]
        Web["Web Application (React)"]:::client
        Mobile["Mobile App (Flutter)"]:::client
    end

    subgraph Ingress["Ingress & Security"]
        Cloudflare["Cloudflare WAF / CDN"]
        Gateway["Kong API Gateway & Auth"]:::gateway
    end

    subgraph Microservices["Microservice Cluster"]
        AuthSvc["Auth & Identity Service"]:::service
        OrderSvc["Order Processing Service"]:::service
        PaymentSvc["Stripe Payment Gateway"]:::service
        NotifSvc["Event Notification Hub"]:::service
    end

    subgraph DataStorage["Data & Cache Layer"]
        Redis[("Redis Distributed Cache")]:::storage
        Postgres[("PostgreSQL Master-Replica")]:::storage
        Kafka[["Apache Kafka Event Stream"]]:::storage
    end

    Web --> Cloudflare
    Mobile --> Cloudflare
    Cloudflare --> Gateway
    Gateway --> AuthSvc
    Gateway --> OrderSvc
    Gateway --> PaymentSvc

    OrderSvc --> Redis
    OrderSvc --> Postgres
    OrderSvc --> Kafka
    Kafka --> NotifSvc
    PaymentSvc --> Postgres`
  },
  {
    id: "auth-sequence",
    title: "OAuth 2.0 & JWT Auth Flow",
    category: "sequence",
    description: "Complete authentication with Token refresh & validation",
    code: `sequenceDiagram
    autonumber
    actor User as User (Browser)
    participant App as React Frontend
    participant Auth as Auth Server (OIDC)
    participant API as Backend API
    participant DB as Database

    User->>App: Click "Sign in with Google"
    App->>Auth: Redirect with client_id & scope
    Auth->>User: Display consent screen
    User->>Auth: Grant permission & credentials
    Auth-->>App: Authorization Code (Redirect URI)
    
    App->>Auth: Exchange Code for Access + Refresh Token
    Auth-->>App: Return JWT AccessToken (15m) & RefreshToken (7d)
    
    Note over App,API: Authenticated API Requests
    App->>API: GET /api/v1/dashboard [Bearer JWT]
    API->>DB: Query User Profile & Perms
    DB-->>API: User Data
    API-->>App: 200 OK (JSON Response)
    
    Note over App,Auth: Silent Token Refresh
    App->>Auth: POST /auth/refresh [RefreshToken]
    Auth-->>App: New AccessToken`
  },
  {
    id: "ecommerce-erd",
    title: "E-Commerce Database Schema",
    category: "database",
    description: "Normalized relational schema with Users, Orders, Products, and Payments",
    code: `erDiagram
    USERS ||--o{ ORDERS : places
    USERS ||--o{ REVIEWS : writes
    ORDERS ||--|{ ORDER_ITEMS : contains
    PRODUCTS ||--o{ ORDER_ITEMS : "included in"
    CATEGORIES ||--o{ PRODUCTS : categorizes
    ORDERS ||--|| PAYMENTS : "settled with"

    USERS {
        uuid id PK
        string email UK
        string password_hash
        string full_name
        string role
        timestamp created_at
    }

    ORDERS {
        uuid id PK
        uuid user_id FK
        decimal total_amount
        string status
        timestamp placed_at
    }

    ORDER_ITEMS {
        uuid id PK
        uuid order_id FK
        uuid product_id FK
        int quantity
        decimal unit_price
    }

    PRODUCTS {
        uuid id PK
        uuid category_id FK
        string title
        string sku UK
        decimal price
        int stock_count
    }

    PAYMENTS {
        uuid id PK
        uuid order_id FK
        string provider
        string transaction_id
        decimal amount
        string status
    }`
  },
  {
    id: "order-state-machine",
    title: "Order Lifecycle State Machine",
    category: "flowchart",
    description: "State transitions from draft, payment, fulfillment, to delivered or cancelled",
    code: `stateDiagram-v2
    [*] --> Draft : Customer adds items
    
    Draft --> PendingPayment : Checkout submitted
    
    state PendingPayment {
        [*] --> AwaitingWebhook
        AwaitingWebhook --> ProcessingGateway : Token verified
        ProcessingGateway --> [*]
    }
    
    PendingPayment --> Paid : Payment Succeeded
    PendingPayment --> Failed : Gateway Timeout / Declined
    Failed --> PendingPayment : Retry Payment
    Failed --> Cancelled : Max Retries Exceeded
    
    Paid --> Processing : Warehouse assigned
    Processing --> Shipped : Carrier picked up
    
    state Shipped {
        [*] --> InTransit
        InTransit --> OutForDelivery
        OutForDelivery --> [*]
    }
    
    Shipped --> Delivered : Recipient signed
    Delivered --> [*]
    
    Draft --> Cancelled : Abandoned cart
    Processing --> Refunded : Customer requested cancel
    Cancelled --> [*]
    Refunded --> [*]`
  },
  {
    id: "class-domain-model",
    title: "Clean Architecture Class Model",
    category: "architecture",
    description: "OOP Domain Model with Interfaces, Inheritance, and Methods",
    code: `classDiagram
    class Entity {
        <<abstract>>
        +UUID id
        +DateTime createdAt
        +DateTime updatedAt
        +validate() bool
    }

    class User {
        +String email
        +String passwordHash
        +UserRole role
        +login(credentials) bool
        +changePassword(old, new)
    }

    class Order {
        +OrderStatus status
        +List~OrderItem~ items
        +Money total
        +addItem(Product, int)
        +calculateDiscount(Coupon) Money
        +pay(PaymentMethod) bool
    }

    class Product {
        +String name
        +Money price
        +int stockQuantity
        +isAvailable() bool
        +deductStock(int)
    }

    class PaymentProcessor {
        <<interface>>
        +charge(Money, CardToken) TransactionResult
        +refund(TransactionId) bool
    }

    class StripeProcessor {
        -String apiKey
        +charge(Money, CardToken) TransactionResult
        +refund(TransactionId) bool
    }

    Entity <|-- User
    Entity <|-- Order
    Entity <|-- Product
    PaymentProcessor <|.. StripeProcessor
    Order "1" *-- "many" Product : contains`
  },
  {
    id: "git-flow-branching",
    title: "GitFlow Branching Strategy",
    category: "project",
    description: "Main, Develop, Feature branches, Release tags, and Hotfix",
    code: `gitGraph
    commit id: "v1.0.0" tag: "v1.0.0"
    branch develop
    checkout develop
    commit id: "init-dev"
    branch feature/auth
    checkout feature/auth
    commit id: "add-jwt"
    commit id: "oauth2-support"
    checkout develop
    merge feature/auth id: "merge-auth"
    branch feature/export
    checkout feature/export
    commit id: "add-png-export"
    commit id: "add-svg-export"
    checkout develop
    merge feature/export id: "merge-export"
    branch release/v1.1.0
    checkout release/v1.1.0
    commit id: "bump-version"
    checkout main
    merge release/v1.1.0 id: "v1.1.0-release" tag: "v1.1.0"
    checkout develop
    merge release/v1.1.0 id: "sync-develop"
    checkout main
    branch hotfix/cors-bug
    commit id: "fix-cors-header"
    checkout main
    merge hotfix/cors-bug id: "v1.1.1" tag: "v1.1.1"
    checkout develop
    merge hotfix/cors-bug id: "sync-hotfix"`
  },
  {
    id: "mindmap-product",
    title: "Product Strategy Mindmap",
    category: "project",
    description: "Brainstorming and hierarchical feature mindmap",
    code: `mindmap
  root((Mermaid Studio))
    Core Features
      Live Monaco Editor
      Realtime SVG Rendering
      Error Diagnostics
    Export Capabilities
      Raster Images
        PNG (1x, 2x, 4x)
        JPEG
        WebP
      Vector
        SVG Clean
      Direct Copy
        Copy Image
        Copy Code
    Developer Experience
      Templates Gallery
      LocalStorage History
      URL Shareable Links
      Dark & Light Themes`
  },
  {
    id: "gantt-project-plan",
    title: "Software Release Roadmap",
    category: "project",
    description: "Timeline with milestones, sprints, and critical path dependencies",
    code: `gantt
    title Sprint 24 & Release Cycle
    dateFormat  YYYY-MM-DD
    section UI & Core
    Design System Setup      :done,    des1, 2026-09-01, 2026-09-04
    Monaco Integration       :done,    des2, 2026-09-05, 2026-09-08
    Live Canvas Pan & Zoom   :active,  des3, 2026-09-09, 2026-09-13
    
    section Export Engine
    High-DPI SVG to PNG      :crit, active, exp1, 2026-09-10, 2026-09-14
    Clipboard Image API      :exp2, 2026-09-14, 2026-09-16
    
    section QA & Launch
    Cross-browser Testing    :qa1, 2026-09-16, 2026-09-18
    Production Deploy        :milestone, m1, 2026-09-19, 2026-09-19`
  },
  {
    id: "pie-chart-stack",
    title: "Technology Stack Share",
    category: "data",
    description: "Clean data breakdown with slices and percentages",
    code: `pie title "Frontend Tech Stack Usage (2026)"
    "React / Next.js" : 48
    "Vue / Nuxt" : 22
    "Svelte / SvelteKit" : 14
    "Angular" : 10
    "Others" : 6`
  },
  {
    id: "markdown-doc-sample",
    title: "Full Markdown with Mermaid Blocks",
    category: "markdown",
    description: "Standard Markdown file containing documentation and embedded Mermaid diagrams",
    isMarkdown: true,
    code: `# Project Architecture Overview

This document describes the request lifecycle and deployment pipeline.

## 1. System Request Pipeline

Berikut adalah alur request dari pengguna hingga ke database:

\`\`\`mermaid
flowchart LR
    User([End User]) --> CDN[Cloudflare CDN]
    CDN --> LB[Nginx Load Balancer]
    LB --> App1[App Instance 1]
    LB --> App2[App Instance 2]
    App1 --> DB[(Primary Postgres)]
    App2 --> DB
\`\`\`

## 2. CI/CD Pipeline

Otomatisasi pengujian dan deployment ke production:

\`\`\`mermaid
sequenceDiagram
    actor Dev as Developer
    participant Git as GitHub Repo
    participant CI as GitHub Actions
    participant K8s as Kubernetes Cluster

    Dev->>Git: git push origin main
    Git->>CI: Trigger Build & Unit Tests
    CI->>CI: Run Linters & Vitest
    CI->>K8s: Deploy Helm Chart (Rolling Update)
    K8s-->>Dev: Deployment Success Notification
\`\`\`

---
*Generated using MermaidArt Diagram Studio*`
  }
]