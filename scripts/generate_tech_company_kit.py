#!/usr/bin/env python3
"""
TECH_COMPANY_INCEPTION_KIT.pdf

Universal setup kit for a Kenya-registered tech company that wants to
build + publish MULTIPLE projects over time — fintech, SaaS, AI, e-commerce,
edtech, healthtech, whatever. This is the parent-company kit; individual
projects get their own product-specific overlays.

Covers:
• Company structure decision (Ltd vs Ltd-by-guarantee vs LLP)
• Founder-level tax posture
• IP holding structure (protecting your code across products)
• Kenya vs Delaware C-Corp decision for future fundraising
• The "core" registrations every tech company needs before shipping
  ANY product
• Per-vertical add-ons (fintech, healthtech, edtech, e-commerce, AI/SaaS)
• Hiring + employment infra
• Government support programs you can tap (Ajira, KENIA, KOTDA, iBiz)
• 12-month founder cash runway breakdown

Run:  python3 scripts/generate_tech_company_kit.py
Out:  docs/TECH_COMPANY_INCEPTION_KIT.pdf
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

BRAND = HexColor("#7C3AED")   # purple to differentiate from Pamoja emerald
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
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "Tech Company Inception Kit — Kenya")
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
        Paragraph("Tech Company Inception Kit", S["H1"]),
        Paragraph("For a first-time founder registering a Kenyan tech company "
                  "that will publish multiple projects over the coming years. "
                  "This is the parent-company setup — every project you launch "
                  "sits under it.",
                  S["Muted"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 8 * mm),
        Paragraph(f"<b>Prepared:</b> {datetime.now().strftime('%d %B %Y')}", S["Body"]),
        Paragraph("<b>Your first product:</b> Pamoja Wealth (see companion "
                  "PAMOJA_WEALTH_LICENSES_AND_FEES.pdf for fintech overlay).", S["Body"]),
        Paragraph("<b>Assumed profile:</b> Kenyan founder · pre-revenue · plans multiple "
                  "product lines · wants long-term protection of IP, tax, and personal liability.", S["Body"]),
        Spacer(1, 5 * mm),
        Paragraph("Contents", S["H2"]),
        Paragraph(
            "1. Structure decision — Ltd, LLP, or dual-entity<br/>"
            "2. Core registrations every tech company needs<br/>"
            "3. Founder tax posture — dividends vs salary<br/>"
            "4. IP protection strategy — trademark, copyright, patent<br/>"
            "5. Vertical add-ons (fintech, healthtech, edtech, e-commerce, AI)<br/>"
            "6. Team + hiring infrastructure<br/>"
            "7. Kenya vs Delaware C-Corp for future fundraising<br/>"
            "8. Government support programs you can tap<br/>"
            "9. Software supply-chain compliance (open-source, licenses)<br/>"
            "10. Banking + treasury for a multi-project company<br/>"
            "11. First 12-month cash budget<br/>"
            "12. When to hire employee vs contractor vs equity<br/>"
            "13. Publishing checklist — before ANY product ships<br/>"
            "14. Tools + software stack (free/paid tier map)<br/>"
            "15. Templates + boilerplate (T&amp;C, DPA, NDA, ESA)",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 1: STRUCTURE ───────────────────────────────────────
    story += [
        Paragraph("1. STRUCTURE DECISION", S["H2"]),
        Paragraph("Get this right day-1; it's expensive to change later.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Structure", "Best for", "Setup cost (KES)", "Tax rate"],
            ["Sole Proprietor", "Freelance income only", "500", "PAYE bands 10-30%"],
            ["Limited Liability Partnership (LLP)", "2 founders splitting labour", "10,000", "Pass-through"],
            ["Private Limited (Ltd)", "Most tech companies", "10,650 – 12,000", "30% CIT"],
            ["Public Limited (PLC)", "Post-IPO", "Way more", "30% CIT + reporting"],
            ["Dual: KE Ltd + Delaware C-Corp", "Fundraising from US VC", "~USD 800 + counsel", "Complex"],
        ], colWidths=[55*mm, 40*mm, 40*mm, 25*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Recommendation:</b> Kenyan Private Limited (Ltd) for v1. If you take US "
                  "VC money later (Series A+), do a &quot;flip&quot; to Delaware C-Corp with "
                  "Kenya as operating subsidiary. Budget USD 15-30k in legal for the flip when "
                  "the time comes.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Multi-project reality:</b> One Ltd holds all your products. Each product "
                  "is a &quot;division&quot; internally, not a separate legal entity, until it "
                  "either (a) has customer money to segregate, or (b) will be sold or spun out. "
                  "Then create a subsidiary Ltd for that product only.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 2: CORE REGISTRATIONS ──────────────────────────────
    story += [
        Paragraph("2. CORE REGISTRATIONS EVERY TECH COMPANY NEEDS", S["H2"]),
        Paragraph("These are the day-1 registrations regardless of what you sell.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Registration", "Where", "Cost (KES)", "Duration"],
            ["Name reservation + company registration", "brs.ecitizen.go.ke", "10,650 – 12,000", "3-14 days"],
            ["KRA PIN (company)", "itax.kra.go.ke", "0", "Immediate"],
            ["KRA VAT (voluntary under 5M turnover)", "iTax", "0", "1-2 weeks"],
            ["Nairobi county Single Business Permit", "nairobi.go.ke", "15,000 – 30,000", "1 week"],
            ["ODPC data-protection registration", "odpc.go.ke", "4,000 – 40,000", "1-2 weeks"],
            ["NSSF employer number", "nssfkenya.co.ke", "0", "Immediate"],
            ["SHA employer number", "sha.go.ke", "0", "Immediate"],
            ["NITA employer registration (skills levy)", "nita.go.ke", "0", "Free"],
            ["Trademark filing (KIPI)", "kipi.go.ke", "5,000 + agent 25-60k", "12-18 months grant"],
            ["Domain (.co.ke or .app / .com)", "kenic.or.ke / Namecheap", "1,500 – 3,000/yr", "Immediate"],
            ["Bank account (business current)", "Equity / KCB", "0 – 20,000", "1-2 weeks"],
        ], colWidths=[65*mm, 45*mm, 30*mm, 25*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>All-in one-time cost:</b> KES 55,000 – 130,000. Add trademark agent "
                  "= up to KES 200,000.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Miss any of these = the fine is bigger than the fee.</b> ODPC alone: "
                  "up to KES 5M or 1% turnover.", S["Danger"]),
        PageBreak(),
    ]

    # ── SECTION 3: FOUNDER TAX ─────────────────────────────────────
    story += [
        Paragraph("3. FOUNDER TAX POSTURE", S["H2"]),
        Paragraph("Once your Ltd earns money, how do you get paid? This shapes your take-home "
                  "materially.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Route", "Company pays", "You pay", "Net take-home on KES 1M"],
            ["Salary (PAYE)", "Salary + WIBA + NSSF + SHA + Housing", "PAYE 10-35% + NSSF + SHA", "~KES 700k"],
            ["Dividends (post-CIT)", "30% CIT on profit", "5% withholding on dividend", "~KES 665k"],
            ["Mixed (KES 300k salary + rest dividend)", "Both", "Blended", "~KES 720k"],
            ["Director loan (short-term)", "Interest 8%+", "Deemed income if not repaid", "Avoid unless advised"],
        ], colWidths=[45*mm, 35*mm, 40*mm, 40*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Strategic default:</b> Pay yourself a modest salary (covers living costs, "
                  "makes NSSF + SHA contributions accrue) plus dividends once profit accrues. "
                  "Salary is deductible for the Ltd; dividends are not. Bookkeeper will model "
                  "the optimal split annually.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Pension tip:</b> Register a Personal Pension Plan (PPP) with an approved "
                  "retirement benefits scheme. Contributions up to KES 20k/mo are tax-deductible. "
                  "Providers: Sanlam, Old Mutual, Britam, CIC.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 4: IP ──────────────────────────────────────────────
    story += [
        Paragraph("4. IP PROTECTION STRATEGY", S["H2"]),
        Paragraph("Your code + brand are the entire company. Locking them down early is "
                  "cheap; retroactive is painful.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("4.1 Copyright (automatic)", S["H3"]),
        Paragraph("All code and content you write is automatically copyright yours (Copyright "
                  "Act 2001). Optional formal registration with KECOBO — KES 1,000 per work "
                  "— gives you a certificate to wave in court. Worth it for landing pages, "
                  "video assets, and marketing copy.", S["Body"]),
        Paragraph("4.2 Trademark (KIPI)", S["H3"]),
        Paragraph("Register your <b>company name</b>, each <b>product name</b>, and your "
                  "<b>logo</b> as separate marks. Cost: KES 5,000 per class × 45 classes "
                  "possible. Typical filing: KES 25,000 – 60,000 per mark via agent. "
                  "Grant in 12-18 months but priority date = filing date.", S["Body"]),
        Paragraph("4.3 Patents", S["H3"]),
        Paragraph("Kenya recognises patents but software patents are hard to defend. Only "
                  "worth it for genuine hardware or novel algorithm. Costs KES 20-40k filing "
                  "+ USD 5-15k per additional jurisdiction (PCT route). Most tech companies "
                  "skip.", S["Body"]),
        Paragraph("4.4 Trade secrets + NDAs", S["H3"]),
        Paragraph("Bake NDA + IP-assignment into every contractor and employee agreement. "
                  "Founders should sign a mutual founders' agreement + IP assignment to the "
                  "Ltd on day 1 — otherwise your code technically belongs to you personally, "
                  "not the company, which breaks investor DD.", S["Body"]),
        Paragraph("4.5 Open-source licensing", S["H3"]),
        Paragraph("Every third-party library you use has a license (MIT, Apache, GPL, AGPL). "
                  "AGPL is the trap: it forces you to open-source your entire product. Audit "
                  "your dependencies before launch. Tools: FOSSA, Snyk Advisor, `npx license-checker`.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 5: VERTICAL ADD-ONS ────────────────────────────────
    story += [
        Paragraph("5. VERTICAL ADD-ONS (per product type)", S["H2"]),
        Paragraph("Registrations you add ON TOP of the core kit depending on which product "
                  "you're launching. Costs are additive to Section 2.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("5.1 Fintech (like Pamoja Wealth)", S["H3"]),
        Paragraph("• CBK PSP or aggregator posture (see companion Pamoja Wealth PDF)<br/>"
                  "• FRC AML registration (free, mandatory)<br/>"
                  "• CMA registration if selling securities/MMF<br/>"
                  "• Safaricom Paybill (KES 25-50k)<br/>"
                  "• Smile Identity KYC + Comply Advantage screening<br/>"
                  "• Add: <b>KES 500k – 4M</b> depending on scope", S["Body"]),
        Paragraph("5.2 Healthtech / Digital Health", S["H3"]),
        Paragraph("• Kenya Medical Practitioners &amp; Dentists Council (KMPDC) if diagnosing/prescribing<br/>"
                  "• Ministry of Health facility license if physical clinic<br/>"
                  "• Digital Health Act 2023 compliance — data localisation + consent<br/>"
                  "• Medical device registration (Pharmacy &amp; Poisons Board) if hardware<br/>"
                  "• Add: <b>KES 300k – 2M</b>", S["Body"]),
        Paragraph("5.3 Edtech", S["H3"]),
        Paragraph("• Ministry of Education registration if issuing certificates<br/>"
                  "• Kenya Institute of Curriculum Development (KICD) approval if selling to schools<br/>"
                  "• TVETA (Technical &amp; Vocational Education) if adult skills<br/>"
                  "• Special child-safety obligations under DPA (Article 33)<br/>"
                  "• Add: <b>KES 100k – 500k</b>", S["Body"]),
        Paragraph("5.4 E-commerce / Marketplace", S["H3"]),
        Paragraph("• Kenya Bureau of Standards (KEBS) — pre-market approval for regulated goods<br/>"
                  "• Kenya Revenue Authority — VAT collection if turnover > 5M<br/>"
                  "• Digital Service Tax (1.5% on marketplace fees)<br/>"
                  "• Escrow account setup for buyer protection<br/>"
                  "• Add: <b>KES 100k – 400k</b>", S["Body"]),
        Paragraph("5.5 AI / SaaS", S["H3"]),
        Paragraph("• Publish AI Ethics + Model Card if you deploy customer-facing AI<br/>"
                  "• EU AI Act compliance if you serve EU customers<br/>"
                  "• Vendor-liability DPAs with Anthropic / OpenAI / Google<br/>"
                  "• Data-residency disclosures (users must know Anthropic is US)<br/>"
                  "• Optional: ISO 42001 AI Management System certification<br/>"
                  "• Add: <b>KES 0 – 2M</b> (mostly legal + optional cert)", S["Body"]),
        Paragraph("5.6 Adtech / Analytics", S["H3"]),
        Paragraph("• Data controller / processor split under DPA<br/>"
                  "• Explicit opt-in consent flow (no dark patterns per §30)<br/>"
                  "• Cross-border transfer basis (SCC) if analytics stored abroad<br/>"
                  "• Add: <b>KES 50k – 200k</b>", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 6: TEAM + HIRING ──────────────────────────────────
    story += [
        Paragraph("6. TEAM + HIRING INFRASTRUCTURE", S["H2"]),
        Paragraph("Kenya's employment law adds real cost per hire. Plan for ~35% overhead "
                  "on top of gross salary.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Statutory item", "Employer cost", "Employee cost"],
            ["NSSF Tier 1 + Tier 2", "Up to KES 2,160/mo", "Up to KES 2,160/mo"],
            ["SHA (Social Health Authority)", "2.75% of gross", "2.75% of gross"],
            ["Housing Levy", "1.5% of gross", "1.5% of gross"],
            ["NITA training levy", "KES 50/mo per employee", "0"],
            ["WIBA workers' comp", "1-2% of payroll", "0"],
            ["PAYE (tax)", "0", "10-35% bracketed"],
            ["Statutory leave", "21 working days paid", "0"],
        ], colWidths=[60*mm, 50*mm, 50*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Contractors vs employees:</b> Contractors save you SHA + NSSF + Housing "
                  "Levy + WIBA. Fine for short-term specialised work. But if you have day-to-day "
                  "control + provide equipment + they work exclusively for you, KRA reclassifies "
                  "as employee retroactively. Test: 3-part &quot;IR35-like&quot; test.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>ESOP / equity for early hires:</b> Set aside 10-20% of shares in an "
                  "Employee Share Option Pool. Legal setup: KES 20-40k with counsel. Grants "
                  "typically 4-year vest with 1-year cliff (US standard). Kenya's tax treatment "
                  "of ESOPs matured recently — see Finance Act 2023.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Templates:</b> Federation of Kenyan Employers (FKE, fke.or.ke) publishes "
                  "vetted employment contract templates. Free to members. Use these as base.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 7: KE vs DE ────────────────────────────────────────
    story += [
        Paragraph("7. KENYA vs DELAWARE C-CORP", S["H2"]),
        Paragraph("If you'll never raise US VC money — stop reading, use Kenya Ltd. If you "
                  "might, understand the trade-offs.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Factor", "Kenya Ltd", "Delaware C-Corp"],
            ["Registration cost", "KES 12k (~USD 90)", "USD 800 + registered agent USD 100/yr"],
            ["US investor comfort", "Low — needs Section 83(b), tax treaties", "High — SAFEs, priced rounds, VC-standard"],
            ["Kenya tax residency", "Yes", "No (must set up KE subsidiary)"],
            ["Founder personal tax", "Kenyan", "US-source income → complications"],
            ["Ease to close", "Fast", "Ongoing filings even after dormancy"],
            ["Ideal moment for flip", "Never or Series A", "Pre-Seed to Series A"],
        ], colWidths=[50*mm, 55*mm, 55*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Recommended path for you:</b><br/>"
                  "1. Register Kenya Ltd now.<br/>"
                  "2. Ship your first product.<br/>"
                  "3. If a US VC term sheet appears, do the &quot;Kenya→Delaware flip&quot; then. "
                  "Standard legal spend USD 15-30k. Firms: Bowmans / Carey Olsen / Cooley.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Alternate:</b> Some East-African founders register in <b>Mauritius</b> "
                  "instead of Delaware. It's a common tax-neutral holding jurisdiction for "
                  "African-focused funds. Talk to counsel.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 8: GOVT SUPPORT ────────────────────────────────────
    story += [
        Paragraph("8. GOVERNMENT SUPPORT PROGRAMS", S["H2"]),
        Paragraph("Free or subsidised support you can tap. Application cost mostly time.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Program", "What you get", "Cost / catch"],
            ["KOTDA (Konza Tech City)", "Serviced office + Kenya Advanced Institute + funds", "Application, tenancy"],
            ["Ajira Digital Program", "Skills training + client leads for team", "Free"],
            ["Kenya Industrial Estates (KIE)", "Grant + soft loan for tech SMEs", "SME size cap"],
            ["Enterprise Kenya Fund", "Concessional loan", "Application"],
            ["iBiz Africa (Strathmore)", "Incubation + connections", "Application"],
            ["Nailab / iHub", "Community + occasional grants", "Application"],
            ["Mozilla Builders / Google for Startups", "Cloud credits + mentorship", "Application"],
            ["MEST / Nation Media Ventures", "Fellowship + equity investment", "Application"],
            ["CBK Regulatory Sandbox", "Test fintech products with light-touch supervision", "Fintech only"],
            ["Kenya Association of Manufacturers (KAM)", "Networking + policy input if hardware", "Membership fee"],
        ], colWidths=[55*mm, 65*mm, 40*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>KRA tax incentives you might qualify for:</b><br/>"
                  "• <b>10-year corporate income tax holiday</b> for companies operating in "
                  "Special Economic Zones (SEZ) with export focus.<br/>"
                  "• <b>Investment Deduction</b> — 100% deduction on qualifying capex for "
                  "manufacturing / value-add tech.<br/>"
                  "• <b>Reduced 25% CIT rate</b> for startups certified under Startup Bill "
                  "(pending final gazette).", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 9: SUPPLY CHAIN ────────────────────────────────────
    story += [
        Paragraph("9. SOFTWARE SUPPLY-CHAIN COMPLIANCE", S["H2"]),
        Paragraph("Enterprise + government + fintech customers audit your code's provenance. "
                  "Do this once, benefit forever.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("• <b>SBOM</b> (Software Bill of Materials) for every product. Tools: "
                  "Syft, CycloneDX. Free.<br/>"
                  "• <b>Dependency audit</b>: Snyk or GitHub Dependabot. Free tier fine.<br/>"
                  "• <b>License compliance</b>: FOSSA or `npx license-checker`. Watch for "
                  "GPL / AGPL leaks.<br/>"
                  "• <b>SAST</b> (static analysis): SonarCloud (free for open-source), "
                  "Semgrep. USD 0-15/dev/mo.<br/>"
                  "• <b>Container image scanning</b>: Trivy, Docker Scout. Free.<br/>"
                  "• <b>Secret scanning</b>: GitGuardian free tier, TruffleHog OSS.<br/>"
                  "• <b>Signed releases</b>: Sigstore Cosign for container images. Free.<br/>"
                  "• <b>Reproducible builds</b>: pin every dependency version + lockfile "
                  "committed. Free discipline.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Kenya-specific:</b> If you sell to government under KE Public Procurement "
                  "Regulations, they'll ask for source-code escrow. Providers: NCC Group or "
                  "Iron Mountain. USD 500-1500/yr per product.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 10: BANKING ────────────────────────────────────────
    story += [
        Paragraph("10. BANKING + TREASURY FOR A MULTI-PROJECT COMPANY", S["H2"]),
        Paragraph("Open more accounts than you think you'll need. Segregation is cheap; "
                  "co-mingling is painful.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Account", "Purpose", "Recommendation"],
            ["Operating (KES)", "Day-to-day, salaries, rent", "Equity or KCB"],
            ["Trust / Escrow (KES)", "Customer float per product", "Same bank, segregated"],
            ["Fixed deposit (KES)", "Reserve capital, 10-12% CBR-linked", "Any bank"],
            ["USD (multi-currency)", "SaaS costs, offshore vendors", "Equity or NCBA"],
            ["EUR (optional)", "European vendors + customers", "NCBA or DTB"],
            ["Payment aggregator sub-account", "Per product line, once revenue > 1M/mo", "Same bank"],
        ], colWidths=[45*mm, 65*mm, 50*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Corporate card:</b> Equity Business Visa or KCB Corporate Mastercard for "
                  "SaaS subscriptions. Alternative: Airwallex / Payoneer virtual USD cards for "
                  "cross-border spending.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Bookkeeping stack:</b><br/>"
                  "• QuickBooks Online (KES 4-6k/mo) — mainstream<br/>"
                  "• Xero (KES 5-8k/mo) — better multi-currency<br/>"
                  "• Zoho Books (KES 2-4k/mo) — cheapest, decent for KE VAT<br/>"
                  "Add fractional bookkeeper KES 30-80k/mo. Add year-end audit KES 250-600k "
                  "(mandatory above 25M turnover).", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 11: 12-MONTH CASH ──────────────────────────────────
    story += [
        Paragraph("11. FIRST 12-MONTH CASH BUDGET", S["H2"]),
        Paragraph("Founder + 2 contractors, no fundraising, pre-revenue. Adjust as needed.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Category", "Month 1-3 (KES)", "Month 4-9 (KES)", "Month 10-12 (KES)"],
            ["One-time setup (Section 2)", "150,000", "0", "0"],
            ["Legal (T&amp;C + IP + templates)", "300,000", "50,000", "0"],
            ["Founder allowance", "150,000/mo", "200,000/mo", "250,000/mo"],
            ["Contractors (2 × ~KES 200k)", "400,000/mo", "400,000/mo", "500,000/mo"],
            ["Infra + SaaS (Section 14)", "60,000/mo", "80,000/mo", "100,000/mo"],
            ["Marketing + design", "50,000/mo", "150,000/mo", "300,000/mo"],
            ["Insurance amortised", "40,000/mo", "40,000/mo", "40,000/mo"],
            ["Accounting + compliance", "30,000/mo", "50,000/mo", "70,000/mo"],
            ["Buffer", "50,000/mo", "80,000/mo", "100,000/mo"],
            ["", "Q1: ≈ 2.6M", "Q2-3: ≈ 6M", "Q4: ≈ 3.7M"],
            ["", "", "TOTAL 12 MONTHS", "≈ 12.3M KES (~USD 95k)"],
        ], colWidths=[55*mm, 35*mm, 35*mm, 35*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Cheaper path:</b> Solo founder + no contractors + minimal marketing "
                  "= KES 6-7M/yr (~USD 45-55k).<br/>"
                  "<b>Aggressive path:</b> 5-person team + real marketing = KES 20-25M/yr "
                  "(~USD 150-190k).", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 12: EMPLOYEE vs CONTRACTOR vs EQUITY ───────────────
    story += [
        Paragraph("12. WHEN TO USE EMPLOYEE vs CONTRACTOR vs EQUITY", S["H2"]),
        gtable([
            ["Role", "Recommended engagement"],
            ["Co-founder", "Founders' agreement + shares + salary once profitable"],
            ["Founding engineer #1-2", "Employee + ESOP grant (0.5-2%) + market salary"],
            ["Contract engineer for feature", "Contractor, KES 3-8k/hr or fixed-fee"],
            ["Designer for one-off", "Contractor, fixed-fee KES 100-500k per project"],
            ["Copywriter, SEO, social", "Contractor or agency retainer"],
            ["Community manager / support", "Employee once user base > 5,000"],
            ["Advisor / mentor", "Vested shares (0.1-0.5%) over 2 years, no cash"],
            ["Non-executive board director", "Post-Series A only; cash + shares"],
        ], colWidths=[60*mm, 100*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Contractor red flags (KRA re-classifies as employee):</b><br/>"
                  "• You dictate hours + workplace + tools<br/>"
                  "• Works exclusively for you<br/>"
                  "• Uses your email / laptop / benefits<br/>"
                  "• Ongoing indefinite arrangement<br/>"
                  "Better path if unsure: pay via approved umbrella employer (Deel, Remote) "
                  "at ~10% overhead.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 13: PUBLISH CHECKLIST ──────────────────────────────
    story += [
        Paragraph("13. PUBLISHING CHECKLIST — BEFORE ANY PRODUCT SHIPS", S["H2"]),
        Paragraph("Universal gate. Every product owned by your Ltd must pass this before "
                  "you accept even one shilling from a real user.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph(
            "<b>Legal</b><br/>"
            "☐ Terms of Service published + linked from footer<br/>"
            "☐ Privacy Policy published + DPA-compliant<br/>"
            "☐ Cookie Policy (if analytics)<br/>"
            "☐ Refund / cancellation policy visible<br/>"
            "☐ Contact + complaint channel (email + phone)<br/>"
            "☐ Business address on website (Consumer Protection Act)<br/>"
            "<b>Data</b><br/>"
            "☐ ODPC registration current<br/>"
            "☐ DPO email published (dpo@)<br/>"
            "☐ User export + erasure endpoints working<br/>"
            "☐ Explicit consent captured for each data category<br/>"
            "☐ Vendor DPAs signed (AWS, SendGrid, Anthropic, etc.)<br/>"
            "<b>Security</b><br/>"
            "☐ HTTPS everywhere (auto-renewed certs)<br/>"
            "☐ Secrets rotated + out of git history<br/>"
            "☐ Password hashing bcrypt/argon2, not MD5<br/>"
            "☐ Rate limiting on public endpoints<br/>"
            "☐ Backup runbook tested<br/>"
            "☐ Error monitoring (Sentry) wired<br/>"
            "☐ OWASP Top 10 pen test passed<br/>"
            "<b>Financial</b><br/>"
            "☐ Bank account live<br/>"
            "☐ KRA VAT registered (if applicable)<br/>"
            "☐ Bookkeeper engaged<br/>"
            "☐ Invoice template compliant (KRA e-TIMS)<br/>"
            "<b>Ops</b><br/>"
            "☐ Support email monitored SLA<br/>"
            "☐ Uptime monitoring (Uptime Robot or BetterUptime)<br/>"
            "☐ Status page published (status.yourcompany.co.ke)<br/>"
            "☐ Incident-response runbook ready<br/>"
            "<b>Product-specific</b><br/>"
            "☐ Vertical add-on registrations from Section 5 complete<br/>"
            "☐ Terms specific to product (T&amp;C addendum) drafted",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 14: TOOLS + STACK ──────────────────────────────────
    story += [
        Paragraph("14. TOOLS + SOFTWARE STACK", S["H2"]),
        Paragraph("The essential toolbox. Free tier fine for most until real revenue.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Category", "Recommended", "Free tier fit?"],
            ["Version control", "GitHub", "Yes"],
            ["Issue tracker", "GitHub Projects or Linear", "Yes / free 250 issues"],
            ["CI/CD", "GitHub Actions", "Yes (2000 min/mo)"],
            ["Docs / wiki", "Notion, Coda, or Obsidian", "Yes"],
            ["Design", "Figma", "Yes (up to 3 files)"],
            ["Uptime monitoring", "UptimeRobot / BetterUptime", "Yes"],
            ["Error tracking", "Sentry", "Yes (5k events/mo)"],
            ["Feature flags", "GrowthBook, LaunchDarkly", "GrowthBook OSS"],
            ["Analytics", "PostHog (self-host or cloud), Plausible", "Yes"],
            ["Email", "SendGrid, Resend, Postmark", "SendGrid 100/day"],
            ["Auth (if not custom)", "Clerk, Auth0, Supabase", "Yes"],
            ["DB", "Postgres (Supabase, Neon, Fly.io)", "Yes (limits)"],
            ["Object store", "AWS S3, Backblaze B2, R2", "R2 cheapest egress"],
            ["Password vault", "1Password / Vaultwarden self-host", "Vaultwarden free"],
            ["Video", "Daily.co, LiveKit", "Yes"],
            ["AI API", "Anthropic Claude, OpenAI", "Pay-per-token"],
            ["Marketing site", "Framer, Webflow, or Astro + Vercel", "Free tiers"],
            ["Customer support", "Crisp, Intercom, Chatwoot self-host", "Chatwoot OSS"],
            ["Payments (SaaS)", "Stripe (KE customers) + Flutterwave", "Free until txn"],
            ["Compliance monitoring", "Vanta / Drata / Secureframe", "Paid $$"],
        ], colWidths=[45*mm, 80*mm, 35*mm]),
        PageBreak(),
    ]

    # ── SECTION 15: TEMPLATES ──────────────────────────────────────
    story += [
        Paragraph("15. TEMPLATES + BOILERPLATE", S["H2"]),
        Paragraph("Free-tier templates to seed your legal pack. Have counsel adapt.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Doc", "Source", "Cost"],
            ["Founders' agreement", "Cooley GO, Y Combinator (Kenya-adapted)", "Free"],
            ["Employment contract", "FKE templates + counsel review", "Free + KES 30k review"],
            ["Contractor MSA", "Cooley GO / SPA templates", "Free"],
            ["NDA (mutual + one-way)", "SPA / Bonterms", "Free"],
            ["IP assignment (for founders)", "Cooley GO Startup Legal Toolkit", "Free"],
            ["ESOP plan + option grant", "Cooley GO + KRA + counsel review", "KES 30-80k"],
            ["Data Processing Agreement (DPA)", "Bonterms Community DPA / ICO templates", "Free"],
            ["Privacy Policy generator", "Termly, Iubenda (lawyer-review after)", "Free tier"],
            ["Terms of Service generator", "Termly, Iubenda", "Free tier"],
            ["SaaS Master Service Agreement", "Bonterms", "Free"],
            ["Convertible note / SAFE", "Y Combinator SAFE (adapt to KE)", "Free"],
            ["Board resolution templates", "eCitizen / counsel", "Free"],
            ["Vendor SLA", "SPA templates", "Free"],
        ], colWidths=[60*mm, 65*mm, 35*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Golden rule:</b> free templates get you a first draft. A Kenyan advocate "
                  "must sign off before you rely on any of them. Budget KES 200-500k for the "
                  "review pass covering all 15 docs.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 16: TOTAL COST SUMMARY ─────────────────────────────
    story += [
        Paragraph("16. TOTAL COST SUMMARY", S["H2"]),
        Paragraph("What you'll pay to have a legally clean, IP-protected, publish-ready "
                  "Kenya tech company. Numbers assume solo founder + occasional contractors.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Bucket", "Lean (KES)", "Standard (KES)", "Enterprise (KES)"],
            ["Company + tax + county + ODPC", "50,000", "80,000", "150,000"],
            ["Trademark (1 mark)", "30,000", "60,000", "150,000 (multiple marks)"],
            ["Bank account opening", "0", "20,000", "50,000"],
            ["Legal templates + counsel review", "150,000", "350,000", "800,000"],
            ["Domain + Cloudflare", "3,000", "15,000", "50,000"],
            ["Insurance (year 1)", "150,000", "400,000", "1,000,000"],
            ["Infra + SaaS (year 1)", "300,000", "700,000", "2,000,000"],
            ["Bookkeeping (year 1)", "150,000", "500,000", "1,500,000"],
            ["Pen test (before public launch)", "0 (defer)", "200,000", "500,000"],
            ["Compliance auditor (SOC 2 etc.)", "0", "0", "3,500,000"],
            ["", "", "", ""],
            ["ONE-TIME TOTAL YEAR 1", "≈ 833k", "≈ 2.3M", "≈ 9.7M"],
            ["Annual recurring after Y1", "≈ 400k", "≈ 1.5M", "≈ 6M"],
        ], colWidths=[55*mm, 32*mm, 32*mm, 41*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Pamoja Wealth vertical add-on:</b> +KES 2.5-4.5M (see companion PDF). "
                  "So realistic total to get Pamoja legally live inside a proper Ltd: "
                  "<b>KES 3.5-7M</b> (USD 27-55k) one-time + <b>KES 2-3.5M</b>/yr recurring.", S["Body"]),
        PageBreak(),
    ]

    # ── FINAL PAGE ─────────────────────────────────────────────────
    story += [
        Paragraph("APPENDIX A — FUNDRAISING PATHS", S["H2"]),
        Paragraph("Once your Ltd exists + first product ships, options for capital:", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph(
            "• <b>Bootstrap</b> — revenue-funded. Slower, keep 100% equity.<br/>"
            "• <b>Grants</b> — Google for Startups, Mozilla Builders, MEST, Innovate UK "
            "(if UK partner), Bill &amp; Melinda Gates Foundation (health/fintech-for-poor). "
            "No dilution.<br/>"
            "• <b>Accelerators</b> — Antler Nairobi, MEST Africa, Founders Factory. "
            "Typically 6-10% equity for USD 25-100k + program.<br/>"
            "• <b>Angel</b> — Nairobi Business Angel Network (NaiBAN), Africa Business Angels "
            "Network (ABAN). USD 25-200k rounds.<br/>"
            "• <b>Pre-Seed VC</b> — Ventures Platform, Norrsken, LoftyInc, Chandaria Capital, "
            "TLcom Capital, Novastar. USD 250k-1M cheques.<br/>"
            "• <b>Seed VC</b> — Partech, Endeavor, Y Combinator (remote batches), Techstars.<br/>"
            "• <b>Debt</b> — SPARK+ (Kenya), Vested World, Watu Africa (asset-backed only).<br/>"
            "• <b>Revenue-based financing</b> — Uncapped, Karmen, Wayflyer.<br/>",
            S["Body"]),
        Spacer(1, 6 * mm),
        Paragraph("APPENDIX B — HANDY GOVERNMENT LINKS", S["H2"]),
        Paragraph(
            "• brs.ecitizen.go.ke — company registration<br/>"
            "• itax.kra.go.ke — KRA<br/>"
            "• nairobi.go.ke — county permits<br/>"
            "• odpc.go.ke — data protection<br/>"
            "• kipi.go.ke — trademark + patent<br/>"
            "• kecobo.co.ke — copyright<br/>"
            "• fke.or.ke — employer federation (templates)<br/>"
            "• nita.go.ke — training levy<br/>"
            "• sha.go.ke — Social Health Authority<br/>"
            "• nssfkenya.co.ke — NSSF<br/>"
            "• konza.go.ke — Konza Tech City<br/>"
            "• startupkenya.go.ke — Startup Bill portal<br/>"
            "• frc.go.ke — AML (fintech)<br/>"
            "• cbk.go.ke — Central Bank (fintech)<br/>"
            "• cma.or.ke — Capital Markets Authority (securities)",
            S["Body"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=1, width="60%"),
        Spacer(1, 4 * mm),
        Paragraph("<b>Regenerate anytime:</b>", S["Body"]),
        Paragraph("<font face='Courier'>cd pamoja-wealth &amp;&amp; "
                  "python3 scripts/generate_tech_company_kit.py</font>", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Companion documents:</b><br/>"
                  "• PAMOJA_WEALTH_GO_LIVE_MASTER.pdf — first product's technical handbook<br/>"
                  "• PAMOJA_WEALTH_LICENSES_AND_FEES.pdf — fintech-specific licenses<br/>"
                  "• This kit — parent-company setup",
                  S["Muted"]),
        Spacer(1, 4 * mm),
        Paragraph("Not legal, tax, or financial advice. All fees change; verify with a "
                  "licensed Kenyan advocate + accountant before committing money.",
                  S["Muted"]),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "docs",
                       "TECH_COMPANY_INCEPTION_KIT.pdf")
    build(out)
    print(f"Generated: {out}")
