#!/usr/bin/env python3
"""
Merge Go-Live Master + Licenses & Fees into a single project-complete PDF.

Order:
  1. Cover page
  2. PAMOJA_WEALTH_GO_LIVE_MASTER.pdf   (technical + operational)
  3. PAMOJA_WEALTH_LICENSES_AND_FEES.pdf (licensing + costs)

Output: docs/PAMOJA_WEALTH_COMPLETE.pdf
"""
import io
import os
from datetime import datetime
from pypdf import PdfReader, PdfWriter
from reportlab.lib.pagesizes import A4
from reportlab.lib.units import mm
from reportlab.lib.colors import HexColor
from reportlab.lib.styles import ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, HRFlowable, PageBreak,
)

HERE = os.path.dirname(os.path.abspath(__file__))
DOCS = os.path.abspath(os.path.join(HERE, "..", "docs"))
GO_LIVE = os.path.join(DOCS, "PAMOJA_WEALTH_GO_LIVE_MASTER.pdf")
LICENSES = os.path.join(DOCS, "PAMOJA_WEALTH_LICENSES_AND_FEES.pdf")
OUT = os.path.join(DOCS, "PAMOJA_WEALTH_COMPLETE.pdf")

BRAND = HexColor("#059669")
INK = HexColor("#111827")
MUTED = HexColor("#6B7280")


def cover_bytes():
    buf = io.BytesIO()
    doc = SimpleDocTemplate(buf, pagesize=A4,
                            leftMargin=18 * mm, rightMargin=18 * mm,
                            topMargin=28 * mm, bottomMargin=18 * mm)
    h1 = ParagraphStyle("H1", fontName="Helvetica-Bold", fontSize=28,
                        textColor=BRAND, leading=34, spaceAfter=10)
    h2 = ParagraphStyle("H2", fontName="Helvetica-Bold", fontSize=14,
                        textColor=INK, leading=18, spaceBefore=14, spaceAfter=6)
    body = ParagraphStyle("Body", fontName="Helvetica", fontSize=10,
                          textColor=INK, leading=14)
    muted = ParagraphStyle("Muted", fontName="Helvetica", fontSize=9,
                           textColor=MUTED, leading=12)

    story = [
        Spacer(1, 30 * mm),
        Paragraph("Pamoja Wealth", h1),
        Paragraph("Complete Go-Live Handbook", h1),
        Spacer(1, 6 * mm),
        HRFlowable(color=BRAND, thickness=2, width="40%"),
        Spacer(1, 10 * mm),
        Paragraph("Everything you need to launch Pamoja Wealth as a real "
                  "company serving real customers in Kenya + regional East Africa. "
                  "Technical + legal + regulatory + banking + licensing + fees — "
                  "end-to-end, one document.",
                  body),
        Spacer(1, 10 * mm),
        Paragraph("Two-part structure", h2),
        Paragraph(
            "<b>Part 1 — Technical &amp; Operational Handbook</b><br/>"
            "System overview, what's shipped, company setup, business bank, "
            "payment rails, third-party services, technical checklist, KYC/AML, "
            "insurance, team, legal docs, launch runbook, monitoring, budget, "
            "master .env<br/><br/>"
            "<b>Part 2 — Licenses, Certifications &amp; Fees</b><br/>"
            "Every registration + license + certification + fee sequenced by "
            "priority. Kenya first, then UG/TZ/RW/NG expansion. Includes "
            "cost summary, priority DAG, fines matrix, decision tree, and "
            "handy government links.",
            body),
        Spacer(1, 12 * mm),
        Paragraph(f"Prepared: {datetime.now().strftime('%d %B %Y')}", muted),
        Paragraph("Companion: TECH_COMPANY_INCEPTION_KIT.pdf (universal "
                  "parent-company setup for your future projects).", muted),
        Spacer(1, 6 * mm),
        Paragraph("Not legal, tax, or financial advice. Verify every fee + "
                  "regulatory step with a licensed Kenyan advocate + accountant.",
                  muted),
        PageBreak(),
    ]
    doc.build(story)
    buf.seek(0)
    return buf


def main():
    writer = PdfWriter()

    # 1. Cover
    for page in PdfReader(cover_bytes()).pages:
        writer.add_page(page)

    # 2. Go-Live Master
    if os.path.exists(GO_LIVE):
        for page in PdfReader(GO_LIVE).pages:
            writer.add_page(page)
    else:
        raise FileNotFoundError(f"missing {GO_LIVE}")

    # 3. Licenses & Fees
    if os.path.exists(LICENSES):
        for page in PdfReader(LICENSES).pages:
            writer.add_page(page)
    else:
        raise FileNotFoundError(f"missing {LICENSES}")

    with open(OUT, "wb") as f:
        writer.write(f)
    print(f"Wrote: {OUT}")


if __name__ == "__main__":
    main()
