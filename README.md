# NovaChat - Multi-Tenant AI Assistant SaaS
NovaChat is a production-ready, full-stack B2B SaaS platform that enables businesses to instantly generate, embed, and manage custom AI chatbots trained strictly on their own knowledge base and website data.
Built with a modern architecture, it features full multi-tenancy, automated Stripe billing, Role-Based Access Control (Admin vs Tenant), and an advanced RAG (Retrieval-Augmented Generation) pipeline.
## 🚀 Key Features
- **Multi-Tenant Architecture**: Strict data isolation using PostgreSQL and Prisma. Thousands of businesses can use the app without data overlap.
- **Advanced RAG Pipeline**: Powered by Pinecone Vector DB for semantic searching and Mistral AI for lightning-fast, highly accurate conversational responses.
- **Automated Billing**: Full Stripe integration (Checkout, Customer Portal, and Webhooks) to manage Free Trials, Pro Subscriptions, and access revocation upon expiration.
- **Embeddable Widget**: A lightweight, isolated `<script>` tag that tenants can inject into any HTML website to display their custom floating chatbot.
- **Live Inbox & Analytics**: Tenants can view real-time transcripts of conversations happening on their widget and track key metrics.
- **Super Admin Dashboard**: A bird's-eye view for the platform owner to monitor total revenue, active tenants, and system-wide message volume.
## 🛠️ Technology Stack
- **Framework**: [Next.js 15](https://nextjs.org/) (App Router)
- **Styling**: Vanilla CSS Modules (Glassmorphism & Modern UI), `lucide-react`, `recharts`
- **Database**: [PostgreSQL](https://www.postgresql.org/) (hosted on Supabase)
- **ORM**: [Prisma](https://www.prisma.io/)
- **Authentication**: [NextAuth.js](https://next-auth.js.org/)
- **Payments**: [Stripe](https://stripe.com/)
- **Vector Database**: [Pinecone](https://www.pinecone.io/)
- **LLM / AI**: [Mistral AI](https://mistral.ai/) (Generation) & [OpenAI](https://openai.com/) (Embeddings)
## 💻 Running Locally
### 1. Clone the repository

git clone https://github.com/yourusername/Multi-Tenant-AI-Assistant.git
cd Multi-Tenant-AI-Assistant
2. Install dependencies
bash


npm install
3. Set up Environment Variables
Create a .env file in the root directory and add the following keys:

env


DATABASE_URL="postgresql://postgres:password@localhost:5432/mydb"
OPENAI_API_KEY="sk-..."
MISTRAL_API_KEY="..."
PINECONE_API_KEY="..."
PINECONE_INDEX_NAME="chatbot-factory"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_PRICE_ID="price_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
4. Setup Database
bash


npx prisma generate
npx prisma db push
5. Start the development server
bash


npm run dev
Your app should now be running on http://localhost:3000.

🚀 Deployment (Vercel)
Push your code to GitHub.
Import the project into Vercel.
Ensure all Environment Variables from .env are copied into Vercel's settings.
Add one additional Environment Variable in Vercel: NEXT_PUBLIC_APP_URL set to your live Vercel domain (e.g., https://my-app.vercel.app).
Ensure the Vercel Build Command is set to prisma generate && next build (This is already configured in package.json).
Deploy!
🔐 Role Access
Admin: Any user that logs in with an email ending in @admin.com (e.g., test@admin.com) automatically gains Super Admin privileges and gets redirected to /admin.
Tenant: Any other email creates a standard Business Tenant account and goes to /dashboard.
