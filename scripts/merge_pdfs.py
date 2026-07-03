#!/usr/bin/env python3
"""
Merge the go-live roadmap + post-session setup into one master handbook.

Order:
  1. Cover page (auto-generated) — overview of merged content
  2. Post-session setup (setup PDF)
  3. Go-live roadmap (existing roadmap PDF)

Output: docs/PAMOJA_WEALTH_MASTER_HANDBOOK.pdf
"""
import io
import os
from datetime import datetime
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor, white
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak,
)

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.abspath(os.path.join(HERE, "..", "docs"))
SETUP = os.path.join(DOCS, "PAMOJA_POST_SESSION_SETUP.pdf")
ROADMAP = os.path.join(DOCS, "PAMOJA_WEALTH_GO_LIVE_ROADMAP.pdf")
OUT = os.path.join(DOCS, "PAMOJA_WEALTH_MASTER_HANDBOOK.pdf")

BRAND = HexColor("#059669")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")


def cover_bytes():
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=28 * mm, bottomMargin=18 * mm)
    h1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=26,
                        textColor=BRAND, leading=32, spaceAfter=8)
    h2 = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=14,
                        textColor=INK, leading=18, spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("Body", fontName="Helvetica", fontSize=10,
                          textColor=INK, leading=14)
    muted = ParagraphStyle("Muted", fontName="Helvetica", fontSize=9,
                           textColor=MUTED, leading=12)

    story = [
        Spacer(1, 12 * mm),
        Paragraph("Pamoja Wealth", h1),
        Paragraph("Master Handbook", h1),
        Spacer(1, 4 * mm),
        Paragraph("Complete guide — from go-live roadmap through the "
                  "world-class overhaul + public donate/invest launch.", muted),
        Spacer(1, 10 * mm),
        HRFlowable(color=BRAND, thickness=2, width="30%"),
        Spacer(1, 8 * mm),
        Paragraph("<b>Rev:</b> " + datetime.now().strftime("%d %B %Y"), body),
        Paragraph("<b>Repos:</b> pamoja-wealth (FE) + pamoja-wealth-backend (BE)", body),
        Spacer(1, 12 * mm),

        Paragraph("Part I — Post-Session Setup &amp; Operator Runbook", h2),
        Paragraph(
            "Everything shipped in the 30-task world-class overhaul + the "
            "public donate/investor/QR feature. Includes credentials, install "
            "steps, verification runbook, and master .env.example.",
            body),
        Paragraph("Sections: 12  ·  Pages: ~20  ·  Priority: read first.", muted),
        Spacer(1, 6 * mm),

        Paragraph("Part II — Original Go-Live Roadmap &amp; Revenue Blueprint", h2),
        Paragraph(
            "Pre-overhaul roadmap: revenue streams, unit economics, GTM "
            "strategy, regulatory position, and launch-week execution plan. "
            "Still authoritative for the business + growth playbook.",
            body),
        Paragraph("Sections: multi  ·  Pages: ~30  ·  Priority: business context.", muted),
        Spacer(1, 12 * mm),

        HRFlowable(color=BRAND, thickness=1),
        Spacer(1, 4 * mm),
        Paragraph("<b>How to use this document</b>", h2),
        Paragraph(
            "Read Part I first — it's the ship-it manual. Reference Part II "
            "for the why-this-matters business context. Section numbering is "
            "independent per part; look at page headers to know which part "
            "you're in.",
            body),
        Spacer(1, 6 * mm),
        Paragraph("<b>Regenerating this handbook</b>", h2),
        Paragraph(
            "cd pamoja-wealth<br/>"
            "python3 scripts/generate_setup_pdf.py &nbsp;# refreshes Part I<br/>"
            "python3 scripts/generate_roadmap_pdf.py &nbsp;# refreshes Part II<br/>"
            "python3 scripts/merge_pdfs.py &nbsp;# rebuilds this master file",
            ParagraphStyle("Mono", fontName="Courier", fontSize=8.5,
                           textColor=INK, leading=11,
                           backColor=HexColor("#F9FAFB"), borderPadding=6,
                           leftIndent=6)),
        PageBreak(),
    ]

    def hf(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BRAND)
        canvas.rect(0, A4[1] - 20 * mm, A4[0], 20 * mm, stroke=0, fill=1)
        canvas.setFillColor(white)
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawString(20 * mm, A4[1] - 13 * mm, "Pamoja Wealth — Master Handbook")
        canvas.setFont("Helvetica", 8)
        canvas.drawRightString(A4[0] - 20 * mm, A4[1] - 13 * mm,
                               datetime.now().strftime("Rev. %Y-%m-%d"))
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawCentredString(A4[0] / 2, 12 * mm, "Cover  ·  Confidential — Internal Use Only")
        canvas.restoreState()

    doc.build(story, onFirstPage=hf, onLaterPages=hf)
    buf.seek(0)
    return buf


def part_divider(title, subtitle):
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=60 * mm, bottomMargin=18 * mm)
    h1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=32,
                        textColor=BRAND, leading=38, alignment=1, spaceAfter=8)
    sub = ParagraphStyle("Sub", fontName="Helvetica", fontSize=12,
                         textColor=MUTED, leading=16, alignment=1)
    story = [
        Paragraph(title, h1),
        Spacer(1, 6 * mm),
        Paragraph(subtitle, sub),
        Spacer(1, 12 * mm),
        HRFlowable(color=BRAND, thickness=2, width="20%"),
    ]

    def hf(canvas, doc):
        canvas.saveState()
        canvas.setFillColor(BRAND)
        canvas.rect(0, A4[1] - 20 * mm, A4[0], 20 * mm, stroke=0, fill=1)
        canvas.setFillColor(white)
        canvas.setFont("Helvetica-Bold", 12)
        canvas.drawString(20 * mm, A4[1] - 13 * mm, "Pamoja Wealth — Master Handbook")
        canvas.setFillColor(MUTED)
        canvas.setFont("Helvetica", 8)
        canvas.drawCentredString(A4[0] / 2, 12 * mm, "Part divider")
        canvas.restoreState()

    doc.build(story, onFirstPage=hf, onLaterPages=hf)
    buf.seek(0)
    return buf


def main():
    if not os.path.exists(SETUP):
        raise SystemExit(f"missing: {SETUP} — run generate_setup_pdf.py first")
    if not os.path.exists(ROADMAP):
        raise SystemExit(f"missing: {ROADMAP} — run generate_roadmap_pdf.py first")

    writer = PdfWriter()

    # Cover
    for page in PdfReader(cover_bytes()).pages:
        writer.add_page(page)

    # Part I divider + setup PDF
    for page in PdfReader(part_divider("Part I", "Post-Session Setup &amp; Operator Runbook")).pages:
        writer.add_page(page)
    for page in PdfReader(SETUP).pages:
        writer.add_page(page)

    # Part II divider + roadmap PDF
    for page in PdfReader(part_divider("Part II", "Go-Live Roadmap &amp; Revenue Blueprint")).pages:
        writer.add_page(page)
    for page in PdfReader(ROADMAP).pages:
        writer.add_page(page)

    # Bookmarks / outline
    writer.add_outline_item("Cover", 0)
    writer.add_outline_item("Part I — Post-Session Setup", 1)
    writer.add_outline_item("Part II — Go-Live Roadmap", 1 + 1 + len(PdfReader(SETUP).pages))

    with open(OUT, "wb") as fh:
        writer.write(fh)

    total = len(writer.pages)
    size = os.path.getsize(OUT) / 1024
    print(f"Wrote {OUT}  ·  {total} pages  ·  {size:.1f} KB")


if __name__ == "__main__":
    main()
