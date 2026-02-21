# CivicGo Application Flowcharts

## 🏗️ System Architecture Flowchart

```mermaid
graph TB
    subgraph "Frontend Layer"
        A[React App] --> B[Components]
        A --> C[Services]
        A --> D[Utils]
        B --> E[HomePage]
        B --> F[ReportPage]
        B --> G[StatusPage]
        B --> H[AdminPage]
        C --> I[ReportService]
        C --> J[AIService]
        C --> K[NotificationService]
        D --> L[Translations]
        D --> M[ThemeContext]
    end

    subgraph "Backend Layer"
        N[Supabase] --> O[Auth]
        N --> P[Database]
        N --> Q[Storage]
        N --> R[Realtime]
        P --> S[Reports Table]
        P --> T[Users Table]
        P --> U[Notifications Table]
    end

    subgraph "External Services"
        V[Firebase] --> W[FCM]
        V --> X[Cloud Messaging]
        Y[Google Vision] --> Z[AI Analysis]
        AA[TensorFlow.js] --> BB[Client-side ML]
    end

    A --> N
    N --> V
    A --> Y
    A --> AA

    style A fill:#e1f5fe
    style N fill:#f3e5f5
    style V fill:#e8f5e8
```

## 🔄 User Journey Flowchart

```mermaid
flowchart TD
    Start([User Opens App]) --> A{Is User Signed In?}
    A -->|No| B[Welcome Page]
    A -->|Yes| C[Home Dashboard]

    B --> D[Google Sign In]
    B --> E[Anonymous Access]
    D --> C
    E --> C

    C --> F{What to do?}
    F -->|Report Issue| G[Report Page]
    F -->|Check Status| H[Status Page]
    F -->|View Profile| I[Profile Page]
    F -->|Admin Access| J{Is Admin?}

    G --> K[Capture Photo]
    K --> L[AI Analysis]
    L --> M[Add Details]
    M --> N[Submit Report]
    N --> O[Confirmation]
    O --> C

    H --> P[View Reports]
    P --> Q[Filter by Status]
    Q --> R[Update Status]
    R --> C

    I --> S[Notification Settings]
    S --> T[Theme Settings]
    T --> U[Language Settings]
    U --> C

    J -->|Yes| V[Admin Dashboard]
    J -->|No| W[Access Denied]
    W --> C

    V --> X[Manage Reports]
    X --> Y[View Analytics]
    Y --> Z[User Management]
    Z --> C
```

## 📊 Data Flow Architecture

```mermaid
flowchart LR
    subgraph "User Input"
        A[Report Submission] --> B[Image Upload]
        A --> C[Text Description]
        A --> D[Location Data]
    end

    subgraph "Processing Layer"
        B --> E[AI Analysis]
        C --> F[Text Processing]
        D --> G[Geocoding]
        E --> H[Object Detection]
        F --> I[Categorization]
        G --> J[Address Resolution]
    end

    subgraph "Storage Layer"
        H --> K[(Supabase)]
        I --> K
        J --> K
        L[User Data] --> K
        M[Notifications] --> K
    end

    subgraph "Output Layer"
        K --> N[Admin Dashboard]
        K --> O[User Notifications]
        K --> P[Status Updates]
        K --> Q[Analytics]
    end

    style A fill:#bbdefb
    style E fill:#c8e6c9
    style K fill:#ffcdd2
    style N fill:#fff3e0
```

## 🔐 Authentication Flow

```mermaid
flowchart TD
    A[User Attempts Access] --> B{Authentication Required?}
    B -->|Yes| C{User Signed In?}
    B -->|No| D[Allow Anonymous Access]

    C -->|No| E[Redirect to Sign In]
    C -->|Yes| F{Valid Session?}
    E --> G[Google OAuth]
    E --> H[Anonymous Sign In]

    F -->|No| I[Refresh Token]
    F -->|Yes| J[Grant Access]

    G --> K[Validate Token]
    H --> L[Create Guest Session]

    K -->|Valid| M[Create User Session]
    K -->|Invalid| N[Authentication Failed]

    I -->|Success| J
    I -->|Failed| E

    M --> J
    L --> J
    N --> E

    D --> O[Proceed with Limited Features]
    J --> P[Full Access Granted]
    O --> Q[Limited Access Granted]

    style G fill:#e8f5e8
    style H fill:#fff3e0
    style P fill:#c8e6c9
    style Q fill:#ffebee
```

## 🤖 AI Processing Flow

