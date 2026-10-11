// ============================================================
// Theme Preset Library — eight professionally designed presets.
//
// Each preset is a PARTIAL token patch deep-merged onto DEFAULT_TOKENS, so a
// preset configures the whole application consistently: sidebar, tables,
// charts, menus, forms, modals, buttons and the login screen.
// ============================================================
import { DEFAULT_TOKENS, mergeTokens } from './schema';

export const PRESETS = [
  {
    id: 'executive-midnight',
    name: 'Executive Midnight',
    description: 'Navy, silver and premium blue — the PlayBeat default.',
    mode: 'dark',
    swatch: ['#080F1E', '#111E32', '#397BFF', '#F0B75E'],
    tokens: {}, // identical to DEFAULT_TOKENS
  },
  {
    id: 'obsidian-gold',
    name: 'Obsidian Gold',
    description: 'Charcoal and black with metallic gold detailing.',
    mode: 'dark',
    swatch: ['#0A0A0B', '#16161A', '#C9A227', '#E8D9A0'],
    tokens: {
      colors: {
        bg: '#0A0A0B', bgElevated: '#101013', bgInset: '#070708',
        cardBg: '#16161A', cardHeadBg: '#111114',
        sidebarBg: '#0C0C0E', topbarBg: '#0C0C0E', navBg: '#0C0C0E',
        border: '#26262C', borderStrong: '#3A3A44',
        text: '#F6F3EA', textMuted: '#A8A497', textInverse: '#0A0A0B',
        accent: '#C9A227', accentStrong: '#A8841B', accentSoft: '#241F10',
        secondaryAccent: '#D8D3C4', highlight: '#E8D9A0',
        link: '#E0C25E', linkHover: '#F0D98F', hover: '#1E1E24',
      },
      gradients: { accent: { from: '#E8D9A0', to: '#C9A227', angle: 135, enabled: true } },
      tables: { headerBg: '#111114', rowHover: '#1E1E24' },
      forms: { inputBg: '#111114', inputBorder: '#26262C', focusRing: '#C9A227' },
      charts: { palette: ['#C9A227', '#E8D9A0', '#8C7A3F', '#4FB6E8', '#EC5D70', '#15B88A'], gridColor: '#22222A' },
    },
  },
  {
    id: 'arctic-enterprise',
    name: 'Arctic Enterprise',
    description: 'White and ice grey with navy accents — bright, high contrast.',
    mode: 'light',
    swatch: ['#F5F7FB', '#FFFFFF', '#1D4ED8', '#0F1A2E'],
    tokens: {
      meta: { radiusBase: 12 },
      colors: {
        bg: '#F5F7FB', bgElevated: '#FFFFFF', bgInset: '#EDF1F7',
        cardBg: '#FFFFFF', cardHeadBg: '#FAFBFD',
        sidebarBg: '#0F1A2E', topbarBg: '#FFFFFF', navBg: '#0F1A2E',
        border: '#DFE5EE', borderStrong: '#C3CCDA',
        text: '#16233B', textMuted: '#5C6B82', textInverse: '#FFFFFF',
        accent: '#1D4ED8', accentStrong: '#1A45BE', accentSoft: '#E8EEFD',
        secondaryAccent: '#516582', highlight: '#B4780F',
        link: '#1D4ED8', linkHover: '#1A45BE', hover: '#EDF2FA',
        overlay: '#0F172A', overlayOpacity: 0.42,
      },
      gradients: { login: { from: '#EDF1F7', to: '#DCE4F0', angle: 135, enabled: true } },
      tables: { headerBg: '#F5F7FB', headerColor: '#5C6B82', rowHover: '#EDF2FA' },
      forms: { inputBg: '#FFFFFF', inputBorder: '#DFE5EE', focusRing: '#1D4ED8' },
      charts: { palette: ['#1D4ED8', '#0F9D74', '#B4780F', '#6D4BD8', '#C0392B', '#2E86C1'], gridColor: '#E6EBF3' },
      cards: { shadow: 'soft' },
    },
  },
  {
    id: 'sapphire-glass',
    name: 'Sapphire Glass',
    description: 'Deep sapphire with frosted-glass surfaces.',
    mode: 'dark',
    swatch: ['#061A33', '#0D2A4A', '#4C9EFF', '#9FD8FF'],
    tokens: {
      colors: {
        bg: '#061A33', bgElevated: '#0A2445', bgInset: '#04121F',
        cardBg: '#0D2A4A', cardHeadBg: '#0B2340',
        sidebarBg: '#081F3B', topbarBg: '#081F3B', navBg: '#081F3B',
        border: '#1B4068', borderStrong: '#2A5B8C',
        text: '#EAF4FF', textMuted: '#93B4D4', textInverse: '#04121F',
        accent: '#4C9EFF', accentStrong: '#2E7FE0', accentSoft: '#0F2E50',
        secondaryAccent: '#9FD8FF', highlight: '#7FE3D0',
        link: '#7FC0FF', linkHover: '#A9D6FF', hover: '#123A63',
      },
      cards: { bgStyle: 'glass', shadow: 'medium' },
      gradients: {
        accent: { from: '#4C9EFF', to: '#7FE3D0', angle: 145, enabled: true },
        sidebar: { from: '#08203C', to: '#0A2B4F', angle: 180, enabled: true },
      },
      tables: { headerBg: '#0B2340', rowHover: '#123A63' },
      forms: { inputBg: '#0A2445', inputBorder: '#1B4068', focusRing: '#4C9EFF' },
      charts: { palette: ['#4C9EFF', '#7FE3D0', '#9FD8FF', '#A87BFF', '#EC5D70', '#F0B75E'], gridColor: '#12395F' },
    },
  },
  {
    id: 'graphite-professional',
    name: 'Graphite Professional',
    description: 'Dark grey and platinum — restrained and corporate.',
    mode: 'dark',
    swatch: ['#121417', '#1C1F24', '#8FA3BF', '#D5DBE3'],
    tokens: {
      colors: {
        bg: '#121417', bgElevated: '#181B20', bgInset: '#0E1013',
        cardBg: '#1C1F24', cardHeadBg: '#181B20',
        sidebarBg: '#14171B', topbarBg: '#14171B', navBg: '#14171B',
        border: '#2A2F36', borderStrong: '#3D444D',
        text: '#EDEFF3', textMuted: '#A2A9B4', textInverse: '#121417',
        accent: '#8FA3BF', accentStrong: '#7288A6', accentSoft: '#232A33',
        secondaryAccent: '#D5DBE3', highlight: '#C8CDD6',
        link: '#A9BCD6', linkHover: '#CBD8EA', hover: '#232830',
      },
      gradients: { accent: { from: '#D5DBE3', to: '#8FA3BF', angle: 135, enabled: true } },
      tables: { headerBg: '#181B20', rowHover: '#232830' },
      forms: { inputBg: '#181B20', inputBorder: '#2A2F36', focusRing: '#8FA3BF' },
      charts: { palette: ['#8FA3BF', '#D5DBE3', '#6C7F99', '#4FB6E8', '#EC5D70', '#15B88A'], gridColor: '#262B32' },
    },
  },
  {
    id: 'emerald-business',
    name: 'Emerald Business',
    description: 'Graphite surfaces with an emerald accent.',
    mode: 'dark',
    swatch: ['#0B1512', '#13201C', '#15B88A', '#7FE3C0'],
    tokens: {
      colors: {
        bg: '#0B1512', bgElevated: '#101C18', bgInset: '#08110F',
        cardBg: '#13201C', cardHeadBg: '#101B17',
        sidebarBg: '#0C1714', topbarBg: '#0C1714', navBg: '#0C1714',
        border: '#1F332C', borderStrong: '#2D4A40',
        text: '#ECF7F2', textMuted: '#8FB0A4', textInverse: '#06110D',
        accent: '#15B88A', accentStrong: '#109A73', accentSoft: '#122C25',
        secondaryAccent: '#7FE3C0', highlight: '#F0B75E',
        link: '#4FD8AE', linkHover: '#86E9C8', hover: '#17302A',
      },
      gradients: { accent: { from: '#15B88A', to: '#7FE3C0', angle: 140, enabled: true } },
      tables: { headerBg: '#101B17', rowHover: '#17302A' },
      forms: { inputBg: '#101C18', inputBorder: '#1F332C', focusRing: '#15B88A' },
      charts: { palette: ['#15B88A', '#7FE3C0', '#F0B75E', '#4FB6E8', '#EC5D70', '#A87BFF'], gridColor: '#1B2E28' },
    },
  },
  {
    id: 'royal-indigo',
    name: 'Royal Indigo',
    description: 'Indigo and violet with silver typography.',
    mode: 'dark',
    swatch: ['#0B0A1F', '#161338', '#6C5CFF', '#C9C4FF'],
    tokens: {
      colors: {
        bg: '#0B0A1F', bgElevated: '#12102B', bgInset: '#080718',
        cardBg: '#161338', cardHeadBg: '#131030',
        sidebarBg: '#0D0B24', topbarBg: '#0D0B24', navBg: '#0D0B24',
        border: '#272154', borderStrong: '#392F73',
        text: '#F1EFFF', textMuted: '#A29CC6', textInverse: '#0B0A1F',
        accent: '#6C5CFF', accentStrong: '#5747E0', accentSoft: '#1E1A46',
        secondaryAccent: '#C9C4FF', highlight: '#F0B75E',
        link: '#9C90FF', linkHover: '#BFB7FF', hover: '#1E1A46',
      },
      gradients: {
        accent: { from: '#6C5CFF', to: '#A87BFF', angle: 135, enabled: true },
        sidebar: { from: '#0D0B24', to: '#161338', angle: 180, enabled: true },
      },
      tables: { headerBg: '#131030', rowHover: '#1E1A46' },
      forms: { inputBg: '#12102B', inputBorder: '#272154', focusRing: '#6C5CFF' },
      charts: { palette: ['#6C5CFF', '#A87BFF', '#C9C4FF', '#4FB6E8', '#EC5D70', '#15B88A'], gridColor: '#241F4E' },
    },
  },
  {
    id: 'minimal-cloud',
    name: 'Minimal Cloud',
    description: 'Soft white and clean neutral surfaces — quiet and airy.',
    mode: 'light',
    swatch: ['#FBFBFD', '#FFFFFF', '#3A63F0', '#6B7280'],
    tokens: {
      meta: { radiusBase: 14 },
      colors: {
        bg: '#FBFBFD', bgElevated: '#FFFFFF', bgInset: '#F2F3F7',
        cardBg: '#FFFFFF', cardHeadBg: '#FCFCFE',
        sidebarBg: '#F4F5F9', topbarBg: '#FFFFFF', navBg: '#F4F5F9',
        border: '#E7E9F0', borderStrong: '#D2D6E2',
        text: '#1B1F2A', textMuted: '#6B7280', textInverse: '#FFFFFF',
        accent: '#3A63F0', accentStrong: '#2B4CD0', accentSoft: '#EAEFFE',
        secondaryAccent: '#8A93A6', highlight: '#B4780F',
        link: '#3A63F0', linkHover: '#2B4CD0', hover: '#F0F2F8',
        overlay: '#1B1F2A', overlayOpacity: 0.36,
      },
      gradients: {
        login: { from: '#FBFBFD', to: '#EDF0F8', angle: 135, enabled: true },
        accent: { from: '#3A63F0', to: '#7C8CF8', angle: 135, enabled: true },
      },
      tables: { headerBg: '#F7F8FB', headerColor: '#6B7280', rowHover: '#F0F2F8' },
      forms: { inputBg: '#FFFFFF', inputBorder: '#E7E9F0', focusRing: '#3A63F0' },
      charts: { palette: ['#3A63F0', '#15B88A', '#F3AD45', '#A87BFF', '#EC5D70', '#4FB6E8'], gridColor: '#EDEFF5' },
      cards: { shadow: 'soft', borderWidth: 1 },
    },
  },
];

export function presetById(id) {
  return PRESETS.find((p) => p.id === id) || null;
}

/** Full token set for a preset id (merged onto the defaults). */
export function presetTokens(id, customPresets = []) {
  const custom = (customPresets || []).find((p) => p.id === id);
  if (custom) return mergeTokens(DEFAULT_TOKENS, custom.tokens || {});
  const preset = presetById(id);
  if (!preset) return JSON.parse(JSON.stringify(DEFAULT_TOKENS));
  return mergeTokens(DEFAULT_TOKENS, preset.tokens);
}

export const DEFAULT_PRESET_ID = 'executive-midnight';
