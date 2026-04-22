import { createContext, useContext, useState, useMemo, type ReactNode } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme, alpha, type Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

declare module '@mui/material/styles' {
  interface Palette {
    gh: {
      pageBg: string; cardBg: string; raisedBg: string; deepBg: string;
      border: string; borderLit: string;
      primary: string; primaryDim: string;
      danger: string; dangerDim: string;
      warning: string; warningDim: string;
      inkStrong: string; inkMed: string; inkSoft: string; inkGhost: string;
    };
  }
  interface PaletteOptions { gh?: Partial<Palette['gh']>; }
  interface TypeText { muted: string; ghost: string; }
}

const DARK = {
  pageBg:'#080b10', deepBg:'#0d1117', cardBg:'#161b22', raisedBg:'#1c2330',
  border:'#21293a', borderLit:'#2d3d55',
  primary:'#00ff9d', primaryDim:'rgba(0,255,157,0.12)',
  danger:'#f85149',  dangerDim:'rgba(248,81,73,0.12)',
  warning:'#d29922', warningDim:'rgba(210,153,34,0.12)',
  inkStrong:'#cdd9e5', inkMed:'#adbac7', inkSoft:'#768390', inkGhost:'#444e5c',
};

const LIGHT = {
  pageBg:'#f4f7fb', deepBg:'#edf0f5', cardBg:'#ffffff', raisedBg:'#f0f3f8',
  border:'#dce2ea', borderLit:'#b5c1cf',
  primary:'#00875a', primaryDim:'rgba(0,135,90,0.09)',
  danger:'#c0302a',  dangerDim:'rgba(192,48,42,0.08)',
  warning:'#9a6f00', warningDim:'rgba(154,111,0,0.08)',
  inkStrong:'#0d1117', inkMed:'#2a3340', inkSoft:'#5a6676', inkGhost:'#9ca8b4',
};