```mermaid
flowchart TD
    A[Image Uploaded] --> B{Client-side Processing?}
    B -->|Yes| C[TensorFlow.js Analysis]
    B -->|No| D[Server-side Processing]

    C --> E[Load MobileNet Model]
    D --> F[Send to Google Vision API]

    E --> G[Preprocess Image]
    F --> H[API Request]

    G --> I[Run Inference]
    H --> J[Receive Response]

    I --> K[Extract Features]
    J --> L[Parse Results]

    K --> M[Object Detection]
    L --> N[Object Detection]

    M --> O[Confidence Scoring]
    N --> P[Confidence Scoring]

    O --> Q[Local Results]
    P --> R[Cloud Results]

    Q --> S{Merge Results}
    R --> S

    S --> T[Generate Report]
    T --> U[Auto-categorize]
    U --> V[Add Metadata]
    V --> W[Store in Database]

    style C fill:#e3f2fd
    style F fill:#f3e5f5
    style T fill:#e8f5e8
```

## 📱 Notification Flow

```mermaid
flowchart TD
    A[Event Triggered] --> B{Notification Type}
    B -->|Report Status| C[Status Update]
    B -->|New Report| D[Admin Alert]
    B -->|System| E[System Notification]

    C --> F[Check User Preferences]
    D --> G[Check Admin Settings]
    E --> H[Global Settings]

    F --> I{Email Enabled?}
    G --> J{Push Enabled?}
    H --> K{In-App Enabled?}

    I -->|Yes| L[Send Email]
    I -->|No| M[Skip Email]
    J -->|Yes| N[Send Push]
    J -->|No| O[Skip Push]
    K -->|Yes| P[Show In-App]
    K -->|No| Q[Skip In-App]

    L --> R[Email Service]
    N --> S[Firebase FCM]
    P --> T[UI Notification]

    R --> U[Email Sent]
    S --> V[Push Delivered]
    T --> W[In-App Shown]

    M --> X[Email Skipped]
    O --> Y[Push Skipped]
    Q --> Z[In-App Skipped]

    U --> AA[Log Success]
    V --> AA
    W --> AA
    X --> BB[Log Skipped]
    Y --> BB
    Z --> BB

    AA --> CC[Update Database]
    BB --> CC

    style L fill:#e8f5e8
    style N fill:#e8f5e8
    style P fill:#e8f5e8
    style CC fill:#c8e6c9
```

## 🔄 Report Lifecycle Flow

```mermaid
stateDiagram-v2
    [*] --> Submitted: User submits report
    Submitted --> Processing: AI analysis begins
    Processing --> Categorized: Auto-categorized
    Categorized --> Pending: Awaiting review

    Pending --> UnderReview: Admin reviews
    UnderReview --> Approved: Valid report
    UnderReview --> Rejected: Invalid/spam

    Approved --> Assigned: Assigned to department
    Assigned --> InProgress: Work started
    InProgress --> Resolved: Issue fixed
    InProgress --> Escalated: Needs higher authority

    Escalated --> UnderReview
    Resolved --> Closed: Final status
    Rejected --> Closed

    Closed --> [*]

    note right of Submitted
        Initial submission
        with photo & details
    end note

    note right of Processing
        AI analyzes image
        and categorizes
    end note

    note right of Pending
        Waiting for
        admin review
    end note

    note right of UnderReview
        Admin validates
        and prioritizes
    end note

    note right of Assigned
        Routed to appropriate
        department/team
    end note

    note right of InProgress
        Active work on
        the issue
    end note

    note right of Resolved
        Issue successfully
        addressed
    end note
```

## 📈 Admin Workflow Flow

```mermaid
flowchart TD
    A[Admin Logs In] --> B{Authentication}
    B -->|Success| C[Admin Dashboard]
    B -->|Failed| D[Access Denied]

    C --> E[View Statistics]
    C --> F[Manage Reports]
    C --> G[User Management]
    C --> H[System Settings]

    E --> I[Reports Overview]
    E --> J[Analytics Charts]
    E --> K[Performance Metrics]

    F --> L[Filter Reports]
    F --> M[Update Status]
    F --> N[Assign Priority]
    F --> O[Bulk Actions]

    L --> P{Report Category}
    P -->|Infrastructure| Q[Road Department]
    P -->|Sanitation| R[Sanitation Dept]
    P -->|Electricity| S[Electric Dept]
    P -->|Water| T[Water Dept]

    M --> U[Status Changed]
    N --> V[Priority Set]
    O --> W[Batch Updated]

    G --> X[User Roles]
    G --> Y[Permissions]
    G --> Z[Access Control]

    H --> AA[Notification Settings]
    H --> BB[System Configuration]
    H --> CC[Backup & Maintenance]

    style C fill:#e3f2fd
    style F fill:#fff3e0
    style H fill:#f3e5f5
```

