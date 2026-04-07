# Lead Engine v4 — GitHub Pages Deployment Guide
# ═══════════════════════════════════════════════════

## Repository Structure

```
your-repo/
├── index.html          ← lead_engine_v4.html এর নাম বদলে এটি
├── apps_script.gs      ← Reference only (Sheet-এ paste করতে হবে)
├── .github/
│   └── workflows/
│       └── deploy.yml  ← নিচের কোড copy করুন
└── README.md
```

---

## Step 1: GitHub Repository তৈরি

1. GitHub-এ নতুন **private** repository তৈরি করুন
2. `lead_engine_v4.html` ফাইলটি `index.html` নামে upload করুন
3. Settings → Pages → Source: **Deploy from a branch** → Branch: **main** → `/root`
4. Save করুন — কিছুক্ষণ পর `https://yourusername.github.io/repo-name` এ accessible হবে

---

## Step 2: GitHub Actions Auto-Deploy (Optional)

`.github/workflows/deploy.yml` ফাইল তৈরি করুন:

```yaml
name: Deploy Lead Engine

on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: '.'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

---

## Step 3: Google Apps Script Setup

1. **Google Sheet খুলুন** (যেকোনো নামে)
2. **Extensions → Apps Script** এ যান
3. `apps_script.gs` এর সম্পূর্ণ কোড paste করুন
4. **Deploy → New Deployment**
   - Type: **Web App**
   - Execute as: **Me**
   - Who has access: **Anyone**
5. **Deploy** করুন → URL কপি করুন (এরকম দেখাবে):
   `https://script.google.com/macros/s/AKfycb.../exec`

---

## Step 4: App Configure করুন

1. `https://yourusername.github.io/repo-name` খুলুন
2. Setup screen এ Apps Script URL paste করুন
3. **Connect & Start** চাপুন
4. Done! ✓

---

## Update করতে চাইলে

```bash
# Local থেকে push করলে auto-deploy হবে
git add index.html
git commit -m "feat: update lead engine"
git push origin main
```

অথবা GitHub UI থেকে সরাসরি ফাইল edit করুন।

---

## Security Notes

- Repository **private** রাখুন (GitHub Pages private repo-তেও কাজ করে Pro account-এ)
- Apps Script URL কাউকে share করবেন না
- Data Google Sheet-এ থাকে — আপনার Google account-এ secured

---

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `Ctrl/Cmd + N` | New Lead |
| `Escape` | Modal বন্ধ করুন |

---

## Troubleshooting

**Sync কাজ করছে না?**
→ Config tab → Test Connection চাপুন
→ Apps Script-এ নতুন version Deploy করুন

**Sheet-এ data নেই?**
→ `doGet` কাজ করছে কিনা check করুন: Script URL browser-এ open করুন, JSON দেখাবে

**CORS error?**
→ Apps Script-এ `mode: 'no-cors'` use হয় POST-এ, এটা normal