function buildTheme(mode: 'light' | 'dark'): Theme {
  const p = mode === 'dark' ? DARK : LIGHT;
  const isDark = mode === 'dark';

  return createTheme({
    palette: {
      mode,
      primary:  { main: p.primary,  light: isDark?'#4dffbb':'#00a86e', dark: isDark?'#00cc7a':'#006644', contrastText: isDark?'#080b10':'#ffffff' },
      secondary:{ main: p.danger,   contrastText: '#ffffff' },
      warning:  { main: p.warning,  contrastText: isDark?'#080b10':'#ffffff' },
      error:    { main: p.danger,   contrastText: '#ffffff' },
      success:  { main: p.primary,  contrastText: isDark?'#080b10':'#ffffff' },
      background:{ default: p.pageBg, paper: p.cardBg },
      text:{ primary: p.inkStrong, secondary: p.inkSoft, muted: p.inkSoft, ghost: p.inkGhost, disabled: p.inkGhost },
      divider: p.border,
      gh: p,
    },
    typography: {
      fontFamily: '"Share Tech Mono","JetBrains Mono","Fira Code",monospace',
      h1:{ fontFamily:'"Syne","Share Tech Mono",monospace', fontWeight:800, fontSize:'2.25rem', letterSpacing:'-0.02em', color: isDark?'#ffffff':p.inkStrong },
      h2:{ fontFamily:'"Syne","Share Tech Mono",monospace', fontWeight:800, fontSize:'1.75rem',  letterSpacing:'-0.02em', color: isDark?'#ffffff':p.inkStrong },
      h3:{ fontFamily:'"Syne","Share Tech Mono",monospace', fontWeight:700, fontSize:'1.375rem', letterSpacing:'-0.01em', color: isDark?'#ffffff':p.inkStrong },
      h4:{ fontFamily:'"Syne","Share Tech Mono",monospace', fontWeight:700, fontSize:'1.125rem', color: p.inkStrong },
      h5:{ fontWeight:600, fontSize:'0.9375rem', color: p.inkStrong },
      h6:{ fontWeight:600, fontSize:'0.875rem',  color: p.inkStrong },
      subtitle1:{ fontSize:'0.8125rem', fontWeight:500, color: p.inkSoft, letterSpacing:'0.08em' },
      subtitle2:{ fontSize:'0.6875rem', fontWeight:500, letterSpacing:'0.2em', textTransform:'uppercase' as const, color: p.inkSoft },
      body1:{ fontSize:'0.875rem', lineHeight:1.75, color: p.inkStrong },
      body2:{ fontSize:'0.8125rem', lineHeight:1.65, color: p.inkSoft },
      caption:{ fontSize:'0.6875rem', letterSpacing:'0.12em', color: p.inkGhost },
      overline:{ fontSize:'0.625rem', fontWeight:600, letterSpacing:'0.3em', textTransform:'uppercase' as const, color: p.primary },
      button:{ fontFamily:'"Share Tech Mono",monospace', fontWeight:500, letterSpacing:'0.12em', textTransform:'uppercase' as const },
    },
    shape: { borderRadius: 4 },
    components: {
      MuiCssBaseline: {
        styleOverrides: `
          @import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&family=Syne:wght@400;700;800&display=swap');
          body { background:${p.pageBg}; color:${p.inkStrong}; -webkit-font-smoothing:antialiased; }
          ${isDark?`body::after{content:'';position:fixed;inset:0;background:repeating-linear-gradient(0deg,transparent,transparent 2px,rgba(0,0,0,0.06) 2px,rgba(0,0,0,0.06) 4px);pointer-events:none;z-index:9999;}`:''}
          ::-webkit-scrollbar{width:4px} ::-webkit-scrollbar-track{background:transparent} ::-webkit-scrollbar-thumb{background:${p.border};border-radius:2px} ::-webkit-scrollbar-thumb:hover{background:${p.borderLit}}
          @keyframes blink{0%,100%{opacity:1}50%{opacity:0}}
          @keyframes glow{0%,100%{text-shadow:0 0 8px ${alpha(p.primary,0.4)}}50%{text-shadow:0 0 20px ${alpha(p.primary,0.9)},0 0 40px ${alpha(p.primary,0.4)}}}
          @keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
          @keyframes fadeIn{from{opacity:0}to{opacity:1}}
          .cursor::after{content:'▋';animation:blink 1s step-end infinite;color:${p.primary}}
          .glow-text{animation:glow 2.5s ease-in-out infinite}
          .slide-up{animation:slideUp 0.4s cubic-bezier(.4,0,.2,1) both}
        `,
      },
      MuiPaper:{
        styleOverrides:{
          root:{ backgroundImage:'none', backgroundColor:p.cardBg, border:`1px solid ${p.border}` },
          elevation1:{ boxShadow: isDark?'0 2px 8px rgba(0,0,0,0.4)':'0 1px 4px rgba(13,17,23,0.08)' },
          elevation2:{ boxShadow: isDark?'0 4px 16px rgba(0,0,0,0.5)':'0 3px 12px rgba(13,17,23,0.10)' },
          elevation3:{ boxShadow: isDark?'0 8px 32px rgba(0,0,0,0.6)':'0 6px 24px rgba(13,17,23,0.12)' },
        },
      },
      MuiCard:{
        styleOverrides:{
          root:{ backgroundColor:p.cardBg, border:`1px solid ${p.border}`, borderRadius:4, backgroundImage:'none', transition:'border-color 0.2s ease', '&:hover':{borderColor:p.borderLit} },
        },
      },
      MuiCardContent:{ styleOverrides:{ root:{ padding:'20px 24px', '&:last-child':{paddingBottom:'20px'} } } },
      MuiButton:{
        styleOverrides:{
          root:{
            borderRadius:3, padding:'10px 24px', fontSize:'0.75rem', letterSpacing:'0.15em', fontWeight:500, transition:'all 0.2s ease',
            '&.MuiButton-contained':{ boxShadow:'none', '&:hover':{ boxShadow:`0 0 20px ${alpha(p.primary,0.3)}` } },
            '&.MuiButton-containedPrimary':{ background:'transparent', border:`1px solid ${p.primary}`, color:p.primary,
              '&:hover':{ background:p.primary, color:isDark?'#080b10':'#ffffff', boxShadow:`0 0 24px ${alpha(p.primary,0.4)}` } },
            '&.MuiButton-containedSecondary':{ background:'transparent', border:`1px solid ${p.danger}`, color:p.danger,
              '&:hover':{ background:p.danger, color:'#fff' } },
            '&.MuiButton-outlined':{ borderColor:p.borderLit, color:p.inkSoft, '&:hover':{ borderColor:p.primary, color:p.primary, backgroundColor:p.primaryDim } },
            '&.MuiButton-text':{ color:p.inkSoft, '&:hover':{ color:p.inkStrong, backgroundColor:alpha(p.inkStrong,0.05) } },
          },
        },
      },
      MuiOutlinedInput:{
        styleOverrides:{
          root:{ fontFamily:'"Share Tech Mono",monospace', fontSize:'1rem', letterSpacing:'0.05em',
            color: isDark?p.primary:p.inkStrong, backgroundColor:p.deepBg, borderRadius:3, caretColor:p.primary,
            '& .MuiOutlinedInput-notchedOutline':{ borderColor:p.borderLit, transition:'border-color 0.2s' },
            '&:hover .MuiOutlinedInput-notchedOutline':{ borderColor:p.inkSoft },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline':{ borderColor:p.primary, boxShadow:`0 0 0 1px ${alpha(p.primary,0.2)}` },
            '& input::placeholder':{ color:p.inkGhost, opacity:1 },
            '& input':{ padding:'14px 16px' },
          },
        },
      },
      MuiInputLabel:{ styleOverrides:{ root:{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.75rem', letterSpacing:'0.15em', textTransform:'uppercase', color:p.inkSoft, '&.Mui-focused':{color:p.primary} } } },
      MuiLinearProgress:{ styleOverrides:{ root:{ height:4, borderRadius:2, backgroundColor:p.border }, bar:{ borderRadius:2 } } },
      MuiChip:{ styleOverrides:{ root:{ borderRadius:3, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.625rem', letterSpacing:'0.15em', fontWeight:500, height:22 } } },
      MuiTooltip:{
        styleOverrides:{
          tooltip:{ backgroundColor:isDark?p.raisedBg:p.inkStrong, border:isDark?`1px solid ${p.borderLit}`:'none', color:isDark?p.inkStrong:'#fff', fontSize:'0.75rem', fontFamily:'"Share Tech Mono",monospace', letterSpacing:'0.05em', borderRadius:3, padding:'8px 12px' },
          arrow:{ color: isDark?p.raisedBg:p.inkStrong },
        },
      },
      MuiAlert:{
        styleOverrides:{
          root:{
            borderRadius:3, fontFamily:'"Share Tech Mono",monospace', fontSize:'0.8125rem', border:'1px solid',
            '&.MuiAlert-standardSuccess':{ backgroundColor:alpha(p.primary,0.08), borderColor:alpha(p.primary,0.3), color:isDark?p.primary:'#005c38' },
            '&.MuiAlert-standardError':  { backgroundColor:p.dangerDim,           borderColor:alpha(p.danger,0.3),  color:isDark?p.danger:'#8c1e1a' },
            '&.MuiAlert-standardWarning':{ backgroundColor:p.warningDim,          borderColor:alpha(p.warning,0.3), color:isDark?p.warning:'#705000' },
            '&.MuiAlert-standardInfo':   { backgroundColor:alpha(p.borderLit,0.4),borderColor:p.borderLit,          color:isDark?p.inkStrong:p.inkMed },
          },
        },
      },
      MuiStepLabel:{ styleOverrides:{ label:{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.6875rem', letterSpacing:'0.15em', textTransform:'uppercase', color:p.inkSoft, '&.Mui-active':{color:p.primary}, '&.Mui-completed':{color:p.primary} } } },
      MuiStepIcon:{ styleOverrides:{ root:{ color:p.borderLit, '&.Mui-active':{color:p.primary}, '&.Mui-completed':{color:p.primary} }, text:{ fontFamily:'"Share Tech Mono",monospace', fontSize:'0.625rem', fill:isDark?'#080b10':'#ffffff' } } },
      MuiStepConnector:{ styleOverrides:{ line:{ borderColor:p.borderLit } } },
      MuiDivider:{ styleOverrides:{ root:{ borderColor:p.border } } },
      MuiIconButton:{ styleOverrides:{ root:{ color:p.inkSoft, borderRadius:3, '&:hover':{ color:p.inkStrong, backgroundColor:alpha(p.inkStrong,0.06) } } } },
      MuiDialog:{
        styleOverrides:{
          paper:{ backgroundColor:p.cardBg, border:`1px solid ${p.borderLit}`, borderRadius:6, backgroundImage:'none' },
          root:{ '& .MuiBackdrop-root':{ backgroundColor:isDark?'rgba(8,11,16,0.85)':'rgba(0,0,0,0.55)', backdropFilter:'blur(6px)' } },
        },
      },
      MuiDialogTitle:{ styleOverrides:{ root:{ fontFamily:'"Syne",monospace', fontSize:'1.125rem', fontWeight:700, color:isDark?'#ffffff':p.inkStrong, padding:'20px 24px 12px' } } },
      MuiSlider:{ styleOverrides:{ root:{ color:p.primary }, rail:{ backgroundColor:p.border }, thumb:{ '&:hover':{ boxShadow:`0 0 0 8px ${alpha(p.primary,0.14)}` } } } },
    },
  });
}

interface ThemeContextValue { mode: 'light' | 'dark'; toggleMode: () => void; }
const ThemeCtx = createContext<ThemeContextValue>({ mode: 'dark', toggleMode: () => {} });
export function useColorMode() { return useContext(ThemeCtx); }

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<'light' | 'dark'>(() => {
    try { return (localStorage.getItem('gh-color-mode') as 'light' | 'dark') || 'dark'; }
    catch { return 'dark'; }
  });
  const toggleMode = () => setMode(m => {
    const next = m === 'light' ? 'dark' : 'light';
    try { localStorage.setItem('gh-color-mode', next); } catch {}
    return next;
  });
  const theme = useMemo(() => buildTheme(mode), [mode]);
  return (
    <ThemeCtx.Provider value={{ mode, toggleMode }}>
      <MuiThemeProvider theme={theme}><CssBaseline />{children}</MuiThemeProvider>
    </ThemeCtx.Provider>
  );
}