## 🌐 Multi-language Support Flow

```mermaid
flowchart TD
    A[User Changes Language] --> B{Supported Language?}
    B -->|Yes| C[Load Translation File]
    B -->|No| D[Fallback to English]

    C --> E[Update Context]
    D --> F[Update Context]

    E --> G[Re-render Components]
    F --> H[Re-render Components]

    G --> I[Translate UI Elements]
    H --> J[Translate UI Elements]

    I --> K[Update Text Content]
    J --> L[Update Text Content]

    K --> M[Persist Preference]
    L --> N[Persist Preference]

    M --> O[Language Set Successfully]
    N --> P[Language Set to Default]

    style C fill:#e8f5e8
    style D fill:#ffebee
    style O fill:#c8e6c9
```

## 🎨 Theme System Flow

```mermaid
flowchart TD
    A[User Toggles Theme] --> B{System Preference?}
    B -->|Yes| C[Detect System Theme]
    B -->|No| D[Use User Preference]

    C --> E{System is Dark?}
    D --> F{User Prefers Dark?}

    E -->|Yes| G[Apply Dark Theme]
    E -->|No| H[Apply Light Theme]
    F -->|Yes| G
    F -->|No| H

    G --> I[Update CSS Variables]
    H --> J[Update CSS Variables]

    I --> K[Update Components]
    J --> L[Update Components]

    K --> M[Persist Theme Choice]
    L --> N[Persist Theme Choice]

    M --> O[Theme Applied Successfully]
    N --> P[Theme Applied Successfully]

    style G fill:#424242
    style H fill:#ffffff
    style O fill:#c8e6c9
```

## 🔍 Search & Filter Flow

```mermaid
flowchart TD
    A[User Initiates Search] --> B{Search Type}
    B -->|Text Search| C[Text Query]
    B -->|Category Filter| D[Category Selection]
    B -->|Status Filter| E[Status Selection]
    B -->|Date Filter| F[Date Range]

    C --> G[Parse Query]
    D --> H[Apply Category Filter]
    E --> I[Apply Status Filter]
    F --> J[Apply Date Filter]

    G --> K[Search Database]
    H --> L[Filter Results]
    I --> M[Filter Results]
    J --> N[Filter Results]

    K --> O[Get Matching Reports]
    L --> P[Get Filtered Reports]
    M --> Q[Get Filtered Reports]
    N --> R[Get Filtered Reports]

    O --> S[Combine Results]
    P --> S
    Q --> S
    R --> S

    S --> T[Sort Results]
    T --> U[Paginate Results]
    U --> V[Display Results]

    style V fill:#c8e6c9
```

## 📊 Analytics & Reporting Flow

```mermaid
flowchart TD
    A[Data Collection] --> B[Raw Events]
    B --> C[Process Events]
    C --> D[Aggregate Data]

    D --> E{Report Type}
    E -->|User Analytics| F[User Metrics]
    E -->|Report Analytics| G[Report Metrics]
    E -->|Performance| H[Performance Metrics]
    E -->|System Health| I[System Metrics]

    F --> J[Active Users]
    F --> K[Engagement Rate]
    F --> L[Retention Rate]

    G --> M[Reports by Category]
    G --> N[Resolution Time]
    G --> O[Success Rate]

    H --> P[Response Time]
    H --> Q[Uptime Percentage]
    H --> R[Error Rate]

    I --> S[Server Load]
    I --> T[Database Performance]
    I --> U[API Usage]

    J --> V[Generate Charts]
    K --> V
    L --> V
    M --> V
    N --> V
    O --> V
    P --> V
    Q --> V
    R --> V
    S --> V
    T --> V
    U --> V

    V --> W[Dashboard Display]
    W --> X[Export Reports]
    X --> Y[Email Reports]
    Y --> Z[Archive Data]

    style W fill:#e3f2fd
    style X fill:#fff3e0
```

## 🔧 Error Handling Flow

