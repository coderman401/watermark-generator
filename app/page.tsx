"use client";

import { useEffect, useRef, useState } from "react";
import { Aperture, Check, Download, ImagePlus, LockKeyhole, X } from "lucide-react";
import Image from "next/image";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Label } from "./components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./components/ui/select";


const fonts = [
  'Passero One', 'Bebas Neue', 'Righteous', 'Russo One', 'Bangers', 'Bungee', 'Anton', 'Permanent Marker', 'Oswald', 'Montserrat', 'Orbitron', 'Rajdhani', 'Black Ops One', 'Teko', 'Saira Condensed', 'Hitchcut'
];

const fontStack = (family: string) => `"${family}", system-ui, sans-serif`;

const backgrounds = [
  { id: "scene", label: "Sample footage" },
  { id: "grid", label: "Transparency grid" },
  { id: "light", label: "Light background" },
] as const;

type Background = (typeof backgrounds)[number]["id"];

function drawWatermark(
  canvas: HTMLCanvasElement,
  { text, font, color, opacity, logo }: {
    text: string;
    font: string;
    color: string;
    opacity: number;
    logo: HTMLImageElement | undefined;
  },
) {
  const context = canvas.getContext("2d");
  if (!context) return;

  const { width, height } = canvas;
  context.clearRect(0, 0, width, height);
  context.globalAlpha = opacity / 100;

  if (logo) {
    const size = text ? 150 : 250;
    const scale = Math.min(size / logo.naturalWidth, size / logo.naturalHeight);
    const logoWidth = logo.naturalWidth * scale;
    const logoHeight = logo.naturalHeight * scale;
    context.drawImage(
      logo,
      (width - logoWidth) / 2,
      text ? (280 - logoHeight) / 2 : (height - logoHeight) / 2,
      logoWidth,
      logoHeight,
    );
  }

  if (text) {
    context.font = `72px ${fontStack(font)}`;
    context.fillStyle = color;
    context.textBaseline = "middle";
    context.textAlign = "center";
    context.fillText(text, width / 2, logo ? 320 : height / 2, width - 48);
  }
}

