/**
 * QRShareCard — generates a QR code for sharing chamas, fundraisers, and invite links.
 *
 * Uses qrcode.react to render a scannable QR that links to the share URL.
 * Includes copy-link, WhatsApp share, and download-QR actions.
 */

import { useState, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { toast } from "sonner";
import { Copy, Check, Share2, Download, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

interface QRShareCardProps {
  url: string;
  title: string;
  description?: string;
  variant?: "chama" | "fundraiser" | "invite";
  className?: string;
}

export function QRShareCard({ url, title, description, variant = "chama", className }: QRShareCardProps) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const variantColors = {
    chama: { bg: "from-brand-50 to-brand-100/50 dark:from-brand-500/[0.06] dark:to-brand-500/[0.02]", border: "border-brand-200/60 dark:border-brand-500/20", icon: "text-brand-600 dark:text-brand-400" },
    fundraiser: { bg: "from-amber-50 to-amber-100/50 dark:from-amber-500/[0.06] dark:to-amber-500/[0.02]", border: "border-amber-200/60 dark:border-amber-500/20", icon: "text-amber-600 dark:text-amber-400" },
    invite: { bg: "from-emerald-50 to-emerald-100/50 dark:from-emerald-500/[0.06] dark:to-emerald-500/[0.02]", border: "border-emerald-200/60 dark:border-emerald-500/20", icon: "text-emerald-600 dark:text-emerald-400" },
  };

  const colors = variantColors[variant];

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(`${title}${description ? ` — ${description}` : ""}\n\n${url}`);
    window.open(`https://wa.me/?text=${text}`, "_blank", "noopener,noreferrer");
  };

  const downloadQR = () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg) return;
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();
    img.onload = () => {
      canvas.width = 512;
      canvas.height = 512;
      ctx!.fillStyle = "#ffffff";
      ctx!.fillRect(0, 0, 512, 512);
      ctx!.drawImage(img, 0, 0, 512, 512);
      const png = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `pamoja-${variant}-qr.png`;
      link.href = png;
      link.click();
      toast.success("QR code downloaded!");
    };
    img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
  };

  return (
    <div className={cn("rounded-2xl border bg-gradient-to-br p-5 space-y-4", colors.bg, colors.border, className)}>
      <div className="flex items-center gap-2">
        <Share2 className={cn("h-4 w-4", colors.icon)} />
        <h3 className="text-sm font-bold text-gray-900 dark:text-white">Share &amp; get support</h3>
      </div>

      {/* QR Code */}
      <div ref={qrRef} className="flex justify-center bg-white dark:bg-white rounded-xl p-4 shadow-sm">
        <QRCodeSVG
          value={url}
          size={200}
          level="M"
          includeMargin
          imageSettings={{
            src: "",
            height: 0,
            width: 0,
            excavate: true,
          }}
        />
      </div>

      <p className="text-center text-[11px] text-gray-500 dark:text-gray-400 leading-relaxed">
        Scan this QR code to open <strong className="text-gray-700 dark:text-gray-300">{title}</strong> on your phone.
      </p>

      {/* Share URL */}
      <div className="flex items-center gap-2">
        <code className="flex-1 rounded-lg border border-gray-200 dark:border-white/[0.08] bg-white dark:bg-white/[0.05] px-3 py-2 text-[11px] font-mono text-gray-600 dark:text-gray-400 truncate select-all">
          {url}
        </code>
        <Button
          size="sm"
          variant="secondary"
          leftIcon={copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
          onClick={copyLink}
        >
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={shareWhatsApp}
          className="flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700 transition-colors"
        >
          <MessageCircle className="h-4 w-4" /> WhatsApp
        </button>
        <button
          onClick={downloadQR}
          className="flex items-center justify-center gap-2 rounded-xl border border-gray-200 dark:border-white/[0.1] bg-white dark:bg-white/[0.03] px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-white/[0.06] transition-colors"
        >
          <Download className="h-4 w-4" /> Save QR
        </button>
      </div>
    </div>
  );
}
