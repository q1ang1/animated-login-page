import {
  defineConfig,
  presetWind3,
  transformerDirectives,
  transformerVariantGroup,
} from 'unocss'

export default defineConfig({
  presets: [presetWind3()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
  theme: {
    fontFamily: {
      display:
        '"Iowan Old Style", "Palatino Linotype", "Book Antiqua", Georgia, serif',
      sans:
        '"Avenir Next", "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif',
    },
    colors: {
      canvas: '#e8e4df',
      panel: '#0f0d0c',
      mist: '#f4f0ea',
      accent: '#355cff',
      accentSoft: '#7d97ff',
      plum: '#6c3ff5',
      graphite: '#2d2d2d',
      ember: '#ff9b6b',
      citron: '#e8d754',
      cloud: '#cbc6bf',
    },
  },
  shortcuts: {
    'form-field':
      'h-14 w-full rounded-full border border-white/10 bg-white/[0.03] px-5 text-[15px] text-white outline-none transition duration-300 placeholder:text-white/35 focus:border-white/30 focus:bg-white/[0.05]',
    'primary-pill':
      'h-14 w-full inline-flex items-center justify-center rounded-full px-6 text-[15px] font-semibold transition duration-300 disabled:cursor-not-allowed disabled:opacity-60',
    'glass-panel':
      'border border-white/10 bg-white/[0.035] shadow-[0_20px_70px_rgba(0,0,0,0.25)] backdrop-blur-[18px]',
  },
})

