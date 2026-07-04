#!/usr/bin/env python3
"""
PAMOJA_WEALTH_LICENSES_AND_FEES.pdf

Every license, registration, certification, and fee you will pay to make
Pamoja Wealth legally live in Kenya + expansion into UG/TZ/RW/NG. Covers
one-off costs, recurring annual costs, transaction fees, and the sequenced
priority order so you don't spend on the wrong license first.

Run:  python3 scripts/generate_licenses_pdf.py
Out:  docs/PAMOJA_WEALTH_LICENSES_AND_FEES.pdf
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
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "Pamoja Wealth — Licenses & Fees")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm,
                           datetime.now().strftime("Rev. %Y-%m-%d"))
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 12 * mm,
                             f"Page {doc.page}  ·  Confidential — Not Legal Advice")
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
    doc = SimpleDocTemplate(
        path, pagesize=A4,
        leftMargin=18 * mm, rightMargin=18 * mm,
        topMargin=28 * mm, bottomMargin=18 * mm,
    )
    S = styles()
    story = []

    # ── COVER ────────────────────────────────────────────────────────
    story += [
        Spacer(1, 15 * mm),
        Paragraph("Licenses, Certifications & Fees", S["H1"]),
        Paragraph("Every license, registration, and fee you'll pay to make "
                  "Pamoja Wealth legally live in Kenya, then scale to UG/TZ/RW/NG. "
                  "Sequenced so you spend on the right thing first.", S["Muted"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 8 * mm),
        Paragraph(f"<b>Prepared:</b> {datetime.now().strftime('%d %B %Y')}", S["Body"]),
        Paragraph("<b>Scope:</b> Kenya go-live + regional expansion", S["Body"]),
        Paragraph("<b>Product:</b> Group-savings + fundraiser + investor-onboarding platform. "
                  "Money moves via licensed rails (M-Pesa, banks, Flutterwave). "
                  "Pamoja is a <b>Payment Aggregator / Digital Distributor</b> — NOT a bank, NOT a SACCO.",
                  S["Body"]),
        Spacer(1, 5 * mm),
        Paragraph("Contents", S["H2"]),
        Paragraph(
            "1. Cost summary — headline numbers<br/>"
            "2. Priority sequence — what to pay first<br/>"
            "3. Business + tax registrations (BRS, KRA, county)<br/>"
            "4. Data-protection registration (ODPC)<br/>"
            "5. Financial regulator registrations (CBK, CMA, FRC)<br/>"
            "6. Payment-rail onboarding fees (Safaricom Daraja, Flutterwave, Stripe)<br/>"
            "7. KYC / AML vendor contracts (Smile ID, Comply Advantage)<br/>"
            "8. Insurance premiums (cyber, PI, D&amp;O, WIBA)<br/>"
            "9. Certifications you'll want (PCI DSS, SOC 2, ISO 27001)<br/>"
            "10. Regional expansion license map (UG, TZ, RW, NG)<br/>"
            "11. Ongoing recurring costs<br/>"
            "12. Legal-drafting budget<br/>"
            "13. Fines you avoid by doing this right", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Disclaimer:</b> Not legal, tax, or financial advice. Verify every "
                  "figure with a licensed Kenyan advocate + accountant. Government fees "
                  "change; treat as a planning baseline.", S["Muted"]),
        PageBreak(),
    ]

    # ── SECTION 1: COST SUMMARY ─────────────────────────────────────
    story += [
        Paragraph("1. COST SUMMARY — HEADLINE NUMBERS", S["H2"]),
        Paragraph("If you read nothing else, read this. Total capital you need before "
                  "your first customer pays you a shilling.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("1.1 One-off launch costs (Kenya only)", S["H3"]),
        gtable([
            ["Category", "Item", "Cost (KES)", "Priority"],
            ["Company", "BRS registration + stamp duty + name reservation", "10,650 – 12,000", "CRITICAL"],
            ["Tax", "KRA PIN + VAT + PAYE + NHIF + NSSF setup", "0 (free)", "CRITICAL"],
            ["Local", "Nairobi county Single Business Permit (annual)", "15,000 – 30,000", "CRITICAL"],
            ["Data", "ODPC registration (small enterprise)", "4,000", "CRITICAL"],
            ["Banking", "Bank KYC + opening docs (Equity/KCB)", "0 – 20,000", "CRITICAL"],
            ["Payments", "Safaricom Paybill setup (M-Pesa)", "25,000 – 50,000", "CRITICAL"],
            ["Payments", "Flutterwave KYB (no upfront fee)", "0", "HIGH"],
            ["Legal", "Fintech-savvy lawyer: T&amp;C, Privacy, AML, DPAs", "200,000 – 500,000", "CRITICAL"],
            ["AML", "FRC Reporting Institution registration", "0 (free)", "CRITICAL"],
            ["KYC", "Smile Identity account setup", "40,000 – 120,000", "HIGH"],
            ["Screening", "Comply Advantage annual contract", "1,500,000 – 2,500,000", "HIGH"],
            ["Insurance", "Bundle: cyber + PI + D&amp;O + WIBA (1yr)", "300,000 – 500,000", "HIGH"],
            ["Security", "Third-party pen test (OWASP Top 10)", "150,000 – 300,000", "HIGH"],
            ["Ops", "Load test consulting (optional but wise)", "100,000 – 200,000", "MEDIUM"],
            ["Brand", "Design polish + trademark (KIPI)", "80,000 – 150,000", "MEDIUM"],
            ["", "APPROX ONE-OFF TOTAL", "≈ 2.5M – 4.5M KES", ""],
        ], colWidths=[28*mm, 68*mm, 40*mm, 24*mm]),
        Spacer(1, 4 * mm),
        Paragraph("Cheapest path: skip Comply Advantage first year (use KYC-Chain or manual "
                  "spreadsheet-driven checks) and lawyer at KES 200k → total ≈ <b>1.4M KES</b> "
                  "(~USD 11k). Most conservative: full stack ≈ <b>4.5M KES</b> (~USD 35k).", S["Body"]),
        Spacer(1, 5 * mm),
        Paragraph("1.2 Recurring annual costs (Kenya, steady state)", S["H3"]),
        gtable([
            ["Item", "Annual cost (KES)"],
            ["ODPC re-registration", "4,000 – 40,000"],
            ["County business permit renewal", "15,000 – 30,000"],
            ["KRA corporate income tax (30% on profit)", "variable"],
            ["Digital Service Tax (1.5% on qualifying)", "variable"],
            ["Comply Advantage AML screening", "1,500,000 – 2,500,000"],
            ["Smile Identity KYC (~KES 40 per verified user)", "≈ 400,000 @ 10k users"],
            ["Insurance bundle renewal", "300,000 – 500,000"],
            ["FRC compliance (no annual fee, ops cost)", "0"],
            ["Trademark renewal (every 10 yr, but budget)", "5,000 / yr amortised"],
            ["Statutory: NSSF Tier 1+2, SHA 2.75%, Housing 1.5%", "≈ 12% of payroll"],
            ["Bookkeeper / auditor engagement", "300,000 – 600,000"],
            ["", "APPROX ANNUAL: 2.5M – 4.5M KES excl. tax on profits"],
        ], colWidths=[110*mm, 50*mm]),
        Spacer(1, 5 * mm),
        Paragraph("1.3 Transaction fees (passed to customers, but budget)", S["H3"]),
        gtable([
            ["Rail", "Fee"],
            ["Safaricom M-Pesa STK Push (C2B)", "KES 0 – 30 per txn (tiered)"],
            ["Safaricom B2C (payout)", "KES 15 – 33 per txn"],
            ["Safaricom Ratiba (recurring)", "KES 10 – 30 per collection"],
            ["Flutterwave card", "1.4% + KES 22"],
            ["Flutterwave FX", "3.8%"],
            ["Stripe", "2.9% + KES 22"],
            ["Pesalink (bank-to-bank)", "KES 30 typical"],
            ["Africa's Talking SMS", "KES 0.80 – 1.50 per SMS"],
            ["Africa's Talking USSD", "KES 4 – 6 per session"],
            ["WhatsApp Business Cloud API", "USD 0.005 – 0.15 per conversation (tier)"],
        ], colWidths=[80*mm, 80*mm]),
        PageBreak(),
    ]

    # ── SECTION 2: PRIORITY SEQUENCE ────────────────────────────────
    story += [
        Paragraph("2. PRIORITY SEQUENCE — WHAT TO PAY FIRST", S["H2"]),
        Paragraph("If you spend money in the wrong order, you'll pay twice or wait weeks. "
                  "This is the DAG.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Order", "Step", "Blocked by", "Cost"],
            ["1", "Reserve company name at BRS", "Nothing", "KES 150"],
            ["2", "Directors get KRA PINs (personal)", "Nothing", "Free"],
            ["3", "Register company (CR1 + BO1)", "Step 1, 2", "KES 10,650"],
            ["4", "Get company KRA PIN", "Step 3", "Free"],
            ["5", "Register for VAT (voluntary if under 5M)", "Step 4", "Free"],
            ["6", "Nairobi Single Business Permit", "Step 3, address", "KES 15-30k"],
            ["7", "Open Equity/KCB business account", "Step 3, 4, 6", "0"],
            ["8", "ODPC registration", "Step 3", "KES 4-40k"],
            ["9", "Register domain + get SSL", "Nothing", "USD 15/yr"],
            ["10", "Safaricom Daraja sandbox (test API)", "Nothing", "Free"],
            ["11", "Apply for Paybill", "Step 3, 7, 6", "KES 25-50k"],
            ["12", "Insurance quotes + bind", "Step 3", "KES 300-500k"],
            ["13", "Lawyer: T&amp;C + Privacy + AML policy", "Step 3", "KES 200-500k"],
            ["14", "FRC registration as Reporting Institution", "Step 3, 13", "Free"],
            ["15", "Daraja production access (Go-Live form)", "Step 11", "0"],
            ["16", "Smile Identity + Comply Advantage contracts", "Step 3, 7", "USD 15-25k"],
            ["17", "Pen test + fix findings", "MVP built", "KES 150-300k"],
            ["18", "Load test + fix bottlenecks", "MVP built", "KES 0-150k"],
            ["19", "Trademark filing (KIPI) — parallel", "Nothing", "KES 5k + agent"],
        ], colWidths=[12*mm, 70*mm, 40*mm, 38*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Critical path:</b> 1 → 3 → 4 → 6 → 7 → 11 → 15 unblocks live payments. "
                  "That's ~6-8 weeks with clean docs, ~10-12 weeks with hiccups.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 3: BUSINESS REGISTRATIONS ──────────────────────────
    story += [
        Paragraph("3. BUSINESS + TAX REGISTRATIONS", S["H2"]),
        Paragraph("3.1 Business Registration Service (BRS)", S["H3"]),
        Paragraph("<b>Portal:</b> brs.ecitizen.go.ke<br/>"
                  "<b>Entity:</b> Private Limited Company (Ltd) — do NOT choose sole prop.<br/>"
                  "<b>Docs:</b> CR1 (registration), CR8 (registered office), Statement of Nominal Capital, "
                  "MoA + AoA, directors' national IDs, KRA PINs, passport photos, BO1 (beneficial ownership "
                  "for anyone >10%).<br/>"
                  "<b>Fees:</b> name search KES 150 · registration KES 10,650 (KES 100k nominal) · "
                  "stamp duty on capital · certificate issued in 3-14 days.", S["Body"]),
        Paragraph("3.2 KRA (Kenya Revenue Authority)", S["H3"]),
        gtable([
            ["Registration", "Fee", "Trigger"],
            ["Company KRA PIN", "Free", "Immediately after BRS"],
            ["VAT (16%)", "Free", "Voluntary if under 5M turnover; mandatory above"],
            ["PAYE (employer)", "Free", "Once you hire employee #1"],
            ["NSSF Tier 1 + Tier 2", "Free (contribution due)", "Same trigger"],
            ["SHA (Social Health Authority)", "Free (2.75% of gross)", "Same trigger"],
            ["Housing Levy", "Free (1.5% of gross)", "Same trigger"],
            ["Corporate Income Tax (30%)", "Free", "On profits, quarterly instalments"],
            ["Digital Service Tax (1.5% / 3%)", "Free", "If threshold met on qualifying revenue"],
            ["Withholding Tax", "Free", "On payments to non-residents"],
        ], colWidths=[60*mm, 40*mm, 60*mm]),
        Spacer(1, 3 * mm),
        Paragraph("3.3 Nairobi County Single Business Permit", S["H3"]),
        Paragraph("<b>Portal:</b> nairobi.go.ke<br/>"
                  "<b>Fee:</b> KES 15,000 – 30,000 / year for office-based small tech services. "
                  "Fee tiers by staff count + premises size. Renew every January.", S["Body"]),
        Paragraph("3.4 Trademark filing (KIPI)", S["H3"]),
        Paragraph("<b>Portal:</b> kipi.go.ke<br/>"
                  "<b>What:</b> Register &quot;Pamoja Wealth&quot; word mark + logo. Blocks competitors "
                  "using your name.<br/>"
                  "<b>Fees:</b> KES 5,000 per class, filing agent typically KES 25,000 – 60,000 total. "
                  "Grant takes 12-18 months, but priority date runs from filing.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 4: ODPC ────────────────────────────────────────────
    story += [
        Paragraph("4. DATA PROTECTION REGISTRATION (ODPC)", S["H2"]),
        Paragraph("Kenya's Data Protection Act 2019 requires every data controller AND "
                  "data processor to register with the Office of the Data Protection "
                  "Commissioner. Fintechs qualify as both.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Enterprise class", "Registration fee (KES/yr)"],
            ["Small enterprise (< 10 staff / < 5M turnover)", "4,000"],
            ["Medium enterprise", "20,000"],
            ["Large enterprise (> 100 staff / > 100M turnover)", "40,000"],
        ], colWidths=[100*mm, 60*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>What you file:</b> DPO details · categories of data · lawful basis · "
                  "retention periods · cross-border transfer basis (SCC or user consent for "
                  "SendGrid US, Anthropic US, AWS US) · security measures.<br/>"
                  "<b>Renewal:</b> annual.<br/>"
                  "<b>Fines for non-compliance:</b> up to <b>KES 5,000,000</b> or <b>1% of "
                  "annual turnover</b>, whichever is higher. Plus criminal liability for the DPO.", S["Danger"]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Extras beyond registration:</b><br/>"
                  "• Appoint DPO — founder can wear the hat below 10M turnover. Above that, "
                  "fractional DPO-as-a-Service via ALN or Anjarwalla &amp; Khanna @ KES 50k/mo.<br/>"
                  "• Publish Privacy Policy on website (Section 12 covers lawyer draft cost).<br/>"
                  "• Data subject rights endpoints (already coded).<br/>"
                  "• Breach notification within <b>72 hours</b>.<br/>"
                  "• DPIA for each high-risk processing activity.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 5: FINANCIAL REGULATORS ────────────────────────────
    story += [
        Paragraph("5. FINANCIAL REGULATOR REGISTRATIONS", S["H2"]),
        Paragraph("Kenya splits financial oversight across four bodies. What you owe depends "
                  "on which product surface you activate.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("5.1 CBK — Central Bank of Kenya", S["H3"]),
        gtable([
            ["License", "When required", "Fee"],
            ["Payment aggregator (informal)", "You never hold customer money > 24h", "0 — no separate license"],
            ["Payment Service Provider (PSP)", "You hold customer float in Pamoja wallet", "Application varies; capital KES 5M"],
            ["Digital Credit Provider (DCP)", "You lend money digitally", "Application KES 1M + capital KES 5M"],
            ["e-Money Issuer", "You issue Pamoja-branded stored value", "Capital KES 20M + audit"],
            ["Money Remittance", "You do cross-border transfers directly", "Capital KES 20M + audit"],
        ], colWidths=[55*mm, 65*mm, 40*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Path of least resistance for v1:</b> Stay as a payment aggregator. "
                  "Route all money through licensed rails (Safaricom, banks, Flutterwave). "
                  "Segregate any customer float in a bank trust account. This posture keeps "
                  "you under CBK's radar until you add credit or e-money.", S["Body"]),
        Paragraph("<b>Launching loans without DCP license = illegal.</b> Timeline: 4-9 months for "
                  "DCP approval. Budget KES 3-6M in legal + fees + capital lock-up.", S["Danger"]),
        Spacer(1, 3 * mm),
        Paragraph("5.2 CMA — Capital Markets Authority", S["H3"]),
        Paragraph("<b>Triggers:</b> selling securities (chama shares in your investor path), "
                  "listing T-bills / MMFs.<br/>"
                  "<b>Path:</b> partner with a CMA-licensed fund manager (CIC AM, Sanlam, ICEA "
                  "Lion) for yield products. Their license covers the sale.<br/>"
                  "<b>Regulatory Sandbox:</b> apply at cma.or.ke — pilot up to 24 months with "
                  "limited customer base. No upfront fee, quarterly reporting required.<br/>"
                  "<b>Full license (not needed for MVP):</b> KES 2M+ application + capital "
                  "requirements starting at KES 50M for fund management.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("5.3 FRC — Financial Reporting Centre (POCAMLA)", S["H3"]),
        Paragraph("<b>Mandatory the day you touch customer money.</b><br/>"
                  "<b>Portal:</b> frc.go.ke<br/>"
                  "<b>Fee:</b> Free.<br/>"
                  "<b>What you file:</b> Form R1 — Reporting Institution registration · appoint "
                  "MLRO (Money Laundering Reporting Officer) · adopt written AML/CFT Policy · "
                  "STR filing workflow.<br/>"
                  "<b>Ongoing:</b> file Suspicious Transaction Reports within <b>24 hours</b> of "
                  "detection. Cash Transaction Reports for txns > KES 1M. Quarterly reporting.", S["Body"]),
        Paragraph("<b>SASRA — SACCO Regulator:</b> only if you become a SACCO or offer SACCO-like "
                  "deposit+loan services. Recommended: NOT this path for v1.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 6: PAYMENT RAILS ───────────────────────────────────
    story += [
        Paragraph("6. PAYMENT-RAIL ONBOARDING FEES", S["H2"]),
        Paragraph("6.1 Safaricom Daraja + Paybill", S["H3"]),
        gtable([
            ["Item", "Fee"],
            ["Daraja sandbox access", "Free"],
            ["Paybill application (M-Pesa Business Portal)", "KES 25,000 – 50,000 setup"],
            ["Paybill monthly maintenance", "KES 5,000 typical"],
            ["Daraja production Go-Live form", "Free"],
            ["Per-transaction C2B fee (to Safaricom)", "KES 0 – 30 tiered by amount"],
            ["Per-transaction B2C fee (to Safaricom)", "KES 15 – 33"],
            ["Ratiba (recurring collections)", "KES 10 – 30 per collection"],
        ], colWidths=[100*mm, 60*mm]),
        Spacer(1, 3 * mm),
        Paragraph("6.2 Flutterwave (cards + international)", S["H3"]),
        Paragraph("<b>Signup:</b> flutterwave.com → Business.<br/>"
                  "<b>KYB fee:</b> Free.<br/>"
                  "<b>Per-txn:</b> 1.4% + KES 22 per card · 3.8% FX spread.<br/>"
                  "<b>Timeline:</b> 5-14 days once KYB pack submitted.", S["Body"]),
        Paragraph("6.3 Stripe (USD/EUR — optional)", S["H3"]),
        Paragraph("<b>Signup:</b> stripe.com/ke (Kenyan entity supported).<br/>"
                  "<b>Fees:</b> 2.9% + KES 22 typical. 1% FX for non-KES.<br/>"
                  "<b>Timeline:</b> 3-7 days activation.", S["Body"]),
        Paragraph("6.4 Pesalink (bank-to-bank)", S["H3"]),
        Paragraph("<b>Route:</b> Enable via your operating bank (Equity/KCB). "
                  "Most expose Pesalink API. Fee: KES 30 per txn. Adds instant settlement "
                  "rails without Daraja B2C's 3-5 day lag.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 7: KYC/AML VENDORS ─────────────────────────────────
    story += [
        Paragraph("7. KYC / AML VENDOR CONTRACTS", S["H2"]),
        Paragraph("7.1 Smile Identity (KYC)", S["H3"]),
        Paragraph("<b>Portal:</b> portal.smileidentity.com<br/>"
                  "<b>Products:</b> ID Verification (Kenya national ID + KRA PIN + Passport), "
                  "Biometric Liveness, Document Verification.<br/>"
                  "<b>Contract:</b> typically 12-month · USD 500 – 1,500 setup · USD 0.30 – 1.50 "
                  "per verification.<br/>"
                  "<b>Kenya annual estimate:</b> USD 4-8k at 10k active users. Under KES 1M.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("7.2 Comply Advantage (PEP + sanctions)", S["H3"]),
        Paragraph("<b>Access:</b> Sales-led at complyadvantage.com. Book demo.<br/>"
                  "<b>Contract:</b> USD 15k/yr minimum enterprise contract.<br/>"
                  "<b>What you get:</b> Real-time OFAC / UN / EU / HMT sanctions screening, "
                  "PEP database, adverse media, ongoing monitoring.<br/>"
                  "<b>Cheaper alternatives:</b><br/>"
                  "• KYC-Chain — pay-per-check ~ USD 0.50<br/>"
                  "• Refinitiv World-Check One — sales-led but tiered<br/>"
                  "• DIY with backend AML service already shipped (OFAC + UN + EU feeds are free "
                  "public XML/CSV; you host + refresh yourself). Trade-off: no adverse media, "
                  "no PEP database.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("7.3 FRC MLRO appointment", S["H3"]),
        Paragraph("Founder / CFO wears the MLRO hat for MVP. Above 20 staff, hire a dedicated "
                  "compliance officer at KES 200-350k/mo. Fractional AML advisors "
                  "(ALN, Bowmans) charge KES 150k/mo retainer.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 8: INSURANCE ───────────────────────────────────────
    story += [
        Paragraph("8. INSURANCE PREMIUMS", S["H2"]),
        Paragraph("Fintechs need multiple layers. Get bundle quotes from ICEA LION, Jubilee, "
                  "Britam, or brokers like Barnes-Insurance / Turaco.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Cover", "Purpose", "Annual premium (KES)"],
            ["Cyber liability", "Data breach, ransomware, DDoS", "100,000 – 500,000"],
            ["Professional indemnity", "Software errors → customer loss", "80,000 – 300,000"],
            ["Fidelity guarantee / crime", "Employee fraud, misappropriation", "50,000 – 200,000"],
            ["Directors' &amp; Officers' (D&amp;O)", "Personal liability of directors", "100,000 – 400,000"],
            ["General liability", "Slip-and-fall at office", "30,000"],
            ["WIBA (Workers Compensation)", "Statutory per employee", "1-2% of payroll"],
            ["Group medical (SHA-supplemented)", "Employees", "KES 30-80k per person/yr"],
        ], colWidths=[55*mm, 55*mm, 50*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Bundle target:</b> KES 300k – 600k/yr for 5-person team.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Special note — Fidelity Guarantee:</b> Non-negotiable once you have "
                  "employees moving customer money. Bond amount = 1x monthly transaction "
                  "volume. Missing this makes bank negotiations painful.", S["Warn"]),
        PageBreak(),
    ]

    # ── SECTION 9: CERTIFICATIONS ──────────────────────────────────
    story += [
        Paragraph("9. CERTIFICATIONS YOU'LL WANT", S["H2"]),
        Paragraph("Certifications are optional for launch but table stakes for enterprise "
                  "customers, bank partnerships, and CBK's DCP review.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("9.1 PCI DSS", S["H3"]),
        Paragraph("<b>When:</b> You take card payments directly. Currently you route via "
                  "Flutterwave/Stripe = you inherit their compliance, so you only need "
                  "<b>SAQ-A</b> (self-assessment questionnaire). Free, form-only.<br/>"
                  "<b>Full PCI DSS Level 4 audit:</b> USD 5-15k if you take cards direct.", S["Body"]),
        Paragraph("9.2 SOC 2 Type II", S["H3"]),
        Paragraph("<b>When:</b> Enterprise chama customers or bank partners will ask.<br/>"
                  "<b>Vendors:</b> Vanta / Drata / Secureframe automate ~70% of the evidence "
                  "collection.<br/>"
                  "<b>Cost:</b> Vanta USD 15-30k/yr platform + USD 20-40k auditor. Total "
                  "≈ USD 40-70k first year, USD 25-40k renewal.<br/>"
                  "<b>Timeline:</b> 6 months to Type II (need 6 months of evidence).", S["Body"]),
        Paragraph("9.3 ISO 27001", S["H3"]),
        Paragraph("<b>When:</b> Government tenders, banks, insurance partners.<br/>"
                  "<b>Cost:</b> Consultant KES 800k – 2M · certification body KES 400-800k · "
                  "annual surveillance KES 200-400k. Total ≈ KES 1.5-3M first year.", S["Body"]),
        Paragraph("9.4 ISO 42001 (AI Management)", S["H3"]),
        Paragraph("<b>When:</b> You market your AI features (rule compiler, loan underwriter) to "
                  "regulated customers. EU customers may require this once EU AI Act is in "
                  "force for African vendors serving EU. Cost similar to ISO 27001.", S["Body"]),
        Paragraph("9.5 CBK Approved-Vendor status", S["H3"]),
        Paragraph("<b>What:</b> Informal but valuable. Once you complete a bank pilot cleanly, "
                  "request CBK add you to the approved-vendor list. Unlocks other banks. "
                  "No fee, referral-based.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 10: REGIONAL EXPANSION ─────────────────────────────
    story += [
        Paragraph("10. REGIONAL EXPANSION LICENSE MAP", S["H2"]),
        Paragraph("Your provider adapters already support UG (MTN, Airtel), TZ (M-Pesa, Airtel, "
                  "Tigo), RW (MTN, Airtel), NG (Paystack, Flutterwave). Regulatory:", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Country", "Regulator", "Equivalent license", "Est. cost"],
            ["Uganda", "Bank of Uganda", "PSP Class II (small)", "UGX 15-30M capital"],
            ["Uganda", "NITA-U", "Data controller registration", "UGX 1-3M/yr"],
            ["Tanzania", "Bank of Tanzania", "Payment System License", "TZS 200M capital"],
            ["Tanzania", "TCRA", "Electronic Communications License", "TZS 5-10M"],
            ["Rwanda", "National Bank of Rwanda", "Non-Bank Payment SP", "RWF 100M capital"],
            ["Rwanda", "NCSA", "Data protection registration", "RWF 500k-1M"],
            ["Nigeria", "CBN", "Payment Solution Service Provider", "NGN 100M capital"],
            ["Nigeria", "NITDA", "NDPR compliance filing", "NGN 250k – 2M"],
        ], colWidths=[25*mm, 40*mm, 60*mm, 35*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Reality:</b> Nigeria + Tanzania have the steepest capital walls. "
                  "Cheapest expansion path is UG → RW → TZ → NG. Alternatively, partner with "
                  "an already-licensed player in each market (revenue-share) — no license "
                  "capital, but 20-40% of revenue goes to the partner.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 11: RECURRING SAAS ─────────────────────────────────
    story += [
        Paragraph("11. RECURRING SAAS + INFRASTRUCTURE (from Go-Live Master §8)", S["H2"]),
        Paragraph("Every SaaS you'll pay for. Steady-state ~1000 active users.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Service", "Monthly cost (USD)"],
            ["Postgres (Supabase / DigitalOcean managed)", "25 – 150"],
            ["Redis Cloud", "15 – 80"],
            ["Backend host (DigitalOcean / Render / Fly.io)", "20 – 100"],
            ["Frontend host (Vercel / Cloudflare Pages)", "0 – 20"],
            ["S3 or MinIO object storage", "10 – 50"],
            ["SendGrid (transactional email)", "20"],
            ["Africa's Talking (SMS + USSD)", "variable, ~50-200"],
            ["Firebase / FCM push", "0 (Spark tier)"],
            ["Anthropic Claude API", "20 – 200 (rule compiler + AI insights)"],
            ["Sentry", "26 (Team)"],
            ["Datadog / Grafana Cloud", "15 – 50/host"],
            ["Daily.co (video)", "99 team + usage"],
            ["Cloudflare Pro (WAF + CDN)", "20"],
            ["1Password / Vaultwarden", "8/user"],
            ["Domain + DNS", "1.25/mo amortised"],
            ["Let's Encrypt TLS", "Free"],
            ["Total per month", "≈ USD 400 – 1,200"],
        ], colWidths=[100*mm, 60*mm]),
        PageBreak(),
    ]

    # ── SECTION 12: LEGAL BUDGET ───────────────────────────────────
    story += [
        Paragraph("12. LEGAL-DRAFTING BUDGET", S["H2"]),
        Paragraph("Kenyan fintech law firms. Budget KES 200,000 – 500,000 for the full pack.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Firm", "Fit", "Typical hourly (KES)"],
            ["ALN Kenya (Anjarwalla &amp; Khanna)", "Top-tier, expensive", "40,000 – 70,000"],
            ["Kaplan &amp; Stratton", "Deep fintech bench", "35,000 – 60,000"],
            ["Bowmans Kenya", "International arm, thorough", "35,000 – 65,000"],
            ["Wamae &amp; Allen", "Mid-market, startup-friendly", "18,000 – 30,000"],
            ["MMAN Advocates", "Good for compliance ops", "20,000 – 35,000"],
        ], colWidths=[50*mm, 60*mm, 50*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Doc pack you need drafted:</b>", S["H3"]),
        Paragraph(
            "• Terms of Service — binding user contract<br/>"
            "• Privacy Policy — DPA-compliant<br/>"
            "• Cookie Policy — if you use analytics cookies<br/>"
            "• AML/CFT Policy — POCAMLA + FRC requirement<br/>"
            "• Data Retention Policy — how long you hold what<br/>"
            "• Data Breach Response Plan — DPA-required<br/>"
            "• Vendor DPAs (Data Processing Agreements) — SendGrid, AWS, Anthropic, etc.<br/>"
            "• User consent flow — explicit opt-in per DPA §30<br/>"
            "• Chama Constitution template — model bylaws<br/>"
            "• Investor SAFE / Convertible Note template<br/>"
            "• KYC Refusal + Appeals Policy — fairness under DCP Regs<br/>"
            "• Complaints Handling Policy — Consumer Protection Act<br/>"
            "• Refunds &amp; Reversals Policy — M-Pesa dispute posture",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 13: FINES ──────────────────────────────────────────
    story += [
        Paragraph("13. FINES YOU AVOID BY DOING THIS RIGHT", S["H2"]),
        gtable([
            ["Violation", "Regulator", "Max penalty"],
            ["Unregistered data controller", "ODPC", "KES 5M or 1% turnover"],
            ["Data breach not reported in 72h", "ODPC", "KES 3M per incident"],
            ["Operating without CBK license (DCP)", "CBK", "KES 5M + closure"],
            ["Operating as unlicensed PSP", "CBK", "KES 10M + closure + criminal"],
            ["Failure to file STR to FRC", "FRC", "KES 2M per omission"],
            ["Failure to register with FRC", "FRC", "KES 5M + directors' liability"],
            ["Consumer Protection Act breach", "KECOB", "Up to KES 10M"],
            ["Unregistered under KIPI (trademark abuse)", "KIPI", "Civil damages only"],
            ["Selling unlicensed securities", "CMA", "KES 10M + refund"],
            ["Violation of AI-related regs (future EU AI Act)", "EU", "Up to €35M or 7% turnover"],
        ], colWidths=[65*mm, 30*mm, 55*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Bottom line:</b> KES 5-10M in fines is bigger than your entire one-off "
                  "launch spend. Doing the paperwork is cheap insurance.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 14: 90-DAY WALLET-DAMAGE FORECAST ──────────────────
    story += [
        Paragraph("14. 90-DAY WALLET-DAMAGE FORECAST", S["H2"]),
        Paragraph("Assumes lean solo-founder + 2 contractors, no external counsel retainer.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Week", "Line item", "Cost (KES)"],
            ["W1", "BRS + KRA + county + domain", "45,000"],
            ["W1", "Daraja sandbox + Flutterwave signup", "0"],
            ["W2", "Bank account opening + trust account setup", "0 – 20,000"],
            ["W2", "ODPC registration", "4,000"],
            ["W3", "Lawyer engagement — T&amp;C + Privacy + AML pack draft", "300,000"],
            ["W3", "Insurance quotes + bind", "400,000"],
            ["W4", "Paybill application + Daraja Go-Live", "40,000"],
            ["W4", "Smile Identity contract signup", "60,000"],
            ["W5", "FRC registration + MLRO training", "0"],
            ["W5", "KIPI trademark filing", "40,000"],
            ["W6", "Pen test engagement", "200,000"],
            ["W7", "Load test + fix", "100,000"],
            ["W8-12", "Comply Advantage OR DIY AML rollout", "0 – 1,500,000"],
            ["W8-12", "Design polish + marketing site", "150,000"],
            ["W8-12", "Launch PR + KES buffer", "200,000"],
            ["", "SUB-TOTAL (lean path)", "≈ 1,540,000"],
            ["", "SUB-TOTAL (with Comply Advantage)", "≈ 3,040,000"],
        ], colWidths=[15*mm, 100*mm, 45*mm]),
        Spacer(1, 5 * mm),
        Paragraph("<b>Add 15% contingency:</b> lean path ≈ KES 1.77M; full path ≈ KES 3.5M.", S["Body"]),
        Paragraph("<b>Runway including 6 months OPEX:</b> lean KES 8-10M; full KES 12-15M.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 15: WHAT'S ALREADY DONE ────────────────────────────
    story += [
        Paragraph("15. WHAT THIS CODEBASE ALREADY DOES FOR YOU", S["H2"]),
        Paragraph("Compliance requirements you can tick off day-1 without extra spend:", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Requirement", "Where in code", "Status"],
            ["Data subject export (Art. 30)", "GET /kyc/export", "✓"],
            ["Data subject erasure (Art. 40)", "DELETE /kyc/erase", "✓"],
            ["KYC tiers 0-3 (matches CBK DCP)", "services/kyc.service.ts", "✓"],
            ["PEP + sanctions screening", "services/aml.service.ts (OFAC/UN/EU)", "✓"],
            ["Transaction monitoring rules", "R-VEL / R-STR / R-THR", "✓"],
            ["STR auto-open + SAR draft", "aml.service.ts + FRC template", "✓"],
            ["Audit hash-chain (POCAMLA §35)", "AuditLog.hash / prevHash", "✓"],
            ["Trust-account segregation posture", "LedgerAccount type=mpesa_clearing", "✓"],
            ["Refund/reversal ledger", "services/ledger.service.ts", "✓"],
            ["User consent flow", "hooks/useConsent", "✓"],
            ["Encryption at rest for 2FA secrets", "services/encryption.service.ts", "✓"],
            ["Rate limiting on STK Push (fair use)", "contribute.service.ts", "✓"],
            ["Multi-sig payouts (WebAuthn passkey)", "payouts.routes.ts + webauthn", "✓"],
            ["Idempotent double-entry ledger", "ledger.service.ts", "✓"],
            ["72h breach notification framework", "notifications + audit", "✓"],
        ], colWidths=[70*mm, 60*mm, 30*mm]),
        Spacer(1, 4 * mm),
        Paragraph("Regulators love seeing shipped features, not slide decks. Your live demo is "
                  "your best license application.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 16: DECISION TREE ──────────────────────────────────
    story += [
        Paragraph("16. QUICK DECISION TREE", S["H2"]),
        Paragraph("Answer YES/NO to jump to the right spend:", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Q1: Are you launching in Kenya only for v1?</b><br/>"
                  "YES → skip Section 10 (regional). Save KES 20-100M capital.<br/>"
                  "NO → budget +KES 15-30M for one additional country.", S["Body"]),
        Paragraph("<b>Q2: Are you launching with loans (chama-to-member lending)?</b><br/>"
                  "YES → CBK Digital Credit Provider license needed. +KES 1M app fee + KES 5M "
                  "capital + 4-9 month wait. Add KES 6-8M line item.<br/>"
                  "NO → contribution + investment paths only. Save KES 6M+.", S["Body"]),
        Paragraph("<b>Q3: Will you hold customer float in a Pamoja-branded wallet?</b><br/>"
                  "YES → CBK views this as e-money. Segregate in bank trust account (still "
                  "aggregator posture) or become e-money issuer (KES 20M capital). Trust "
                  "account is the smart path.<br/>"
                  "NO → true aggregator, cheapest path.", S["Body"]),
        Paragraph("<b>Q4: Will enterprise or bank customers ask for SOC 2 in first 12 months?</b><br/>"
                  "YES → start Vanta now (USD 15-30k/yr). Certification in month 7.<br/>"
                  "NO → defer. Focus on ISO 27001 later if government contracts appear.", S["Body"]),
        Paragraph("<b>Q5: How aggressive is your AML posture?</b><br/>"
                  "LEAN → use built-in OFAC/UN/EU refresher + FRC filings manually. Free.<br/>"
                  "STANDARD → Comply Advantage USD 15k/yr + Smile Identity USD 4-8k/yr.<br/>"
                  "ENTERPRISE → both + fractional AML advisor KES 150k/mo.", S["Body"]),
        PageBreak(),
    ]

    # ── FINAL PAGE ─────────────────────────────────────────────────
    story += [
        Paragraph("APPENDIX — HANDY LINKS", S["H2"]),
        Paragraph("• brs.ecitizen.go.ke — company registration<br/>"
                  "• itax.kra.go.ke — KRA PIN + tax<br/>"
                  "• nairobi.go.ke — county permit<br/>"
                  "• odpc.go.ke — Data Protection Commissioner<br/>"
                  "• kipi.go.ke — trademark<br/>"
                  "• frc.go.ke — Financial Reporting Centre (AML)<br/>"
                  "• cbk.go.ke — Central Bank of Kenya<br/>"
                  "• cma.or.ke — Capital Markets Authority + Sandbox<br/>"
                  "• developer.safaricom.co.ke — Daraja API<br/>"
                  "• mpesabusiness.safaricom.co.ke — Paybill<br/>"
                  "• flutterwave.com — cards<br/>"
                  "• smileidentity.com — KYC<br/>"
                  "• complyadvantage.com — sanctions screening<br/>"
                  "• fke.or.ke — Federation of Kenyan Employers (employment templates)",
                  S["Body"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=1, width="60%"),
        Spacer(1, 4 * mm),
        Paragraph("<b>Regenerate anytime:</b>", S["Body"]),
        Paragraph("<font face='Courier'>cd pamoja-wealth &amp;&amp; "
                  "python3 scripts/generate_licenses_pdf.py</font>", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Companion documents:</b> PAMOJA_WEALTH_GO_LIVE_MASTER.pdf · "
                  "TECH_COMPANY_INCEPTION_KIT.pdf (universal tech-company setup)", S["Muted"]),
        Spacer(1, 4 * mm),
        Paragraph("This document does not constitute legal, tax, or financial advice. "
                  "Verify every regulatory step + fee with a licensed Kenyan advocate + "
                  "accountant. Government fees change without notice.",
                  S["Muted"]),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "docs",
                       "PAMOJA_WEALTH_LICENSES_AND_FEES.pdf")
    build(out)
    print(f"Generated: {out}")
