import { defineConfig, presetIcons, presetUno } from 'unocss';

export default defineConfig({
  presets: [
    presetUno(),
    presetIcons({
      extraProperties: {
        display: 'inline-block',
        'vertical-align': 'middle'
      }
    })
  ],
  safelist: [
    'i-lucide-arrow-right',
    'i-lucide-bot',
    'i-lucide-calendar-clock',
    'i-lucide-chart-column-big',
    'i-lucide-chart-no-axes-column',
    'i-lucide-chevrons-right',
    'i-lucide-clock-3',
    'i-lucide-feather',
    'i-lucide-file-chart-column',
    'i-lucide-file-stack',
    'i-lucide-files',
    'i-lucide-folder-cog',
    'i-lucide-info',
    'i-lucide-languages',
    'i-lucide-layout-dashboard',
    'i-lucide-lightbulb',
    'i-lucide-plug-zap',
    'i-lucide-puzzle',
    'i-lucide-radio-tower',
    'i-lucide-search',
    'i-lucide-settings-2',
    'i-lucide-sparkles',
    'i-lucide-square-pen',
    'i-lucide-x'
  ]
});