export default function App() {
  const [text, setText] = useState("@yourChannel");
  const [font, setFont] = useState(fonts[0]);
  const [color, setColor] = useState("#FFFFFF");
  const [hexInput, setHexInput] = useState(color);
  const [opacity, setOpacity] = useState(30);
  const [background, setBackground] = useState<Background>("scene");
  const [logo, setLogo] = useState<{ image: HTMLImageElement; name: string }>();
  const [uploadError, setUploadError] = useState("");
  const [exportStatus, setExportStatus] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);

  const watermarkText = text.trim() ? text : "";
  const hasWatermark = Boolean(watermarkText || logo);
  const width = logo && !watermarkText ? 300 : 800;
  const height = logo ? (watermarkText ? 450 : 300) : 200;

  useEffect(() => {
    let active = true;
    const draw = () => {
      if (active && canvasRef.current) {
        drawWatermark(canvasRef.current, { text: watermarkText, font, color, opacity, logo: logo?.image });
      }
    };

    draw();
    if (watermarkText) {
      void document.fonts.load(`72px ${fontStack(font)}`, watermarkText).then(draw, draw);
    }
    return () => { active = false; };
  }, [watermarkText, font, color, opacity, logo]);

  function updateColor(value: string) {
    const hex = value.toUpperCase();
    setHexInput(hex);
    if (/^#[0-9A-F]{6}$/.test(hex)) setColor(hex);
  }

  async function uploadLogo(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.currentTarget.files?.[0];
    event.currentTarget.value = "";
    if (!file) return;

    const version = ++uploadVersion.current;
    const url = URL.createObjectURL(file);
    const image = new window.Image();
    image.src = url;
    setUploadError("");

    try {
      await image.decode();
      if (version === uploadVersion.current) setLogo({ image, name: file.name });
    } catch {
      if (version === uploadVersion.current) setUploadError("This image couldn’t be opened. Try a PNG or JPEG.");
    } finally {
      URL.revokeObjectURL(url);
    }
  }

  function downloadWatermark() {
    if (!canvasRef.current || !hasWatermark) return;

    setExportStatus("");
    canvasRef.current.toBlob((blob) => {
      if (!blob) {
        setExportStatus("The PNG couldn’t be created. Try downloading again.");
        return;
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.download = `watermark-${opacity}opacity.png`;
      link.href = url;
      link.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
      setExportStatus("PNG download started.");
    }, "image/png");
  }

  return (
    <>
      <a className="skip-link" href="#main">Skip to editor</a>

      <header className="site-header">
        <div className="shell topbar">
          <div className="brand">
            <span className="brand-icon"><Aperture size={19} strokeWidth={1.7} aria-hidden="true" /></span>
            Watermark
          </div>
          <p className="privacy"><LockKeyhole size={14} aria-hidden="true" /> Files stay in your browser</p>
        </div>
      </header>

      <main className="shell main" id="main" tabIndex={-1}>
        <section className="hero" aria-labelledby="editor-title" data-enter>
          <div className="intro">
            <h1 id="editor-title">Watermark editor</h1>
            <p>Create a text or logo watermark and export it as a transparent PNG.</p>
          </div>

          <div className="app-frame">
            <section className="preview" aria-labelledby="preview-title">
              <div className="panel-header">
                <h2 id="preview-title">Preview</h2>
                <div className="background-options" role="group" aria-label="Preview background">
                  {backgrounds.map(({ id, label }) => (
                    <label key={id} title={label}>
                      <input type="radio" name="preview-background" value={id} aria-label={label} checked={background === id} onChange={() => setBackground(id)} />
                      <span className={`background-swatch background-swatch--${id}`} aria-hidden="true" />
                    </label>
                  ))}
                </div>
              </div>

              <div className={`stage stage--${background}`}>
                <Image className="stage-image" src="/sample-footage.webp" alt="" fill sizes="(max-width: 760px) 92vw, 68vw" loading="eager" />
                <canvas
                  ref={canvasRef}
                  width={width}
                  height={height}
                  className={logo && !watermarkText ? "watermark watermark--square" : "watermark"}
                  role="img"
                  aria-label={watermarkText ? `Watermark preview for ${watermarkText}` : "Logo watermark preview"}
                  hidden={!hasWatermark}
                />
                {!hasWatermark && <p className="empty-preview">Add text or a logo to preview your watermark.</p>}
              </div>

              <div className="preview-meta">
                <span>{backgrounds.find(({ id }) => id === background)?.label}</span>
                <span>PNG <span aria-hidden="true">·</span> {width} × {height} px</span>
              </div>
            </section>

            <section className="inspector" aria-labelledby="settings-title">
              <div className="panel-header">
                <h2 id="settings-title">Watermark</h2>
              </div>

              <div className="fields">
                <div className="field">
                  <Label htmlFor="watermark-text">Text</Label>
                  <Input id="watermark-text" value={text} onChange={(event) => setText(event.target.value)} maxLength={24} placeholder="@yourChannel" />
                </div>

                <div className="field">
                  <Label htmlFor="watermark-font">Typeface</Label>
                  <Select value={font} onValueChange={setFont}>
                    <SelectTrigger id="watermark-font"><SelectValue /></SelectTrigger>
                    <SelectContent className="font-menu">
                      {fonts.map((family) => <SelectItem key={family} value={family} style={{ fontFamily: fontStack(family) }}>{family}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>

                <div className="appearance">
                  <div className="field">
                    <Label htmlFor="watermark-hex">Text color</Label>
                    <div className="color-field">
                      <input type="color" aria-label="Pick text color" value={color} onChange={(event) => updateColor(event.target.value)} />
                      <Input id="watermark-hex" value={hexInput} onChange={(event) => updateColor(event.target.value)} onBlur={() => setHexInput(color)} maxLength={7} spellCheck={false} autoComplete="off" />
                    </div>
                  </div>

                  <div className="field">
                    <div className="field-label">
                      <Label htmlFor="watermark-opacity">Opacity</Label>
                      <output htmlFor="watermark-opacity">{opacity}%</output>
                    </div>
                    <input id="watermark-opacity" type="range" min={20} max={40} value={opacity} onChange={(event) => setOpacity(event.target.valueAsNumber)} style={{ "--range-fill": `${(opacity - 20) * 5}%` } as React.CSSProperties} />
                  </div>
                </div>

                <div className="field">
                  <div className="field-label"><span>Logo</span><span className="optional">Optional</span></div>
                  <input ref={fileRef} type="file" accept="image/*" onChange={uploadLogo} hidden />
                  {logo ? (
                    <div className="logo-row">
                      <span title={logo.name}>{logo.name}</span>
                      <Button type="button" variant="ghost" className="remove-logo" aria-label="Remove logo" onClick={() => {
                        uploadVersion.current++;
                        setLogo(undefined);
                        setUploadError("");
                      }}><X size={16} aria-hidden="true" /></Button>
                    </div>
                  ) : (
                    <Button type="button" variant="outline" className="upload-button" onClick={() => fileRef.current?.click()}>
                      <ImagePlus size={17} aria-hidden="true" /> Upload logo
                    </Button>
                  )}
                  {uploadError && <p className="field-error" role="alert">{uploadError}</p>}
                </div>
              </div>

              <div className="export">
                <Button type="button" className="download-button" onClick={downloadWatermark} disabled={!hasWatermark}>
                  <Download size={17} aria-hidden="true" /> Download PNG
                </Button>
                <p className="export-status" role="status">
                  {exportStatus === "PNG download started." && <Check size={13} aria-hidden="true" />}
                  {exportStatus || "Transparent background"}
                </p>
              </div>
            </section>
          </div>
        </section>
      </main>

      <footer className="shell site-footer">
        <span>© {new Date().getFullYear()} Watermark</span>
        <a href="https://kishanpanchal.in/" target="_blank" rel="noopener noreferrer">@coderman401</a>
      </footer>
    </>
  );
}
