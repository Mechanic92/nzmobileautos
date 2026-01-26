# SEO & Local Search Setup Guide
## Mobile Autoworks NZ

This guide covers the complete SEO implementation for improving search visibility and local rankings.

---

## 1. Google Search Console Setup

### Verification Steps
1. Go to [Google Search Console](https://search.google.com/search-console)
2. Add property: `https://www.mobileautoworksnz.com`
3. Choose "HTML tag" verification method
4. Copy the verification code
5. Replace `YOUR_GOOGLE_VERIFICATION_CODE` in `index.html`:
   ```html
   <meta name="google-site-verification" content="YOUR_ACTUAL_CODE_HERE" />
   ```
6. Deploy and verify

### Post-Verification Tasks
- [ ] Submit sitemap: `https://www.mobileautoworksnz.com/sitemap.xml`
- [ ] Check for crawl errors
- [ ] Monitor Core Web Vitals
- [ ] Set up email alerts for issues

---

## 2. Bing Webmaster Tools Setup

1. Go to [Bing Webmaster Tools](https://www.bing.com/webmasters)
2. Add your site
3. Get verification code
4. Replace `YOUR_BING_VERIFICATION_CODE` in `index.html`
5. Submit sitemap

---

## 3. Google Business Profile (Critical for Local SEO)

### Setup Checklist
- [ ] Claim/create listing at [Google Business Profile](https://business.google.com)
- [ ] Verify ownership (postcard, phone, or email)
- [ ] Complete ALL fields:

**Business Information:**
- Business name: `Mobile Autoworks NZ`
- Primary category: `Auto repair shop` or `Mobile mechanic`
- Secondary categories: `Car repair`, `Vehicle inspection`
- Phone: `027 642 1824`
- Website: `https://www.mobileautoworksnz.com`
- Service area: List specific Auckland suburbs

**Hours:**
- Monday-Friday: 9:00 AM - 5:00 PM
- Saturday-Sunday: By appointment

**Services (add all):**
- Mobile Car Diagnostic - $140
- Pre-Purchase Inspection - $180
- Car Servicing
- Brake Repairs
- WOF Repairs
- Battery Replacement

**Photos to Upload:**
- Logo
- Work vehicle/van
- Before/after repair photos
- Diagnostic equipment
- Happy customers (with permission)

### Review Strategy
- Ask satisfied customers to leave Google reviews
- Respond to ALL reviews (positive and negative)
- Encourage specific keywords in reviews: "mobile mechanic", "diagnostic", "pre-purchase inspection"

---

## 4. Local Citations (NAP Consistency)

Ensure identical Name, Address, Phone across all listings:

**Name:** Mobile Autoworks NZ
**Address:** Auckland, New Zealand (service area business)
**Phone:** 027 642 1824

### Priority Directories
- [ ] Google Business Profile
- [ ] Apple Maps Connect
- [ ] Bing Places
- [ ] Yellow Pages NZ
- [ ] Finda.co.nz
- [ ] NoCowboys.co.nz
- [ ] Localist.co.nz
- [ ] Hotfrog NZ

---

## 5. Implemented SEO Pages

### High-Intent Landing Pages
| Page | URL | Target Keywords |
|------|-----|-----------------|
| Mobile Diagnostic | `/mobile-diagnostic-auckland` | mobile car diagnostic auckland, check engine light |
| Pre-Purchase Inspection | `/pre-purchase-inspection-auckland` | pre purchase car inspection auckland |
| Car Won't Start | `/car-wont-start-auckland` | car won't start auckland, emergency mechanic |
| Prepaid Booking | `/booking` | book mobile mechanic auckland |

### Each Page Includes:
- Unique title tag (≤60 chars)
- Meta description (≤155 chars)
- H1 with primary keyword
- JSON-LD structured data (LocalBusiness, Service, FAQ, Breadcrumb)
- Internal links to booking
- Clear CTAs with phone number

---

## 6. Structured Data Implementation

### Schema Types Used
1. **LocalBusiness** - Business info, hours, contact
2. **Service** - Individual service offerings with prices
3. **FAQPage** - Common questions (helps win featured snippets)
4. **BreadcrumbList** - Navigation path
5. **AggregateRating** - Review summary (when available)

### Validation
Test structured data at:
- [Google Rich Results Test](https://search.google.com/test/rich-results)
- [Schema.org Validator](https://validator.schema.org/)

---

## 7. Technical SEO Checklist

### Implemented ✅
- [x] XML Sitemap (`/sitemap.xml`)
- [x] Robots.txt (`/robots.txt`)
- [x] Canonical URLs on all pages
- [x] Mobile-responsive design
- [x] SPA routing with Netlify redirects
- [x] Security headers (X-Frame-Options, CSP, etc.)
- [x] Static asset caching (1 year for JS/CSS/fonts)
- [x] Geographic meta tags

### To Configure
- [ ] Replace Google verification code in `index.html`
- [ ] Replace Bing verification code in `index.html`
- [ ] Set up Google Analytics 4
- [ ] Configure Google Tag Manager (optional)

---

## 8. Content Strategy

### Blog Topics (High Search Volume)
1. "How to know if your car battery is dying" 
2. "What does the check engine light mean?"
3. "How much does a pre-purchase inspection cost in NZ?"
4. "Mobile mechanic vs workshop - pros and cons"
5. "Common WOF failures and how to fix them"
6. "Signs your brakes need replacing"
7. "How often should you service your car in NZ?"

### Content Guidelines
- Minimum 1000 words for service pages
- Include local keywords naturally
- Add images with descriptive alt text
- Internal link to booking/quote pages
- Update content regularly (freshness signal)

---

## 9. Performance Optimization

### Current Implementation
- Font preconnect for Google Fonts
- Static asset caching headers
- Responsive images (implement lazy loading)

### Recommendations
- [ ] Compress images (WebP format)
- [ ] Implement lazy loading for below-fold images
- [ ] Minimize JavaScript bundle size
- [ ] Use CDN for static assets
- [ ] Monitor Core Web Vitals in Search Console

---

## 10. Monitoring & Reporting

### Weekly Tasks
- Check Google Search Console for errors
- Monitor keyword rankings
- Respond to new reviews
- Check website uptime

### Monthly Tasks
- Review Search Console performance report
- Analyze top-performing pages
- Update sitemap if new pages added
- Check competitor rankings

### Tools
- Google Search Console (free)
- Google Analytics 4 (free)
- Bing Webmaster Tools (free)
- Ahrefs/SEMrush (paid, optional)

---

## 11. Environment Variables for Analytics

Add to `.env`:
```env
# Google Analytics
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Google Tag Manager (optional)
VITE_GTM_ID=GTM-XXXXXXX
```

---

## Quick Wins Checklist

### Immediate (This Week)
- [ ] Set up Google Search Console
- [ ] Claim Google Business Profile
- [ ] Submit sitemap
- [ ] Add business to Apple Maps

### Short-term (This Month)
- [ ] Get 5+ Google reviews
- [ ] Add to local directories
- [ ] Create 2-3 blog posts
- [ ] Set up Google Analytics

### Ongoing
- [ ] Respond to all reviews
- [ ] Publish monthly blog content
- [ ] Monitor and fix crawl errors
- [ ] Build quality backlinks

---

## Support

For technical SEO questions or implementation help, refer to:
- [Google Search Central](https://developers.google.com/search)
- [Schema.org Documentation](https://schema.org/)
- [Moz Local SEO Guide](https://moz.com/learn/seo/local)
