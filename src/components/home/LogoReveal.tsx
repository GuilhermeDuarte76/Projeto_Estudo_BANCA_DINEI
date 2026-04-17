import { useEffect, useRef, useState, useCallback } from 'react';
import logoSrc from '../../assets/logo.png';

interface Props {
  className?: string;
}

export default function LogoReveal({ className }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [showImg, setShowImg] = useState(false);
  const rafRef = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

  const finishAnimation = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    clearTimeout(timeoutRef.current);
    sessionStorage.setItem('logoRevealed', '1');
    setShowImg(true);
  }, []);

  useEffect(() => {
    // Returning visitors skip the animation entirely
    if (sessionStorage.getItem('logoRevealed')) {
      setShowImg(true);
      return;
    }

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d')!;

    // ─── Resolution ───
    const PX = 2;
    const W = 600 * PX;
    const H = 600 * PX;
    const CX = W / 2;
    const S = PX;

    // ─── Colors ───
    const WHITE     = '#ffffff';
    const OFFWHITE  = '#fcfaf7';
    const GOLD      = '#b8872b';
    const GOLD_LT   = '#c99a35';
    const GOLD_DK   = '#8a6518';
    const GOLD_BAND = '#b07e26';
    const CHARCOAL  = '#444444';

    // ─── Geometry ───
    const ARC_CY   = 244 * S;
    const ARC_R    = 175 * S;
    const BADGE_CX = CX;
    const RECT_L   = (300 - 238) * S;
    const RECT_R   = (300 + 238) * S;
    const RECT_BOT = ARC_CY + 160 * S;
    const RECT_RAD = 16 * S;
    const NOTCH_HW = 22 * S;
    const NOTCH_H  = 22 * S;
    const NOTCH_R  = 8 * S;
    const GARC_R   = ARC_R - 14 * S;
    const RIB_Y    = RECT_BOT - 30 * S;
    const RIB_H    = 42 * S;
    const RIB_HW   = 232 * S;
    const RIB_NOTCH = 16 * S;
    const CROWN_CX  = CX;
    const CROWN_CY  = ARC_CY - 64 * S;

    // ─── Centering ───
    const BADGE_TOP_Y   = ARC_CY - ARC_R;
    const BADGE_BOT_Y   = RECT_BOT + NOTCH_H;
    const BADGE_CY_VIS  = (BADGE_TOP_Y + BADGE_BOT_Y) / 2;
    const CENTER_OFFSET = H / 2 - BADGE_CY_VIS;

    // ─── Real logo ───
    const realLogo = new window.Image();
    realLogo.src = logoSrc;
    let logoLoaded = false;
    realLogo.onload = () => { logoLoaded = true; };

    // ─── Easings ───
    const easeOutCubic   = (t: number) => 1 - Math.pow(1 - t, 3);
    const easeOutQuart   = (t: number) => 1 - Math.pow(1 - t, 4);
    const easeOutQuint   = (t: number) => 1 - Math.pow(1 - t, 5);
    const easeInOutCubic = (t: number) => t < 0.5 ? 4*t*t*t : 1 - Math.pow(-2*t+2, 3)/2;
    const easeOutBack    = (t: number) => {
      const c1 = 1.70158, c3 = c1 + 1;
      return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
    };
    const easeInCubic  = (t: number) => t * t * t;
    const clamp01 = (t: number) => Math.max(0, Math.min(1, t));

    // ─── Badge outline path ───
    function badgePath(inflate = 0) {
      const r   = ARC_R + inflate;
      const l   = RECT_L - inflate;
      const rt  = RECT_R + inflate;
      const bot = RECT_BOT + inflate;
      const rr  = RECT_RAD;
      const cx  = BADGE_CX;
      const cy  = ARC_CY;
      const nw  = NOTCH_HW;
      const nh  = NOTCH_H + inflate * 0.5;
      const nr  = NOTCH_R;

      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, -Math.PI, true);
      ctx.lineTo(l, cy);
      ctx.lineTo(l, bot - rr);
      ctx.quadraticCurveTo(l, bot, l + rr, bot);
      ctx.lineTo(cx - nw - nr, bot);
      ctx.quadraticCurveTo(cx - nw, bot, cx - nw, bot + nr);
      ctx.lineTo(cx - nr * 0.6, bot + nh - nr * 0.6);
      ctx.quadraticCurveTo(cx, bot + nh, cx + nr * 0.6, bot + nh - nr * 0.6);
      ctx.lineTo(cx + nw, bot + nr);
      ctx.quadraticCurveTo(cx + nw, bot, cx + nw + nr, bot);
      ctx.lineTo(rt - rr, bot);
      ctx.quadraticCurveTo(rt, bot, rt, bot - rr);
      ctx.lineTo(rt, cy);
      ctx.closePath();
    }

    // ─── Draw functions ───

    function drawBadge(alpha: number, scaleT: number) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const sc = 0.93 + 0.07 * scaleT;
      const pivotY = ARC_CY + 60 * S;
      ctx.translate(CX, pivotY);
      ctx.scale(sc, sc);
      ctx.translate(-CX, -pivotY);
      ctx.shadowColor = 'rgba(0,0,0,0.45)';
      ctx.shadowBlur = 30 * S;
      ctx.shadowOffsetY = 8 * S;
      badgePath(6 * S);
      ctx.fillStyle = WHITE;
      ctx.fill();
      ctx.shadowColor = 'transparent';
      badgePath(0);
      ctx.fillStyle = OFFWHITE;
      ctx.fill();
      ctx.restore();
    }

    function drawGoldArc(progress: number) {
      if (progress <= 0) return;
      ctx.save();
      const halfSpan = progress * (Math.PI / 2);
      const topAngle = -Math.PI / 2;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 2.5 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.arc(CX, ARC_CY, GARC_R, topAngle - halfSpan, topAngle + halfSpan);
      ctx.stroke();
      if (progress > 0.15) {
        const p2 = clamp01((progress - 0.15) / 0.85);
        const halfSpan2 = p2 * (Math.PI / 2);
        ctx.globalAlpha = 0.45;
        ctx.lineWidth = 1 * S;
        ctx.beginPath();
        ctx.arc(CX, ARC_CY, GARC_R - 12 * S, topAngle - halfSpan2, topAngle + halfSpan2);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawCrown(alpha: number, dropT: number) {
      if (alpha <= 0) return;
      ctx.save();
      const cy = CROWN_CY - (1 - dropT) * 45 * S;
      ctx.globalAlpha = alpha;
      ctx.translate(CROWN_CX, cy);
      ctx.scale(0.3 + 0.7 * dropT, 0.3 + 0.7 * dropT);
      const w = 52 * S, h = 44 * S;
      ctx.beginPath();
      ctx.moveTo(-w, h * 0.45);
      ctx.lineTo(-w, -h * 0.08);
      ctx.lineTo(-w + 4 * S, -h * 0.16);
      ctx.lineTo(-w * 0.52, h * 0.22);
      ctx.lineTo(-4 * S, -h * 0.58);
      ctx.lineTo(0, -h * 0.62);
      ctx.lineTo(4 * S, -h * 0.58);
      ctx.lineTo(w * 0.52, h * 0.22);
      ctx.lineTo(w - 4 * S, -h * 0.16);
      ctx.lineTo(w, -h * 0.08);
      ctx.lineTo(w, h * 0.45);
      ctx.closePath();
      ctx.fillStyle = GOLD;
      ctx.fill();
      ctx.strokeStyle = GOLD_DK;
      ctx.lineWidth = 1.2 * S;
      ctx.stroke();
      const bandH = h * 0.22;
      ctx.fillStyle = GOLD_BAND;
      ctx.fillRect(-w, h * 0.45, w * 2, bandH);
      ctx.strokeStyle = GOLD_DK;
      ctx.lineWidth = 0.8 * S;
      ctx.strokeRect(-w, h * 0.45, w * 2, bandH);
      for (const [tx, ty] of [[0, -h * 0.62], [-w + 2 * S, -h * 0.16], [w - 2 * S, -h * 0.16]] as [number,number][]) {
        ctx.beginPath();
        ctx.arc(tx, ty - 2 * S, 5.5 * S, 0, Math.PI * 2);
        ctx.fillStyle = GOLD_LT;
        ctx.fill();
        ctx.strokeStyle = GOLD_DK;
        ctx.lineWidth = 0.8 * S;
        ctx.stroke();
      }
      for (const [tx, ty] of [[-w * 0.52, h * 0.18], [w * 0.52, h * 0.18]] as [number,number][]) {
        ctx.beginPath();
        ctx.arc(tx, ty, 3.5 * S, 0, Math.PI * 2);
        ctx.fillStyle = GOLD_LT;
        ctx.fill();
      }
      ctx.restore();
    }

    function drawBancaDo(alpha: number, ruleP: number) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const ty = ARC_CY + 4 * S;
      ctx.fillStyle = GOLD;
      ctx.font = `500 ${18 * S}px "Cormorant Garamond", Georgia, serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const text = 'BANCA DO';
      const spacing = 4.5 * S;
      const charWidths: number[] = [];
      let totalW = 0;
      for (const ch of text) {
        const w = ctx.measureText(ch).width;
        charWidths.push(w);
        totalW += w;
      }
      totalW += spacing * (text.length - 1);
      let xPos = CX - totalW / 2;
      for (let i = 0; i < text.length; i++) {
        ctx.fillText(text[i], xPos + charWidths[i] / 2, ty);
        xPos += charWidths[i] + spacing;
      }
      if (ruleP > 0) {
        ctx.strokeStyle = GOLD;
        ctx.lineWidth = 1.2 * S;
        ctx.globalAlpha = alpha * ruleP;
        const ruleLen = 82 * S * ruleP;
        const gap = totalW / 2 + 8 * S;
        ctx.beginPath();
        ctx.moveTo(CX - gap, ty);
        ctx.lineTo(CX - gap - ruleLen, ty);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(CX + gap, ty);
        ctx.lineTo(CX + gap + ruleLen, ty);
        ctx.stroke();
      }
      ctx.restore();
    }

    function drawDINEI(states: { char: string; x: number; alpha: number; offsetY: number }[]) {
      for (const { char, x, alpha, offsetY } of states) {
        if (alpha <= 0) continue;
        ctx.save();
        ctx.globalAlpha = alpha;
        ctx.shadowColor = 'rgba(0,0,0,0.18)';
        ctx.shadowBlur = 3 * S;
        ctx.shadowOffsetX = 2 * S;
        ctx.shadowOffsetY = 2 * S;
        ctx.fillStyle = CHARCOAL;
        ctx.font = `800 ${116 * S}px "Playfair Display", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'alphabetic';
        ctx.fillText(char, x, ARC_CY + 108 * S + offsetY);
        ctx.restore();
      }
    }

    function drawRibbon(progress: number, textAlpha: number) {
      if (progress <= 0) return;
      ctx.save();
      const ry = RIB_Y;
      const rh = RIB_H;
      const hw = RIB_HW * progress;
      const nd = RIB_NOTCH;
      const cx = CX;
      const grad = ctx.createLinearGradient(cx - hw, ry, cx + hw, ry);
      grad.addColorStop(0,    GOLD_DK);
      grad.addColorStop(0.12, GOLD);
      grad.addColorStop(0.5,  GOLD_LT);
      grad.addColorStop(0.88, GOLD);
      grad.addColorStop(1,    GOLD_DK);
      ctx.fillStyle = grad;
      const notched = progress >= 0.95;
      ctx.beginPath();
      if (notched) {
        ctx.moveTo(cx - hw + nd, ry + rh / 2);
        ctx.lineTo(cx - hw, ry);
      } else {
        ctx.moveTo(cx - hw, ry);
      }
      ctx.lineTo(cx + hw, ry);
      if (notched) ctx.lineTo(cx + hw - nd, ry + rh / 2);
      ctx.lineTo(cx + hw, ry + rh);
      ctx.lineTo(cx - hw, ry + rh);
      if (notched) ctx.lineTo(cx - hw + nd, ry + rh / 2);
      ctx.closePath();
      ctx.fill();
      ctx.strokeStyle = GOLD_DK;
      ctx.lineWidth = 0.8 * S;
      const off = notched ? nd : 0;
      ctx.beginPath();
      ctx.moveTo(cx - hw + off, ry);
      ctx.lineTo(cx + hw - off, ry);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - hw + off, ry + rh);
      ctx.lineTo(cx + hw - off, ry + rh);
      ctx.stroke();
      if (textAlpha > 0) {
        ctx.globalAlpha = textAlpha;
        ctx.fillStyle = WHITE;
        ctx.font = `500 ${14.5 * S}px "Cormorant Garamond", Georgia, serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const txt = 'DELICATESSEN';
        const sp = 3.5 * S;
        const cw: number[] = [];
        let tw = 0;
        for (const ch of txt) {
          const w = ctx.measureText(ch).width;
          cw.push(w);
          tw += w;
        }
        tw += sp * (txt.length - 1);
        let xx = cx - tw / 2;
        for (let i = 0; i < txt.length; i++) {
          ctx.fillText(txt[i], xx + cw[i] / 2, ry + rh / 2 + 1 * S);
          xx += cw[i] + sp;
        }
      }
      ctx.restore();
    }

    function drawBottomDeco(alpha: number) {
      if (alpha <= 0) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      const bx = CX;
      const by = RECT_BOT + 2 * S;
      ctx.strokeStyle = GOLD;
      ctx.lineWidth = 1 * S;
      ctx.lineCap = 'round';
      ctx.beginPath();
      ctx.moveTo(bx - 24 * S, by + NOTCH_H + 8 * S);
      ctx.lineTo(bx - 6 * S,  by + NOTCH_H + 8 * S);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + 6 * S,  by + NOTCH_H + 8 * S);
      ctx.lineTo(bx + 24 * S, by + NOTCH_H + 8 * S);
      ctx.stroke();
      const dy = by + NOTCH_H + 8 * S;
      const ds = 3 * S;
      ctx.fillStyle = GOLD;
      ctx.beginPath();
      ctx.moveTo(bx,      dy - ds);
      ctx.lineTo(bx + ds, dy);
      ctx.lineTo(bx,      dy + ds);
      ctx.lineTo(bx - ds, dy);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }

    function drawSheen(progress: number) {
      if (progress <= 0 || progress >= 1) return;
      ctx.save();
      badgePath(6 * S);
      ctx.clip();
      const totalW = (RECT_R - RECT_L) + 200 * S;
      const x = RECT_L - 100 * S + totalW * progress;
      const grad = ctx.createLinearGradient(x - 90 * S, 0, x + 90 * S, 0);
      grad.addColorStop(0,    'rgba(255,255,255,0)');
      grad.addColorStop(0.35, 'rgba(255,255,255,0.06)');
      grad.addColorStop(0.5,  'rgba(255,255,255,0.22)');
      grad.addColorStop(0.65, 'rgba(255,255,255,0.06)');
      grad.addColorStop(1,    'rgba(255,255,255,0)');
      ctx.fillStyle = grad;
      ctx.fillRect(x - 90 * S, ARC_CY - ARC_R - 20 * S, 180 * S, RECT_BOT - ARC_CY + ARC_R + NOTCH_H + 60 * S);
      ctx.restore();
    }

    function drawLogoImage() {
      if (!logoLoaded) return;
      const aspect = realLogo.width / realLogo.height;
      let imgW = W * 0.92;
      let imgH = imgW / aspect;
      if (imgH > H * 0.92) {
        imgH = H * 0.92;
        imgW = imgH * aspect;
      }
      ctx.drawImage(realLogo, CX - imgW / 2, BADGE_CY_VIS - imgH / 2, imgW, imgH);
    }

    // ─── Particles — durations halved ───
    interface Particle { x: number; y: number; size: number; delay: number; dur: number; color: string; }
    const particles: Particle[] = Array.from({ length: 30 }, () => {
      const ang = Math.random() * Math.PI * 2;
      const dist = (100 + Math.random() * 160) * S;
      return {
        x: CX + Math.cos(ang) * dist,
        y: ARC_CY + 30 * S + Math.sin(ang) * dist * 0.65,
        size:  (1.2 + Math.random() * 2.2) * S,
        delay: 1.6 + Math.random() * 0.5,
        dur:   0.175 + Math.random() * 0.175,
        color: Math.random() > 0.4 ? GOLD_LT : '#fff',
      };
    });

    function drawParticles(t: number) {
      for (const p of particles) {
        const pt = clamp01((t - p.delay) / p.dur);
        if (pt <= 0 || pt >= 1) continue;
        const a = pt < 0.25 ? pt / 0.25 : (1 - pt) / 0.75;
        ctx.save();
        ctx.globalAlpha = a * 0.85;
        ctx.fillStyle = p.color;
        const s = p.size * (0.5 + 0.5 * Math.sin(pt * Math.PI));
        ctx.beginPath();
        ctx.moveTo(p.x,           p.y - s * 2.2);
        ctx.lineTo(p.x + s * 0.4, p.y - s * 0.4);
        ctx.lineTo(p.x + s * 2.2, p.y);
        ctx.lineTo(p.x + s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x,           p.y + s * 2.2);
        ctx.lineTo(p.x - s * 0.4, p.y + s * 0.4);
        ctx.lineTo(p.x - s * 2.2, p.y);
        ctx.lineTo(p.x - s * 0.4, p.y - s * 0.4);
        ctx.closePath();
        ctx.fill();
        ctx.restore();
      }
    }

    // ─── Letter positions ───
    const letterDefs = [
      { char: 'D', x: CX - 165 * S },
      { char: 'I', x: CX - 78 * S  },
      { char: 'N', x: CX - 4 * S   },
      { char: 'E', x: CX + 80 * S  },
      { char: 'I', x: CX + 155 * S },
    ];

    // ─── Animation loop — all timings halved (7s → 3.5s) ───
    let startTime: number | null = null;
    let animDone = false;

    function render(ts: number) {
      if (!startTime) startTime = ts;
      const t = (ts - startTime) / 1000;

      ctx.clearRect(0, 0, W, H);

      const badgeA  = easeOutCubic(clamp01(t / 0.275));
      const badgeS  = easeOutBack(clamp01(t / 0.3));
      const arcP    = easeOutQuart(clamp01((t - 0.125) / 0.375));
      const crownT  = clamp01((t - 0.275) / 0.3);
      const crownA  = easeOutCubic(clamp01(crownT * 2.5));
      const crownD  = easeOutBack(crownT);
      const bancaA  = easeOutCubic(clamp01((t - 0.475) / 0.2));
      const ruleP   = easeInOutCubic(clamp01((t - 0.5) / 0.25));
      const letters = letterDefs.map((ld, i) => {
        const lt = clamp01((t - (0.575 + i * 0.06)) / 0.21);
        return { char: ld.char, x: ld.x, alpha: easeOutCubic(clamp01(lt * 2.2)), offsetY: (1 - easeOutBack(lt)) * 38 * S };
      });
      const ribP   = easeOutQuint(clamp01((t - 0.925) / 0.3));
      const ribTA  = easeOutCubic(clamp01((t - 1.15) / 0.15));
      const decoA  = easeOutCubic(clamp01((t - 1.175) / 0.175));
      const sheenP = clamp01((t - 1.35) / 0.35);

      // ── Card flip (2.15 – 2.85s) ──
      const flipT     = clamp01((t - 2.15) / 0.7);
      const firstHalf = flipT <= 0.5;
      const halfP     = firstHalf ? flipT * 2 : (flipT - 0.5) * 2;
      const flipScaleX = firstHalf ? 1 - easeInCubic(halfP) : easeOutCubic(halfP);

      ctx.save();
      ctx.translate(0, CENTER_OFFSET);

      if (flipT > 0) {
        ctx.translate(CX, BADGE_CY_VIS);
        ctx.scale(flipScaleX, 1);
        ctx.translate(-CX, -BADGE_CY_VIS);
      }

      if (!firstHalf && flipT > 0) {
        drawLogoImage();
      } else {
        drawBadge(badgeA, badgeS);
        drawGoldArc(arcP);
        drawCrown(crownA, crownD);
        drawBancaDo(bancaA, ruleP);
        drawDINEI(letters);
        drawRibbon(ribP, ribTA);
        drawBottomDeco(decoA);
        drawSheen(sheenP);
        drawParticles(t);
      }

      ctx.restore();

      if (t < 3.5) {
        rafRef.current = requestAnimationFrame(render);
      } else if (!animDone) {
        animDone = true;
        sessionStorage.setItem('logoRevealed', '1');
        setShowImg(true);
      }
    }

    function start() {
      rafRef.current = requestAnimationFrame(render);
    }

    if (document.fonts?.ready) {
      document.fonts.ready.then(() => { timeoutRef.current = setTimeout(start, 150); });
    } else {
      timeoutRef.current = setTimeout(start, 600);
    }

    return () => {
      cancelAnimationFrame(rafRef.current);
      clearTimeout(timeoutRef.current);
    };
  }, []);

  return (
    <div className={`relative ${className ?? ''}`}>
      <canvas
        ref={canvasRef}
        width={1200}
        height={1200}
        style={{ display: 'block', width: '100%', height: '100%' }}
        className={showImg ? 'invisible' : ''}
      />
      <img
        src={logoSrc}
        alt="Banca do Dinei"
        draggable={false}
        className={`absolute inset-0 w-full h-full object-contain select-none transition-opacity duration-300 ${showImg ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
      />
      {!showImg && (
        <button
          onClick={finishAnimation}
          className="absolute bottom-4 right-4 type-overline text-cream/30 hover:text-cream/60 transition-colors duration-200 text-[10px] bg-transparent border-none cursor-pointer"
          aria-label="Pular animação"
        >
          Pular
        </button>
      )}
    </div>
  );
}
