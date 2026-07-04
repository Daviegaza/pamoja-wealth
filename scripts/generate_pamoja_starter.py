#!/usr/bin/env python3
"""
PAMOJA_WEALTH_STARTER.pdf

Budget launch playbook for Pamoja Wealth. Ship v1 for KES 300k total,
run at KES 5-10k/mo, hit first paying customer in ~90 days.

Run:  python3 scripts/generate_pamoja_starter.py
Out:  docs/PAMOJA_WEALTH_STARTER.pdf
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle, HRFlowable,
)
from datetime import datetime
import os

BRAND = HexColor("#059669")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")
BG = HexColor("#F9FAFB")
OK = HexColor("#059669")
DANGER = HexColor("#DC2626")
WARN = HexColor("#D97706")


def styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                          fontSize=22, textColor=BRAND, spaceAfter=12, leading=26))
    ss.add(ParagraphStyle("H2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                          fontSize=15, textColor=INK, spaceBefore=14, spaceAfter=8, leading=19))
    ss.add(ParagraphStyle("H3", parent=ss["Heading3"], fontName="Helvetica-Bold",
                          fontSize=12, textColor=BRAND, spaceBefore=10, spaceAfter=4))
    ss.add(ParagraphStyle("Body", parent=ss["BodyText"], fontName="Helvetica",
                          fontSize=10, textColor=INK, leading=14, alignment=TA_LEFT))
    ss.add(ParagraphStyle("Muted", parent=ss["BodyText"], fontName="Helvetica",
                          fontSize=9, textColor=MUTED, leading=12))
    ss.add(ParagraphStyle("OK", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=OK, leading=13))
    ss.add(ParagraphStyle("Danger", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=DANGER, leading=13))
    ss.add(ParagraphStyle("Warn", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=WARN, leading=13))
    return ss


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 20 * mm, A4[0], 20 * mm, stroke=0, fill=1)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "Pamoja Wealth — Starter Playbook")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm,
                           datetime.now().strftime("Rev. %Y-%m-%d"))
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 12 * mm,
                             f"Page {doc.page}  ·  Budget path · Not legal advice")
    canvas.restoreState()


def gtable(rows, colWidths=None, header=True):
    tbl = Table(rows, colWidths=colWidths, repeatRows=1 if header else 0)
    style = [
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1), [white, BG]),
        ("GRID", (0, 0), (-1, -1), 0.3, HexColor("#D1D5DB")),
        ("FONTSIZE", (0, 0), (-1, -1), 8),
    ]
    if header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), BRAND),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    tbl.setStyle(TableStyle(style))
    return tbl


def build(path):
    doc = SimpleDocTemplate(path, pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=28 * mm, bottomMargin=18 * mm)
    S = styles()
    story = []

    # ── COVER ───────────────────────────────────────────────────────
    story += [
        Spacer(1, 15 * mm),
        Paragraph("Pamoja Wealth — Starter Playbook", S["H1"]),
        Paragraph("Launch v1 for <b>KES 300k total</b>. Run at <b>KES 5-10k/mo</b>. "
                  "Hit first paying customer in <b>~90 days</b>.<br/><br/>"
                  "Everything the killer-feature build already ships. Every corner "
                  "you can cut without breaking the law.",
                  S["Body"]),
        Spacer(1, 6 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 6 * mm),
        Paragraph(f"Prepared: {datetime.now().strftime('%d %B %Y')}", S["Muted"]),
        Paragraph("Companion: COMPANY_STARTER_KIT.pdf (register the parent Ltd first).",
                  S["Muted"]),
        Spacer(1, 8 * mm),
        Paragraph("Product scope for v1 — deliberately narrow", S["H2"]),
        Paragraph(
            "• Chama contribution flow (M-Pesa STK Push) — the killer path<br/>"
            "• Group chat (already built)<br/>"
            "• Wallet with double-entry ledger (already built)<br/>"
            "• Rule engine + Bylaw Compiler (killer feature)<br/>"
            "• Public donate link (already built)<br/>"
            "• Audit report SKU (KES 1,500 revenue per report)<br/><br/>"
            "<b>Explicit v1 CUTS</b> (add post-revenue):<br/>"
            "• No loans (CBK DCP license = KES 6M+; illegal without)<br/>"
            "• No investment products (CMA license = KES 2M+)<br/>"
            "• No cap-table/dividends (built, but wait until first paying chama asks)<br/>"
            "• No trust-score API resale (built, enable when partners appear)<br/>"
            "• No WhatsApp bot in production (built, Meta review takes weeks)<br/>"
            "• No paid AML vendor — DIY OFAC/UN/EU feeds (built)",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 1: BUDGET ───────────────────────────────────────────
    story += [
        Paragraph("1. TOTAL BUDGET — KES 300k", S["H2"]),
        gtable([
            ["Category", "Item", "Cost (KES)"],
            ["Company", "Registration + KRA + county + ODPC (COMPANY_STARTER §1)", "31,000"],
            ["Fintech", "FRC AML registration", "0"],
            ["Fintech", "Safaricom Paybill setup", "25,000"],
            ["Bank", "Equity/KCB business account", "0 – 5,000"],
            ["Web", "Domain (.co.ke or .app) + Cloudflare + Zoho email", "3,000"],
            ["Legal", "Free templates (Termly, Cooley GO, FRC AML template)", "0"],
            ["Legal", "Lawyer review pass at first traction", "80,000 – 150,000"],
            ["Insurance", "Cyber liability only", "25,000 – 50,000"],
            ["Design", "Free Figma + iconify.design + Unsplash", "0"],
            ["KYC", "Manual review + self-attest (Smile ID later)", "0"],
            ["AML", "DIY OFAC/UN/EU feeds — code already ships this", "0"],
            ["Infra Y1", "Vercel + Fly + Supabase + Cloudflare (all free tier)", "0 – 5,000"],
            ["Monitoring", "Sentry free + UptimeRobot free", "0"],
            ["Marketing", "Landing page + organic social (your time)", "0"],
            ["Buffer", "15% for surprises", "30,000"],
            ["", "TOTAL Y1", "≈ 200,000 – 300,000"],
        ], colWidths=[25*mm, 90*mm, 45*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Absolute minimum to be legally live: KES 200k.</b><br/>"
                  "<b>Comfortable: KES 300k.</b><br/>"
                  "Add KES 200-500k over year 2 as you scale and layer on paid vendors.",
                  S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 2: 90-DAY PLAN ─────────────────────────────────────
    story += [
        Paragraph("2. 90-DAY LAUNCH PLAN", S["H2"]),
        Paragraph("Assumes you're building solo, ~30h/week on Pamoja.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Week", "Money", "Product", "Legal / Ops"],
            ["W1", "31k registrations", "Deploy to Vercel + Fly + Supabase", "BRS submission"],
            ["W2", "0", "Wire real Safaricom sandbox", "Buy domain + Cloudflare"],
            ["W3", "25k Paybill apply", "Ship rule engine + chat", "Certificate arrives"],
            ["W4", "0", "Test STK Push end-to-end", "Bank account opens"],
            ["W5", "0", "Ship KYC tier 1 (manual)", "Draft T&amp;C + Privacy from Termly"],
            ["W6", "0", "Onboard first 5 real chamas (friends)", "FRC R1 registration"],
            ["W7", "25k cyber insurance", "Fix bugs from first-user feedback", "Publish T&amp;C + Privacy"],
            ["W8", "0", "Ship Bylaw Compiler showcase page", "SEO on landing page"],
            ["W9", "0", "Ship audit-report SKU (revenue path)", "Paybill goes live"],
            ["W10", "0", "Push to 20 chamas", "Ask for first testimonials"],
            ["W11", "0", "Iterate on bylaw compiler + STK", "Analyse first-week churn"],
            ["W12", "80-150k lawyer", "Ship referral cash-out", "Legal review pass"],
            ["W13", "0", "First paying chama (subscription)", "Send invoice via QuickBooks free"],
        ], colWidths=[15*mm, 30*mm, 65*mm, 50*mm]),
        Spacer(1, 4 * mm),
        Paragraph("End of W13: <b>legal + live + first revenue.</b> Total spend so far: "
                  "≈ KES 130-200k depending on lawyer timing.", S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 3: WHAT'S ALREADY BUILT ────────────────────────────
    story += [
        Paragraph("3. WHAT'S ALREADY IN THE CODE (FREE VALUE)", S["H2"]),
        Paragraph("Enterprise features other fintechs pay millions for — you already have them.",
                  S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Feature", "Market value / comparable"],
            ["OFAC/UN/EU AML screening", "Comply Advantage: USD 15k/yr — you have DIY feed"],
            ["Trust score credit passport", "FICO-style vendors: charge per lookup"],
            ["Hash-chain audit trail (POCAMLA compliance)", "Consultants: KES 500k-2M engagement"],
            ["Rule engine + natural-language bylaw compiler", "Custom legal drafting: KES 100-200k per chama"],
            ["Multi-sig payouts with WebAuthn passkeys", "Enterprise MFA: USD 5-15/user/mo"],
            ["Double-entry ledger + invariant checker", "Accounting integration: KES 200-400k"],
            ["Multi-provider payment router (5 providers)", "Payment orchestration SaaS: USD 500-2k/mo"],
            ["Multi-currency ledger + FX", "Wise-for-Business: 0.4-1% of volume"],
            ["Audit report SKU (revenue built-in)", "KES 1,500 per report = margin from day 1"],
            ["Referral program with B2C cashout", "ReferralCandy: USD 79-249/mo"],
            ["Offline PWA with background sync", "iOS PWA compliance work: weeks"],
            ["Feature-gate paywalls + 402 UX", "SaaS platform work: months"],
            ["k6 load + Playwright e2e + CI pipeline", "DevOps consultant: KES 200-500k"],
            ["Sentry init + WebAuthn init (peer-dep gated)", "Zero cost until DSN provisioned"],
        ], colWidths=[80*mm, 80*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Marketing angle:</b> Position as \"enterprise-grade fintech infra "
                  "for chamas from day 1.\" You're not a bootstrapped MVP — you're a fully "
                  "shipped product on a lean spend.", S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 4: REVENUE ─────────────────────────────────────────
    story += [
        Paragraph("4. REVENUE — HOW YOU GET PAID FROM WEEK 1", S["H2"]),
        Paragraph("12 revenue streams already coded. Pick 3-4 for launch. Add rest post-PMF.",
                  S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Stream", "V1 activation", "Est. monthly at 100 chamas"],
            ["Chama subscription (Free/Starter/Pro/Enterprise)", "Yes — Starter KES 500/mo", "50,000"],
            ["Take-rate on contributions (0.5-1%)", "Yes", "20,000 – 50,000"],
            ["Audit report SKU (KES 1,500 each)", "Yes — one-click on ChamaDetailPage", "15,000 – 45,000"],
            ["Loan origination fee", "NO (needs DCP license)", "0"],
            ["Yield marketplace fee", "NO (needs CMA)", "0"],
            ["Dedicated paybill / white-label", "Enterprise only, later", "0"],
            ["FX spread on multi-currency", "Later (regional launch)", "0"],
            ["Trust-score API for SACCO / insurers", "Later, when partners exist", "0"],
            ["Cap-table + investor tooling", "Later, Pro tier", "0"],
            ["Referral cashout spread", "Yes, small margin", "5,000 – 10,000"],
            ["Insurance commission", "Later, partner needed", "0"],
            ["Late-payment fee", "Yes, configurable per chama", "10,000 – 20,000"],
            ["", "V1 MONTHLY AT 100 CHAMAS", "≈ 100,000 – 175,000"],
        ], colWidths=[70*mm, 45*mm, 45*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Break-even math:</b><br/>"
                  "OPEX ~ KES 30-50k/mo (infra + you living lean)<br/>"
                  "Break-even ≈ <b>30-50 paying chamas</b>. Achievable by month 6.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 5: RISK POSTURE ────────────────────────────────────
    story += [
        Paragraph("5. REGULATORY POSTURE (KEEP IT SAFE)", S["H2"]),
        Paragraph("Which regulator lanes to stay OUT of for v1. Save millions in capital.",
                  S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Lane", "V1 posture", "Why safe"],
            ["CBK — Payment aggregator", "IN", "Money moves via licensed rails (M-Pesa, banks). Legal."],
            ["CBK — PSP", "OUT", "You never hold customer float &gt; 24h. Use trust account."],
            ["CBK — DCP (loans)", "OUT", "No loans in v1. Add license before enabling loans."],
            ["CBK — e-Money issuer", "OUT", "No Pamoja-branded wallet balance. Bank trust account."],
            ["CMA — Securities / MMF", "OUT", "No investment products. Partner needed later."],
            ["SASRA — SACCO", "OUT", "You are software, chamas are self-help groups."],
            ["FRC — AML Reporting Institution", "IN", "Free registration. Mandatory. Ship day 1."],
            ["ODPC — Data controller", "IN", "KES 4k/yr. Mandatory. Ship day 1."],
            ["KRA — Tax", "IN", "Auto once BRS-registered."],
            ["Consumer Protection Act", "IN", "T&amp;C + refund policy + support channel."],
        ], colWidths=[45*mm, 25*mm, 90*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Simple rule:</b> route every shilling through a licensed party "
                  "(M-Pesa, bank, Flutterwave) and don't hold customer money overnight. "
                  "You are a fintech <i>software</i> company, not a fintech operator.", S["OK"]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Red-line features to NOT enable in v1:</b>", S["H3"]),
        Paragraph(
            "• Loan disbursement flow → hide from UI (feature-flag off)<br/>"
            "• Investment / T-bill purchase → hide<br/>"
            "• Cross-border FX conversion → hide<br/>"
            "• Trust-score API resale → keep gated<br/>"
            "• Dividend B2C execute → keep gated<br/>"
            "All the code is there — just don't ship the UI paths that would trigger licensing.",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 6: TECH RUNBOOK ─────────────────────────────────────
    story += [
        Paragraph("6. TECH RUNBOOK — FREE TIER STACK", S["H2"]),
        Paragraph("Every host + service you'll use. All free until real scale.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Layer", "Choice", "Cost"],
            ["Frontend", "Vercel Hobby", "0"],
            ["Backend API", "Fly.io (1 shared-CPU-1x)", "0 – USD 5/mo"],
            ["Workers (BullMQ)", "Fly.io second machine", "0 – USD 5/mo"],
            ["Postgres", "Supabase Free (500 MB)", "0"],
            ["Redis (queue + cache)", "Upstash Free (10k cmd/day)", "0"],
            ["Object storage (S3)", "Cloudflare R2 Free (10 GB)", "0"],
            ["DNS + WAF + CDN", "Cloudflare Free", "0"],
            ["Email transactional", "Resend or SendGrid Free (100/day)", "0"],
            ["SMS (KE)", "Africa's Talking pay-as-go", "KES 1/SMS"],
            ["Error monitoring", "Sentry Free (5k events/mo)", "0"],
            ["Uptime", "UptimeRobot Free", "0"],
            ["Analytics", "Plausible Free or PostHog self-host", "0"],
            ["Domain email", "Zoho Mail Free (5 users)", "0"],
            ["Backups", "cron + pg_dump → R2 nightly", "0"],
            ["CI", "GitHub Actions Free (2000 min/mo)", "0"],
            ["", "TOTAL MONTHLY", "≈ USD 0-15"],
        ], colWidths=[35*mm, 90*mm, 35*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Env vars to keep OFF (save cost until needed):</b>", S["H3"]),
        Paragraph(
            "MTN_MOMO_* · AIRTEL_* · PAYSTACK_SECRET_KEY · FLUTTERWAVE_SECRET_KEY · "
            "STRIPE_SECRET_KEY · SMILE_API_KEY · COMPLY_ADVANTAGE_KEY · "
            "WHATSAPP_ACCESS_TOKEN · WEBAUTHN_RP_ID · SENTRY_DSN (start blank)<br/><br/>"
            "All these features gracefully no-op when creds are absent. Your app runs.",
            S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Env vars to fill day 1:</b>", S["H3"]),
        Paragraph(
            "DATABASE_URL · REDIS_URL · JWT_SECRET · JWT_REFRESH_SECRET · "
            "ENCRYPTION_KEY · MPESA_CONSUMER_KEY · MPESA_CONSUMER_SECRET · "
            "MPESA_PASSKEY · MPESA_SHORTCODE · MPESA_ENVIRONMENT · "
            "MPESA_CALLBACK_BASE · MPESA_WEBHOOK_SECRET",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 7: GROWTH TO PROFITABILITY ─────────────────────────
    story += [
        Paragraph("7. FROM LAUNCH TO PROFITABILITY", S["H2"]),
        Paragraph("Milestones + when to spend the next KES.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Milestone", "Action", "Add cost"],
            ["First 10 chamas", "Watch STK success rate + iterate", "0"],
            ["First paying chama", "Bind cyber insurance if not yet", "25,000 one-off"],
            ["50 chamas", "Move to Supabase Pro + SendGrid Pro", "USD 45/mo"],
            ["100 chamas", "Hire part-time bookkeeper", "KES 20k/mo"],
            ["100 chamas", "Real KYC (Smile Identity)", "USD 500 setup + per-check"],
            ["500 chamas", "First contractor (community / support)", "KES 100-200k/mo"],
            ["500 chamas", "PI + Fidelity insurance", "KES 150k/yr"],
            ["1000 chamas", "Trademark filing (KIPI)", "KES 40-60k"],
            ["1000 chamas", "Pen test round 1", "KES 200-300k"],
            ["KES 1M/mo revenue", "First employee + full legal review", "KES 400-600k/mo"],
            ["KES 5M/mo revenue", "SOC 2 via Vanta for enterprise deals", "USD 40-70k/yr"],
            ["Approach VC", "Delaware C-Corp flip if US round", "USD 15-30k one-off"],
        ], colWidths=[45*mm, 65*mm, 50*mm]),
        PageBreak(),
    ]

    # ── SECTION 8: KILLER-FEATURE MOAT ─────────────────────────────
    story += [
        Paragraph("8. WHY THIS BEATS COMPETITORS ON A BUDGET", S["H2"]),
        Paragraph(
            "You're solo, broke, and going against Chamasoft, M-Chama, iChama, Kwara. "
            "Here's your moat — features they don't ship:",
            S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Feature", "Competitor status", "Your position"],
            ["Bylaw Compiler (natural-language rules)", "None have it", "KILLER — no-code chama governance"],
            ["Portable trust score (POCAMLA-compliant)", "None have it", "MOAT — SACCO partners will want this"],
            ["Multi-sig payouts with WebAuthn passkey", "Enterprise-only elsewhere", "MOAT — table stakes for treasurers"],
            ["Hash-chained audit trail", "Chamasoft has basic logs", "MOAT — auditors love this"],
            ["Public donate + investor share paths", "M-Chama has donate only", "MOAT — one product, three motions"],
            ["Multi-currency (7 currencies) ready", "Kenya-only competitors", "MOAT — regional expansion built-in"],
            ["Offline PWA + Background Sync", "None have it", "MOAT — 2G/rural Kenya users"],
            ["Ledger export to QuickBooks / Xero", "Manual export at best", "MOAT — accountants love this"],
            ["Audit report as paid product (SKU)", "None have it", "REVENUE — repeatable purchase"],
            ["AI-generated compliance narratives (SAR)", "None have it", "MOAT — MLRO time savings"],
        ], colWidths=[55*mm, 45*mm, 60*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Marketing headline:</b> \"The chama that runs itself — with governance, "
                  "compliance, and reporting built for regulators, on day 1.\"", S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 9: DECISION TREE ───────────────────────────────────
    story += [
        Paragraph("9. QUICK BUDGET DECISION TREE", S["H2"]),
        Paragraph("Q1: Do you have KES 200k right now?<br/>"
                  "YES → follow this playbook exactly.<br/>"
                  "NO → get to 200k first. Skip the KES 25k cyber insurance in month 1 "
                  "(delay to month 3 when you have first user). Reduces need to KES 175k.", S["Body"]),
        Paragraph("Q2: Do you have &gt; KES 500k?<br/>"
                  "YES → add early KYC (Smile Identity) + lawyer at start (not month 3). "
                  "Compress timeline from 90 days to 60.<br/>"
                  "NO → stay lean. Compensate with time.", S["Body"]),
        Paragraph("Q3: Are you leaving a stable job for this?<br/>"
                  "YES → build 6 months of personal runway (KES 300-600k) BEFORE quitting. "
                  "Product-market fit averages 12-18 months for fintech.<br/>"
                  "NO → keep the job, ship nights + weekends until first KES 200k/mo revenue.", S["Body"]),
        Paragraph("Q4: Do you have a technical co-founder?<br/>"
                  "YES → they own IP assignment day 1 (KES 0 with Cooley GO template). "
                  "Vest their shares over 4 years with 1-year cliff.<br/>"
                  "NO → hire contractors for spikes, but write the core yourself. "
                  "You already have a shipping codebase — leverage it.", S["Body"]),
        Paragraph("Q5: How aggressive on AML for launch?<br/>"
                  "LEAN → DIY OFAC/UN/EU feeds (built) + FRC filings manually. KES 0.<br/>"
                  "STANDARD → Comply Advantage entry-tier (~USD 500/mo). Add month 6.<br/>"
                  "ENTERPRISE → full stack, KES 2M+. Only when needed by a customer.", S["Body"]),
        PageBreak(),
    ]

    # ── FINAL PAGE ─────────────────────────────────────────────────
    story += [
        Paragraph("APPENDIX — READY-TO-COPY .ENV FOR STARTER", S["H2"]),
        Paragraph("Only the vars you need for v1. Skip everything else.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("<font face='Courier' size='8'>"
                  "NODE_ENV=production<br/>"
                  "PORT=3000<br/>"
                  "API_URL=https://your-api.fly.dev<br/>"
                  "CORS_ORIGINS=https://your-app.vercel.app<br/><br/>"
                  "DATABASE_URL=postgres://... (Supabase)<br/>"
                  "REDIS_URL=rediss://... (Upstash)<br/><br/>"
                  "JWT_SECRET=&lt;openssl rand -hex 32&gt;<br/>"
                  "JWT_REFRESH_SECRET=&lt;openssl rand -hex 32&gt;<br/>"
                  "ENCRYPTION_KEY=&lt;64 hex chars&gt;<br/><br/>"
                  "MPESA_CONSUMER_KEY=<br/>"
                  "MPESA_CONSUMER_SECRET=<br/>"
                  "MPESA_PASSKEY=<br/>"
                  "MPESA_SHORTCODE=&lt;your paybill&gt;<br/>"
                  "MPESA_ENVIRONMENT=production<br/>"
                  "MPESA_CALLBACK_BASE=https://your-api.fly.dev/api/v1/wallet<br/>"
                  "MPESA_WEBHOOK_SECRET=&lt;openssl rand -base64 48&gt;<br/>"
                  "FEATURE_MPESA_ENABLED=true<br/><br/>"
                  "SENDGRID_API_KEY=... (100/day free tier)<br/>"
                  "EMAIL_FROM=noreply@yourdomain.co.ke<br/><br/>"
                  "AT_USERNAME=... (Africa's Talking, pay-as-go)<br/>"
                  "AT_API_KEY=<br/>"
                  "AT_SENDER_ID=Pamoja<br/><br/>"
                  "S3_ENDPOINT=&lt;R2 endpoint&gt;<br/>"
                  "S3_ACCESS_KEY=<br/>"
                  "S3_SECRET_KEY=<br/>"
                  "S3_BUCKET=pamoja-documents<br/>"
                  "S3_REGION=auto<br/><br/>"
                  "FEATURE_CHAT_ENABLED=true<br/>"
                  "FEATURE_AI_ENABLED=false   # add Anthropic key when ready<br/>"
                  "FEATURE_INVESTMENTS_ENABLED=false   # CMA lane, skip v1<br/>"
                  "FEATURE_RULE_ENGINE_ENFORCE=false   # shadow mode first"
                  "</font>", S["Body"]),
        Spacer(1, 6 * mm),
        Paragraph("<b>Frontend (.env):</b>", S["H3"]),
        Paragraph("<font face='Courier' size='8'>"
                  "VITE_API_BASE_URL=https://your-api.fly.dev/api/v1<br/>"
                  "VITE_MPESA_PAYBILL=&lt;your paybill&gt;<br/>"
                  "VITE_USE_MOCKS=false"
                  "</font>", S["Body"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=1, width="60%"),
        Spacer(1, 4 * mm),
        Paragraph("Regenerate: <font face='Courier'>python3 scripts/generate_pamoja_starter.py</font>",
                  S["Muted"]),
        Paragraph("Companion: COMPANY_STARTER_KIT.pdf — register the Ltd first.",
                  S["Muted"]),
        Paragraph("Not legal, tax, or financial advice.", S["Muted"]),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "docs",
                       "PAMOJA_WEALTH_STARTER.pdf")
    build(out)
    print(f"Generated: {out}")
