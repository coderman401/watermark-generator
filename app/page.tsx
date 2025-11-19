"use client";
import { useState, useRef, useEffect } from "react";
import { Download } from "lucide-react";
import { Button } from "./components/ui/button";
import { Slider } from "./components/ui/slider";
import { Card } from "./components/ui/card";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";

export default function App() {
  const [text, setText] = useState("@yourChannel");
  const [font, setFont] = useState("Passero One");
  const [color, setColor] = useState("#FFFFFF");
  const [opacity, setOpacity] = useState(30);
  const [logo, setLogo] = useState<string | null>(null);
  const watermarkRef = useRef<HTMLDivElement>(null);
  const logoImgRef = useRef<HTMLImageElement>(null);
  const [previewFontSize, setPreviewFontSize] = useState<number>(72);

  const fonts = [
    "Passero One",
    "Bebas Neue",
    "Righteous",
    "Russo One",
    "Bangers",
    "Bungee",
    "Anton",
    "Permanent Marker",
    "Oswald",
    "Montserrat",
    "Orbitron",
    "Rajdhani",
    "Black Ops One",
    "Teko",
    "Saira Condensed",
    "Hitchcut"
  ];

  const downloadWatermark = () => {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) return;

    const hasLogo = logo && logoImgRef.current;
    const hasText = text.trim().length > 0;

    // Determine canvas size based on content
    let canvasWidth = 800;
    let canvasHeight = 200;

    if (hasLogo && !hasText) {
      canvasWidth = 300;
      canvasHeight = 300;
    } else if (!hasLogo && hasText) {
      canvasWidth = 800;
      canvasHeight = 200;
    } else if (hasLogo && hasText) {
      canvasWidth = 800;
      canvasHeight = 450;
    }

    canvas.width = canvasWidth;
    canvas.height = canvasHeight;

    // Clear canvas with transparency
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    let yOffset = 0;

    // Draw logo if available
    if (hasLogo && logoImgRef.current) {
      const logoImg = logoImgRef.current;
      const logoSize = hasText ? 150 : 250;
      const logoActualHeight = logoImg.naturalHeight;
      const logoActualWidth = logoImg.naturalWidth;
      const logoX = canvas.width / 2 - logoSize / 2;
      const logoHeight = (logoActualHeight / logoActualWidth) * logoSize;
      const logoY = hasText ? 100 : canvas.height / 2 - logoHeight / 2;

      // Apply opacity to logo
      ctx.globalAlpha = opacity / 100;
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoHeight);
      ctx.globalAlpha = 1.0;

      yOffset = logoY + logoHeight + 50;
    }

    // Draw text if available
    if (hasText) {
      // choose canvas font size relative to canvas width and clamp for readability
      const canvasFontSize = Math.max(24, Math.min(120, Math.round(canvas.width * 0.09)));
      ctx.font = `${canvasFontSize}px "${font}"`;

      // Convert hex to rgba
      const r = parseInt(color.slice(1, 3), 16);
      const g = parseInt(color.slice(3, 5), 16);
      const b = parseInt(color.slice(5, 7), 16);
      ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity / 100})`;

      ctx.textBaseline = "middle";
      ctx.textAlign = "center";

      const textY = hasLogo ? yOffset : canvas.height / 2;
      ctx.fillText(text, canvas.width / 2, textY);
    }

    // Convert to PNG and download
    canvas.toBlob((blob) => {
      if (blob) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.download = `watermark-${opacity}opacity.png`;
        link.href = url;
        link.click();
        URL.revokeObjectURL(url);
      }
    }, "image/png");
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setLogo(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setLogo(null);
  };

  const hasLogo = logo !== null;
  const hasText = text.trim().length > 0;

  useEffect(() => {
    const computePreviewFont = () => {
      // Scale preview font relative to a baseline 375px width, clamp between 20 and 72
      const base = 36; // baseline font size for ~375px width
      const size = Math.round((window.innerWidth / 375) * base);
      setPreviewFontSize(Math.max(20, Math.min(72, size)));
    };

    computePreviewFont();
    window.addEventListener('resize', computePreviewFont);
    return () => window.removeEventListener('resize', computePreviewFont);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-8">
      <link href={`https://fonts.googleapis.com/css2?family=${fonts.map((f) => f.replace(" ", "+")).join("&family=")}&display=swap`} rel="stylesheet" />


      <Card className="max-w-4xl w-full p-8 bg-slate-800/50 backdrop-blur-sm border-slate-700">
        <div className="space-y-8">
          <div>
            <h1 className="text-white mb-2">Video Watermark Generator</h1>
            <p className="text-slate-400">Customize your watermark and download as a transparent PNG</p>
          </div>

          {/* Watermark Preview */}
          <div className="bg-slate-900/50 rounded-lg p-12 flex items-center justify-center min-h-[300px] border-2 border-dashed border-slate-700">
            <div
              ref={watermarkRef}
              className="flex flex-col items-center justify-center gap-4"
              style={{
                opacity: opacity / 100,
                userSelect: "none",
              }}
            >
              {hasLogo && <img ref={logoImgRef} src={logo!} alt="Logo" style={{ width: "150px", objectFit: "contain" }} />}
              {hasText && (
                <div
                  style={{
                    fontFamily: `"${font}", cursive`,
                    color: color,
                    fontSize: `${previewFontSize}px`,
                    lineHeight: 1,
                    textAlign: 'center',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {text}
                </div>
              )}
              {!hasLogo && !hasText && <p className="text-slate-500">Add text or upload a logo to preview</p>}
            </div>
          </div>

          {/* Controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Text Input */}
            <div className="space-y-2">
              <Label htmlFor="text" className="text-white">
                Watermark Text
              </Label>
              <Input id="text" value={text} onChange={(e) => setText(e.target.value)} placeholder="Enter your text" maxLength={24} className="bg-slate-700 border-slate-600 text-white" />
            </div>

            {/* Font Selector */}
            <div className="space-y-2">
              <Label htmlFor="font" className="text-white">
                Font Family
              </Label>
              <Select value={font} onValueChange={setFont}>
                <SelectTrigger className="bg-slate-700 border-slate-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {fonts.map((f) => (
                    <SelectItem key={f} value={f} style={{ fontFamily: `"${f}"` }}>
                      {f}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Color Picker */}
            <div className="space-y-2">
              <Label htmlFor="color" className="text-white">
                Color
              </Label>
              <div className="flex gap-2">
                <Input id="color" type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-20 h-10 bg-slate-700 border-slate-600 cursor-pointer" />
                <Input type="text" value={color} onChange={(e) => setColor(e.target.value)} className="flex-1 bg-slate-700 border-slate-600 text-white" placeholder="#FFFFFF" />
              </div>
            </div>

            {/* Opacity Control */}
            <div className="space-y-2">
              <Label className="text-white">Opacity: {opacity}%</Label>
              <Slider value={[opacity]} onValueChange={(value: number[]) => setOpacity(value[0])} min={20} max={40} step={1} className="w-full mt-2" />
              <div className="flex justify-between text-slate-400">
                <span>20%</span>
                <span>40%</span>
              </div>
            </div>

            {/* Logo Upload */}
            <div className="space-y-2">
              <Label htmlFor="logo" className="text-white">
                Logo
              </Label>
              <Input id="logo" type="file" accept="image/*" onChange={handleLogoUpload} className="bg-slate-700 border-slate-600 text-white" />
              {hasLogo && (
                <Button onClick={removeLogo} className="w-full bg-red-600 hover:bg-red-700" size="sm">
                  Remove Logo
                </Button>
              )}
            </div>
          </div>

          {/* Download Button */}
          <Button onClick={downloadWatermark} className="w-full bg-purple-600 hover:bg-purple-700" size="lg">
            <Download className="mr-2 size-5" />
            Download PNG (Transparent)
          </Button>

          {/* Info */}
          <div className="bg-slate-700/30 rounded-lg p-4 text-slate-300 space-y-2">
            <p>
              <strong>Current Settings:</strong>
            </p>
            <p>
              <strong>Font:</strong> {font}
            </p>
            <p>
              <strong>Color:</strong> {color}
            </p>
            <p>
              <strong>Opacity:</strong> {opacity}%
            </p>
            <p>
              <strong>Format:</strong> PNG with transparent background
            </p>
          </div>
        </div>

        <footer className="mt-6 text-center text-sm">
          <p className="text-center text-primary-foreground">
            © {new Date().getFullYear()} Video Watermark. All rights reserved. Developed by{' '}
            <a
              href="https://kishanpanchal.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-200 underline hover:text-white"
            >
              @coderman401
            </a>
          </p>
        </footer>
      </Card>
    </div>
  );
}
