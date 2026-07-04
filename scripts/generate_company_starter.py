#!/usr/bin/env python3
"""
COMPANY_STARTER_KIT.pdf

Rock-bottom starter kit for a first-time Kenyan founder registering a
tech company on a shoestring. Skips everything not blocking launch.

Total spend target: KES 60,000 (~USD 460) one-off + KES 5,000/mo max.

Run:  python3 scripts/generate_company_starter.py
Out:  docs/COMPANY_STARTER_KIT.pdf
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

BRAND = HexColor("#7C3AED")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")
BG = HexColor("#F9FAFB")
OK = HexColor("#059669")
DANGER = HexColor("#DC2626")


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
    return ss


def header_footer(canvas, doc):
    canvas.saveState()
    canvas.setFillColor(BRAND)
    canvas.rect(0, A4[1] - 20 * mm, A4[0], 20 * mm, stroke=0, fill=1)
    canvas.setFillColor(white)
    canvas.setFont("Helvetica-Bold", 12)
    canvas.drawString(20 * mm, A4[1] - 13 * mm, "Company Starter Kit — Kenya · Budget Path")
    canvas.setFont("Helvetica", 8)
    canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm,
                           datetime.now().strftime("Rev. %Y-%m-%d"))
    canvas.setFillColor(MUTED)
    canvas.setFont("Helvetica", 8)
    canvas.drawCentredString(A4[0] / 2, 12 * mm,
                             f"Page {doc.page}  ·  For first-time founders · Not legal advice")
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
        Paragraph("Company Starter Kit", S["H1"]),
        Paragraph("Rock-bottom Kenya tech-company setup for a first-time founder.<br/>"
                  "One-off spend target: <b>KES 60,000</b> (~USD 460). "
                  "Monthly recurring: <b>under KES 5,000</b> until revenue proves the model.",
                  S["Body"]),
        Spacer(1, 6 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 6 * mm),
        Paragraph(f"Prepared: {datetime.now().strftime('%d %B %Y')}", S["Muted"]),
        Paragraph("Companion: PAMOJA_WEALTH_STARTER.pdf (your first product).", S["Muted"]),
        Spacer(1, 8 * mm),
        Paragraph("What this kit deliberately skips", S["H2"]),
        Paragraph(
            "• No lawyer retainer — free templates + KES 80-150k review only when revenue justifies.<br/>"
            "• No SOC 2 / ISO 27001 — millions in cert cost, do at enterprise ask.<br/>"
            "• No expensive KYC vendors — DIY or self-attest until 1000 users.<br/>"
            "• No comprehensive insurance bundle — cyber only, add rest when hiring.<br/>"
            "• No trademark filing — do at 500 users; priority date is the day you file.<br/>"
            "• No paid office — home address is fine until customer visits become normal.<br/>"
            "• No employees — contractors + you until revenue &gt; KES 500k/mo.",
            S["Body"]),
        Spacer(1, 5 * mm),
        Paragraph("What this kit refuses to skip (blockers)", S["H3"]),
        Paragraph(
            "Company registration · KRA PIN · county permit · ODPC · bank account · "
            "domain · basic legal templates (free) · cyber insurance · backup.",
            S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 1: MINIMUM VIABLE SPEND ────────────────────────────
    story += [
        Paragraph("1. MINIMUM VIABLE SPEND — DAY 1", S["H2"]),
        Paragraph("Every shilling. Nothing else needed to legally exist as a Kenyan Ltd.",
                  S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Item", "Cost (KES)", "Where"],
            ["Name search + reservation", "150", "brs.ecitizen.go.ke"],
            ["Company registration + stamp duty", "10,500", "brs.ecitizen.go.ke"],
            ["KRA PIN (company)", "0", "itax.kra.go.ke"],
            ["Nairobi county permit (small)", "15,000", "nairobi.go.ke"],
            ["ODPC data-protection reg (small)", "4,000", "odpc.go.ke"],
            ["Bank account opening (Equity/KCB)", "0", "Branch visit"],
            ["Domain (.co.ke 1 year)", "1,500", "kenic.or.ke"],
            ["OR (.app / .com 1 year)", "1,800", "Namecheap"],
            ["Cyber liability insurance (small)", "≈ 25,000", "ICEA / Britam / broker"],
            ["FRC AML registration (fintech only)", "0", "frc.go.ke"],
            ["Cloudflare Pro DNS + WAF (optional)", "USD 20/mo", "cloudflare.com"],
            ["Domain email (Zoho Free / Gmail Workspace)", "0 – USD 6/user", "zoho.com / google"],
            ["", "≈ 56,000", "≈ USD 435"],
        ], colWidths=[70*mm, 40*mm, 50*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>That's it.</b> You are now a legal Kenyan tech company that can bank, "
                  "sell software, and take payments (once your product is ready).", S["OK"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Skip cyber insurance in month 1</b> if you're pre-launch and not "
                  "storing customer data yet. Add it before you touch a real customer.", S["Muted"]),
        PageBreak(),
    ]

    # ── SECTION 2: SEQUENCE ─────────────────────────────────────────
    story += [
        Paragraph("2. SEQUENCE — 14-DAY REGISTRATION SPRINT", S["H2"]),
        Paragraph("Do these in order. Don't spend on step N+1 until N clears.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Day", "Action", "Cost", "Waits on"],
            ["1", "Get personal KRA PIN if you don't have one", "0", "Nothing"],
            ["1", "Reserve company name at BRS eCitizen", "150", "Nothing"],
            ["2", "Prepare CR1 + CR8 + BO1 forms", "0", "Name approval"],
            ["3", "Submit registration on eCitizen", "10,500", "Docs ready"],
            ["3-14", "Wait for Certificate of Incorporation", "0", "BRS review"],
            ["+1d", "Register company on iTax → get PIN", "0", "Certificate"],
            ["+2d", "Apply Nairobi Single Business Permit", "15,000", "Certificate"],
            ["+3d", "ODPC registration (small enterprise)", "4,000", "Certificate"],
            ["+3d", "Buy domain + point at Cloudflare", "1,500-2,000", "Nothing"],
            ["+5d", "Bank appointment (Equity/KCB with all docs)", "0", "Certificate + permit"],
            ["+10d", "Bank account activated", "0", "Bank KYC"],
        ], colWidths=[15*mm, 65*mm, 30*mm, 40*mm]),
        Spacer(1, 4 * mm),
        Paragraph("Realistic timeline: <b>2-3 weeks</b> if paperwork is clean.<br/>"
                  "Delays usually come from BRS name search + bank KYC. "
                  "Bring 5 name alternatives to the first BRS submission.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 3: FREE STACK ───────────────────────────────────────
    story += [
        Paragraph("3. FREE-TIER STACK — INFRA + SAAS", S["H2"]),
        Paragraph("Everything a solo founder needs. All free tiers hold up to 500-1000 "
                  "users. Move to paid only when hitting real limits.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Category", "Tool", "Free tier limit"],
            ["Version control", "GitHub", "Unlimited private repos"],
            ["CI/CD", "GitHub Actions", "2000 min/mo"],
            ["Frontend host", "Vercel or Cloudflare Pages", "100 GB bandwidth"],
            ["Backend host", "Fly.io", "USD 5 free credit/mo"],
            ["Database", "Supabase or Neon (Postgres)", "500 MB storage"],
            ["Cache/Queue", "Upstash Redis", "10k commands/day"],
            ["Object storage", "Cloudflare R2", "10 GB free + zero egress"],
            ["DNS + WAF + CDN", "Cloudflare Free", "Unlimited"],
            ["TLS certs", "Let's Encrypt", "Unlimited (auto-renew)"],
            ["Email transactional", "SendGrid or Resend", "100/day free"],
            ["SMS (Kenya)", "Africa's Talking", "Pay-as-go from KES 0.80"],
            ["Push notifications", "Firebase Cloud Messaging", "Unlimited"],
            ["Error monitoring", "Sentry", "5k events/mo"],
            ["Uptime monitor", "UptimeRobot", "50 monitors, 5-min interval"],
            ["Password manager", "Vaultwarden self-host", "Free (Docker container)"],
            ["Analytics", "PostHog self-host or Plausible", "Free / paid tier tiny"],
            ["Design", "Figma", "3 files free"],
            ["Docs / wiki", "Notion / Obsidian", "Personal free"],
            ["Business email", "Zoho Mail Free", "5 users, 5 GB each"],
            ["Bookkeeping", "Wave or Zoho Books Starter", "Free / KES 2k/mo"],
            ["Customer support", "Crisp free tier or Chatwoot self-host", "Free"],
            ["Video calls", "Google Meet (free 60 min)", "Free"],
        ], colWidths=[40*mm, 55*mm, 65*mm]),
        Spacer(1, 3 * mm),
        Paragraph("<b>Monthly infra cost at this stack: USD 0-8.</b> Move to Vercel Pro / "
                  "Supabase Pro / Sentry Team only when you cross their free tiers — "
                  "which happens around 1,000-5,000 active users.", S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 4: LEGAL DIY ───────────────────────────────────────
    story += [
        Paragraph("4. LEGAL DOCUMENTS — DIY BOOTSTRAP", S["H2"]),
        Paragraph("Every doc you need before launch. Use free templates. Pay a lawyer only "
                  "for one review pass at KES 80-150k when your product is validated.",
                  S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Doc", "Free template source", "Cost"],
            ["Terms of Service", "Termly.io generator", "0"],
            ["Privacy Policy", "Termly.io + DPA §30 checklist", "0"],
            ["Cookie Policy (if analytics)", "Termly.io", "0"],
            ["AML/CFT Policy (fintech)", "frc.go.ke template + adapt", "0"],
            ["Data Retention Policy", "ICO UK template + adapt", "0"],
            ["Data Breach Response Plan", "Google 'DPA breach template'", "0"],
            ["Vendor DPA", "Bonterms Community DPA", "0"],
            ["User consent flow", "Copy from any GDPR checklist", "0"],
            ["NDA (mutual + one-way)", "SPA templates / Bonterms", "0"],
            ["IP assignment (founders)", "Cooley GO Startup Toolkit", "0"],
            ["Employment contract", "FKE templates", "0"],
            ["Contractor MSA", "Cooley GO", "0"],
            ["SAFE / convertible", "Y Combinator template", "0"],
            ["Chama constitution", "MoSSA templates (if fintech)", "0"],
        ], colWidths=[65*mm, 65*mm, 30*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>When to pay a lawyer:</b><br/>"
                  "• Before signing first big customer/SAFE — KES 80-150k review pass<br/>"
                  "• Before hiring first employee — employment contract review, KES 30-50k<br/>"
                  "• Before taking VC money — full pack review, KES 300-500k<br/>"
                  "• Never for the initial templates. Free templates + your own careful reading "
                  "  cover you until real money is involved.", S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Cheap Kenyan firms for the eventual review:</b>", S["H3"]),
        Paragraph(
            "• <b>Wamae &amp; Allen</b> — mid-market, startup-friendly<br/>"
            "• <b>MMAN Advocates</b> — good for compliance ops<br/>"
            "• <b>Coulson Harney (Bowmans local)</b> — mid-tier tech desk<br/>"
            "Avoid ALN / Kaplan &amp; Stratton until you have revenue &mdash; they charge KES 40-70k/hr.",
            S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 5: TAX AND FOUNDER SALARY ──────────────────────────
    story += [
        Paragraph("5. TAX POSTURE ON A BUDGET", S["H2"]),
        Paragraph("Pay yourself the smallest legal amount until revenue exists. Save "
                  "everything else in the company.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("5.1 Founder salary strategy", S["H3"]),
        Paragraph(
            "• Pay yourself KES 30,000/mo salary — below the PAYE threshold + accrues "
            "  NSSF + SHA + Housing contributions (~KES 3,000 total statutory).<br/>"
            "• Draw more as needed via director's loan (short-term, interest-bearing).<br/>"
            "• Once profitable (usually year 2), pay dividends after 30% CIT.<br/>"
            "• Register a Personal Pension Plan (Sanlam / CIC) — KES 5-20k/mo "
            "  tax-deductible contribution.", S["Body"]),
        Spacer(1, 3 * mm),
        Paragraph("5.2 KRA obligations (pre-revenue)", S["H3"]),
        Paragraph(
            "• File nil returns monthly (PAYE + VAT) — takes 5 minutes on iTax.<br/>"
            "• File nil annual corporate return (Form IT-2C) — takes 30 minutes.<br/>"
            "• Once turnover crosses KES 5M — VAT registration mandatory.<br/>"
            "• KRA e-TIMS device: skip until revenue &gt; 5M (mandatory then).<br/>"
            "• <b>Fine for missed filings: KES 10,000/return.</b> Set calendar reminders.", S["Danger"]),
        Spacer(1, 3 * mm),
        Paragraph("5.3 Bookkeeping — cheapest working setup", S["H3"]),
        Paragraph(
            "• Wave Accounting — free forever, decent for KE.<br/>"
            "• Zoho Books Starter — KES 2,000/mo, KE-VAT-aware.<br/>"
            "• Do it yourself monthly until revenue &gt; KES 300k/mo. Then hire a "
            "  part-time bookkeeper at KES 20-30k/mo.<br/>"
            "• Annual audit: only mandatory when turnover &gt; KES 25M. Below that, skip. "
            "Save KES 300-600k/yr.", S["Body"]),
        PageBreak(),
    ]

    # ── SECTION 6: MONTH-BY-MONTH SPEND ────────────────────────────
    story += [
        Paragraph("6. MONTH-BY-MONTH SPEND (Y1)", S["H2"]),
        Paragraph("Solo founder, no contractors, home office, ship first product.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Month", "Actions", "Spend (KES)"],
            ["M1", "Register everything (Section 2)", "31,000"],
            ["M1", "Domain + Cloudflare + email + Vaultwarden", "3,000"],
            ["M2", "ODPC + bank open + Zoho Books start", "6,000"],
            ["M2", "Ship v1 MVP to 10 friends (free hosting)", "0"],
            ["M3", "Iterate on feedback", "0 – 5,000"],
            ["M3", "Cyber insurance if touching data", "25,000"],
            ["M4", "First 50 users; move Postgres to Supabase Pro if needed", "0 – 3,000"],
            ["M5", "Lawyer review pass on all templates", "80,000 – 150,000"],
            ["M6", "First paying customer — celebrate", "0"],
            ["M7-9", "Growth: paid ads if revenue allows", "20,000 – 100,000/mo"],
            ["M10-12", "Consider first contractor, add PI insurance", "50,000 – 100,000"],
            ["", "TOTAL Y1 SOLO PATH", "≈ 250,000 – 400,000"],
        ], colWidths=[15*mm, 100*mm, 45*mm]),
        Spacer(1, 4 * mm),
        Paragraph("<b>Absolute floor: KES 60,000 registrations + KES 100k cyber insurance "
                  "+ KES 100k lawyer + KES 40k domain/hosting/tools = KES 300,000</b> "
                  "(~USD 2,300) to have a legally-live company running a live product.",
                  S["OK"]),
        PageBreak(),
    ]

    # ── SECTION 7: WHEN TO UPGRADE ─────────────────────────────────
    story += [
        Paragraph("7. WHEN TO GRADUATE FROM STARTER TIER", S["H2"]),
        Paragraph("Trigger points to move off free tools + pay for the next tier.", S["Body"]),
        Spacer(1, 3 * mm),
        gtable([
            ["Trigger", "Upgrade"],
            ["First paying customer", "Cyber insurance if not already"],
            ["100 active users", "Move Postgres to Supabase Pro (USD 25/mo)"],
            ["500 users", "SendGrid Essentials (USD 20/mo)"],
            ["500 users", "Vercel Pro (USD 20/mo) if traffic spikes"],
            ["1000 users", "Sentry Team (USD 26/mo)"],
            ["1000 users", "Real KYC vendor (Smile Identity ~USD 500 setup)"],
            ["Revenue &gt; KES 500k/mo", "Hire first contractor (KES 100-300k/mo)"],
            ["Revenue &gt; KES 1M/mo", "First employee + full insurance bundle"],
            ["Revenue &gt; KES 5M/mo", "PI + Fidelity + D&amp;O + Trademark + Bookkeeper"],
            ["First enterprise customer asks", "SOC 2 via Vanta (USD 15-30k/yr)"],
            ["Fundraising round appears", "Full legal pack review (KES 300-500k)"],
        ], colWidths=[60*mm, 100*mm]),
        PageBreak(),
    ]

    # ── SECTION 8: MISTAKES TO AVOID ───────────────────────────────
    story += [
        Paragraph("8. EXPENSIVE MISTAKES TO AVOID", S["H2"]),
        gtable([
            ["Mistake", "Cost"],
            ["Sole proprietorship instead of Ltd", "Can't open bank / Daraja / Flutterwave. Re-register KES 15k + weeks"],
            ["Skipping ODPC registration", "Fine: KES 5M or 1% turnover"],
            ["Using personal bank account for business", "Bank freeze + tax mess"],
            ["No T&amp;C on website before selling", "Consumer Protection Act, up to KES 10M"],
            ["Storing customer money in personal wallet", "CBK views as unlicensed e-money, KES 10M + closure"],
            ["Skipping FRC registration (fintech)", "KES 5M + personal liability"],
            ["Missing KRA nil returns", "KES 10k per missed return, compounds"],
            ["Using free/cracked commercial software", "Copyright suit + reputational damage"],
            ["Skipping IP assignment from co-founders", "They own the code, breaks investor DD"],
            ["Home address on public records", "Family harassment if issue erupts. Use virtual office."],
        ], colWidths=[80*mm, 80*mm]),
        PageBreak(),
    ]

    # ── SECTION 9: LINKS ───────────────────────────────────────────
    story += [
        Paragraph("9. LINKS + TEMPLATES", S["H2"]),
        Paragraph("Government portals", S["H3"]),
        Paragraph(
            "• brs.ecitizen.go.ke — company registration<br/>"
            "• itax.kra.go.ke — KRA<br/>"
            "• nairobi.go.ke — county permit<br/>"
            "• odpc.go.ke — data protection<br/>"
            "• frc.go.ke — AML (fintech)<br/>"
            "• kipi.go.ke — trademark (later)<br/>"
            "• nssfkenya.co.ke — NSSF<br/>"
            "• sha.go.ke — health<br/>"
            "• kenic.or.ke — .co.ke domain",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("Free template portals", S["H3"]),
        Paragraph(
            "• termly.io — T&amp;C + Privacy + Cookie generators<br/>"
            "• cooley.com/go — SAFE, IP assignment, board resolutions<br/>"
            "• bonterms.com — SaaS MSA, DPA, NDA<br/>"
            "• y-combinator/legal — YC SAFE + safeguards<br/>"
            "• fke.or.ke — Kenyan employment templates<br/>"
            "• github.com/nayafia/lemonade-stand — open-source SaaS legal boilerplate",
            S["Body"]),
        Spacer(1, 4 * mm),
        Paragraph("Free tools to install day 1", S["H3"]),
        Paragraph(
            "• Password manager (Vaultwarden Docker)<br/>"
            "• 2FA app (Aegis / Bitwarden Authenticator)<br/>"
            "• GitHub with signed commits (GPG or Sigstore)<br/>"
            "• Cloudflare account with DNSSEC on<br/>"
            "• Sentry account with DSN in .env<br/>"
            "• Backup script for database (nightly, encrypted, off-server)",
            S["Body"]),
        Spacer(1, 8 * mm),
        HRFlowable(color=BRAND, thickness=1, width="60%"),
        Spacer(1, 4 * mm),
        Paragraph("Regenerate: <font face='Courier'>python3 scripts/generate_company_starter.py</font>",
                  S["Muted"]),
        Paragraph("Companion: PAMOJA_WEALTH_STARTER.pdf — your first product's budget playbook.",
                  S["Muted"]),
        Paragraph("Not legal, tax, or financial advice.", S["Muted"]),
    ]

    doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)


if __name__ == "__main__":
    out = os.path.join(os.path.dirname(__file__), "..", "docs",
                       "COMPANY_STARTER_KIT.pdf")
    build(out)
    print(f"Generated: {out}")
