# 📱 Sosyal Medya Takip İzleme Uygulaması
## Proje Tasarım Dokümanı (PRD & Technical Architecture)

**Versiyon:** 1.0  
**Tarih:** 21 Aralık 2024  
**Doküman Türü:** Product Requirements Document + Technical Architecture

---

## 📑 İçindekiler

1. [Marka Kimliği](#1-marka-kimliği)
2. [Temel Özellikler (MVP ve İleri Seviye)](#2-temel-özellikler)
3. [Teknik Altyapı ve Zorluklar](#3-teknik-altyapı-ve-zorluklar)
4. [Kullanıcı Deneyimi (UX/UI)](#4-kullanıcı-deneyimi-uxui)
5. [Gelir Modeli (Monetization)](#5-gelir-modeli-monetization)
6. [Roadmap ve Önceliklendirme](#6-roadmap-ve-önceliklendirme)

---

## 1. Marka Kimliği

### 🏷️ İsim Önerileri

| Sıra | İsim | Anlam & Konsept | Domain Uygunluğu |
|------|------|-----------------|------------------|
| **1** | **Followrazzi** | "Follow" + "Paparazzi" birleşimi. Ünlülerin takip hareketlerini izleyen "dijital paparazzi" konsepti. Akılda kalıcı, eğlenceli ve uygulamanın amacını net yansıtıyor. | followrazzi.com ✓ |
| **2** | **Orbiter** | "Orbit" (yörünge) kavramından. Kullanıcılar, izledikleri hesapların "yörüngesinde" kalıyor. Uzay teması ile modern ve minimal bir his. | orbiter.app ✓ |
| **3** | **Tracely** | "Trace" (iz) + "-ly" eki. İzleme/takip konseptini zarif bir şekilde ifade ediyor. Uluslararası pazarda telaffuzu kolay. | tracely.io ✓ |

### 💬 Slogan Önerileri

| İsim | Slogan (TR) | Slogan (EN - Global) |
|------|-------------|---------------------|
| **Followrazzi** | *"Kim kimi takip etti? İlk sen öğren."* | *"Know who they follow, before everyone else."* |
| **Orbiter** | *"Yörüngendeki her hareket, avucunun içinde."* | *"Every move in your orbit."* |
| **Tracely** | *"Takip dünyasının nabzı burada."* | *"The pulse of the follow game."* |

### 🎨 Marka Renk Paleti Önerisi (Followrazzi için)

```
Primary:     #6366F1 (Indigo - Güven & Premium)
Secondary:   #F59E0B (Amber - Dikkat & Bildirim)
Accent:      #10B981 (Emerald - Takip/Pozitif)
Danger:      #EF4444 (Red - Takipten Çıkma)
Background:  #0F172A (Slate 900 - Dark Mode Ana)
Surface:     #1E293B (Slate 800 - Card Background)
```

---

## 2. Temel Özellikler

### 🎯 MVP (Minimum Viable Product) - Faz 1

#### 2.1 Hesap İzleme (Watchlist)

| Özellik | Açıklama | Öncelik |
|---------|----------|---------|
| **Hesap Ekleme** | Kullanıcı, izlemek istediği hesapları kullanıcı adı ile ekleyebilir | P0 |
| **Platform Desteği** | İlk aşamada sadece X/Twitter desteği (API erişilebilirliği nedeniyle) | P0 |
| **Watchlist Limiti** | Free: 5 hesap, Premium: 50 hesap, Enterprise: Sınırsız | P0 |
| **Hesap Doğrulama** | Eklenen hesabın var olup olmadığının kontrolü | P0 |

#### 2.2 Bildirim Sistemi

```
┌─────────────────────────────────────────────────────────────┐
│                    BİLDİRİM MİMARİSİ                        │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│   [Veri Kaynağı]  →  [Event Queue]  →  [Notification       │
│   (API/Scraper)      (Redis/Kafka)      Service]           │
│                                              │              │
│                                              ▼              │
│                          ┌───────────────────────────┐      │
│                          │     DAĞITIM KANALLARI     │      │
│                          ├───────────────────────────┤      │
│                          │ • Push (FCM/APNs)         │      │
│                          │ • In-App Notification     │      │
│                          │ • Email Digest (Günlük)   │      │
│                          │ • Telegram Bot (Premium)  │      │
│                          │ • Webhook (Enterprise)    │      │
│                          └───────────────────────────┘      │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Bildirim Tipleri:**

| Tip | İkon | Örnek Mesaj |
|-----|------|-------------|
| **Yeni Takip** | 🟢 | "@elonmusk, @BilGates'i takip etmeye başladı" |
| **Takipten Çıkma** | 🔴 | "@kimkardashian, @kanyewest'i takipten çıktı" |
| **Toplu Hareket** | ⚡ | "@jeffbezos bugün 12 yeni hesap takip etti" |
| **Karşılıklı Takip** | 🤝 | "@tim_cook ve @satloganadella karşılıklı takipleşti" |

#### 2.3 Filtreleme Sistemi

```typescript
interface FilterOptions {
  // Hesap Kategorileri
  categories: {
    verified: boolean;          // Doğrulanmış hesaplar
    crypto: boolean;            // Kripto fenomenleri
    tech: boolean;              // Teknoloji liderleri
    celebrities: boolean;       // Ünlüler
    politicians: boolean;       // Politikacılar
    brands: boolean;            // Markalar/Şirketler
    sports: boolean;            // Sporcular
    media: boolean;             // Medya/Gazeteciler
  };
  
  // Takipçi Sayısı Filtresi
  followerCount: {
    min: number;                // Minimum takipçi
    max: number;                // Maximum takipçi
  };
  
  // Zaman Filtresi
  timeRange: 'realtime' | '1h' | '24h' | '7d' | '30d';
  
  // Bildirim Tercihleri
  notifications: {
    newFollow: boolean;
    unfollow: boolean;
    mutualFollow: boolean;
    bulkActivity: boolean;
  };
}
```

---

### 🚀 İleri Seviye Özellikler - Faz 2 & 3

#### 2.4 "Neden Takip Etti?" AI Analizi

Bu özellik, bir hesap yeni birini takip ettiğinde, takip edilen kişi hakkında **yapay zeka destekli bağlamsal özet** sunar.

**Sistem Mimarisi:**

```
┌──────────────────────────────────────────────────────────────────┐
│                     AI ANALİZ PİPELINE'I                         │
├──────────────────────────────────────────────────────────────────┤
│                                                                  │
│  [Yeni Takip Event]                                              │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────────┐                                             │
│  │ Veri Toplama    │ → Bio, Son tweetler, Ortak takipçiler      │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │ Bağlam Analizi  │ → Son haberler, etkinlikler, duyurular     │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                             │
│  │ LLM İşleme      │ → GPT-4 / Claude API                       │
│  │ (Prompt Eng.)   │                                             │
│  └────────┬────────┘                                             │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────────────────────────────────────────────┐     │
│  │                    ÖRNEK ÇIKTI                          │     │
│  │                                                         │     │
│  │  🔍 @elonmusk → @sama takip etti                       │     │
│  │                                                         │     │
│  │  "Sam Altman, OpenAI CEO'su. Elon Musk'ın eski        │     │
│  │   yatırımcı olduğu şirketin başında. Son dönemde      │     │
│  │   GPT-5 duyuruları ve Microsoft ortaklığı ile         │     │
│  │   gündemde. Bu takip, potansiyel bir iş birliği       │     │
│  │   veya AI sektöründeki rekabete yönelik bir           │     │
│  │   izleme stratejisi olabilir."                        │     │
│  │                                                         │     │
│  │  📊 Güven Skoru: %72                                   │     │
│  │  🏷️ Etiketler: #AI #Tech #Business                    │     │
│  └─────────────────────────────────────────────────────────┘     │
│                                                                  │
└──────────────────────────────────────────────────────────────────┘
```

**AI Analiz Prompt Template:**

```python
ANALYSIS_PROMPT = """
Aşağıdaki bilgilere dayanarak, {follower} hesabının {followed} hesabını 
neden takip etmiş olabileceğine dair kısa (max 3 cümle) bir analiz yap.

TAKIP EDEN: {follower}
- Bio: {follower_bio}
- Sektör: {follower_industry}
- Son aktiviteler: {follower_recent_activity}

TAKIP EDİLEN: {followed}
- Bio: {followed_bio}
- Sektör: {followed_industry}
- Son haberler: {followed_news}

ORTAK BAĞLANTI: {mutual_connections} ortak takipçi

Analizi Türkçe ve İngilizce olarak ver. Spekülatif ol ama mantıklı kal.
Güven skoru (0-100) belirt.
"""
```

#### 2.5 Trend Analizi ve İstatistikler

| Metrik | Açıklama |
|--------|----------|
| **En Çok Takip Edilen** | Son 24 saatte en çok takip alan hesaplar |
| **En Çok Takipten Çıkılan** | "Unfollow dalgası" yaşayan hesaplar |
| **Sıcak Bağlantılar** | Birden fazla ünlünün aynı anda takip ettiği hesaplar |
| **Kategori Hareketleri** | "Bugün kripto fenomenleri X'i takip ediyor" tarzı içgörüler |
| **Takip Grafı** | İzlenen hesaplar arasındaki ilişki ağı görselleştirmesi |

#### 2.6 Platform Genişlemesi

| Platform | Faz | Teknik Zorluk | Notlar |
|----------|-----|---------------|--------|
| X/Twitter | MVP | ⭐⭐ | Enterprise API gerekli |
| Instagram | Faz 2 | ⭐⭐⭐⭐⭐ | Resmi API yok, scraping riskli |
| LinkedIn | Faz 2 | ⭐⭐⭐⭐ | Kısıtlı API, B2B odaklı |
| TikTok | Faz 3 | ⭐⭐⭐ | Yeni API programları mevcut |
| YouTube | Faz 3 | ⭐⭐ | Subscription verileri erişilebilir |

---

## 3. Teknik Altyapı ve Zorluklar

### ⚠️ KRİTİK: API Limitleri ve Çözüm Stratejileri

#### 3.1 X/Twitter API Durumu (2024)

| Tier | Fiyat/Ay | Rate Limit | Erişim | Yeterliliği |
|------|----------|------------|--------|-------------|
| **Free** | $0 | 1,500 tweet/ay | Sadece yazma | ❌ Yetersiz |
| **Basic** | $100 | 10K tweet/ay, 3 app | Okuma limitli | ❌ Yetersiz |
| **Pro** | $5,000 | 1M tweet/ay | Full okuma | ⚠️ Sınırlı |
| **Enterprise** | $42,000+ | Custom | Full access | ✅ Uygun |

**Takip Listesi API Endpoint'leri:**

```
GET /2/users/:id/following      → Rate: 15 req/15min (user auth)
GET /2/users/:id/followers      → Rate: 15 req/15min (user auth)
```

#### 3.2 Hibrit Veri Toplama Mimarisi

```
┌────────────────────────────────────────────────────────────────────────┐
│                    HİBRİT VERİ TOPLAMA SİSTEMİ                         │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KATMAN 1: RESMİ API                          │   │
│  │                                                                 │   │
│  │  • X/Twitter Enterprise API ($42K+/ay)                         │   │
│  │  • LinkedIn Marketing API (Onay gerekli)                       │   │
│  │  • Webhook subscriptions (gerçek zamanlı)                      │   │
│  │                                                                 │   │
│  │  ✅ Avantaj: Legal, güvenilir, stabil                          │   │
│  │  ❌ Dezavantaj: Çok pahalı, onay süreci uzun                   │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KATMAN 2: 3. PARTİ SERVİSLER                 │   │
│  │                                                                 │   │
│  │  Önerilen Servisler:                                           │   │
│  │  ┌─────────────────┬─────────────────┬────────────────────┐    │   │
│  │  │ Servis          │ Fiyat/ay        │ Özellik            │    │   │
│  │  ├─────────────────┼─────────────────┼────────────────────┤    │   │
│  │  │ RapidAPI        │ $500-2000       │ Çeşitli endpoint   │    │   │
│  │  │ SocialData.tools│ $200-1000       │ Twitter focused    │    │   │
│  │  │ Apify           │ $49-499         │ Scraping platform  │    │   │
│  │  │ Bright Data     │ Custom          │ Proxy + scraping   │    │   │
│  │  └─────────────────┴─────────────────┴────────────────────┘    │   │
│  │                                                                 │   │
│  │  ✅ Avantaj: Maliyet-etkin, hızlı başlangıç                    │   │
│  │  ❌ Dezavantaj: TOS riski, kararsız                            │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                              │                                         │
│                              ▼                                         │
│  ┌─────────────────────────────────────────────────────────────────┐   │
│  │                    KATMAN 3: AKILLI SCRAPING                    │   │
│  │                                                                 │   │
│  │  Teknik Yaklaşım:                                              │   │
│  │                                                                 │   │
│  │  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐         │   │
│  │  │ Residential │ →  │ Headless    │ →  │ Anti-Bot    │         │   │
│  │  │ Proxy Pool  │    │ Browsers    │    │ Bypass      │         │   │
│  │  │ (Rotation)  │    │ (Playwright)│    │ (Captcha)   │         │   │
│  │  └─────────────┘    └─────────────┘    └─────────────┘         │   │
│  │                                                                 │   │
│  │  Rate Limiting Stratejisi:                                     │   │
│  │  • IP başına: Max 100 req/saat                                 │   │
│  │  • Random delay: 2-8 saniye arası                              │   │
│  │  • User-agent rotation                                         │   │
│  │  • Session cookie management                                   │   │
│  │                                                                 │   │
│  │  ⚠️ DİKKAT: Legal riskler mevcut, TOS ihlali sayılabilir      │   │
│  └─────────────────────────────────────────────────────────────────┘   │
│                                                                        │
└────────────────────────────────────────────────────────────────────────┘
```

#### 3.3 Önerilen Strateji: Fazlı Yaklaşım

```
📅 FAZ 1 (MVP - İlk 6 ay):
├── 3. parti servisler (RapidAPI, SocialData)
├── Düşük maliyet ($500-1000/ay)
├── Sadece X/Twitter
└── Max 10,000 izlenen hesap

📅 FAZ 2 (Büyüme - 6-18 ay):
├── X/Twitter Pro API'ye geçiş ($5,000/ay)
├── Hibrit: API + 3. parti
├── Instagram için Apify
└── Max 50,000 izlenen hesap

📅 FAZ 3 (Ölçekleme - 18+ ay):
├── X/Twitter Enterprise API
├── Tüm platformlar
├── Özel scraping altyapısı
└── Sınırsız ölçekleme
```

---

### 🗄️ Veritabanı Mimarisi

#### 3.4 Veritabanı Seçimi: Polyglot Persistence

| Veri Tipi | Veritabanı | Seçim Sebebi |
|-----------|------------|--------------|
| **Kullanıcı Verileri** | PostgreSQL | ACID, ilişkisel sorgular, auth |
| **Takip Grafı** | Neo4j / Dgraph | Graf sorguları, ilişki analizi |
| **Event Stream** | Apache Kafka | Yüksek throughput, event sourcing |
| **Cache & Sessions** | Redis | Düşük latency, pub/sub |
| **Zaman Serisi** | TimescaleDB | Takip geçmişi, trend analizi |
| **Arama** | Elasticsearch | Full-text search, analytics |

#### 3.5 Veritabanı Şeması

```sql
-- PostgreSQL: Kullanıcı ve Temel Veriler

-- Uygulama Kullanıcıları
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    subscription_tier VARCHAR(50) DEFAULT 'free',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- İzlenen Sosyal Medya Hesapları
CREATE TABLE watched_accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL, -- 'twitter', 'instagram', 'linkedin'
    platform_user_id VARCHAR(255) NOT NULL,
    username VARCHAR(255) NOT NULL,
    display_name VARCHAR(255),
    profile_image_url TEXT,
    follower_count BIGINT,
    following_count BIGINT,
    is_verified BOOLEAN DEFAULT FALSE,
    category VARCHAR(100), -- 'crypto', 'tech', 'celebrity', etc.
    last_checked_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(platform, platform_user_id)
);

-- Kullanıcı Watchlist'i
CREATE TABLE user_watchlist (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    watched_account_id UUID REFERENCES watched_accounts(id) ON DELETE CASCADE,
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    
    UNIQUE(user_id, watched_account_id)
);

-- Takip Olayları (Event Sourcing)
CREATE TABLE follow_events (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_account_id UUID REFERENCES watched_accounts(id),
    target_account_id UUID REFERENCES watched_accounts(id),
    event_type VARCHAR(20) NOT NULL, -- 'follow', 'unfollow'
    detected_at TIMESTAMP NOT NULL,
    platform VARCHAR(50) NOT NULL,
    metadata JSONB DEFAULT '{}',
    ai_analysis TEXT,
    ai_confidence_score DECIMAL(5,2),
    
    INDEX idx_follow_events_actor (actor_account_id, detected_at DESC),
    INDEX idx_follow_events_detected (detected_at DESC)
);
```

```cypher
// Neo4j: Graf Veritabanı Şeması

// Hesap Node'ları
CREATE (a:Account {
    platform_user_id: "123456",
    username: "elonmusk",
    platform: "twitter",
    follower_count: 150000000,
    category: "tech"
})

// Takip İlişkileri
CREATE (a:Account)-[:FOLLOWS {
    since: datetime(),
    detected_at: datetime()
}]->(b:Account)

// Örnek Sorgular:

// 1. Elon Musk'ın son 24 saatte takip ettikleri
MATCH (elon:Account {username: "elonmusk"})-[f:FOLLOWS]->(target:Account)
WHERE f.detected_at > datetime() - duration('P1D')
RETURN target.username, f.detected_at
ORDER BY f.detected_at DESC

// 2. Ortak takip edilen hesaplar (A ve B'nin ikisinin de takip ettiği)
MATCH (a:Account {username: "elonmusk"})-[:FOLLOWS]->(common:Account)<-[:FOLLOWS]-(b:Account {username: "jeffbezos"})
RETURN common.username, common.category

// 3. İkinci derece bağlantılar
MATCH (start:Account {username: "user1"})-[:FOLLOWS*2]->(end:Account)
WHERE NOT (start)-[:FOLLOWS]->(end)
RETURN DISTINCT end.username
LIMIT 10
```

---

### 🛠️ Tech Stack

#### 3.6 Backend

```yaml
Backend Stack:
  Runtime: Node.js 20 LTS (veya Bun 1.0 performans için)
  Framework: NestJS (Enterprise-grade, TypeScript native)
  
  API:
    - REST API (Ana endpoints)
    - GraphQL (Karmaşık sorgular, mobil için)
    - WebSocket (Gerçek zamanlı bildirimler)
  
  Message Queue:
    - Apache Kafka (Event streaming)
    - Redis Pub/Sub (Lightweight notifications)
    - Bull (Job queue for background tasks)
  
  Caching:
    - Redis Cluster (Session, rate limiting, cache)
    - CDN: Cloudflare (Static assets, edge caching)
  
  Authentication:
    - JWT + Refresh Tokens
    - OAuth 2.0 (Google, Apple Sign-In)
    - Rate limiting per user tier
  
  Monitoring:
    - Prometheus + Grafana (Metrics)
    - Sentry (Error tracking)
    - OpenTelemetry (Distributed tracing)
    - PagerDuty (Alerting)
```

#### 3.7 Frontend (Web Dashboard)

```yaml
Web Dashboard Stack:
  Framework: Next.js 14 (App Router)
  Language: TypeScript 5.x
  
  UI:
    - Tailwind CSS 3.x
    - shadcn/ui (Component library)
    - Framer Motion (Animations)
    - Recharts / D3.js (Data visualization)
  
  State Management:
    - TanStack Query (Server state)
    - Zustand (Client state)
  
  Real-time:
    - Socket.io Client
    - Server-Sent Events (SSE fallback)
```

#### 3.8 Mobile

```yaml
Mobile Stack:
  Framework: React Native 0.73+ (veya Flutter 3.x alternatif)
  
  Seçim Gerekçesi - React Native:
    ✅ Web ekibi ile kod/bilgi paylaşımı
    ✅ Expo SDK ile hızlı geliştirme
    ✅ OTA updates (CodePush)
    ✅ Geniş ekosistem
  
  Alternatif - Flutter:
    ✅ Daha iyi performans
    ✅ Pixel-perfect UI kontrolü
    ✅ Tek codebase, gerçek native
    ❌ Ayrı ekip/bilgi gerektirir
  
  Kritik Kütüphaneler (React Native):
    - expo-notifications (Push)
    - react-native-reanimated (Animasyonlar)
    - @tanstack/react-query (Data fetching)
    - react-native-mmkv (Hızlı storage)
    - react-native-fast-image (Görsel cache)
  
  Push Notifications:
    - Firebase Cloud Messaging (FCM) - Android
    - Apple Push Notification Service (APNs) - iOS
    - OneSignal (Alternatif unified platform)
```

#### 3.9 Infrastructure

```yaml
Cloud Provider: AWS (veya GCP alternatif)

Infrastructure Components:
  Compute:
    - EKS (Kubernetes) - Ana backend servisleri
    - Lambda - Serverless functions (AI analysis, webhooks)
    - EC2 Spot Instances - Scraping workers
  
  Database:
    - RDS PostgreSQL (Multi-AZ)
    - Amazon Neptune (Graf DB alternatifi)
    - ElastiCache Redis Cluster
    - Amazon MSK (Managed Kafka)
  
  Storage:
    - S3 (Profile images, exports)
    - CloudFront CDN
  
  Networking:
    - VPC with private subnets
    - NAT Gateway (Scraper outbound)
    - WAF (DDoS protection)
    - Route 53 (DNS)
  
  CI/CD:
    - GitHub Actions
    - ArgoCD (GitOps)
    - Terraform (IaC)

Tahmini Aylık Maliyet (10K aktif kullanıcı):
  ├── AWS Infrastructure: $2,000-4,000
  ├── 3. Parti API'ler: $1,000-2,000
  ├── AI/LLM API (OpenAI): $500-1,000
  └── TOPLAM: $3,500-7,000/ay
```

---

### 🏗️ Sistem Mimarisi Diyagramı

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           FOLLOWRAZZI SİSTEM MİMARİSİ                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                             │
│  │   iOS App   │  │ Android App │  │ Web Dashboard│                             │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘                             │
│         │                │                │                                     │
│         └────────────────┼────────────────┘                                     │
│                          │                                                      │
│                          ▼                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         CLOUDFLARE (CDN + WAF)                            │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                      │
│                          ▼                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         API GATEWAY (Kong/AWS)                            │  │
│  │                    Rate Limiting • Auth • Load Balancing                  │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                      │
│         ┌────────────────┼────────────────┬───────────────────┐                 │
│         │                │                │                   │                 │
│         ▼                ▼                ▼                   ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │    User     │  │  Watchlist  │  │Notification │  │    Analytics        │    │
│  │   Service   │  │   Service   │  │   Service   │  │     Service         │    │
│  │  (NestJS)   │  │  (NestJS)   │  │  (NestJS)   │  │    (NestJS)         │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └─────────┬───────────┘    │
│         │                │                │                   │                 │
│         └────────────────┴────────────────┴───────────────────┘                 │
│                          │                                                      │
│                          ▼                                                      │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                         MESSAGE BROKER (Kafka)                            │  │
│  │              follow-events • notifications • analytics-events             │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│         │                │                │                   │                 │
│         ▼                ▼                ▼                   ▼                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐    │
│  │ PostgreSQL  │  │   Neo4j     │  │    Redis    │  │   Elasticsearch     │    │
│  │  (Users,    │  │  (Social    │  │  (Cache,    │  │    (Search,         │    │
│  │   Config)   │  │   Graph)    │  │   Pub/Sub)  │  │    Analytics)       │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────────────┘    │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                           VERİ TOPLAMA KATMANI                                  │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                      DATA COLLECTOR SERVICE                               │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │  │
│  │  │   Twitter   │  │  Instagram  │  │  LinkedIn   │  │    TikTok   │      │  │
│  │  │  Collector  │  │  Collector  │  │  Collector  │  │  Collector  │      │  │
│  │  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘      │  │
│  │         │                │                │                │              │  │
│  │         ▼                ▼                ▼                ▼              │  │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │  │
│  │  │                      PROXY MANAGER                                  │ │  │
│  │  │        IP Rotation • Rate Limiting • Anti-Detection                 │ │  │
│  │  └─────────────────────────────────────────────────────────────────────┘ │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                          │                                                      │
│         ┌────────────────┴────────────────────────────┐                         │
│         ▼                                             ▼                         │
│  ┌─────────────────────┐                    ┌─────────────────────┐             │
│  │   Official APIs     │                    │   3rd Party APIs     │             │
│  │  (Twitter, LinkedIn)│                    │  (RapidAPI, etc.)    │             │
│  └─────────────────────┘                    └─────────────────────┘             │
│                                                                                 │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                              AI KATMANI                                         │
│  ═══════════════════════════════════════════════════════════════════════════   │
│                                                                                 │
│  ┌───────────────────────────────────────────────────────────────────────────┐  │
│  │                        AI ANALYSIS SERVICE                                │  │
│  │                                                                           │  │
│  │   [Follow Event] → [Context Gatherer] → [LLM Processor] → [Result]       │  │
│  │                           │                   │                           │  │
│  │                           ▼                   ▼                           │  │
│  │                    ┌─────────────┐     ┌─────────────┐                    │  │
│  │                    │  News API   │     │  OpenAI /   │                    │  │
│  │                    │  (Context)  │     │   Claude    │                    │  │
│  │                    └─────────────┘     └─────────────┘                    │  │
│  └───────────────────────────────────────────────────────────────────────────┘  │
│                                                                                 │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 4. Kullanıcı Deneyimi (UX/UI)

### 🎨 Tasarım Felsefesi

#### 4.1 Genel Hava: "Premium Intelligence Dashboard"

```
Konsept Karışımı:
├── 40% Bloomberg Terminal (veri yoğunluğu, profesyonellik)
├── 30% Notion (temizlik, okunabilirlik)
├── 20% Instagram (tanıdık sosyal medya elementleri)
└── 10% Superhuman (hız hissi, klavye kısayolları)

❌ KAÇINILACAKLAR:
   • Magazin uygulaması cıvıklığı
   • Aşırı renk ve animasyon
   • Clickbait tarzı bildirimler
   
✅ HEDEFLENİLECEKLER:
   • Veri odaklı, minimal tasarım
   • Dark mode öncelikli (7/24 izleme için göz yormuyor)
   • Hızlı tarama için grid düzeni
   • Profesyonel ama sıkıcı olmayan
```

#### 4.2 Renk Sistemi

```css
/* Dark Mode (Ana Tema) */
:root {
  /* Background Layers */
  --bg-primary: #0A0A0F;      /* Ana arka plan */
  --bg-secondary: #12121A;     /* Card arka planı */
  --bg-tertiary: #1A1A25;      /* Hover states */
  
  /* Text */
  --text-primary: #FAFAFA;     /* Ana metin */
  --text-secondary: #A1A1AA;   /* İkincil metin */
  --text-muted: #52525B;       /* Disabled/hint */
  
  /* Accent Colors */
  --accent-follow: #22C55E;    /* Yeşil - Yeni takip */
  --accent-unfollow: #EF4444;  /* Kırmızı - Takipten çıkma */
  --accent-mutual: #8B5CF6;    /* Mor - Karşılıklı */
  --accent-highlight: #F59E0B; /* Amber - Önemli */
  --accent-info: #3B82F6;      /* Mavi - Bilgi */
  
  /* Platform Colors */
  --twitter: #1DA1F2;
  --instagram: #E4405F;
  --linkedin: #0A66C2;
  --tiktok: #000000;
  
  /* Borders & Dividers */
  --border-subtle: #27272A;
  --border-default: #3F3F46;
}
```

---

### 📱 Ana Ekran Düzeni

#### 4.3 Mobile App - Ana Sayfa (Home Feed)

```
┌─────────────────────────────────────────┐
│ ░░░░░░░░░░░ STATUS BAR ░░░░░░░░░░░░░░░░│
├─────────────────────────────────────────┤
│                                         │
│  Followrazzi              🔔  ⚙️  👤    │
│  ─────────────────────────────────────  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 🔥 CANLI   │  📊 Trend  │  🔍 Ara   ││
│  └─────────────────────────────────────┘│
│                                         │
│  Bugün 47 hareket tespit edildi         │
│  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 🟢 2 dk önce                        ││
│  │ ┌─────┐                             ││
│  │ │ 🖼️  │  @elonmusk                  ││
│  │ │     │  @OpenAI'ı takip etti       ││
│  │ └─────┘                             ││
│  │                                     ││
│  │ 🤖 AI: "OpenAI'ın GPT-5 duyurusu   ││
│  │     sonrası stratejik bir hamle     ││
│  │     olabilir..."  [Devamını gör]    ││
│  │                                     ││
│  │ ❤️ 234   💬 45   🔗 Paylaş          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ 🔴 15 dk önce                       ││
│  │ ┌─────┐                             ││
│  │ │ 🖼️  │  @kimkardashian             ││
│  │ │     │  @kanyewest'i takipten      ││
│  │ └─────┘  çıktı                      ││
│  │                                     ││
│  │ 🏷️ #Celebrity #Drama                ││
│  │                                     ││
│  │ ❤️ 1.2K  💬 892  🔗 Paylaş          ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ⚡ TOPLU AKTİVİTE                   ││
│  │                                     ││
│  │ @a]6vc (Andreessen Horowitz)        ││
│  │ bugün 8 kripto projesini takip etti ││
│  │                                     ││
│  │ [Tümünü Gör →]                      ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─  │
│                                         │
├─────────────────────────────────────────┤
│  🏠      📋      ➕      📈      👤     │
│  Ana   Watchlist  Ekle  Analiz  Profil  │
└─────────────────────────────────────────┘
```

#### 4.4 Watchlist Ekranı

```
┌─────────────────────────────────────────┐
│  ← Watchlist                    🔍 ⚙️   │
├─────────────────────────────────────────┤
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ Kategoriler          [Tümü ▾]       ││
│  │ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐    ││
│  │ │ All │ │Crypto│ │ Tech │ │Celeb│    ││
│  │ │ 24  │ │  8   │ │  10  │ │  6  │    ││
│  │ └─────┘ └─────┘ └─────┘ └─────┘    ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │ ┌────┐  @elonmusk          ✓  🔔   ││
│  │ │ 🖼️ │  Elon Musk                   ││
│  │ └────┘  💙 Twitter • 180M           ││
│  │         Son: 2 saat önce (3 takip)  ││
│  │─────────────────────────────────────││
│  │ ┌────┐  @VitalikButerin    ✓  🔔   ││
│  │ │ 🖼️ │  Vitalik Buterin             ││
│  │ └────┘  💙 Twitter • 5.2M           ││
│  │         Son: 5 saat önce (1 takip)  ││
│  │─────────────────────────────────────││
│  │ ┌────┐  @BillGates         ✓  🔔   ││
│  │ │ 🖼️ │  Bill Gates                  ││
│  │ └────┘  💙 Twitter • 63M            ││
│  │         Son: 1 gün önce             ││
│  │─────────────────────────────────────││
│  │ ┌────┐  @tim_cook          ✓  🔔   ││
│  │ │ 🖼️ │  Tim Cook                    ││
│  │ └────┘  💙 Twitter • 14M            ││
│  │         Son: 3 gün önce             ││
│  └─────────────────────────────────────┘│
│                                         │
│  ┌─────────────────────────────────────┐│
│  │      ➕ Yeni Hesap Ekle              ││
│  │      5/5 slot kullanıldı             ││
│  │      [Premium'a Geç - 50 hesap]      ││
│  └─────────────────────────────────────┘│
│                                         │
├─────────────────────────────────────────┤
│  🏠      📋      ➕      📈      👤     │
└─────────────────────────────────────────┘
```

#### 4.5 Hesap Detay Sayfası

```
┌─────────────────────────────────────────┐
│  ←                              ⋮       │
├─────────────────────────────────────────┤
│                                         │
│            ┌──────────┐                 │
│            │          │                 │
│            │   🖼️     │                 │
│            │          │                 │
│            └──────────┘                 │
│                                         │
│          @elonmusk  ✓                   │
│          Elon Musk                      │
│          💙 Twitter                     │
│                                         │
│   ┌───────────┬───────────┬──────────┐  │
│   │  180.2M   │   850     │   2.1K   │  │
│   │ Takipçi   │  Takip    │  Değişim │  │
│   │           │           │  (30 gün)│  │
│   └───────────┴───────────┴──────────┘  │
│                                         │
│  [🔔 Bildirimler: AÇIK]  [📊 Analiz]    │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📅 Son 7 Günlük Aktivite               │
│                                         │
│  ┌─────────────────────────────────────┐│
│  │  Pts  Sal  Çar  Per  Cum  Cts  Paz  ││
│  │   █    █    ▄    █    ▄         ▂   ││
│  │   3    2    1    4    1    0    1   ││
│  └─────────────────────────────────────┘│
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  🕐 Son Hareketler                      │
│                                         │
│  🟢 2 saat önce                         │
│  → @OpenAI takip etti                   │
│                                         │
│  🟢 2 saat önce                         │
│  → @sama takip etti                     │
│                                         │
│  🔴 1 gün önce                          │
│  ← @nytimes takipten çıktı              │
│                                         │
│  [Tüm Geçmişi Gör →]                    │
│                                         │
├─────────────────────────────────────────┤
│  🏠      📋      ➕      📈      👤     │
└─────────────────────────────────────────┘
```

---

### 🔔 Bildirim Tasarımı

#### 4.6 Push Notification Formatları

```
┌─────────────────────────────────────────┐
│ FOLLOWRAZZI                        now  │
│                                         │
│ 🟢 @elonmusk → @OpenAI                  │
│ Elon Musk, OpenAI'ı takip etmeye        │
│ başladı                                 │
│                                         │
│ [Detay]                [Kapat]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FOLLOWRAZZI                       2m    │
│                                         │
│ 🔴 Drama Alert!                         │
│ @kimkardashian, @kanyewest'i            │
│ takipten çıktı                          │
│                                         │
│ [AI Analizi]           [Kapat]          │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│ FOLLOWRAZZI                       1h    │
│                                         │
│ ⚡ Toplu Hareket Algılandı               │
│ @a16z bugün 12 kripto projesini         │
│ takip etti. Yeni yatırım sinyali?       │
│                                         │
│ [Listeyi Gör]          [Kapat]          │
└─────────────────────────────────────────┘
```

---

## 5. Gelir Modeli (Monetization)

### 💰 Freemium Katmanlı Abonelik Modeli

#### 5.1 Fiyatlandırma Tablosu

| Özellik | 🆓 Free | ⭐ Pro | 💎 Elite | 🏢 Enterprise |
|---------|---------|--------|----------|---------------|
| **Fiyat (Aylık)** | $0 | $9.99 | $29.99 | Custom |
| **Fiyat (Yıllık)** | $0 | $79.99 (%33↓) | $239.99 (%33↓) | Custom |
| **Watchlist Limiti** | 5 hesap | 50 hesap | 200 hesap | Sınırsız |
| **Platform** | Sadece Twitter | Twitter + Instagram | Tüm platformlar | Tüm + Özel |
| **Bildirim Gecikmesi** | 1 saat | Anlık | Anlık + Öncelikli | Anlık |
| **AI Analizi** | ❌ | ✅ Günde 10 | ✅ Sınırsız | ✅ Özelleştirilmiş |
| **Geçmiş Veri** | Son 24 saat | Son 30 gün | Son 1 yıl | Tüm geçmiş |
| **Dışa Aktarma** | ❌ | CSV | CSV + API | Full API Access |
| **Kategori Filtreleri** | Temel | Gelişmiş | Özel kategoriler | Özel + ML |
| **Email Digest** | Haftalık | Günlük | Saatlik opsiyon | Custom |
| **Destek** | Community | Email | Öncelikli | Dedicated |

#### 5.2 Gelir Projeksiyonu (İlk 2 Yıl)

```
📊 VARSAYIMLAR:
├── Toplam İndirme: 100,000 (Y1), 500,000 (Y2)
├── Free → Pro Dönüşüm: %3
├── Pro → Elite Dönüşüm: %0.5
├── Churn Rate: %5/ay
└── Enterprise Müşteri: 10 (Y1), 50 (Y2)

💵 YIL 1 GELİR TAHMİNİ:
├── Pro Aboneler: 3,000 × $9.99 × 12 = $359,640
├── Elite Aboneler: 500 × $29.99 × 12 = $179,940
├── Enterprise: 10 × $500 × 12 = $60,000
├── Reklam (Free tier): $20,000
└── TOPLAM Y1: ~$620,000

💵 YIL 2 GELİR TAHMİNİ:
├── Pro Aboneler: 15,000 × $9.99 × 12 = $1,798,200
├── Elite Aboneler: 2,500 × $29.99 × 12 = $899,700
├── Enterprise: 50 × $750 × 12 = $450,000
├── Reklam (Free tier): $100,000
├── Data Licensing: $200,000
└── TOPLAM Y2: ~$3,450,000
```

#### 5.3 Ek Gelir Kanalları

| Kanal | Açıklama | Potansiyel |
|-------|----------|------------|
| **Veri Lisanslama** | Anonim, toplu trend verileri hedge fonlarına/araştırmacılara satışı | $$$$ |
| **API Erişimi** | Geliştiriciler için ücretli API | $$$ |
| **White Label** | Ajanslar ve büyük şirketler için özelleştirilmiş çözüm | $$$ |
| **Affiliate Marketing** | Premium analiz araçlarına yönlendirme (Social Blade, Hootsuite) | $$ |
| **Sponsored Alerts** | Markalar, belirli hesapların takibini "sponsor" edebilir | $$ |
| **NFT/Web3 Entegrasyonu** | Özel rozetler, early access token'ları | $ |

#### 5.4 Müşteri Segmentasyonu

```
🎯 HEDEF KİTLE DAĞILIMI:

┌────────────────────────────────────────────────────────────┐
│                                                            │
│   CRYPTO/FINANS ████████████████████░░░░░░░░░░░░░░  40%   │
│   Trader'lar, yatırımcılar, VC'ler                        │
│   Pain Point: Yatırım sinyallerini kaçırmak               │
│                                                            │
│   GAZETECİ/MEDYA ████████████░░░░░░░░░░░░░░░░░░░░░  25%   │
│   Haber ajansları, sosyal medya editörleri                │
│   Pain Point: Haber kaçırmak, yavaş kalmak                │
│                                                            │
│   MARKA/AJANS ████████░░░░░░░░░░░░░░░░░░░░░░░░░░░░  20%   │
│   Sosyal medya yöneticileri, PR ajansları                 │
│   Pain Point: Rakip ve influencer takibi                  │
│                                                            │
│   BİREYSEL █████░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░  15%   │
│   Fan'lar, meraklılar, sosyal medya tutkunları            │
│   Pain Point: İdollerin aktivitelerini kaçırmak           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

---

## 6. Roadmap ve Önceliklendirme

### 📅 Geliştirme Takvimi

```
═══════════════════════════════════════════════════════════════════════════════
                              FOLLOWRAZZI ROADMAP
═══════════════════════════════════════════════════════════════════════════════

2025 Q1 (Ocak-Mart)                                              [MVP LAUNCH]
├── Hafta 1-4: Teknik Altyapı
│   ├── AWS infrastructure kurulumu
│   ├── PostgreSQL + Redis setup
│   ├── Twitter API entegrasyonu (3rd party)
│   └── Temel backend servisleri
│
├── Hafta 5-8: Core Features
│   ├── Kullanıcı auth sistemi
│   ├── Watchlist CRUD
│   ├── Follow event detection
│   └── Push notification sistemi
│
├── Hafta 9-12: Mobile App (React Native)
│   ├── Ana sayfa feed
│   ├── Watchlist yönetimi
│   ├── Hesap detay sayfası
│   └── Bildirim tercihleri
│
└── 🚀 MVP LAUNCH (Mart sonu)
    └── Hedef: 1,000 beta kullanıcı

───────────────────────────────────────────────────────────────────────────────

2025 Q2 (Nisan-Haziran)                                          [GROWTH PHASE]
├── Freemium model implementasyonu
├── Ödeme sistemi (Stripe/RevenueCat)
├── Email digest özelliği
├── Web dashboard (Next.js)
├── Basit trend analizi
├── Instagram desteği (beta)
└── 🎯 Hedef: 10,000 kullanıcı, $10K MRR

───────────────────────────────────────────────────────────────────────────────

2025 Q3 (Temmuz-Eylül)                                           [AI & ANALYTICS]
├── "Neden Takip Etti?" AI analizi
├── Graf veritabanı (Neo4j) entegrasyonu
├── İlişki ağı görselleştirmesi
├── Gelişmiş filtreleme
├── Kategori auto-tagging (ML)
├── LinkedIn desteği (beta)
└── 🎯 Hedef: 50,000 kullanıcı, $50K MRR

───────────────────────────────────────────────────────────────────────────────

2025 Q4 (Ekim-Aralık)                                            [ENTERPRISE]
├── Enterprise tier launch
├── API platformu
├── White-label çözümü
├── Veri lisanslama altyapısı
├── Özel kategori oluşturma
├── Takım özellikleri (çoklu kullanıcı)
└── 🎯 Hedef: 100,000 kullanıcı, $150K MRR

───────────────────────────────────────────────────────────────────────────────

2026 Q1-Q2                                                       [SCALE]
├── Twitter Enterprise API geçişi
├── TikTok desteği
├── Uluslararası genişleme (çoklu dil)
├── Mobile app v2.0 (yeniden tasarım)
├── Gerçek zamanlı alert özelleştirme
└── 🎯 Hedef: 500,000 kullanıcı, $500K MRR

═══════════════════════════════════════════════════════════════════════════════
```

### ✅ Önceliklendirme Matrisi (MVP için)

| Özellik | Etki | Efor | Öncelik |
|---------|------|------|---------|
| Twitter takip detection | 🔴 Kritik | Yüksek | P0 |
| Push bildirimler | 🔴 Kritik | Orta | P0 |
| Kullanıcı auth | 🔴 Kritik | Düşük | P0 |
| Watchlist yönetimi | 🔴 Kritik | Orta | P0 |
| Ana feed | 🟡 Yüksek | Orta | P1 |
| Hesap detay sayfası | 🟡 Yüksek | Düşük | P1 |
| Temel filtreler | 🟡 Yüksek | Düşük | P1 |
| Freemium model | 🟢 Orta | Orta | P2 |
| AI analizi | 🟢 Orta | Yüksek | P2 |
| Instagram desteği | 🟢 Orta | Çok Yüksek | P3 |
| Trend analizi | 🔵 Düşük | Orta | P3 |
| Web dashboard | 🔵 Düşük | Yüksek | P3 |

---

## 7. Risk Analizi ve Mitigasyon

### ⚠️ Kritik Riskler

| Risk | Olasılık | Etki | Mitigasyon Stratejisi |
|------|----------|------|----------------------|
| **API Erişim Kaybı** | Yüksek | Kritik | Çoklu veri kaynağı, scraping fallback, enterprise API geçiş planı |
| **Platform TOS İhlali** | Orta | Yüksek | Yasal danışmanlık, TOS değişiklik takibi, API öncelikli yaklaşım |
| **Ölçekleme Maliyetleri** | Orta | Yüksek | Cloud cost optimization, reserved instances, caching stratejileri |
| **Rekabet** | Orta | Orta | Hızlı iterasyon, niche focus (crypto/tech), AI diferansiyasyonu |
| **Kullanıcı Gizliliği Endişeleri** | Düşük | Orta | Şeffaf privacy policy, opt-out mekanizmaları, GDPR uyumu |
| **Fake/Bot Hesaplar** | Orta | Düşük | Bot detection, verified account önceliği |

---

## 8. Sonuç ve Öneriler

### 🎯 Kritik Başarı Faktörleri

1. **Veri Güvenilirliği:** Anlık ve doğru takip verisi, uygulamanın temel değer önerisi
2. **Hız:** İlk bildirim avantajı (dakikalar içinde, saatler değil)
3. **AI Farklılaştırması:** "Neden takip etti?" analizi ile rakiplerden ayrışma
4. **Niş Odağı:** İlk aşamada crypto/tech/finans segmentine konsantrasyon
5. **Premium UX:** Profesyonel, veri odaklı, göz yormayan tasarım

### 💡 Önerilen Başlangıç Stratejisi

```
1. İlk 3 ayda sadece Twitter + 3rd party API ile başla
2. Crypto influencer'larına odaklan (yüksek talep, ödeme gücü)
3. Product Hunt ve Twitter'da viral launch planla
4. Beta kullanıcılardan yoğun feedback al
5. 1000 ödeme yapan kullanıcıya ulaşınca Enterprise API'ye geç
```

---

**Doküman Sonu**

*Bu doküman, Followrazzi projesinin teknik ve ürün gereksinimlerini içermektedir. Sorularınız için iletişime geçebilirsiniz.*