```mermaid
flowchart TD
    A[Error Occurs] --> B{Error Type}
    B -->|Network Error| C[Retry Logic]
    B -->|Authentication Error| D[Re-authenticate]
    B -->|Validation Error| E[Show Validation Message]
    B -->|Server Error| F[Show Generic Error]
    B -->|Client Error| G[Log Error]

    C --> H{Retry Count < Max?}
    H -->|Yes| I[Wait & Retry]
    H -->|No| J[Show Offline Message]

    D --> K[Redirect to Login]
    E --> L[Highlight Invalid Fields]
    F --> M[Show User-Friendly Message]
    G --> N[Send to Error Reporting]

    I --> O{Success?}
    O -->|Yes| P[Continue Normal Flow]
    O -->|No| H

    K --> Q[User Logs In]
    Q --> R[Retry Original Action]

    L --> S[User Corrects Input]
    S --> T[Re-submit Form]

    M --> U[User Acknowledges]
    U --> V[Return to Previous State]

    N --> W[Error Logged]
    W --> X[Developer Notification]

    style P fill:#c8e6c9
    style R fill:#c8e6c9
    style T fill:#c8e6c9
    style V fill:#c8e6c9
```

## 🚀 Deployment Flow

```mermaid
flowchart TD
    A[Code Changes] --> B[Run Tests]
    B --> C{Tests Pass?}
    C -->|No| D[Fix Issues]
    C -->|Yes| E[Build Application]

    D --> B

    E --> F[Create Build Artifacts]
    F --> G{Environment}
    G -->|Development| H[Deploy to Dev]
    G -->|Staging| I[Deploy to Staging]
    G -->|Production| J[Deploy to Production]

    H --> K[Run Integration Tests]
    I --> L[Run E2E Tests]
    J --> M[Run Smoke Tests]

    K --> N{Tests Pass?}
    L --> O{Tests Pass?}
    M --> P{Tests Pass?}

    N -->|No| Q[Rollback Dev]
    N -->|Yes| R[Dev Deployed]
    O -->|No| S[Rollback Staging]
    O -->|Yes| T[Staging Deployed]
    P -->|No| U[Rollback Production]
    P -->|Yes| V[Production Deployed]

    Q --> D
    S --> D
    U --> D

    R --> W[Monitor Dev]
    T --> X[Monitor Staging]
    V --> Y[Monitor Production]

    W --> Z[Performance Check]
    X --> AA[User Acceptance]
    Y --> BB[Business Metrics]

    style V fill:#c8e6c9
    style T fill:#e8f5e8
    style R fill:#fff3e0
```

## 📱 Progressive Web App Flow

```mermaid
flowchart TD
    A[User Visits Site] --> B{Supports PWA?}
    B -->|Yes| C[Show Install Prompt]
    B -->|No| D[Standard Web Experience]

    C --> E{User Installs?}
    E -->|Yes| F[Install PWA]
    E -->|No| D

    F --> G[Register Service Worker]
    G --> H[Cache Resources]
    H --> I[Enable Offline Mode]

    I --> J[App Installed Successfully]
    J --> K[Launch from Home Screen]

    K --> L{Online Status}
    L -->|Online| M[Full Functionality]
    L -->|Offline| N[Limited Functionality]

    M --> O[Sync Data]
    N --> P[Use Cached Data]

    O --> Q[Real-time Updates]
    P --> R[Offline Queue]

    Q --> S[Immediate Feedback]
    R --> T[Background Sync]

    T --> U{Back Online?}
    U -->|Yes| V[Sync Pending Actions]
    U -->|No| W[Continue Offline]

    V --> X[Update UI]
    W --> Y[Maintain State]

    style F fill:#e8f5e8
    style J fill:#c8e6c9
    style M fill:#e3f2fd
```

---

## 📋 Flowchart Legend

### Node Types
- **Rectangle**: Process/Action
- **Diamond**: Decision Point
- **Rounded Rectangle**: Start/End Point
- **Cylinder**: Database/Storage
- **Cloud**: External Service

### Colors
- 🔵 **Blue** (`#e3f2fd`): User Interface Components
- 🟢 **Green** (`#e8f5e8`): Successful Operations
- 🟡 **Yellow** (`#fff3e0`): Processing/Analysis
- 🟠 **Orange** (`#ffebee`): External Services
- 🔴 **Red** (`#ffcdd2`): Errors/Failures
- 🟣 **Purple** (`#f3e5f5`): System Components

### Flow Types
- **Solid Line**: Primary Flow
- **Dashed Line**: Alternative/Conditional Flow
- **Thick Line**: Critical Path
- **Thin Line**: Optional/Background Process

---

*These flowcharts provide a comprehensive visual representation of the CivicGo application's architecture, user flows, and system interactions. They serve as both documentation and planning tools for development and maintenance.*
