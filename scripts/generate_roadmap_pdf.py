#!/usr/bin/env python3
"""Generate Pamoja Wealth Go-Live Roadmap & Revenue Blueprint PDF"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white, grey
from reportlab.lib.units import mm, inch
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, PageBreak, Table, TableStyle,
    ListFlowable, ListItem, KeepTogether, HRFlowable
)
from reportlab.platypus.tableofcontents import TableOfContents
from reportlab.pdfgen import canvas
from reportlab.platypus.doctemplate import PageTemplate, BaseDocTemplate, Frame
from reportlab.platypus.frames import Frame
import os
from datetime import datetime

# ── Colors ──────────────────────────────────────────────────
GREEN = HexColor('#059669')
GREEN_DARK = HexColor('#047857')
GREEN_LIGHT = HexColor('#d1fae5')
GOLD = HexColor('#d4a853')
GOLD_LIGHT = HexColor('#fef3c7')
DARK = HexColor('#1a1a2e')
MEDIUM = HexColor('#4a5568')
LIGHT_BG = HexColor('#f0fdf4')
WHITE = white
RED = HexColor('#dc2626')
ORANGE = HexColor('#ea580c')
BLUE = HexColor('#2563eb')

# ── Page Setup ──────────────────────────────────────────────
PAGE_W, PAGE_H = A4

# ── Styles ──────────────────────────────────────────────────
styles = getSampleStyleSheet()

body_style = ParagraphStyle(
    'Body', parent=styles['Normal'],
    fontName='Helvetica', fontSize=9, leading=14,
    textColor=MEDIUM, spaceAfter=6,
)

heading1 = ParagraphStyle(
    'H1', parent=styles['Heading1'],
    fontName='Helvetica-Bold', fontSize=22, leading=28,
    textColor=GREEN_DARK, spaceAfter=12, spaceBefore=20,
)

heading2 = ParagraphStyle(
    'H2', parent=styles['Heading2'],
    fontName='Helvetica-Bold', fontSize=16, leading=22,
    textColor=GREEN_DARK, spaceAfter=10, spaceBefore=18,
)

heading3 = ParagraphStyle(
    'H3', parent=styles['Heading3'],
    fontName='Helvetica-Bold', fontSize=12, leading=16,
    textColor=DARK, spaceAfter=8, spaceBefore=14,
)

bullet_style = ParagraphStyle(
    'Bullet', parent=body_style,
    leftIndent=20, bulletIndent=10,
    spaceBefore=2, spaceAfter=2,
)

small_style = ParagraphStyle(
    'Small', parent=body_style,
    fontSize=7, leading=10, textColor=grey,
)

code_style = ParagraphStyle(
    'Code', parent=body_style,
    fontName='Courier', fontSize=8, leading=11,
    textColor=DARK, backColor=LIGHT_BG,
    leftIndent=12, rightIndent=12,
    spaceBefore=4, spaceAfter=4,
)

title_style = ParagraphStyle(
    'Title', parent=styles['Title'],
    fontName='Helvetica-Bold', fontSize=28, leading=34,
    textColor=WHITE,
)

subtitle_style = ParagraphStyle(
    'Subtitle', parent=body_style,
    fontName='Helvetica', fontSize=14, leading=20,
    textColor=HexColor('#a7f3d0'),
)

highlight_box = ParagraphStyle(
    'HighlightBox', parent=body_style,
    fontSize=10, leading=15,
    backColor=GOLD_LIGHT, textColor=DARK,
    leftIndent=8, rightIndent=8,
    spaceBefore=6, spaceAfter=6,
    borderPadding=10,
)

# ── Helper functions ────────────────────────────────────────
def heading(text, level=2):
    s = heading2 if level == 2 else heading3
    return Paragraph(text, s)

def body(text):
    return Paragraph(text, body_style)

def bullet(text):
    return Paragraph(f"<bullet>&bull;</bullet> {text}", bullet_style)

def code(text):
    return Paragraph(text, code_style)

def spacer(h=8):
    return Spacer(1, h)

def hr():
    return HRFlowable(width="100%", thickness=0.5, color=GREEN_LIGHT, spaceAfter=10, spaceBefore=10)

def make_table(headers, rows, col_widths=None):
    """Create a styled table with header row"""
    all_rows = [[Paragraph(h, ParagraphStyle('th', parent=body_style, fontName='Helvetica-Bold', textColor=WHITE, fontSize=8)) for h in headers]]
    for row in rows:
        all_rows.append([Paragraph(str(c), ParagraphStyle('td', parent=body_style, fontSize=8)) for c in row])

    t = Table(all_rows, colWidths=col_widths, repeatRows=1)
    style_cmds = [
        ('BACKGROUND', (0, 0), (-1, 0), GREEN),
        ('TEXTCOLOR', (0, 0), (-1, 0), WHITE),
        ('ALIGN', (0, 0), (-1, 0), 'LEFT'),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('GRID', (0, 0), (-1, -1), 0.5, GREEN_LIGHT),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [WHITE, LIGHT_BG]),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ]
    t.setStyle(TableStyle(style_cmds))
    return t

def check_item(text):
    return Paragraph(f"<font color='#059669'>[X]</font> {text}", bullet_style)

def todo_item(text):
    return Paragraph(f"<font color='#ea580c'>[&nbsp;&nbsp;]</font> {text}", bullet_style)

def flowable_section(title_text, content_items):
    """Create a section with title and bullet list that stays together"""
    elems = [heading(title_text)]
    for item in content_items:
        elems.append(bullet(item))
    return KeepTogether(elems)

# ── Cover Page ──────────────────────────────────────────────
def draw_cover_page(canvas_obj, doc):
    canvas_obj.saveState()
    # Green background
    canvas_obj.setFillColor(GREEN)
    canvas_obj.rect(0, 0, PAGE_W, PAGE_H, fill=1, stroke=0)

    # Decorative elements
    canvas_obj.setFillColor(GREEN_DARK)
    canvas_obj.rect(0, PAGE_H * 0.55, PAGE_W, PAGE_H * 0.45, fill=1, stroke=0)

    # Gold accent line
    canvas_obj.setStrokeColor(GOLD)
    canvas_obj.setLineWidth(3)
    canvas_obj.line(50, PAGE_H * 0.58, PAGE_W * 0.6, PAGE_H * 0.58)

    # Title
    canvas_obj.setFillColor(WHITE)
    canvas_obj.setFont('Helvetica-Bold', 32)
    canvas_obj.drawString(50, PAGE_H * 0.68, "Pamoja Wealth")

    canvas_obj.setFont('Helvetica', 18)
    canvas_obj.setFillColor(HexColor('#a7f3d0'))
    canvas_obj.drawString(50, PAGE_H * 0.63, "Production Go-Live Roadmap")

    canvas_obj.setFont('Helvetica', 14)
    canvas_obj.drawString(50, PAGE_H * 0.53, "& Revenue Blueprint 2026")

    # Info
    canvas_obj.setFont('Helvetica', 9)
    canvas_obj.setFillColor(HexColor('#a7f3d0'))
    canvas_obj.drawString(50, PAGE_H * 0.38, f"Generated: {datetime.now().strftime('%B %d, %Y')}")
    canvas_obj.drawString(50, PAGE_H * 0.35, "Confidential - For Internal Use Only")
    canvas_obj.drawString(50, PAGE_H * 0.32, "Target Markets: Kenya, East Africa, Diaspora")

    # Bottom text
    canvas_obj.setFont('Helvetica-Bold', 11)
    canvas_obj.setFillColor(WHITE)
    canvas_obj.drawString(50, PAGE_H * 0.18, "From Chama to Wealth - Africa's Trusted")
    canvas_obj.drawString(50, PAGE_H * 0.14, "Group Savings & Fundraising Platform")

    canvas_obj.restoreState()

# ── Header/Footer ───────────────────────────────────────────
def draw_header_footer(canvas_obj, doc):
    canvas_obj.saveState()
    canvas_obj.setFont('Helvetica', 7)
    canvas_obj.setFillColor(grey)

    # Header
    canvas_obj.setStrokeColor(GREEN)
    canvas_obj.setLineWidth(1)
    canvas_obj.line(40, PAGE_H - 40, PAGE_W - 40, PAGE_H - 40)
    canvas_obj.drawString(40, PAGE_H - 35, "Pamoja Wealth")
    canvas_obj.drawRightString(PAGE_W - 40, PAGE_H - 35, "Go-Live Roadmap & Revenue Blueprint")

    # Footer
    canvas_obj.line(40, 35, PAGE_W - 40, 35)
    canvas_obj.drawString(40, 22, f"Confidential - Page {doc.page}")
    canvas_obj.drawRightString(PAGE_W - 40, 22, "pamojawealth.app")

    canvas_obj.restoreState()

# ── Document Setup ──────────────────────────────────────────
doc = BaseDocTemplate(
    os.path.join(os.path.dirname(__file__), '..', 'docs', 'PAMOJA_WEALTH_GO_LIVE_ROADMAP.pdf'),
    pagesize=A4,
    leftMargin=45, rightMargin=45,
    topMargin=50, bottomMargin=45,
    title='Pamoja Wealth - Production Go-Live Roadmap & Revenue Blueprint',
    author='Pamoja Wealth Engineering',
    subject='Go-Live Roadmap',
)

# Custom page templates
cover_frame = Frame(0, 0, PAGE_W, PAGE_H, id='cover')
content_frame = Frame(45, 45, PAGE_W - 90, PAGE_H - 90, id='content')

cover_template = PageTemplate(id='Cover', frames=[cover_frame], onPage=draw_cover_page)
content_template = PageTemplate(id='Content', frames=[content_frame], onPage=draw_header_footer)

doc.addPageTemplates([cover_template, content_template])

# ── Build Story ─────────────────────────────────────────────
story = []

# After cover page, switch to content template
from reportlab.platypus.doctemplate import NextPageTemplate
story.append(NextPageTemplate(['Cover', 'Content']))

# Placeholder for cover (first page handles it via template)
story.append(Spacer(1, 1))
story.append(PageBreak())

# ── TABLE OF CONTENTS ───────────────────────────────────────
story.append(heading("Table of Contents", 1))
story.append(spacer(10))

toc_items = [
    ("1.", "Executive Summary", "Current status, what's built, what remains"),
    ("2.", "M-Pesa Daraja Go-Live Steps", "Registration, credentials, production deployment"),
    ("3.", "App Store & Play Store Submission", "iOS & Android packaging, store requirements"),
    ("4.", "Kenya Regulatory Compliance", "CBK, DPA 2019, AML/CFT, SACCO alignment"),
    ("5.", "Revenue & Monetization Blueprint", "Subscriptions, fees, projections Year 1-3"),
    ("6.", "Missing Features to Build", "B2C, KYC, multi-rail, diaspora, credit scoring"),
    ("7.", "Technical Deployment Checklist", "Infrastructure, CI/CD, monitoring, security"),
    ("8.", "Go-to-Market Timeline", "6-month launch plan with milestones"),
    ("9.", "Appendix", "Environment variables, API reference, team structure"),
]
for num, title, desc in toc_items:
    story.append(Paragraph(
        f'<font size="11"><b>{num}</b> <font color="#059669">{title}</font></font><br/>'
        f'<font size="8" color="#888888">&nbsp;&nbsp;&nbsp;&nbsp;{desc}</font>',
        ParagraphStyle('TOC', parent=body_style, spaceAfter=10, leading=16)
    ))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 1: EXECUTIVE SUMMARY
# ═══════════════════════════════════════════════════════════════
story.append(heading("1. Executive Summary", 1))
story.append(hr())

story.append(body(
    "Pamoja Wealth is a comprehensive digital platform for managing Chamas (informal savings groups), "
    "fundraisers (Harambee), and collective investment groups across Kenya and East Africa. The system "
    "has been built as a full-stack application with a React 19 + TypeScript frontend and a Node.js + "
    "Express + Prisma backend, featuring over 110 API endpoints, 30 database models, and a rich "
    "mock-data demo with 33+ pages."
))

story.append(heading("Current System Status"))
story.append(body(
    "The platform is currently in <b>advanced prototype/demo stage</b> with a fully functional "
    "mock-data frontend and a feature-complete backend that runs locally. All core business logic "
    "is implemented but several integrations are feature-flagged off pending production credentials."
))

story.append(spacer(6))

# Status table
status_headers = ['Component', 'Status', 'Details']
status_rows = [
    ['Frontend (React 19 + TS)', 'COMPLETE', '33+ pages, 62+ components, mock data, all flows working'],
    ['Backend API (Express + Prisma)', 'COMPLETE', '110+ endpoints, 30 models, RBAC, audit logging'],
    ['Database Schema', 'COMPLETE', 'PostgreSQL, 28 enums, 30 models, full migration ready'],
    ['M-Pesa STK Push', 'CODE READY', 'Feature-flagged off, needs production credentials'],
    ['M-Pesa C2B Paybill', 'CODE READY', 'Webhook handlers built, needs production shortcode'],
    ['M-Pesa B2C Payout', 'NEEDS BUILD', 'Schema exists, service not implemented'],
    ['Subscription Billing', 'COMPLETE', '4 tiers, coupons, invoices, M-Pesa/card checkout'],
    ['Double-Entry Ledger', 'COMPLETE', 'Full accounting with imbalance detection'],
    ['AI Rule Compiler', 'CODE READY', 'Needs AI API keys and plan gate'],
    ['KYC System', 'PARTIAL', 'DB fields exist, upload/verification flow not built'],
    ['Mobile App (Capacitor)', 'NOT STARTED', 'Frontend is Capacitor-ready, no native config yet'],
    ['CI/CD Pipeline', 'NOT STARTED', 'No GitHub Actions or Docker configs'],
    ['Production Infrastructure', 'NOT STARTED', 'Docker Compose for dev only'],
    ['Regulatory Compliance', 'NOT STARTED', 'No CBK/ODPC registration yet'],
    ['Testing Coverage', 'LOW', '7 test files for 110+ endpoints'],
]
story.append(make_table(status_headers, status_rows, col_widths=[160, 100, 250]))
story.append(spacer(10))

story.append(heading("What This Roadmap Covers"))
story.append(body(
    "This document provides a step-by-step blueprint to take Pamoja Wealth from its current "
    "prototype stage to a fully production-ready, revenue-generating platform published on both "
    "the Apple App Store and Google Play Store. It covers M-Pesa go-live, mobile app packaging, "
    "regulatory compliance, revenue model design, missing feature builds, infrastructure deployment, "
    "and a month-by-month go-to-market timeline."
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 2: M-PESA DARAJA GO-LIVE STEPS
# ═══════════════════════════════════════════════════════════════
story.append(heading("2. M-Pesa Daraja Go-Live Steps", 1))
story.append(hr())

story.append(body(
    "M-Pesa is the dominant payment method in Kenya, used by over 96% of the population. "
    "Getting the Daraja API into production is the single most critical step for Pamoja Wealth. "
    "Without live M-Pesa, the platform cannot process real contributions, donations, or payouts."
))

story.append(heading("2.1 Prerequisites Checklist"))
prereq_headers = ['#', 'Requirement', 'Who Obtains', 'Timeline']
prereq_rows = [
    ['1', 'Register company in Kenya (Companies Act)', 'Founder / Lawyer', '2-4 weeks'],
    ['2', 'Obtain KRA PIN for company', 'Founder / Accountant', '1-3 days'],
    ['3', 'Secure physical office address in Kenya', 'Founder', '1-2 weeks'],
    ['4', 'Open company bank account', 'Founder', '1-3 weeks'],
    ['5', 'Get Certificate of Incorporation', 'Lawyer / e-Citizen', '1-2 weeks'],
    ['6', 'Obtain CR12 (company directors listing)', 'Lawyer / e-Citizen', '1-3 days'],
    ['7', 'Prepare Register of Beneficial Owners (BOF)', 'Lawyer / Company Secretary', '3-5 days'],
    ['8', 'Copy of ID/Passport for all directors', 'Each director', 'Immediate'],
    ['9', 'Obtain bank letter (names must match docs)', 'Company bank', '1-5 days'],
    ['10', 'Register on Safaricom Business Portal', 'Founder / CTO', '1 day'],
]
story.append(make_table(prereq_headers, prereq_rows, col_widths=[25, 280, 130, 80]))

story.append(heading("2.2 Required Documents by Business Type"))
story.append(heading("Limited Liability Company", 3))
for item in [
    "Company KRA PIN Certificate",
    "KRA PIN Certificates for ALL directors/founders",
    "Certificate of Incorporation",
    "CR12 (Companies Act 2015) or latest Annual Returns",
    "Register of Beneficial Owners (BOF)",
    "Copies of National ID or Passport for all directors",
    "Bank Letter from registered bank (names must match EXACTLY across all docs)",
    "M-Pesa C2B Service Application Form (obtained at Safaricom Shop)",
    "Paybill/Till Number Standard Tariff Guide",
    "M-Pesa Account Opening Authorization Form",
]:
    story.append(bullet(item))

story.append(heading("2.3 Tariff Plan Selection"))
tariff_headers = ['Plan', 'Who Pays Fees', 'Best For', 'Typical Fee']
tariff_rows = [
    ['Mgao', 'Shared: business + customer', 'Startups, testing the market', 'KES 5-15 per transaction'],
    ['Business Bouquet', 'Business absorbs all fees', 'E-commerce, SaaS platforms', 'KES 5-15 per transaction'],
    ['Customer Bouquet', 'Customer pays all fees', 'Utilities, schools, government', 'KES 5-15 per transaction'],
]
story.append(make_table(tariff_headers, tariff_rows, col_widths=[115, 140, 140, 120]))
story.append(body(
    "<b>Recommendation for Pamoja Wealth:</b> Start with <b>Business Bouquet</b> — absorb fees "
    "initially to drive adoption, then shift to Mgao once user base is established. "
    "This gives the best user experience during launch."
))

story.append(heading("2.4 Application Submission Process"))
story.append(body("<b>Option A: In-Person (Recommended for first-timers)</b>"))
for item in [
    "Visit any Safaricom Shop with ALL original documents + photocopies",
    "Request 'M-Pesa Business Till' or 'Paybill' account opening",
    "Fill in the M-Pesa C2B Service Application Form on-site",
    "Submit all documents for verification",
    "Receive SMS confirmation within 2-10 working days",
    "For Till numbers: activate via USSD *234# or Safaricom Business App",
]:
    story.append(bullet(item))

story.append(body("<b>Option B: Online via Safaricom Business Portal</b>"))
for item in [
    "Go to https://business.safaricom.co.ke/",
    "Register for a business account",
    "Upload scanned copies of all required documents",
    "Select tariff plan during application",
    "Wait for verification email (7-10 business days for companies)",
]:
    story.append(bullet(item))

story.append(heading("2.5 Daraja Portal Go-Live Process"))
story.append(body("<b>Step-by-step after receiving your Paybill/Till number:</b>"))
go_live_steps = [
    ("1. Create Developer Account", "Register at https://developer.safaricom.co.ke with your business email"),
    ("2. Create Sandbox App", "Create a test app to get sandbox Consumer Key/Secret for development"),
    ("3. Build & Test in Sandbox", "Complete full STK Push + C2B integration testing with sandbox credentials"),
    ("4. Submit Go-Live Request", "Click 'Go Live' tab in Daraja portal, enter your production shortcode, select APIs needed (STK Push, C2B, B2C), link your Web API user"),
    ("5. Verify with OTP", "Safaricom sends OTP to your registered admin phone number — enter it to complete"),
    ("6. Receive Production Credentials", "1-3 working days later: Consumer Key, Consumer Secret appear in portal. Lipa Na M-Pesa Passkey arrives via email."),
    ("7. Switch to Production URLs", "Update ALL sandbox URLs to production URLs in your .env file"),
    ("8. Test with Real Money", "Use your own Safaricom line to do a real KES 1 transaction and verify the full flow"),
]
for step_title, step_desc in go_live_steps:
    story.append(Paragraph(f"<b>{step_title}</b>: {step_desc}", bullet_style))

story.append(heading("2.6 Production URL Switch Checklist"))
url_headers = ['API', 'Sandbox URL', 'Production URL']
url_rows = [
    ['OAuth Token', 'sandbox.safaricom.co.ke/oauth/v1/generate', 'api.safaricom.co.ke/oauth/v1/generate'],
    ['STK Push', 'sandbox.safaricom.co.ke/mpesa/stkpush/v1/processrequest', 'api.safaricom.co.ke/mpesa/stkpush/v1/processrequest'],
    ['C2B Register', 'sandbox.safaricom.co.ke/mpesa/c2b/v1/registerurl', 'api.safaricom.co.ke/mpesa/c2b/v1/registerurl'],
    ['B2C Payment', 'sandbox.safaricom.co.ke/mpesa/b2c/v1/paymentrequest', 'api.safaricom.co.ke/mpesa/b2c/v1/paymentrequest'],
    ['Query Status', 'sandbox.safaricom.co.ke/mpesa/stkpushquery/v1/query', 'api.safaricom.co.ke/mpesa/stkpushquery/v1/query'],
]
story.append(make_table(url_headers, url_rows, col_widths=[100, 220, 200]))

story.append(heading("2.7 Common Rejection Reasons & Solutions"))
rej_headers = ['Problem', 'Cause', 'Solution']
rej_rows = [
    ['Name mismatch', 'KRA, bank, registration names differ', 'Ensure EXACT name match across ALL documents before submitting'],
    ['Expired CR12', 'CR12 older than 12 months', 'Request fresh CR12 from e-Citizen (KES 650)'],
    ['Missing BOF', 'Beneficial Owners register not filed', 'File BOF with Company Registry before applying'],
    ['Callback URL not HTTPS', 'Using http or self-signed cert', 'Deploy with valid SSL certificate (Let\'s Encrypt free)'],
    ['Wrong shortcode format', 'Using sandbox 174379 in production', 'Use YOUR registered Paybill/Till number only'],
    ['Incomplete testing', 'Sandbox flow not fully verified', 'Run end-to-end test suite before go-live request'],
    ['Unregistered IPN URL', 'C2B confirmation URL not whitelisted', 'Register both Validation and Confirmation URLs via C2B Register API'],
]
story.append(make_table(rej_headers, rej_rows, col_widths=[110, 190, 215]))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 3: APP STORE & PLAY STORE SUBMISSION
# ═══════════════════════════════════════════════════════════════
story.append(heading("3. App Store & Play Store Submission", 1))
story.append(hr())

story.append(body(
    "Pamoja Wealth will be published as a native mobile app on both Google Play Store and Apple App Store. "
    "The frontend is built with Vite + React and is Capacitor-ready — meaning it can be wrapped as a "
    "native iOS/Android app with minimal changes. This section covers the complete submission process."
))

story.append(heading("3.1 Capacitor Mobile App Configuration"))

story.append(body("<b>Installation & Setup:</b>"))
for item in [
    "Install Capacitor CLI: <font face='Courier'>npm install @capacitor/cli @capacitor/core @capacitor/ios @capacitor/android</font>",
    "Initialize Capacitor: <font face='Courier'>npx cap init PamojaWealth com.pamojawealth.app</font>",
    "Build the web app: <font face='Courier'>npm run build</font>",
    "Add platforms: <font face='Courier'>npx cap add ios && npx cap add android</font>",
    "Sync web build: <font face='Courier'>npx cap sync</font>",
    "Open native IDEs: <font face='Courier'>npx cap open ios</font> / <font face='Courier'>npx cap open android</font>",
]:
    story.append(bullet(item))

story.append(body("<b>Required Capacitor Plugins:</b>"))
plugin_headers = ['Plugin', 'Purpose', 'iOS', 'Android']
plugin_rows = [
    ['@capacitor/push-notifications', 'In-app push notifications', 'APNs required', 'FCM required'],
    ['@capacitor/camera', 'KYC selfie + ID document capture', 'NSCameraUsageDescription', 'CAMERA permission'],
    ['@capacitor/filesystem', 'Document upload/download', 'Default', 'Default'],
    ['@capacitor/biometric', 'Biometric auth for app unlock', 'NSFaceIDUsageDescription', 'BIOMETRIC permission'],
    ['@capacitor/share', 'Share campaigns to WhatsApp/Social', 'Default', 'Default'],
    ['@capacitor/splash-screen', 'Branded splash screen', 'LaunchScreen.storyboard', 'splash.xml'],
    ['@capacitor/status-bar', 'Status bar styling', 'Default', 'Default'],
    ['@capacitor/deep-links', 'Deep linking for invite/contribute', 'Associated Domains', 'Intent Filters'],
]
story.append(make_table(plugin_headers, plugin_rows, col_widths=[145, 140, 130, 100]))

story.append(heading("3.2 Google Play Store Submission"))
story.append(body("<b>Pre-submission Requirements for Fintech Apps in Kenya:</b>"))
for item in [
    "<b>CBK DCP License:</b> If the app offers loans/credit, you MUST submit your CBK Digital Credit Provider license in the Play Console declaration form. For non-lending chama platforms, this may not be required but having the registration helps.",
    "<b>Privacy Policy URL:</b> Must be hosted on your domain. Must disclose all data collected (financial, personal, device), how it's used, and third-party sharing.",
    "<b>Data Safety Section:</b> Complete the Google Play Data Safety form detailing: financial info, personal info, device ID, location, contacts (if invite feature uses contacts).",
    "<b>Financial Features Declaration:</b> Declare that your app offers financial services. Provide evidence of regulatory compliance (CBK registration, company docs).",
    "<b>App Content Rating:</b> Complete the IARC content rating questionnaire. Fintech apps typically rate 'Everyone' or 'Teen'.",
    "<b>APR Disclosure:</b> If any lending: clearly disclose Annual Percentage Rate in-app AND in Play Store description.",
    "<b>App Signing:</b> Use Google Play App Signing (default) or upload your own keystore. <b>NEVER lose your keystore file.</b>",
]:
    story.append(bullet(item))

story.append(body("<b>Required Assets for Play Store Listing:</b>"))
for item in [
    "App icon: 512x512px PNG (adaptive icon with foreground + background layers)",
    "Feature graphic: 1024x500px PNG (shown at top of store listing)",
    "Screenshots: Minimum 2, recommended 8 (JPEG/PNG, 1080px min dimension for phones)",
    "Short description: 80 characters max",
    "Full description: 4000 characters max, include keywords naturally",
    "Promo video (optional but recommended): YouTube URL",
    "App category: Finance",
    "Tags: chama, savings, fundraising, harambee, mpesa, investment group, kenya",
]:
    story.append(bullet(item))

story.append(body("<b>Play Store Review Timeline:</b> 3-7 days for initial submission, 1-3 days for updates. "
                   "Fintech apps may take longer due to additional compliance review."))

story.append(heading("3.3 Apple App Store Submission"))
story.append(body("<b>Pre-submission Requirements:</b>"))
for item in [
    "<b>Apple Developer Program:</b> $99/year enrollment. Requires D-U-N-S Number for organizations.",
    "<b>Financial Services License:</b> Apple requires proof of regulatory authorization for financial apps. Submit your CBK registration (or company registration for non-lending apps).",
    "<b>App Privacy Labels:</b> Complete detailed privacy nutrition labels showing ALL data types collected and their purpose. Financial apps have heightened scrutiny.",
    "<b>Encryption Compliance:</b> Declare use of encryption (HTTPS, AES). Submit annual self-classification report if encryption is beyond OS-provided.",
    "<b>KYC/Authentication:</b> Multi-factor auth (2FA or biometrics) expected for fintech. Apple may reject apps without strong auth.",
    "<b>Fee Transparency:</b> All fees, commissions, and charges must be clearly visible in-app BEFORE user commits to any transaction.",
]:
    story.append(bullet(item))

story.append(body("<b>Required Assets for App Store Listing:</b>"))
for item in [
    "App icon: 1024x1024px PNG (no alpha, no rounded corners)",
    "Screenshots: 6.7-inch (1290x2796px) and 6.5-inch (1242x2688px) displays required",
    "App Preview video: Optional, up to 30 seconds, 1080p",
    "App name: 30 characters max",
    "Subtitle: 30 characters max",
    "Promotional text: 170 characters max",
    "Description: 4000 characters max",
    "Keywords: 100 characters, comma-separated",
    "Content rating: Complete questionnaire (fintech typically 4+ or 12+)",
    "Primary category: Finance. Secondary: Productivity or Social Networking",
]:
    story.append(bullet(item))

story.append(body("<b>Common App Store Rejection Reasons for Fintech:</b>"))
for item in [
    "Insufficient regulatory documentation (most common)",
    "Missing or incomplete privacy labels (automatic rejection)",
    "No native iOS feel — web-wrapped apps that look like websites get rejected under Guideline 4.2",
    "Incomplete authentication flow — must show proper error states and offline handling",
    "Hardcoded fees without disclosure screen before payment",
    "Using non-Apple payment methods for digital goods (use IAP or M-Pesa, not card directly)",
]:
    story.append(bullet(item))

story.append(body("<b>App Store Review Timeline:</b> 2-7 days for initial review. Rejections add 1-2 weeks per round. "
                   "Budget 3-4 weeks total for first approval. Expedited review available for critical bugs only."))

story.append(heading("3.4 Store Submission Timeline Summary"))
timeline_headers = ['Week', 'Activity', 'Owner']
timeline_rows = [
    ['1-2', 'Install Capacitor, configure plugins, generate icons/splash', 'Frontend Dev'],
    ['2-3', 'Native build testing on real iOS & Android devices', 'Frontend Dev + QA'],
    ['3-4', 'Create store listings: screenshots, descriptions, privacy docs', 'Marketing + Frontend'],
    ['4-5', 'Submit to Google Play Store (internal testing track first)', 'CTO'],
    ['4-5', 'Submit to Apple App Store (TestFlight first)', 'CTO'],
    ['5-7', 'Address review feedback, fix issues', 'Engineering'],
    ['7-8', 'Promote from TestFlight/Internal to Production', 'CTO'],
    ['8+', 'PUBLIC LAUNCH on both stores', 'Full Team'],
]
story.append(make_table(timeline_headers, timeline_rows, col_widths=[50, 340, 125]))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 4: KENYA REGULATORY COMPLIANCE
# ═══════════════════════════════════════════════════════════════
story.append(heading("4. Kenya Regulatory Compliance", 1))
story.append(hr())

story.append(body(
    "Operating a fintech platform in Kenya requires compliance with several regulatory frameworks. "
    "The regulatory landscape tightened significantly in late 2025 with the introduction of the "
    "CBK Non-Deposit Taking Credit Providers Regulations. Pamoja Wealth must align with all "
    "applicable regulations before going live."
))

story.append(heading("4.1 CBK Digital Credit Providers (DCP) Regulations 2025"))
story.append(body(
    "Even if Pamoja Wealth's primary function is chama management and fundraising, the loan feature "
    "triggers DCP registration requirements. The CBK now requires ALL entities offering credit "
    "to register or obtain a license."
))
dcp_headers = ['Requirement', 'Full License', 'Simplified Registration']
dcp_rows = [
    ['Minimum Capital', 'KES 20 million (~USD 155,000)', 'Less than KES 20 million'],
    ['Application Fee', 'KES 100,000', 'KES 100,000'],
    ['Annual Fee', 'KES 500,000', 'To be confirmed'],
    ['Physical Office', 'Required in Kenya', 'Required in Kenya'],
    ['Director Vetting', 'Fit & proper test for all directors', 'Fit & proper test for all directors'],
    ['Credit Policy', 'Detailed credit policy document required', 'Basic credit policy required'],
    ['AML/CFT Policy', 'Required', 'Required'],
    ['Data Protection', 'ODPC registration required', 'ODPC registration required'],
    ['Foreign Ownership', 'Permitted, additional docs needed', 'Permitted, additional docs needed'],
    ['Annual Reporting', 'Full audited reports to CBK', 'Basic annual returns'],
]
story.append(make_table(dcp_headers, dcp_rows, col_widths=[130, 195, 195]))

story.append(body(
    "<b>Recommendation:</b> Start with <b>Simplified Registration</b> initially. Pamoja Wealth's "
    "loans are member-funded (not from company balance sheet), which may qualify for lighter "
    "regulation. Upgrade to Full License after reaching scale (Year 2-3)."
))

story.append(heading("4.2 Kenya Data Protection Act (DPA) 2019"))
story.append(body("The DPA 2019 requires any entity processing personal data of Kenyan residents to:"))
for item in [
    "<b>Register with ODPC</b> (Office of the Data Protection Commissioner) as a Data Controller. Cost: KES 4,000 for micro/small entities.",
    "<b>Appoint a Data Protection Officer</b> (DPO) — can be external/part-time for small orgs.",
    "<b>Complete a DPIA</b> (Data Protection Impact Assessment) before processing sensitive financial data.",
    "<b>Implement data subject rights:</b> access, rectification, erasure, restriction, portability, objection. Your backend must support data export and deletion APIs.",
    "<b>Obtain consent</b> for data collection. Consent must be specific, informed, and withdrawable.",
    "<b>Report breaches</b> within 72 hours to ODPC and affected data subjects.",
    "<b>Data localization:</b> No strict requirement yet, but CBK expects financial data stored within Kenya or EAC.",
]:
    story.append(bullet(item))

story.append(heading("4.3 Anti-Money Laundering (AML) / CFT"))
for item in [
    "<b>Appoint a Money Laundering Reporting Officer (MLRO)</b>",
    "<b>Implement KYC</b> — at minimum: ID verification (National ID, Passport, or Alien ID), proof of address, selfie liveness check",
    "<b>Transaction monitoring:</b> Flag transactions above KES 1,000,000 (POCAMLA threshold), unusual patterns, structuring",
    "<b>STR submission:</b> File Suspicious Transaction Reports to the Financial Reporting Centre (FRC) via goAML platform",
    "<b>Sanctions screening:</b> Screen users against UN, EU, US OFAC, and Kenya sanctions lists",
    "<b>PEP screening:</b> Screen for Politically Exposed Persons",
    "<b>Record keeping:</b> Maintain KYC and transaction records for minimum 7 years",
]:
    story.append(bullet(item))

story.append(heading("4.4 SACCO Societies Act Alignment"))
story.append(body(
    "While Pamoja Wealth is not a SACCO, many chamas operate like informal SACCOs. Key considerations:"
))
for item in [
    "If chama collective savings exceed KES 100M, SASRA (SACCO Societies Regulatory Authority) may require registration",
    "Investment chamas (ones that invest member funds in securities) may need CMA (Capital Markets Authority) registration",
    "For now: use platform terms of service to clarify that Pamoja Wealth is a <b>technology platform</b>, not a financial institution",
    "Chamas themselves are the financial cooperatives — Pamoja Wealth provides the management tooling",
]:
    story.append(bullet(item))

story.append(heading("4.5 Compliance Implementation Checklist"))
for item in [
    "Register company in Kenya",
    "Register with ODPC as Data Controller",
    "Appoint DPO (can be part-time consultant)",
    "Register with CBK as DCP (simplified registration)",
    "Implement in-app KYC flow",
    "Draft and publish Privacy Policy, Terms of Service, Cookie Policy",
    "Draft AML/KYC policy document",
    "Complete DPIA for the platform",
    "Implement data export/deletion APIs",
    "Set up transaction monitoring rules in ledger",
    "Register on goAML for STR filing",
    "Implement consent management in onboarding",
    "Set up 7-year data retention in database",
]:
    story.append(bullet(item))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 5: REVENUE & MONETIZATION BLUEPRINT
# ═══════════════════════════════════════════════════════════════
story.append(heading("5. Revenue & Monetization Blueprint", 1))
story.append(hr())

story.append(body(
    "Pamoja Wealth's monetization strategy follows a hybrid model combining recurring subscriptions, "
    "transaction-based fees, and value-added services. This multi-stream approach maximizes revenue "
    "while keeping the platform accessible to small chamas."
))

story.append(heading("5.1 Subscription Tiers"))
sub_headers = ['Tier', 'Price (KES/mo)', 'Chama Size', 'Key Features', 'Target Market']
sub_rows = [
    ['Free', 'KES 0', 'Up to 20 members', 'Basic chama mgmt, manual contributions tracking, 1 chama, basic reports, M-Pesa contributions', 'Small informal chamas, student groups'],
    ['Starter', 'KES 499', 'Up to 100 members', 'Everything Free +: 3 chamas, automated STK Push, loan management, meeting scheduler, basic analytics, email support', 'Growing chamas, family groups'],
    ['Pro', 'KES 1,499', 'Up to 500 members', 'Everything Starter +: 10 chamas, AI rule compiler, advanced analytics, investment tracking, voting, document storage, priority support, WhatsApp bot', 'Established chamas, investment groups'],
    ['Enterprise', 'KES 4,999', 'Unlimited', 'Everything Pro +: unlimited chamas, dedicated Paybill, API access, white-label option, custom branding, audit exports, dedicated CSM, multi-group management, SLA', 'Large chama federations, SACCOs, corporate'],
]
story.append(make_table(sub_headers, sub_rows, col_widths=[55, 65, 60, 210, 120]))

story.append(heading("5.2 Transaction-Based Revenue"))
txn_headers = ['Fee Type', 'Rate', 'Applied To', 'Example (KES 10,000)', 'Annual Est. Revenue']
txn_rows = [
    ['Contribution Fee', '1.0%', 'All chama contributions via M-Pesa', 'KES 100', 'KES 2.4M at 2,000 groups'],
    ['Harambee Fee', '2.5%', 'Public fundraiser donations', 'KES 250', 'KES 3.6M at 1,500 campaigns'],
    ['Loan Origination Fee', '2.0%', 'Each loan disbursement', 'KES 200', 'KES 1.8M at 900 loans'],
    ['Withdrawal Fee', 'KES 25 flat', 'Each share-out / withdrawal', 'KES 25 flat', 'KES 1.2M at 48,000 withdrawals'],
    ['B2C Payout Fee', '0.5%', 'Automated payouts to members', 'KES 50', 'KES 600K at 12,000 payouts'],
    ['Late Payment Fee', 'KES 100', 'Overdue loan repayments', 'KES 100 flat', 'KES 360K at 3,600 late payments'],
    ['Currency Conversion', '1.5%', 'Diaspora card payments', 'KES 150', 'KES 900K at 6,000 diaspora txns'],
]
story.append(make_table(txn_headers, txn_rows, col_widths=[95, 45, 140, 105, 130]))

story.append(heading("5.3 Premium & Value-Added Revenue"))
prem_headers = ['Service', 'Pricing Model', 'Target Users', 'Revenue Potential']
prem_rows = [
    ['AI Rule Compiler', 'KES 500 per rule compilation (3 free)', 'Chama admins creating rules', 'KES 600K/year'],
    ['AI Loan Underwriter', 'KES 200 per loan assessment', 'Chama treasurers', 'KES 360K/year'],
    ['Dedicated Paybill', 'KES 2,000/mo add-on', 'Enterprise chamas', 'KES 2.4M/year at 100 chamas'],
    ['WhatsApp Bot', 'KES 999/mo add-on', 'Chamas wanting WhatsApp mgmt', 'KES 1.2M/year at 100 chamas'],
    ['API Access', 'KES 5,000/mo', 'Enterprise, developers, integrators', 'KES 1.2M/year at 20 clients'],
    ['White Label', 'KES 25,000/mo', 'Large SACCOs, corporates', 'KES 3M/year at 10 clients'],
    ['Insurance Commission', '15% of premium', 'Members buying insurance', 'KES 1.5M/year at 1,000 policies'],
    ['Referral Bonus', 'KES 500 per referred chama', 'Existing users', 'Marketing cost offset'],
    ['Credit Reports', 'KES 300 per report', 'Chamas checking member credit', 'KES 180K/year'],
    ['Training/Certification', 'KES 2,000 per attendee', 'Chama officials', 'KES 480K/year'],
]
story.append(make_table(prem_headers, prem_rows, col_widths=[120, 140, 115, 135]))

story.append(heading("5.4 3-Year Revenue Projections"))
rev_headers = ['Revenue Stream', 'Year 1 (KES M)', 'Year 2 (KES M)', 'Year 3 (KES M)']
rev_rows = [
    ['Subscriptions (net)', 'KES 2.4M', 'KES 8.6M', 'KES 28.8M'],
    ['Transaction Fees', 'KES 3.6M', 'KES 12.0M', 'KES 36.0M'],
    ['Harambee/Donation Fees', 'KES 1.8M', 'KES 5.4M', 'KES 14.4M'],
    ['Loan Origination Fees', 'KES 0.9M', 'KES 3.6M', 'KES 10.8M'],
    ['Withdrawal/Payout Fees', 'KES 0.6M', 'KES 2.4M', 'KES 7.2M'],
    ['Premium Add-ons', 'KES 1.2M', 'KES 4.8M', 'KES 14.4M'],
    ['Insurance Commissions', 'KES 0.3M', 'KES 1.2M', 'KES 4.2M'],
    ['API/Enterprise/White Label', 'KES 0.6M', 'KES 3.0M', 'KES 9.0M'],
    ['TOTAL GROSS REVENUE', 'KES 11.4M', 'KES 41.0M', 'KES 124.8M'],
    ['Platform Costs (30-35%)', '(KES 3.8M)', '(KES 12.3M)', '(KES 37.4M)'],
    ['NET REVENUE', 'KES 7.6M', 'KES 28.7M', 'KES 87.4M'],
    ['Active Chamas', '500', '2,500', '10,000'],
    ['Active Users', '15,000', '75,000', '300,000'],
    ['Monthly Transaction Volume', 'KES 50M', 'KES 250M', 'KES 1B'],
]
story.append(make_table(rev_headers, rev_rows, col_widths=[145, 100, 100, 100]))

story.append(body(
    "<b>Key Assumptions:</b> 5% conversion from free to paid in Year 1, 8% in Year 2, 12% in Year 3. "
    "Average chama size: 30 members. Average monthly contribution per member: KES 3,000. "
    "Platform costs include: hosting (KES 60K/mo Y1 scaling to KES 500K/mo Y3), M-Pesa transaction "
    "costs, team salaries (5-15 people), compliance, and marketing."
))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 6: MISSING FEATURES TO BUILD
# ═══════════════════════════════════════════════════════════════
story.append(heading("6. Missing Features to Build", 1))
story.append(hr())

story.append(body(
    "The following features are either not yet implemented or exist only as database schemas/API stubs. "
    "They are prioritized by impact on revenue, user experience, and competitive differentiation."
))

story.append(heading("Tier 1: Must Ship for Kenya Parity (Month 1-2)"))
feat1_headers = ['Feature', 'Current State', 'Effort', 'Revenue Impact']
feat1_rows = [
    ['M-Pesa STK Push (go-live)', 'Code ready, feature-flagged', '1-2 weeks', 'CRITICAL - all payments'],
    ['M-Pesa C2B Paybill (go-live)', 'Webhook handlers built', '1 week', 'CRITICAL - incoming payments'],
    ['M-Pesa B2C Payout', 'Schema exists, no service', '2-3 weeks', 'HIGH - disbursements & share-outs'],
    ['KYC Flow (ID + Selfie)', 'DB fields exist, no UI/flow', '3-4 weeks', 'HIGH - compliance, trust'],
    ['SMS Deep-Link Invites', 'Africa\'s Talking SDK ready', '1 week', 'MEDIUM - viral growth'],
    ['In-App Push Notifications', 'FCM config in .env, no client', '2 weeks', 'MEDIUM - engagement'],
    ['Bilingual UX (EN + SW)', 'No i18n framework yet', '2-3 weeks', 'MEDIUM - market reach'],
    ['Loan Repayment Overdue Alerts', 'Worker stub exists', '1 week', 'MEDIUM - loan performance'],
    ['Multi-Sig Withdrawals', 'Schema exists, logic partial', '2-3 weeks', 'MEDIUM - trust & security'],
    ['Real-time Ledger Stream', 'WebSocket init, no events', '1-2 weeks', 'LOW - transparency'],
]
story.append(make_table(feat1_headers, feat1_rows, col_widths=[150, 125, 80, 160]))

story.append(heading("Tier 2: Differentiators (Month 3-4)"))
feat2_headers = ['Feature', 'Description', 'Effort', 'Market Impact']
feat2_rows = [
    ['Diaspora On-Ramp', 'Integrate LemFi, NALA, Wise for international contributions', '4-6 weeks', 'HIGH - diaspora remittances = 3% of Kenya GDP'],
    ['WhatsApp Bot', 'Bot for: balance check, contribute, vote, meeting reminders via WhatsApp', '4-6 weeks', 'HIGH - 86% of Kenyans on WhatsApp'],
    ['Peer-to-Peer Fundraising', 'Affiliate links, fundraising teams, leaderboards, milestone gamification', '3-4 weeks', 'HIGH - viral growth mechanic'],
    ['Donor Wall & Campaign Pages', 'Public campaign pages, donor recognition, progress bars, photo galleries', '3-4 weeks', 'MEDIUM - donor engagement'],
    ['Recurring Donations', 'Weekly/monthly auto-donate to favorite causes', '1-2 weeks', 'MEDIUM - recurring revenue'],
    ['AI Anomaly Detection', 'Flag unusual transactions, detect fraud patterns in chama accounts', '3-4 weeks', 'MEDIUM - trust & security'],
    ['Credit Scoring Integration', 'Report to Metropol/TransUnion, build internal credit scores', '6-8 weeks', 'LOW (long-term play)'],
    ['Investment Marketplace', 'Cross-chama investment opportunities, shared portfolios', '4-6 weeks', 'LOW (Year 2 feature)'],
]
story.append(make_table(feat2_headers, feat2_rows, col_widths=[130, 200, 80, 110]))

story.append(heading("Tier 3: Scale & Compliance (Month 5-6+)"))
for item in [
    "<b>Escrow-by-Default:</b> Hold all chama contributions in regulated escrow account with daily reconciliation",
    "<b>Automated Tax (WHT):</b> Calculate and remit withholding tax on interest/dividends to KRA",
    "<b>Insurance Marketplace:</b> Partner with insurers to offer life, health, and chama fund protection",
    "<b>Advanced Analytics Dashboard:</b> Predictive chama health scoring, risk alerts, growth projections",
    "<b>API Marketplace:</b> Allow third-party developers to build on Pamoja Wealth (like M-Pesa's Daraja)",
    "<b>SACCO Bridge:</b> Connect informal chamas to formal SACCO registration pipeline",
    "<b>Cross-Border Chamas:</b> Support EAC cross-border chamas (Kenya, Uganda, Tanzania, Rwanda)",
]:
    story.append(bullet(item))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 7: TECHNICAL DEPLOYMENT CHECKLIST
# ═══════════════════════════════════════════════════════════════
story.append(heading("7. Technical Deployment Checklist", 1))
story.append(hr())

story.append(heading("7.1 Production Infrastructure"))
infra_headers = ['Component', 'Recommendation', 'Estimated Cost (KES/mo)', 'Priority']
infra_rows = [
    ['Compute (API Server)', 'AWS EC2 t3.medium (2 vCPU, 4GB) x2 + Auto Scaling', 'KES 18,000', 'CRITICAL'],
    ['Compute (Workers)', 'AWS EC2 t3.small (2 vCPU, 2GB) x1 for BullMQ workers', 'KES 6,000', 'CRITICAL'],
    ['Database (Primary)', 'AWS RDS PostgreSQL db.t3.medium, Multi-AZ, 100GB SSD', 'KES 25,000', 'CRITICAL'],
    ['Database (Read Replica)', 'AWS RDS db.t3.small read replica for analytics', 'KES 12,000', 'MEDIUM'],
    ['Redis (Cache + Queue)', 'AWS ElastiCache Redis cache.t3.micro, Multi-AZ', 'KES 10,000', 'CRITICAL'],
    ['Object Storage', 'AWS S3 Standard (documents, KYC images) + CloudFront CDN', 'KES 3,000', 'CRITICAL'],
    ['SSL Certificate', 'AWS ACM (free) or Let\'s Encrypt', 'KES 0', 'CRITICAL'],
    ['Domain + DNS', 'Route53 or Cloudflare', 'KES 1,500', 'CRITICAL'],
    ['Load Balancer', 'AWS ALB (Application Load Balancer)', 'KES 8,000', 'CRITICAL'],
    ['CI/CD', 'GitHub Actions (free tier for public repo) + ECR', 'KES 2,000', 'HIGH'],
    ['Monitoring', 'Sentry (errors) + Datadog (infra) or Grafana/Prometheus', 'KES 12,000', 'HIGH'],
    ['Backup Storage', 'Automated daily RDS snapshots + S3 cross-region replication', 'KES 5,000', 'CRITICAL'],
    ['WAF / DDoS Protection', 'AWS WAF + Shield Standard (Cloudflare alternative: free tier)', 'KES 4,000', 'HIGH'],
    ['Email Service', 'SendGrid Essentials (100K emails/mo)', 'KES 3,000', 'CRITICAL'],
    ['SMS Service', 'Africa\'s Talking (pay as you go, ~KES 0.50/SMS)', 'KES 5,000', 'MEDIUM'],
    ['TOTAL (Month 1-3)', '', 'KES ~114,500', ''],
    ['TOTAL (Month 4-12)', 'Scale up compute + DB as users grow', 'KES ~200,000-350,000', ''],
]
story.append(make_table(infra_headers, infra_rows, col_widths=[130, 230, 115, 45]))

story.append(heading("7.2 Docker & Containerization"))
for item in [
    "Create <font face='Courier'>Dockerfile</font> for both frontend (multi-stage: build + nginx) and backend (Node.js Alpine)",
    "Create <font face='Courier'>docker-compose.prod.yml</font> for production orchestration",
    "Configure healthcheck endpoints for both services",
    "Set up ECR (Elastic Container Registry) for image storage",
    "Use environment-specific <font face='Courier'>.env.production</font> files (never committed to git)",
]:
    story.append(bullet(item))

story.append(heading("7.3 CI/CD Pipeline (GitHub Actions)"))
for item in [
    "<b>On Push to main:</b> Lint -> Type check -> Unit tests -> Build Docker image -> Push to ECR -> Deploy to EC2",
    "<b>On PR:</b> Lint -> Type check -> Unit + Integration tests -> Preview deployment comment",
    "<b>Database Migrations:</b> Run Prisma migrations as part of deploy (with rollback plan)",
    "<b>Secrets Management:</b> Use GitHub Secrets for all API keys, never in code or .env files",
    "<b>Zero-Downtime Deploy:</b> Blue-green deployment via ALB target group swap",
    "<b>Rollback:</b> Keep last 5 Docker images, automated rollback on health check failure",
]:
    story.append(bullet(item))

story.append(heading("7.4 Database & Backup Strategy"))
for item in [
    "<b>Automated RDS snapshots:</b> Daily at 3:00 AM EAT, retained for 30 days",
    "<b>Transaction log backups:</b> Every 5 minutes via RDS point-in-time recovery (PITR)",
    "<b>S3 backup sync:</b> Weekly full DB dump to S3 with cross-region replication",
    "<b>Disaster Recovery:</b> RTO (Recovery Time Objective) < 4 hours, RPO (Recovery Point Objective) < 5 minutes",
    "<b>Test restores:</b> Monthly DR drill — restore from snapshot to staging environment",
    "<b>Encryption:</b> RDS encryption at rest (AWS KMS) + SSL/TLS in transit",
]:
    story.append(bullet(item))

story.append(heading("7.5 Security Hardening"))
for item in [
    "<b>Helmet.js:</b> Already configured — verify all security headers in production",
    "<b>CORS:</b> Restrict to pamojawealth.app and Capacitor localhost origins only",
    "<b>Rate Limiting:</b> Already implemented — tune thresholds for production load",
    "<b>API Key Rotation:</b> Implement automated rotation for M-Pesa, SendGrid, Africa's Talking keys",
    "<b>Secrets Scanning:</b> Add GitGuardian or truffleHog to CI pipeline",
    "<b>Dependency Scanning:</b> npm audit on every PR, Dependabot for automated updates",
    "<b>Penetration Testing:</b> Schedule external pen test before launch (budget: KES 200,000-500,000)",
    "<b>Bug Bounty:</b> Set up private bug bounty program post-launch (HackerOne or Bugcrowd)",
    "<b>WAF Rules:</b> Configure AWS WAF rules for SQL injection, XSS, rate-based blocking",
]:
    story.append(bullet(item))

story.append(heading("7.6 Load Testing & Performance"))
for item in [
    "<b>Target:</b> Handle 1,000 concurrent users with <500ms API response time (p95)",
    "<b>Tools:</b> k6 (Grafana) or Artillery for load testing scripts",
    "<b>Test Scenarios:</b> STK Push spike (100/minute), concurrent contributions by 200 members in one chama, analytics queries on large datasets",
    "<b>Database:</b> Test with 1M users, 100K chamas, 10M transactions to validate index performance",
    "<b>Redis:</b> Verify cache hit rate >80% for frequently accessed data (plans, user sessions, chama metadata)",
    "<b>CDN:</b> Frontend assets served via CloudFront with 1-year cache for hashed files",
]:
    story.append(bullet(item))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 8: GO-TO-MARKET TIMELINE
# ═══════════════════════════════════════════════════════════════
story.append(heading("8. Go-to-Market Timeline", 1))
story.append(hr())

story.append(body(
    "The following is a 6-month aggressive but achievable timeline to take Pamoja Wealth "
    "from prototype to public launch on both app stores."
))

story.append(heading("Month 1: Foundation & M-Pesa Go-Live"))
m1_headers = ['Week', 'Engineering', 'Business/Compliance', 'Marketing']
m1_rows = [
    ['1', 'Set up production infra (EC2, RDS, Redis, S3)', 'Register company in Kenya', 'Brand identity finalization'],
    ['2', 'Docker + CI/CD pipeline setup', 'Apply for KRA PIN, open bank account', 'Landing page polish'],
    ['3', 'M-Pesa Daraja go-live submission', 'Submit CBK DCP registration', 'Social media accounts setup'],
    ['4', 'Capacitor install + iOS/Android config', 'Draft Privacy Policy, ToS', 'Pre-launch waitlist page'],
]
story.append(make_table(m1_headers, m1_rows, col_widths=[35, 190, 160, 130]))

story.append(heading("Month 2: Mobile App & Feature Completion"))
m2_headers = ['Week', 'Engineering', 'Business/Compliance', 'Marketing']
m2_rows = [
    ['5', 'KYC flow implementation (ID + selfie)', 'ODPC Data Controller registration', 'Screenshot designs for stores'],
    ['6', 'B2C Payout + multi-sig withdrawals', 'DPIA completion, DPO appointment', 'App store listing content'],
    ['7', 'Push notifications + i18n framework', 'AML/KYC policy documentation', 'Press kit preparation'],
    ['8', 'SMS invites + bilingual EN/SW basics', 'Submit to Google Play (internal test)', 'Influencer outreach start'],
]
story.append(make_table(m2_headers, m2_rows, col_widths=[35, 190, 160, 130]))

story.append(heading("Month 3: Beta Testing & Store Review"))
m3_headers = ['Week', 'Engineering', 'Business/Compliance', 'Marketing']
m3_rows = [
    ['9', 'Diaspora on-ramp (LemFi/NALA integration)', 'Finalize CBK registration', 'Beta tester recruitment (5-10 chamas)'],
    ['10', 'WhatsApp bot MVP + P2P fundraising', 'Submit to Apple App Store (TestFlight)', 'Chama community outreach'],
    ['11', 'Fix store review feedback, bug fixes', 'Physical office setup in Nairobi', 'Content marketing: blog, guides'],
    ['12', 'Load testing, security hardening, pen test prep', 'Annual compliance calendar setup', 'Referral program launch prep'],
]
story.append(make_table(m3_headers, m3_rows, col_widths=[35, 190, 160, 130]))

story.append(heading("Month 4: Public Launch"))
m4_headers = ['Week', 'Engineering', 'Business/Compliance', 'Marketing']
m4_rows = [
    ['13', 'Launch-readiness: monitoring, alerts, runbooks', 'Final CBK license confirmation', 'LAUNCH EVENT (Nairobi)'],
    ['14', 'Promote apps to Production on both stores', 'Press release: regulatory approval', 'PR push: tech blogs, newspapers'],
    ['15', 'Post-launch hotfix sprint', 'First compliance review', 'Paid ads: Facebook, Instagram, Google'],
    ['16', 'Analytics dashboard for growth metrics', 'Member feedback collection', 'Chama ambassador program kickoff'],
]
story.append(make_table(m4_headers, m4_rows, col_widths=[35, 190, 160, 130]))

story.append(heading("Month 5-6: Growth & Iteration"))
for item in [
    "<b>Engineering:</b> AI anomaly detection, credit scoring MVP, investment marketplace, cross-border chamas",
    "<b>Business:</b> Insurance partnerships, bank partnerships, SACCO bridge program, corporate chama sales",
    "<b>Marketing:</b> University campus ambassadors, chama federation partnerships, radio/TV appearances, content series 'Kenya's Smartest Chama'",
    "<b>Metrics to track:</b> DAU/MAU, chama creation rate, contribution volume, churn rate, NPS score, store ratings, customer acquisition cost (CAC), lifetime value (LTV)",
]:
    story.append(bullet(item))

story.append(PageBreak())

# ═══════════════════════════════════════════════════════════════
# SECTION 9: APPENDIX
# ═══════════════════════════════════════════════════════════════
story.append(heading("9. Appendix", 1))
story.append(hr())

story.append(heading("9.1 Critical Environment Variables for Production"))
env_vars = [
    "# ── Database",
    "DATABASE_URL=postgresql://user:pass@prod-db.xxx.rds.amazonaws.com:5432/pamoja_wealth",
    "",
    "# ── Redis",
    "REDIS_URL=redis://prod-redis.xxx.cache.amazonaws.com:6379",
    "",
    "# ── JWT",
    "JWT_SECRET=<256-bit-random-secret>",
    "JWT_REFRESH_SECRET=<different-256-bit-random-secret>",
    "JWT_ACCESS_EXPIRY=15m",
    "JWT_REFRESH_EXPIRY=7d",
    "",
    "# ── M-Pesa Daraja (PRODUCTION)",
    "DARAJA_CONSUMER_KEY=<production-consumer-key>",
    "DARAJA_CONSUMER_SECRET=<production-consumer-secret>",
    "DARAJA_PASS_KEY=<production-passkey>",
    "DARAJA_BUSINESS_SHORT_CODE=<your-paybill-number>",
    "DARAJA_CALLBACK_URL=https://api.pamojawealth.app/v1/webhooks/daraja/c2b",
    "MPESA_ENVIRONMENT=production",
    "FEATURE_MPESA_ENABLED=true",
    "",
    "# ── Email (SendGrid)",
    "SENDGRID_API_KEY=<sendgrid-key>",
    "SENDGRID_FROM_EMAIL=noreply@pamojawealth.app",
    "",
    "# ── SMS (Africa's Talking)",
    "AT_USERNAME=<at-username>",
    "AT_API_KEY=<at-api-key>",
    "AT_SENDER_ID=PamojaWealth",
    "",
    "# ── AI",
    "ANTHROPIC_API_KEY=<claude-api-key>",
    "OPENAI_API_KEY=<openai-key>",
    "",
    "# ── Storage (AWS S3)",
    "AWS_REGION=eu-west-1",
    "AWS_ACCESS_KEY_ID=<aws-key>",
    "AWS_SECRET_ACCESS_KEY=<aws-secret>",
    "S3_BUCKET=pamoja-wealth-prod",
    "",
    "# ── Security",
    "ENCRYPTION_KEY=<64-char-hex-key>",
    "CORS_ORIGINS=https://pamojawealth.app,capacitor://localhost",
    "",
    "# ── Monitoring",
    "SENTRY_DSN=https://xxx@sentry.io/xxx",
    "DATADOG_API_KEY=<dd-key>",
    "",
    "# ── Feature Flags",
    "FEATURE_AI_ENABLED=true",
    "FEATURE_CHAT_ENABLED=true",
    "FEATURE_INVESTMENTS_ENABLED=true",
]
story.append(code("\n".join(env_vars)))

story.append(heading("9.2 Recommended Team Structure (Post-Launch)"))
team_headers = ['Role', 'Count', 'Responsibility']
team_rows = [
    ['CTO / Tech Lead', '1', 'Architecture, code review, security, M-Pesa integration'],
    ['Senior Backend Engineer', '1', 'API development, database, BullMQ, payments'],
    ['Senior Frontend Engineer', '1', 'React app, Capacitor, mobile stores, UI/UX'],
    ['DevOps Engineer', '0.5 (part-time)', 'Infrastructure, CI/CD, monitoring, backups'],
    ['QA Engineer', '1', 'Testing, automation, store submission testing'],
    ['Product Manager', '1', 'Roadmap, user research, chama community engagement'],
    ['Compliance Officer / DPO', '0.5 (part-time)', 'CBK, ODPC, AML compliance, audits'],
    ['Customer Support', '1-2', 'In-app support, WhatsApp support, chama onboarding'],
    ['Marketing Lead', '1', 'Growth, content, social media, partnerships'],
    ['TOTAL', '8-9', 'Mix of full-time and part-time/contract roles'],
]
story.append(make_table(team_headers, team_rows, col_widths=[160, 80, 280]))

story.append(heading("9.3 Key Contacts & Resources"))
for item in [
    "<b>Safaricom Business Portal:</b> https://business.safaricom.co.ke/",
    "<b>Daraja Developer Portal:</b> https://developer.safaricom.co.ke/",
    "<b>CBK DCP Registration:</b> https://www.centralbank.go.ke/digital-credit-providers/",
    "<b>ODPC Registration:</b> https://www.odpc.go.ke/",
    "<b>Financial Reporting Centre (FRC):</b> https://www.frc.go.ke/",
    "<b>Kenya Revenue Authority (KRA):</b> https://www.kra.go.ke/",
    "<b>e-Citizen (company registration):</b> https://www.ecitizen.go.ke/",
    "<b>Apple Developer Program:</b> https://developer.apple.com/programs/",
    "<b>Google Play Console:</b> https://play.google.com/console/",
    "<b>M-Pesa Daraja Documentation:</b> https://developer.safaricom.co.ke/docs",
    "<b>Africa's Talking SMS API:</b> https://africastalking.com/sms",
    "<b>SendGrid Email API:</b> https://sendgrid.com/",
]:
    story.append(bullet(item))

story.append(spacer(20))
story.append(hr())
story.append(Paragraph(
    "<i>This document was generated from comprehensive research on the Kenyan fintech regulatory "
    "landscape, M-Pesa Daraja API requirements, App Store/Play Store submission processes, and "
    "chama/fundraising platform best practices. All information is current as of July 2026. "
    "Regulatory requirements are subject to change — always verify with official sources.</i>",
    small_style
))
story.append(spacer(10))
story.append(Paragraph(
    "<b>Pamoja Wealth - From Chama to Wealth</b><br/>"
    "Building Africa's most trusted group savings & fundraising platform",
    ParagraphStyle('Closing', parent=body_style, alignment=TA_CENTER, textColor=GREEN, fontSize=10)
))

# ── Build PDF ────────────────────────────────────────────────
doc.build(story)
print("PDF generated successfully!")
print(f"Location: {os.path.join(os.path.dirname(__file__), '..', 'docs', 'PAMOJA_WEALTH_GO_LIVE_ROADMAP.pdf')}")
