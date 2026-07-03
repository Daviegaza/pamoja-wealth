#!/usr/bin/env python3
"""
PAMOJA_WEALTH_GO_LIVE_MASTER.pdf

The complete go-live handbook: everything about the system, what's missing,
and every step to take — technical, legal, regulatory, banking, operational —
before Pamoja Wealth serves a paying customer in Kenya.

Run:  python3 scripts/generate_go_live_pdf.py
Out:  docs/PAMOJA_WEALTH_GO_LIVE_MASTER.pdf
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, white
from reportlab.lib.units import mm
from reportlab.lib.enums import TA_LEFT, TA_CENTER
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    HRFlowable, KeepTogether,
)
from datetime import datetime
import os

BRAND = HexColor("#059669")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")
BG = HexColor("#F9FAFB")
DANGER = HexColor("#DC2626")
WARN = HexColor("#D97706")
OK = HexColor("#059669")
INFO = HexColor("#2563EB")


def styles():
    ss = getSampleStyleSheet()
    ss.add(ParagraphStyle("H1", parent=ss["Heading1"], fontName="Helvetica-Bold",
                          fontSize=22, textColor=BRAND, spaceAfter=12, leading=26))
    ss.add(ParagraphStyle("H2", parent=ss["Heading2"], fontName="Helvetica-Bold",
                          fontSize=15, textColor=INK, spaceBefore=14, spaceAfter=8, leading=19))
    ss.add(ParagraphStyle("H3", parent=ss["Heading3"], fontName="Helvetica-Bold",
                          fontSize=12, textColor=BRAND, spaceBefore=10, spaceAfter=4))
    ss.add(ParagraphStyle("H4", parent=ss["Heading3"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=INK, spaceBefore=6, spaceAfter=2))
    ss.add(ParagraphStyle("Body", parent=ss["BodyText"], fontName="Helvetica",
                          fontSize=10, textColor=INK, leading=14, alignment=TA_LEFT))
    ss.add(ParagraphStyle("Muted", parent=ss["BodyText"], fontName="Helvetica",
                          fontSize=9, textColor=MUTED, leading=12))
    ss.add(ParagraphStyle("Mono", parent=ss["BodyText"], fontName="Courier",
                          fontSize=8, textColor=INK, leading=11, leftIndent=6,
                          backColor=BG, borderPadding=6))
    ss.add(ParagraphStyle("Danger", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=DANGER, leading=13))
    ss.add(ParagraphStyle("Warn", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=WARN, leading=13))
    ss.add(ParagraphStyle("OK", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=OK, leading=13))
    ss.add(ParagraphStyle("Info", parent=ss["BodyText"], fontName="Helvetica-Bold",
                          fontSize=10, textColor=INFO, leading=13))
    return ss


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 20 * mm, A4[0], 20 * mm, stroke=0, fill=1)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "Pamoja Wealth — Go-Live Master")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm,
                           datetime.now().strftime("Rev. %Y-%m-%d"))
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 12 * mm,
                             f"Page {doc.page}  ·  Confidential — Internal Use Only")
    canvas.restoreState()


def gtable(rows, colWidths=None, first_row_header=True):
    tbl = Table(rows, colWidths=colWidths, repeatRows=1 if first_row_header else 0)
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
    if first_row_header:
        style += [
            ("BACKGROUND", (0, 0), (-1, 0), BRAND),
            ("TEXTCOLOR", (0, 0), (-1, 0), white),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ]
    tbl.setStyle(TableStyle(style))
    return tbl


def build(path):
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=28 * mm, bottomMargin=18 * mm,
    )
    S = styles()
    story = []

    # ═══════════════ COVER ═══════════════
    story += [
        Spacer(1, 15 * mm),
        Paragraph("Go-Live Master Handbook", S["H1"]),
        Paragraph("Everything you need to launch Pamoja Wealth as a real "
                  "company serving real customers in Kenya. Technical, legal, "
                  "regulatory, banking, and operational — end-to-end.",
                  S["Muted"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 6 * mm),
        Paragraph("<b>Prepared:</b> " + datetime.now().strftime("%d %B %Y"), S["Body"]),
        Paragraph("<b>Product:</b> Chama + fundraiser + WhatsApp-replacement + rule engine + "
                  "public donate + investor shares. East-Africa first.", S["Body"]),
        Paragraph("<b>Stack:</b> React 19 + Vite + TypeScript (FE) · "
                  "Node/Express + Prisma + Postgres + Redis + BullMQ + Socket.io (BE)", S["Body"]),
        Spacer(1, 10 * mm),
        Paragraph("<b>Contents</b>", S["H3"]),
        Paragraph(
            "1. System overview — what Pamoja Wealth is<br/>"
            "2. What's shipped vs. what's missing<br/>"
            "3. Company setup (register, PIN, permits)<br/>"
            "4. Business bank account<br/>"
            "5. Regulatory landscape (CBK, ODPC, CMA, SACCO)<br/>"
            "6. Safaricom Daraja &amp; paybill onboarding<br/>"
            "7. Payment providers (Flutterwave, Stripe, banks)<br/>"
            "8. Third-party service master (credentials + accounts)<br/>"
            "9. Technical go-live checklist<br/>"
            "10. KYC / AML / consumer-protection<br/>"
            "11. Insurance &amp; indemnity<br/>"
            "12. Team, roles &amp; hiring<br/>"
            "13. Legal documents (T&amp;C, privacy, DPA notice)<br/>"
            "14. Launch runbook (T-28d → T+30d)<br/>"
            "15. Post-launch monitoring &amp; incident response<br/>"
            "16. Budget &amp; timeline<br/>"
            "17. Master .env.example",
            S["Body"]),
        Spacer(1, 8 * mm),
        Paragraph("<b>Legend</b>", S["H3"]),
        Table([
            [Paragraph("CRITICAL", S["Danger"]), "Blocks go-live"],
            [Paragraph("HIGH", S["Warn"]), "Required for launch feature"],
            [Paragraph("MEDIUM", S["OK"]), "Improves UX / ops"],
            [Paragraph("INFO", S["Info"]), "Reference material"],
        ], colWidths=[25 * mm, 100 * mm]),
        PageBreak(),
    ]

    # ═══════════════ 1. SYSTEM OVERVIEW ═══════════════
    story += [
        Paragraph("1. SYSTEM OVERVIEW", S["H2"]),
        Paragraph(
            "Pamoja Wealth is a group-savings + fundraiser + investor-onboarding "
            "platform for East Africa. It replaces WhatsApp groups with structured "
            "chamas that track contributions, loans, votes, meetings, and shares.",
            S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("1.1 Core primitives", S["H3"]),
        Paragraph(
            "<b>Chama</b> — rotating savings group. Members contribute a set "
            "amount on a schedule. Rules govern eligibility, voting, payouts, exit.<br/>"
            "<b>Harambee / Pot</b> — one-off fundraiser or open pot. Public or private.<br/>"
            "<b>Wallet</b> — per-user, KES-denominated. Backed by double-entry ledger.<br/>"
            "<b>Loans</b> — chama lends to members. Guarantors, repayment schedule, "
            "default handling.<br/>"
            "<b>Investments</b> — chama-managed T-bills, MMFs, SACCO deposits.<br/>"
            "<b>Rule engine</b> — bylaws compiled from natural language via Claude, "
            "enforced at every state-change hook.<br/>"
            "<b>Public donate link</b> — anonymous outsider gives to a cause. No login.<br/>"
            "<b>Investor shares</b> — offering, cap table, dividends pro-rata.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("1.2 Channels", S["H3"]),
        Paragraph(
            "Web (PWA) · Android/iOS (Capacitor shell) · WhatsApp bot (Meta Cloud API) · "
            "USSD (Africa's Talking) · Email (SendGrid) · SMS (Africa's Talking) · "
            "Push (FCM v1 + web-push VAPID)",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("1.3 Revenue streams (built in)", S["H3"]),
        Paragraph(
            "1) SaaS subscription per chama (Free/Starter/Pro/Enterprise).<br/>"
            "2) Take-rate on contributions (small %).<br/>"
            "3) Loan origination fee.<br/>"
            "4) Yield marketplace platform fee.<br/>"
            "5) Dedicated paybill / SMS / white-label (Enterprise).<br/>"
            "6) FX spread on multi-currency movements.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("1.4 Compliance posture", S["H3"]),
        Paragraph(
            "Sits in Kenya's <b>Financial Aggregator</b> / <b>Payment Service "
            "Provider agent</b> category — not a bank, not a licensed deposit-taker. "
            "Money moves via licensed rails (M-Pesa, banks, Flutterwave). Chamas "
            "remain unregulated collective self-help groups; Pamoja provides the "
            "software wrapper. See Section 5 for regulatory detail.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 2. SHIPPED vs MISSING ═══════════════
    story += [
        Paragraph("2. WHAT'S SHIPPED vs. WHAT'S MISSING", S["H2"]),
        Paragraph("Technical status as of this document's revision date.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("2.1 Fully shipped &amp; compiling clean", S["H3"]),
        gtable([
            ["Area", "Status"],
            ["Auth (JWT + 2FA + OTP)", "✓ Encrypted 2FA at rest"],
            ["Chama CRUD + members + roles", "✓"],
            ["Wallet + M-Pesa STK Push", "✓ Signed webhooks"],
            ["Loans (apply, approve, repay)", "✓"],
            ["Investments (basic)", "✓"],
            ["Meetings + RSVPs", "✓"],
            ["Votes + ballots", "✓"],
            ["Chat (group + DM, media, reactions, pin, search)", "✓ Needs migration apply"],
            ["Rule engine (compile + save + versioning)", "✓"],
            ["Billing + subscription tiers", "✓ Needs Flutterwave live keys"],
            ["Notifications (in-app + SMS + email + push)", "✓ Needs provider keys"],
            ["Public donate + investor shares + QR", "✓ NEW"],
            ["Integrations (Slack/Google/Zoom/QB/Xero/Zapier/webhooks)", "✓ OAuth scaffolds"],
            ["USSD channel", "✓ Needs AT service code"],
            ["WhatsApp bot", "✓ Needs Meta verify"],
            ["Video calls (Daily.co)", "✓ Needs API key"],
            ["AI insights (forecast/anomaly/churn/default)", "✓"],
            ["Multi-currency + FX", "✓"],
            ["Bulk CSV/Excel import", "✓"],
            ["Ledger export (CSV/QuickBooks/Xero)", "✓"],
            ["Audit trail + hash-chain verify", "✓"],
            ["Yield marketplace (T-bill/MMF/SACCO)", "✓ Needs partner integration"],
            ["PWA + offline queue + install", "✓ Needs icon PNGs"],
            ["i18n (en/sw/fr)", "✓"],
            ["a11y baseline", "✓"],
            ["Tests (unit + e2e)", "✓ Coverage still light"],
        ], colWidths=[110 * mm, 60 * mm]),
        Spacer(1, 5 * mm),
        Paragraph("2.2 Missing / needs work before launch", S["H3"]),
        gtable([
            ["Gap", "Fix"],
            ["6 files marked @ts-nocheck (Prisma schema drift)", "Realign schema.prisma; see Section 9.5"],
            ["ShareableLink / Offering / Holding in Redis only", "Migrate to Prisma models; Section 9.6"],
            ["Invoice PDF worker not registered in job dispatcher", "Add case in jobs/workers/index.ts"],
            ["Sidebar links for /integrations, /share, /investors", "Add nav entries"],
            ["PWA icons (192, 512)", "Generate + drop in public/icons/"],
            ["FE i18n not applied to component copy", "Sweep pages, replace strings with t()"],
            ["No admin dashboard for platform ops", "Build post-launch (v1.1)"],
            ["No refund/reversal UI", "Build post-launch (v1.1)"],
            ["No KYC screening real provider (Smile/Comply)", "Wire credentials once accounts open"],
            ["No production Sentry/Datadog", "Wire before launch (Section 15)"],
            ["No Terms of Service / Privacy Policy pages content", "Lawyer-drafted; Section 13"],
            ["No offline runtime exercise", "Manual PWA install test in prod build"],
            ["No load test", "k6 / Artillery in staging before launch"],
        ], colWidths=[110 * mm, 60 * mm]),
        PageBreak(),
    ]

    # ═══════════════ 3. COMPANY SETUP ═══════════════
    story += [
        Paragraph("3. COMPANY SETUP (KENYA)", S["H2"]),
        Paragraph(
            "Fintechs in Kenya typically register as a Private Limited Company. "
            "Sole proprietorship will not work — you cannot open a business bank "
            "account, Daraja API access, or Flutterwave merchant account without "
            "a limited company.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("3.1 Company registration (BRS eCitizen)", S["H3"]),
        Paragraph(
            "Portal: <b>brs.ecitizen.go.ke</b> (Business Registration Service).<br/>"
            "1) Reserve a name (KES 150, 30 days). Suggest: <b>Pamoja Wealth Ltd</b> "
            "(check availability; if taken, add \"Africa\" / \"Kenya\" / \"Digital\").<br/>"
            "2) Prepare CR1 (registration), CR8 (registered office), Statement of "
            "Nominal Capital, Memorandum + Articles of Association.<br/>"
            "3) Directors' ID scans + passport photos + KRA PINs.<br/>"
            "4) Beneficial ownership form (BO1) — Beneficial Ownership Regulations 2020 "
            "requires disclosure of anyone holding &gt;10% shares.<br/>"
            "5) Pay stamp duty + registration fee (~KES 10,650 for KES 100k nominal).<br/>"
            "6) Receive Certificate of Incorporation + Company Number.",
            S["Body"]),
        Paragraph("Timeline: 3-14 days. Expedite available.", S["Muted"]),
        Spacer(1, 4 * mm),
        Paragraph("3.2 KRA (Kenya Revenue Authority)", S["H3"]),
        Paragraph(
            "Portal: <b>itax.kra.go.ke</b><br/>"
            "1) Register company for a <b>KRA PIN</b> (mandatory).<br/>"
            "2) Register for <b>VAT</b> if annual turnover &gt; KES 5M (register "
            "voluntarily earlier — you need it for Daraja Paybill).<br/>"
            "3) Register for <b>PAYE</b> (employees) + <b>NHIF</b> (SHA now) + "
            "<b>NSSF</b> once you hire.<br/>"
            "4) Register for <b>Corporate Income Tax</b> (30% resident rate).<br/>"
            "5) Register for <b>Digital Service Tax</b> if platform revenue &gt; "
            "threshold — 1.5% on non-resident, 3% Digital-Asset-Tax for crypto.<br/>"
            "6) Register for <b>Withholding Tax</b> (payments to non-residents).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("3.3 Local county business permit", S["H3"]),
        Paragraph(
            "Apply at your county HQ (Nairobi: nairobi.go.ke). Single Business "
            "Permit — office-based small tech services costs ~KES 15k-30k/yr "
            "depending on staff count + premises size. Renew annually.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("3.4 Office / registered address", S["H3"]),
        Paragraph(
            "You need a physical Kenyan address for CR8 + KRA. Options:<br/>"
            "• <b>Co-working</b> (Nairobi Garage, iHub, Ikigai) — KES 8k-40k/mo.<br/>"
            "• <b>Virtual office</b> (Regus, Servcorp) — KES 5k-15k/mo, meeting rooms per-use.<br/>"
            "• <b>Serviced office</b> — KES 40k+/mo.<br/>"
            "Do NOT use a personal home address for a fintech; regulators visit.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("3.5 ODPC (Office of the Data Protection Commissioner) registration", S["H3"]),
        Paragraph(
            "Kenya Data Protection Act 2019 requires <b>every</b> data controller / "
            "processor to register with ODPC.<br/>"
            "Portal: <b>odpc.go.ke</b><br/>"
            "Fee: KES 4,000 (annual, small enterprise) up to KES 40,000 (large).<br/>"
            "Required data: DPO details, purpose of processing, categories of data "
            "subjects, retention periods, cross-border transfer basis (schrems II "
            "equivalent). Renewal annual.",
            S["Warn"]),
        Paragraph("Without ODPC registration, you cannot legally collect Kenyan user data. "
                  "Fines up to KES 5M or 1% of annual turnover.", S["Danger"]),
        PageBreak(),
    ]

    # ═══════════════ 4. BUSINESS BANK ═══════════════
    story += [
        Paragraph("4. BUSINESS BANK ACCOUNT", S["H2"]),
        Paragraph(
            "You need a Kenyan business current account before Safaricom will "
            "provision a live Daraja paybill and before Flutterwave settles.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("4.1 Bank options (fintech-friendly)", S["H3"]),
        gtable([
            ["Bank", "Fintech friendliness", "Min opening balance", "Notes"],
            ["Equity Bank", "High — deep Daraja + SME playbook", "KES 5,000", "Eazzy API for integrations"],
            ["KCB", "High — largest, Daraja partner", "KES 5,000-20,000", "Vooma wallet + KCB M-Pesa"],
            ["NCBA", "High — has fintech desk", "KES 10,000", "Loop app for direct API"],
            ["Cooperative Bank", "Medium — chama-friendly historically", "KES 5,000", "Good for reaching SACCO segment"],
            ["DTB", "Medium — regional footprint", "KES 10,000", "Good for TZ/UG cross-border"],
            ["Family Bank", "Medium — micro-lending focus", "KES 5,000", ""],
            ["Standard Chartered", "Low — high fees, corporate focus", "KES 100,000+", "Skip for MVP"],
            ["Stanbic", "Medium — corporate/SME split", "KES 25,000", ""],
        ], colWidths=[35 * mm, 40 * mm, 30 * mm, 65 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Recommendation:</b> Open with Equity or KCB first. Both integrate cleanly with Daraja and Flutterwave.", S["OK"]),
        Spacer(1, 4 * mm),
        Paragraph("4.2 Documents required", S["H3"]),
        Paragraph(
            "• Certificate of Incorporation<br/>"
            "• Memorandum + Articles of Association<br/>"
            "• KRA PIN certificate (company + all directors)<br/>"
            "• Directors' + signatories' ID (national ID or passport)<br/>"
            "• Directors' passport photos<br/>"
            "• Board resolution to open account (template from bank)<br/>"
            "• Beneficial ownership declaration (per BOI Regs)<br/>"
            "• Source of funds declaration<br/>"
            "• Proof of physical office address (lease agreement or utility bill)<br/>"
            "• Business permit copy<br/>"
            "• Sample of expected transaction flow (fintech-specific)",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("4.3 Additional accounts to open", S["H3"]),
        Paragraph(
            "• <b>Operating account</b> — day-to-day AR/AP.<br/>"
            "• <b>Trust / escrow account</b> — customer float. MUST be segregated from "
            "operating. If you hold customer money at all, this is required by CBK "
            "guidance for payment aggregators.<br/>"
            "• <b>Fixed deposit</b> — reserve capital, earns ~10-12% Kenya CBR-linked.<br/>"
            "• <b>USD account</b> — for offshore SaaS costs (Anthropic, AWS, GitHub, etc.).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("4.4 Timeline", S["H3"]),
        Paragraph("2-4 weeks for account activation + wire capability. Start early.", S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 5. REGULATORY ═══════════════
    story += [
        Paragraph("5. REGULATORY LANDSCAPE (KENYA)", S["H2"]),
        Paragraph(
            "Fintech regulation in Kenya has 4 loci: CBK (money), ODPC (data), "
            "CMA (investment products), SASRA (SACCOs). Your obligations depend "
            "on which product surface you activate.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("5.1 CBK — Central Bank of Kenya", S["H3"]),
        Paragraph(
            "Regulation of primary concern:<br/>"
            "• <b>National Payment System Act 2011</b> — payment service providers.<br/>"
            "• <b>Digital Credit Providers Regulations 2022</b> — anyone offering "
            "credit digitally MUST be licensed. If you launch loans, you need this "
            "license. Application fee KES 1M (application) + KES 5M capital.<br/>"
            "• <b>Payment aggregator</b> — Pamoja Wealth as a channel is fine because "
            "money moves through licensed rails (M-Pesa, banks). You are an aggregator, "
            "not a PSP. Confirm with CBK before launch.<br/>"
            "• <b>e-Money issuer</b> — if you hold customer float in a Pamoja-branded "
            "wallet, CBK considers you an e-money issuer. Trust account (Section 4.3) "
            "is the standard workaround.",
            S["Body"]),
        Paragraph("Launch loans without DCP license = illegal. Ship v1 without loans, add license Q3.",
                  S["Danger"]),
        Spacer(1, 4 * mm),
        Paragraph("5.2 ODPC — Office of Data Protection Commissioner", S["H3"]),
        Paragraph(
            "• <b>Data Protection Act 2019</b> registration (Section 3.5).<br/>"
            "• Appoint a <b>Data Protection Officer</b> (in-house or fractional).<br/>"
            "• Publish <b>Privacy Policy</b> covering purpose, retention, transfer, rights.<br/>"
            "• Enable data subject rights: access, erasure, portability. "
            "<code>GET /kyc/export</code> + <code>DELETE /kyc/erase</code> endpoints "
            "already exist in the codebase.<br/>"
            "• Cross-border transfers (SendGrid US, Anthropic US, AWS): require a "
            "lawful basis. Use Standard Contractual Clauses or user consent.<br/>"
            "• Breach notification within <b>72 hours</b>.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("5.3 CMA — Capital Markets Authority", S["H3"]),
        Paragraph(
            "Applies if you list investment products (T-bills, MMFs) inside Pamoja.<br/>"
            "• Yield marketplace (Section 9): you're a <b>digital distributor</b>. "
            "You must partner with a CMA-licensed fund manager (CIC AM, Sanlam, "
            "ICEA Lion) rather than issue your own. Their license covers the sale.<br/>"
            "• If you offer chama shares as securities (investor path in this "
            "session), that's a Securities offering under CMA. Under the "
            "<b>Regulatory Sandbox</b> you can pilot up to 24 months with limited "
            "customer base. Apply at cma.or.ke.<br/>"
            "• Crowdfunding-lite (donate path): typically outside CMA scope because "
            "no returns promised. Confirm with counsel.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("5.4 SASRA — SACCO Societies Regulatory Authority", S["H3"]),
        Paragraph(
            "If Pamoja becomes a SACCO or offers SACCO-like services (deposit + "
            "loan with a bond), SASRA regulates. Recommend NOT going down this path "
            "for MVP. Cross-chama lending marketplace (Section 9 P2-27) sits in a "
            "grey area — position as chama-to-chama peer lending, not SACCO.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("5.5 AML / CFT (Anti-Money-Laundering)", S["H3"]),
        Paragraph(
            "• <b>Proceeds of Crime and Anti-Money-Laundering Act (POCAMLA) 2009</b> "
            "applies. Register as a <b>Reporting Institution</b> with FRC (Financial "
            "Reporting Centre).<br/>"
            "• KYC tiers already coded (services/kyc.service.ts): Tier 0 phone, "
            "Tier 1 ID, Tier 2 selfie liveness, Tier 3 proof of address. Match "
            "CBK DCP Regulations 2025 thresholds.<br/>"
            "• PEP + sanctions screening on every user (Comply Advantage / Smile "
            "Identity endpoints already wired).<br/>"
            "• Suspicious Transaction Reports (STR) submission to FRC within 24hr "
            "of detection. Model + queue already in schema (SuspiciousTransactionReport).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("5.6 Kenya Consumer Protection Act", S["H3"]),
        Paragraph(
            "• Clear pricing disclosure (subscription tiers, fees, take-rates).<br/>"
            "• 14-day cooling-off period for online subscription contracts.<br/>"
            "• Dispute resolution mechanism — set up support ticket flow "
            "(SupportPage already exists).",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 6. SAFARICOM DARAJA ═══════════════
    story += [
        Paragraph("6. SAFARICOM DARAJA + PAYBILL", S["H2"]),
        Paragraph(
            "M-Pesa is the payment rail. Without a live paybill or till number, "
            "Pamoja Wealth cannot accept a single shilling.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("6.1 Step 1 — Sandbox access (do this first, free)", S["H3"]),
        Paragraph(
            "• Sign up at <b>developer.safaricom.co.ke</b><br/>"
            "• Create a sandbox app — instant.<br/>"
            "• You get: Consumer Key, Consumer Secret, Test Passkey, Test Shortcode "
            "174379 (STK Push), Test MSISDN 254708374149.<br/>"
            "• Wire into <code>.env</code>. Test STK Push flow end-to-end (already coded).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("6.2 Step 2 — Apply for a Paybill", S["H3"]),
        Paragraph(
            "Paybill = your unique 6-digit number. Customers pay by choosing "
            "\"Lipa na M-Pesa → Pay Bill\" → your number → account (chama).<br/>"
            "1) Apply at any Safaricom shop OR via <b>M-Pesa Business Portal</b> "
            "(mpesabusiness.safaricom.co.ke).<br/>"
            "2) Documents: Certificate of Incorporation, KRA PIN, IDs of "
            "signatories, bank confirmation letter (from Section 4), business "
            "permit.<br/>"
            "3) Fee: KES 25,000-50,000 setup + ongoing per-txn fee (~1.5% + KES 1-15).<br/>"
            "4) Timeline: 5-15 business days.<br/>"
            "5) You get: shortcode + Head Office number + Store Number.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("6.3 Step 3 — Daraja production access", S["H3"]),
        Paragraph(
            "Once paybill is live:<br/>"
            "1) Return to developer.safaricom.co.ke → \"Go Live\".<br/>"
            "2) Submit \"Go Live Form\" — technical + commercial details.<br/>"
            "3) Provide: production callback URLs (from Section 6.4), business "
            "use-case description, expected TPS, security-signing evidence.<br/>"
            "4) Passkey issued (production).<br/>"
            "5) Enable specific APIs: STK Push (C2B), B2C, B2B, Ratiba (recurring), "
            "Reversal, Account Balance, Transaction Status.<br/>"
            "6) Timeline: 2-6 weeks. Track via Daraja portal.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("6.4 Step 4 — Register callback URLs", S["H3"]),
        Paragraph(
            "The overhaul added secret-path-guarded webhooks. Register with Safaricom:",
            S["Body"]),
        Paragraph(
            "STK Confirmation URL:<br/>"
            "https://api.pamojawealth.app/api/v1/wallet/deposit/mpesa-callback/&lt;MPESA_WEBHOOK_SECRET&gt;<br/>"
            "<br/>"
            "C2B Validation URL:<br/>"
            "https://api.pamojawealth.app/api/v1/webhooks/daraja/c2b/validation/&lt;MPESA_WEBHOOK_SECRET&gt;<br/>"
            "<br/>"
            "C2B Confirmation URL:<br/>"
            "https://api.pamojawealth.app/api/v1/webhooks/daraja/c2b/confirmation/&lt;MPESA_WEBHOOK_SECRET&gt;",
            S["Mono"]),
        Spacer(1, 4 * mm),
        Paragraph("6.5 Step 5 — Ratiba (recurring)", S["H3"]),
        Paragraph(
            "For subscription auto-renewal (Pro tier). Separate application after "
            "core Daraja is live. Requires additional Safaricom approval + higher "
            "underwriting.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("6.6 Ongoing costs", S["H3"]),
        gtable([
            ["Item", "Fee"],
            ["Paybill setup", "KES 25,000 - 50,000 one-off"],
            ["Per transaction (C2B)", "KES 0 - 30 tiered by amount"],
            ["B2C withdrawal (per txn)", "KES 15 - 32"],
            ["Ratiba per collection", "KES 10 - 30"],
            ["Monthly maintenance", "KES 5,000 typical"],
        ], colWidths=[80 * mm, 60 * mm]),
        PageBreak(),
    ]

    # ═══════════════ 7. PAYMENT PROVIDERS ═══════════════
    story += [
        Paragraph("7. PAYMENT PROVIDERS", S["H2"]),
        Paragraph("Fallback + international rails.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("7.1 Flutterwave", S["H3"]),
        Paragraph(
            "For card payments + subscription billing + international remittance.<br/>"
            "1) Sign up at <b>flutterwave.com</b> → Business.<br/>"
            "2) KYB: Company docs + directors' IDs + proof of address + business "
            "banking (Section 4).<br/>"
            "3) Once approved: Public Key, Secret Key, Encryption Key, Webhook Secret.<br/>"
            "4) Webhook URL: https://api.pamojawealth.app/api/v1/webhooks/flutterwave<br/>"
            "5) Enable subscriptions product for recurring billing (Pro/Enterprise tiers).<br/>"
            "Fee: 1.4% + KES 22 per card. FX 3.8%.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("7.2 Stripe", S["H3"]),
        Paragraph(
            "For USD/EUR customers + eventual international expansion. Stripe "
            "Atlas not needed if you're Kenyan-registered; use Stripe with your "
            "Kenyan entity.<br/>"
            "Sign up at <b>stripe.com/ke</b>. Standard KYB. 2.9% + KES 22 typical.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("7.3 Bank-to-bank (Pesalink)", S["H3"]),
        Paragraph(
            "For high-value chama withdrawals to member bank accounts. Enable via "
            "your operating bank (Section 4) — most banks expose Pesalink API. "
            "Fee: KES 30 per txn typical. Adds settlement rails without needing "
            "Daraja B2C (Daraja B2C settles in 3-5 days; Pesalink is instant).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("7.4 Airtel Money + T-Kash", S["H3"]),
        Paragraph(
            "For non-Safaricom customers (~7% of Kenya). Both offer APIs similar "
            "to Daraja. Optional for MVP — most chamas are on Safaricom. Add "
            "post-launch if you see demand.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 8. THIRD-PARTY MASTER ═══════════════
    story += [
        Paragraph("8. THIRD-PARTY SERVICE ACCOUNTS TO OPEN", S["H2"]),
        Paragraph(
            "Every SaaS you'll pay for pre-launch. Grouped by function. Fill "
            "corresponding env vars (Section 17).",
            S["Body"]),
        Spacer(1, 4 * mm),
    ]
    story += [gtable([
        ["Service", "Purpose", "Est. monthly cost (v1)"],
        ["Safaricom Daraja + Paybill", "M-Pesa rail", "KES 5,000 + txn fees"],
        ["Flutterwave", "Cards + international", "0% until you transact"],
        ["Stripe", "USD/EUR (optional)", "0% until you transact"],
        ["SendGrid", "Transactional email", "USD 20 (Essentials 50k emails)"],
        ["Africa's Talking", "SMS + USSD gateway", "KES 0.8-1.5 per SMS"],
        ["Firebase / FCM", "Push notifications", "Free (Spark plan up to 5k users)"],
        ["Anthropic Claude", "Rule compiler + AI insights", "USD 20-200 usage"],
        ["AWS S3 or MinIO Cloud", "Document + PDF storage", "USD 10-50"],
        ["Postgres (RDS/Supabase/DigitalOcean)", "Primary DB", "USD 25-150"],
        ["Redis Cloud", "Cache + queue + real-time", "USD 15-80"],
        ["DigitalOcean / Render / Fly.io", "Backend hosting", "USD 20-100"],
        ["Vercel / Cloudflare Pages", "Frontend hosting", "USD 0-20"],
        ["Slack (Business)", "OAuth integration", "USD 8/user (your team)"],
        ["Google Workspace", "OAuth integration", "USD 6/user (your team)"],
        ["Zoom", "OAuth integration", "USD 15/host"],
        ["QuickBooks / Xero", "OAuth integration + your books", "USD 30 QB / USD 39 Xero"],
        ["WhatsApp Business Platform", "Bot channel", "Free tier 1000 conv/mo"],
        ["Daily.co", "Video calls", "USD 99 team + usage"],
        ["Smile Identity", "KYC ID verification", "USD 0.30-1.50 per check"],
        ["Comply Advantage", "PEP + sanctions", "USD 0.50-2.00 per check (contract)"],
        ["Sentry", "Error monitoring", "USD 26 (Team)"],
        ["Datadog", "APM + logs", "USD 15/host"],
        ["exchangerate.host", "FX rates", "Free"],
        ["1Password / Vaultwarden", "Secret management (team)", "USD 8/user"],
        ["Domain (pamojawealth.app)", "DNS + registration", "USD 15/yr"],
        ["Cloudflare", "DNS + CDN + WAF", "Free / USD 20/mo Pro"],
        ["Let's Encrypt", "TLS certificates", "Free"],
    ], colWidths=[55 * mm, 65 * mm, 45 * mm])]
    story += [
        Spacer(1, 4 * mm),
        Paragraph("<b>Rough monthly total pre-revenue:</b> USD 400 - 1,200 depending on scale + AI usage. Add ~KES 15k for Safaricom fees.", S["OK"]),
        PageBreak(),
    ]

    # ═══════════════ 9. TECHNICAL GO-LIVE ═══════════════
    story += [
        Paragraph("9. TECHNICAL GO-LIVE CHECKLIST", S["H2"]),
        Paragraph(
            "Details in the sibling <code>PAMOJA_POST_SESSION_SETUP.pdf</code>. "
            "This section is the flight-check summary.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("9.1 Pre-flight (blocking)", S["H3"]),
        Paragraph(
            "☐ Rotate every secret (JWT, encryption key, all API keys)<br/>"
            "☐ Delete <code>.env</code> from git history (<code>git filter-repo</code>)<br/>"
            "☐ Encrypt existing plaintext 2FA secrets<br/>"
            "☐ Apply <code>chat_upgrades.sql</code> migration<br/>"
            "☐ Realign <code>schema.prisma</code> for 6 @ts-nocheck files<br/>"
            "☐ Add ShareableLink + Offering + Holding Prisma models<br/>"
            "☐ Register invoice PDF worker in job dispatcher<br/>"
            "☐ PWA icons (192, 512) generated + in public/icons/<br/>"
            "☐ Sidebar nav for /integrations, /chamas/:id/share, /chamas/:id/investors<br/>"
            "☐ i18n string sweep — replace hardcoded English<br/>"
            "☐ Terms of Service + Privacy Policy pages content in place<br/>"
            "☐ Both tsc --noEmit pass<br/>"
            "☐ Both npm run build succeeds",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("9.2 Infrastructure", S["H3"]),
        Paragraph(
            "☐ Production Postgres provisioned + backups configured<br/>"
            "☐ Production Redis provisioned<br/>"
            "☐ Prisma migrations applied<br/>"
            "☐ Backend deployed (DigitalOcean / Fly.io / Render)<br/>"
            "☐ Frontend deployed (Vercel / Cloudflare Pages)<br/>"
            "☐ DNS: A / AAAA records for pamojawealth.app + api.pamojawealth.app<br/>"
            "☐ TLS certs via Let's Encrypt or Cloudflare<br/>"
            "☐ Cloudflare WAF + rate-limiting rules<br/>"
            "☐ Sentry DSN configured (BE + FE)<br/>"
            "☐ Datadog agent installed<br/>"
            "☐ Uptime monitoring (BetterUptime / UptimeRobot)<br/>"
            "☐ Log retention policy (Datadog 15d, cold storage 12mo)",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("9.3 Load + security test", S["H3"]),
        Paragraph(
            "☐ Load test with k6 or Artillery — target 100 concurrent chamas, 500 rps<br/>"
            "☐ Basic pen test (OWASP Top 10): SQLi, XSS, CSRF, IDOR<br/>"
            "☐ Verify all M-Pesa webhook responses in 3s or less<br/>"
            "☐ Verify socket.io holds 1000+ connections<br/>"
            "☐ Verify rate limits actually kick in",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("9.4 Backup + disaster recovery", S["H3"]),
        Paragraph(
            "☐ Postgres daily automated backup (7-day retention minimum)<br/>"
            "☐ Redis persistence enabled (AOF)<br/>"
            "☐ S3 versioning enabled on document bucket<br/>"
            "☐ Recovery runbook written + tested<br/>"
            "☐ RTO ≤ 4h, RPO ≤ 15min",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 10. KYC / AML ═══════════════
    story += [
        Paragraph("10. KYC / AML / CONSUMER PROTECTION", S["H2"]),
        Paragraph("10.1 KYC tier design (implemented)", S["H3"]),
        gtable([
            ["Tier", "Requirement", "Contribution limit"],
            ["Tier 0", "Phone number verified (OTP)", "KES 10,000 total"],
            ["Tier 1", "National ID + name match", "KES 100,000 total"],
            ["Tier 2", "Selfie liveness + ID photo match", "KES 1,000,000 total"],
            ["Tier 3", "Proof of address + enhanced DD", "Unlimited"],
        ], colWidths=[20 * mm, 90 * mm, 60 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("10.2 Smile Identity onboarding", S["H3"]),
        Paragraph(
            "Sign up: <b>portal.smileidentity.com</b><br/>"
            "Products: ID Verification (Kenya national ID + KRA PIN + Passport), "
            "Biometric Liveness, Document Verification.<br/>"
            "Contract typically 12-month, ~USD 500-1500 setup + per-check.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("10.3 Comply Advantage (PEP + sanctions)", S["H3"]),
        Paragraph(
            "Sales-led. Book demo at complyadvantage.com. Expect ~USD 15k/yr minimum contract.<br/>"
            "Cheaper alternative: <b>KYC-Chain</b> or <b>Refinitiv World-Check One</b> (Reuters).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("10.4 FRC registration (Financial Reporting Centre)", S["H3"]),
        Paragraph(
            "Register as Reporting Institution under POCAMLA:<br/>"
            "1) File Form R1 at frc.go.ke.<br/>"
            "2) Appoint a Money Laundering Reporting Officer (MLRO). Typically the founder or CFO for MVP.<br/>"
            "3) Write + adopt AML/CFT Policy (template available from FRC).<br/>"
            "4) Set up STR filing workflow — model already in DB (SuspiciousTransactionReport).",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("10.5 Data Protection Officer", S["H3"]),
        Paragraph(
            "Required if you process personal data at scale. Options:<br/>"
            "• In-house — founder wears the hat for MVP (declare on ODPC form).<br/>"
            "• Fractional / DPO-as-a-Service — Kenya firms like ALN, Anjarwalla &amp; "
            "Khanna offer.<br/>"
            "• Publish DPO email address on the site.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 11. INSURANCE ═══════════════
    story += [
        Paragraph("11. INSURANCE &amp; INDEMNITY", S["H2"]),
        Paragraph(
            "Fintechs need multiple layers of insurance. Get quotes from ICEA "
            "LION, Jubilee, or Britam.",
            S["Body"]),
        Spacer(1, 4 * mm),
        gtable([
            ["Cover", "Purpose", "Est. premium"],
            ["Cyber liability", "Data breach, ransomware, DDoS", "KES 100k-500k/yr"],
            ["Professional indemnity (PI)", "Software errors → customer loss", "KES 80k-300k/yr"],
            ["Fidelity guarantee / crime", "Employee fraud, misappropriation", "KES 50k-200k/yr"],
            ["Directors' &amp; Officers'", "Personal liability of directors", "KES 100k-400k/yr"],
            ["General liability", "Slip-and-fall at office etc.", "KES 30k/yr"],
            ["WIBA (Workers Compensation)", "Statutory — required per employee", "1-2% of payroll"],
            ["Group medical / SHA", "Employees — replaces old NHIF", "SHA now statutory"],
        ], colWidths=[45 * mm, 85 * mm, 35 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("Bundle → broker like <b>Barnes-Insurance</b>, <b>ICEA LION SME</b>, or <b>Turaco</b> for the bundle.", S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 12. TEAM ═══════════════
    story += [
        Paragraph("12. TEAM &amp; HIRING", S["H2"]),
        Paragraph("12.1 Minimum viable team for launch", S["H3"]),
        gtable([
            ["Role", "Focus", "Kenyan salary range /mo"],
            ["Founder / CEO", "Vision, fundraising, regulatory", "-"],
            ["Founding engineer (full-stack)", "Ship features + ops", "KES 250k - 500k"],
            ["Product / Growth", "Onboarding, marketing", "KES 150k - 350k"],
            ["Community / Support", "First-line customer support", "KES 60k - 120k"],
            ["DPO / MLRO (fractional / founder)", "Compliance", "In-house or KES 50k retainer"],
            ["Bookkeeper (part-time)", "Monthly books + KRA filings", "KES 30k - 80k"],
        ], colWidths=[55 * mm, 75 * mm, 40 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("12.2 Employment setup", S["H3"]),
        Paragraph(
            "• Employment contracts (see FKE templates)<br/>"
            "• PAYE registration + monthly filing<br/>"
            "• NSSF Tier 1 + Tier 2 contribution (up to KES 4.32k/mo employer + employee)<br/>"
            "• SHA (Social Health Authority — 2.75% of gross)<br/>"
            "• Housing Levy (1.5% of gross, split employer/employee)<br/>"
            "• Statutory annual leave (21 working days)<br/>"
            "• Optional: employee ESOP for founding engineers (KES 20-40k legal setup)",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 13. LEGAL DOCS ═══════════════
    story += [
        Paragraph("13. LEGAL DOCUMENTS TO PUBLISH", S["H2"]),
        Paragraph(
            "All must be lawyer-reviewed. Rough scope + templates below. Budget "
            "KES 200,000-500,000 for a fintech-savvy Kenyan lawyer to draft all.",
            S["Body"]),
        Spacer(1, 4 * mm),
        gtable([
            ["Document", "Purpose", "Priority"],
            ["Terms of Service", "Binding user contract, dispute resolution, liability caps", "CRITICAL"],
            ["Privacy Policy", "DPA-compliant disclosure of data handling", "CRITICAL"],
            ["Cookie Policy", "If you use analytics cookies", "HIGH"],
            ["AML/CFT Policy", "Internal — POCAMLA + FRC requirement", "CRITICAL"],
            ["Data Retention Policy", "How long you hold what", "HIGH"],
            ["Data Breach Response Plan", "Required by DPA", "HIGH"],
            ["Vendor DPAs (Data Processing Agreements)", "With SendGrid, AWS, Anthropic, etc.", "HIGH"],
            ["User consent flow", "Explicit opt-in per DPA Section 30", "CRITICAL"],
            ["Chama Constitution template", "Model bylaws users can adopt", "HIGH"],
            ["Investor SAFE / Convertible Note template", "For investor path", "HIGH"],
            ["KYC Refusal + Appeals Policy", "Fairness under DCP Regs", "MEDIUM"],
            ["Complaints Handling Policy", "Consumer Protection Act", "HIGH"],
            ["Refunds &amp; Reversals Policy", "M-Pesa dispute posture", "HIGH"],
        ], colWidths=[65 * mm, 85 * mm, 20 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("Kenyan fintech law firms:", S["H3"]),
        Paragraph(
            "• <b>ALN Kenya (Anjarwalla &amp; Khanna)</b> — top-tier, expensive.<br/>"
            "• <b>Kaplan &amp; Stratton</b> — deep fintech bench.<br/>"
            "• <b>Bowmans Kenya</b> — international arm, thorough.<br/>"
            "• <b>Wamae &amp; Allen</b> — mid-market, startup-friendly.<br/>"
            "• <b>MMAN Advocates</b> — good for compliance ops.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 14. LAUNCH RUNBOOK ═══════════════
    story += [
        Paragraph("14. LAUNCH RUNBOOK (T-minus timeline)", S["H2"]),
        Paragraph("Assumes you're 8 weeks out. Compress if needed.", S["Body"]),
        Spacer(1, 4 * mm),
        gtable([
            ["Week", "Milestones"],
            ["T-8w", "Company registered · KRA PIN · Bank account initiated · Domain registered · Sandbox Daraja"],
            ["T-7w", "Bank account live · Paybill application submitted · Business permit issued · ODPC registered"],
            ["T-6w", "Lawyer engaged (T&C draft) · Insurance quotes · Team hiring · Sentry/Datadog setup"],
            ["T-5w", "Legal docs ready for review · Paybill number issued · Daraja go-live form submitted"],
            ["T-4w", "Prod infra provisioned · Prisma migrations applied · Load test in staging"],
            ["T-3w", "Daraja production access · KYC provider live (Smile) · Pen test · Fix findings"],
            ["T-2w", "Beta users invited (10 chamas, 100 users) · Monitor 24/7 · Iterate"],
            ["T-1w", "Legal docs finalized + published · FRC registration · WhatsApp bot approved · Press outreach"],
            ["T-0", "PUBLIC LAUNCH — social + PR + email"],
            ["T+1w", "24/7 war room · Fix any incidents · Analytics review"],
            ["T+4w", "First earnings review · Roadmap prioritization · Post-mortem"],
        ], colWidths=[20 * mm, 150 * mm]),
        PageBreak(),
    ]

    # ═══════════════ 15. POST-LAUNCH MONITORING ═══════════════
    story += [
        Paragraph("15. POST-LAUNCH MONITORING", S["H2"]),
        Paragraph("15.1 Dashboards to build in week 1", S["H3"]),
        Paragraph(
            "• DAU / WAU / MAU trend<br/>"
            "• New chamas per day<br/>"
            "• Contribution volume (KES/day)<br/>"
            "• M-Pesa success rate (STK completion %)<br/>"
            "• Callback latency (P50/P95)<br/>"
            "• Failed payments — categorized by error code<br/>"
            "• Churn (chamas going dormant)<br/>"
            "• Support ticket count + median resolution<br/>"
            "• Referral funnel (from Section 9 gamified referral)<br/>"
            "• Loan default rate<br/>"
            "• Ledger invariant (must stay at 0 delta)",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("15.2 SLIs / SLOs", S["H3"]),
        gtable([
            ["SLI", "SLO"],
            ["API p95 latency", "&lt; 500 ms"],
            ["M-Pesa callback success", "&gt; 99.5%"],
            ["Uptime", "99.9% monthly"],
            ["WebSocket connection success", "&gt; 99%"],
            ["STK Push completion rate", "&gt; 75% (industry benchmark)"],
            ["Error rate (5xx)", "&lt; 0.1%"],
        ], colWidths=[70 * mm, 70 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("15.3 Incident response", S["H3"]),
        Paragraph(
            "• PagerDuty / OpsGenie for after-hours alerts.<br/>"
            "• Incident sev levels: SEV1 (outage), SEV2 (partial), SEV3 (degraded).<br/>"
            "• On-call rotation: founding engineer + one backup, weekly rotation.<br/>"
            "• Post-mortem template — publish internally within 48hr of resolution.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 16. BUDGET ═══════════════
    story += [
        Paragraph("16. BUDGET &amp; TIMELINE", S["H2"]),
        Paragraph("16.1 One-time launch costs (Kenya)", S["H3"]),
        gtable([
            ["Item", "Cost (KES)"],
            ["Company registration + stamp duty", "12,000"],
            ["ODPC registration (small enterprise)", "4,000"],
            ["County business permit", "20,000"],
            ["Bank account opening + KYC", "0 - 20,000"],
            ["Paybill setup", "40,000"],
            ["Lawyer (T&amp;C, Privacy, AML, DPAs)", "300,000"],
            ["Insurance bundle (annual)", "400,000"],
            ["Smile Identity setup", "80,000"],
            ["Comply Advantage annual contract", "1,500,000"],
            ["Load test consulting (optional)", "150,000"],
            ["Pen test", "200,000"],
            ["Design polish (icons, branding)", "100,000"],
            ["Legal review 2FA / crypto disclosures", "50,000"],
            ["Total one-off", "≈ 2,900,000"],
        ], colWidths=[110 * mm, 60 * mm]),
        Spacer(1, 4 * mm),
        Paragraph("16.2 Recurring monthly (steady state, ~1000 active users)", S["H3"]),
        gtable([
            ["Item", "Cost (KES / mo)"],
            ["Infra (DB + Redis + hosts + storage)", "40,000"],
            ["SaaS (SendGrid + Sentry + Datadog + etc.)", "25,000"],
            ["AI (Anthropic usage)", "20,000"],
            ["SMS + USSD (Africa's Talking)", "35,000"],
            ["M-Pesa txn fees (pass-through)", "variable"],
            ["Team (5 people avg)", "800,000"],
            ["Rent + utilities", "60,000"],
            ["Insurance amortized", "35,000"],
            ["Compliance / accounting", "40,000"],
            ["Total monthly OPEX (excl. txn fees)", "≈ 1,055,000"],
        ], colWidths=[110 * mm, 60 * mm]),
        Spacer(1, 4 * mm),
        Paragraph(
            "<b>Runway needed:</b> at 12-month runway on KES 1.05M/mo OPEX + KES "
            "2.9M one-off = ≈ <b>KES 15.5M (~USD 120k)</b> seed funding.",
            S["Body"]),
        PageBreak(),
    ]

    # ═══════════════ 17. MASTER .env ═══════════════
    story += [
        Paragraph("17. MASTER .env — BOTH REPOS", S["H2"]),
        Paragraph(
            "Reproduced here for reference. Fill values from Sections 4-8. Do NOT commit.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("17.1 pamoja-wealth-backend/.env", S["H3"]),
        Paragraph(
            "NODE_ENV=production<br/>PORT=3000<br/>API_URL=https://api.pamojawealth.app<br/>"
            "CORS_ORIGINS=https://pamojawealth.app,capacitor://localhost<br/><br/>"
            "DATABASE_URL=postgresql://user:pass@host:5432/pamoja<br/>"
            "REDIS_URL=redis://user:pass@host:6379<br/><br/>"
            "JWT_SECRET=&lt;openssl rand -hex 32&gt;<br/>"
            "JWT_REFRESH_SECRET=&lt;openssl rand -hex 32&gt;<br/>"
            "ENCRYPTION_KEY=&lt;64 hex chars&gt;<br/><br/>"
            "MPESA_CONSUMER_KEY=<br/>MPESA_CONSUMER_SECRET=<br/>MPESA_PASSKEY=<br/>"
            "MPESA_SHORTCODE=&lt;your paybill&gt;<br/>MPESA_ENVIRONMENT=production<br/>"
            "MPESA_CALLBACK_BASE=https://api.pamojawealth.app/api/v1/wallet<br/>"
            "MPESA_WEBHOOK_SECRET=&lt;openssl rand -base64 48&gt;<br/>"
            "DARAJA_ALLOWED_IPS=<br/>FEATURE_MPESA_ENABLED=true<br/><br/>"
            "FLUTTERWAVE_PUBLIC_KEY=<br/>FLUTTERWAVE_SECRET_KEY=<br/>"
            "FLUTTERWAVE_ENCRYPTION_KEY=<br/>FLUTTERWAVE_WEBHOOK_SECRET=<br/><br/>"
            "STRIPE_SECRET_KEY=<br/>STRIPE_WEBHOOK_SECRET=<br/><br/>"
            "SENDGRID_API_KEY=<br/>EMAIL_FROM=noreply@pamojawealth.com<br/><br/>"
            "AT_USERNAME=<br/>AT_API_KEY=<br/>AT_SENDER_ID=Pamoja<br/><br/>"
            "FCM_PROJECT_ID=<br/>FCM_SERVICE_ACCOUNT_JSON=<br/>"
            "VAPID_PRIVATE_KEY=<br/>VAPID_SUBJECT=mailto:hello@pamojawealth.com<br/><br/>"
            "ANTHROPIC_API_KEY=<br/>OPENAI_API_KEY=<br/><br/>"
            "S3_ENDPOINT=<br/>S3_ACCESS_KEY=<br/>S3_SECRET_KEY=<br/>"
            "S3_BUCKET=pamoja-documents<br/>S3_REGION=us-east-1<br/><br/>"
            "SLACK_CLIENT_ID=<br/>SLACK_CLIENT_SECRET=<br/>"
            "GOOGLE_CLIENT_ID=<br/>GOOGLE_CLIENT_SECRET=<br/>"
            "ZOOM_CLIENT_ID=<br/>ZOOM_CLIENT_SECRET=<br/>"
            "QUICKBOOKS_CLIENT_ID=<br/>QUICKBOOKS_CLIENT_SECRET=<br/>"
            "XERO_CLIENT_ID=<br/>XERO_CLIENT_SECRET=<br/><br/>"
            "WHATSAPP_VERIFY_TOKEN=<br/>WHATSAPP_ACCESS_TOKEN=<br/>"
            "WHATSAPP_PHONE_NUMBER_ID=<br/><br/>"
            "DAILY_API_KEY=<br/>DAILY_DOMAIN=pamoja.daily.co<br/><br/>"
            "SMILE_API_KEY=<br/>SMILE_PARTNER_ID=<br/>COMPLY_ADVANTAGE_KEY=<br/><br/>"
            "SENTRY_DSN=<br/>DATADOG_API_KEY=<br/><br/>"
            "FEATURE_CHAT_ENABLED=true<br/>FEATURE_AI_ENABLED=true<br/>"
            "FEATURE_INVESTMENTS_ENABLED=true<br/>FEATURE_RULE_ENGINE_ENFORCE=false",
            S["Mono"]),
        PageBreak(),
        Paragraph("17.2 pamoja-wealth/.env", S["H3"]),
        Paragraph(
            "VITE_API_BASE_URL=https://api.pamojawealth.app/api/v1<br/>"
            "VITE_MPESA_PAYBILL=&lt;your paybill number&gt;<br/>"
            "VITE_USE_MOCKS=false<br/>"
            "VITE_VAPID_PUBLIC_KEY=&lt;from web-push generate-vapid-keys&gt;<br/>"
            "VITE_SENTRY_DSN=<br/>"
            "VITE_DAILY_DOMAIN=pamoja.daily.co",
            S["Mono"]),
        Spacer(1, 10 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 4 * mm),
        Paragraph(
            "<b>You now have every piece of the go-live puzzle.</b> Work Section 3 → 17 in order.",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("Regenerate anytime:", S["Body"]),
        Paragraph("cd pamoja-wealth &amp;&amp; python3 scripts/generate_go_live_pdf.py", S["Mono"]),
        Spacer(1, 8 * mm),
        Paragraph(
            "This document does not constitute legal, tax, or financial advice. "
            "Verify every regulatory step with a licensed Kenyan advocate + accountant.",
            S["Muted"]),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
    print(f"Wrote {path}")


if __name__ == "__main__":
    here = os.path.dirname(os.path.abspath(__file__))
    out = os.path.join(here, "..", "docs", "PAMOJA_WEALTH_GO_LIVE_MASTER.pdf")
    build(os.path.abspath(out))
