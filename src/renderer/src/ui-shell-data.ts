export interface InspirationBanner {
  id: string;
  titleKey: string;
  descriptionKey: string;
  accent: string;
  icon: string;
}

export interface InspirationItem {
  id: string;
  categoryId: InspirationCategoryId;
  titleKey: string;
  descriptionKey: string;
  promptKey: string;
  scenarioTitleKey: string;
  scenarioDescriptionKey: string;
  icon: string;
  accent: string;
}

export interface LaunchCard {
  id: string;
  titleKey: string;
  descriptionKey: string;
  icon: string;
  accent: string;
}

export interface SkillPreset {
  id: string;
  name: string;
  displayNameKey?: string;
  descriptionKey: string;
  builtIn: boolean;
  enabled: boolean;
  icon: string;
}

export interface InspirationCategoryDefinition {
  id: InspirationCategoryId;
  labelKey: string;
}

export type InspirationCategoryId = 'all' | 'office' | 'study' | 'fun' | 'life' | 'marketing' | 'finance';

export const HOME_LAUNCH_CARDS: LaunchCard[] = [
  {
    id: 'install-skill',
    titleKey: 'shell.home.launch.installSkill.title',
    descriptionKey: 'shell.home.launch.installSkill.description',
    icon: '🧰',
    accent: 'linear-gradient(135deg, #fff1f0 0%, #ffe3df 100%)'
  },
  {
    id: 'file-organize',
    titleKey: 'shell.home.launch.fileOrganize.title',
    descriptionKey: 'shell.home.launch.fileOrganize.description',
    icon: '🗂️',
    accent: 'linear-gradient(135deg, #fff4e6 0%, #ffe6c7 100%)'
  },
  {
    id: 'mobile-office',
    titleKey: 'shell.home.launch.mobileOffice.title',
    descriptionKey: 'shell.home.launch.mobileOffice.description',
    icon: '📱',
    accent: 'linear-gradient(135deg, #fff0ef 0%, #ffd7d2 100%)'
  },
  {
    id: 'send-mail',
    titleKey: 'shell.home.launch.mail.title',
    descriptionKey: 'shell.home.launch.mail.description',
    icon: '✉️',
    accent: 'linear-gradient(135deg, #edfff8 0%, #d8fff2 100%)'
  },
  {
    id: 'schedule',
    titleKey: 'shell.home.launch.schedule.title',
    descriptionKey: 'shell.home.launch.schedule.description',
    icon: '🗓️',
    accent: 'linear-gradient(135deg, #f3efff 0%, #e3ddff 100%)'
  }
];

export const INSPIRATION_BANNERS: InspirationBanner[] = [
  {
    id: 'news-digest',
    titleKey: 'shell.inspiration.banner.newsDigest.title',
    descriptionKey: 'shell.inspiration.banner.newsDigest.description',
    accent: 'linear-gradient(135deg, #e7f9d8 0%, #f4ffe9 52%, #dff7dd 100%)',
    icon: '⏰'
  },
  {
    id: 'travel-plan',
    titleKey: 'shell.inspiration.banner.travelPlan.title',
    descriptionKey: 'shell.inspiration.banner.travelPlan.description',
    accent: 'linear-gradient(135deg, #dff3ff 0%, #edf8ff 52%, #d8ecff 100%)',
    icon: '🚌'
  }
];

export const INSPIRATION_CATEGORIES: InspirationCategoryDefinition[] = [
  { id: 'all', labelKey: 'shell.inspiration.category.all' },
  { id: 'office', labelKey: 'shell.inspiration.category.office' },
  { id: 'study', labelKey: 'shell.inspiration.category.study' },
  { id: 'fun', labelKey: 'shell.inspiration.category.fun' },
  { id: 'life', labelKey: 'shell.inspiration.category.life' },
  { id: 'marketing', labelKey: 'shell.inspiration.category.marketing' },
  { id: 'finance', labelKey: 'shell.inspiration.category.finance' }
];

export const INSPIRATION_ITEMS: InspirationItem[] = [
  {
    id: 'hot-news',
    categoryId: 'office',
    titleKey: 'shell.inspiration.item.hotNews.title',
    descriptionKey: 'shell.inspiration.item.hotNews.description',
    promptKey: 'shell.inspiration.item.hotNews.prompt',
    scenarioTitleKey: 'shell.inspiration.item.hotNews.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.hotNews.scenarioDescription',
    icon: '📰',
    accent: 'linear-gradient(135deg, #fff4ef 0%, #ffe4db 100%)'
  },
  {
    id: 'invoice-archive',
    categoryId: 'office',
    titleKey: 'shell.inspiration.item.invoiceArchive.title',
    descriptionKey: 'shell.inspiration.item.invoiceArchive.description',
    promptKey: 'shell.inspiration.item.invoiceArchive.prompt',
    scenarioTitleKey: 'shell.inspiration.item.invoiceArchive.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.invoiceArchive.scenarioDescription',
    icon: '🧾',
    accent: 'linear-gradient(135deg, #eef6ff 0%, #dce9ff 100%)'
  },
  {
    id: 'schedule-follow',
    categoryId: 'office',
    titleKey: 'shell.inspiration.item.scheduleFollow.title',
    descriptionKey: 'shell.inspiration.item.scheduleFollow.description',
    promptKey: 'shell.inspiration.item.scheduleFollow.prompt',
    scenarioTitleKey: 'shell.inspiration.item.scheduleFollow.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.scheduleFollow.scenarioDescription',
    icon: '📆',
    accent: 'linear-gradient(135deg, #eef0ff 0%, #e1e4ff 100%)'
  },
  {
    id: 'doc-create',
    categoryId: 'study',
    titleKey: 'shell.inspiration.item.docCreate.title',
    descriptionKey: 'shell.inspiration.item.docCreate.description',
    promptKey: 'shell.inspiration.item.docCreate.prompt',
    scenarioTitleKey: 'shell.inspiration.item.docCreate.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.docCreate.scenarioDescription',
    icon: '📚',
    accent: 'linear-gradient(135deg, #eef8ff 0%, #dff1ff 100%)'
  },
  {
    id: 'market-research',
    categoryId: 'finance',
    titleKey: 'shell.inspiration.item.marketResearch.title',
    descriptionKey: 'shell.inspiration.item.marketResearch.description',
    promptKey: 'shell.inspiration.item.marketResearch.prompt',
    scenarioTitleKey: 'shell.inspiration.item.marketResearch.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.marketResearch.scenarioDescription',
    icon: '📊',
    accent: 'linear-gradient(135deg, #fdf2ff 0%, #f2e6ff 100%)'
  },
  {
    id: 'food-recommend',
    categoryId: 'life',
    titleKey: 'shell.inspiration.item.foodRecommend.title',
    descriptionKey: 'shell.inspiration.item.foodRecommend.description',
    promptKey: 'shell.inspiration.item.foodRecommend.prompt',
    scenarioTitleKey: 'shell.inspiration.item.foodRecommend.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.foodRecommend.scenarioDescription',
    icon: '🥗',
    accent: 'linear-gradient(135deg, #fff7ef 0%, #ffeeda 100%)'
  },
  {
    id: 'fitness-adjust',
    categoryId: 'life',
    titleKey: 'shell.inspiration.item.fitnessAdjust.title',
    descriptionKey: 'shell.inspiration.item.fitnessAdjust.description',
    promptKey: 'shell.inspiration.item.fitnessAdjust.prompt',
    scenarioTitleKey: 'shell.inspiration.item.fitnessAdjust.scenarioTitle',
    scenarioDescriptionKey: 'shell.inspiration.item.fitnessAdjust.scenarioDescription',
    icon: '🏋️',
    accent: 'linear-gradient(135deg, #f2f6ff 0%, #e0ebff 100%)'
  }
];

export const SCHEDULE_SUGGESTION_KEYS = [
  'shell.schedule.suggestion.astrology',
  'shell.schedule.suggestion.water',
  'shell.schedule.suggestion.techNews'
] as const;

export const SETTINGS_SECTIONS = [
  { id: 'general', labelKey: 'shell.settings.section.general', icon: 'i-lucide-settings-2' },
  { id: 'stats', labelKey: 'shell.settings.section.stats', icon: 'i-lucide-chart-no-axes-column' },
  { id: 'skills', labelKey: 'shell.settings.section.skills', icon: 'i-lucide-puzzle' },
  { id: 'remote', labelKey: 'shell.settings.section.remote', icon: 'i-lucide-radio-tower' },
  { id: 'about', labelKey: 'shell.settings.section.about', icon: 'i-lucide-info' }
] as const;

export type SettingsSectionId = (typeof SETTINGS_SECTIONS)[number]['id'];

export const INSTALLED_SKILLS: SkillPreset[] = [
  {
    id: 'agent-mbti',
    name: 'agent-mbti',
    descriptionKey: 'shell.settings.skill.agentMbti.description',
    builtIn: true,
    enabled: true,
    icon: '🧩'
  },
  {
    id: 'arxiv-watcher',
    name: 'arxiv-watcher',
    descriptionKey: 'shell.settings.skill.arxivWatcher.description',
    builtIn: true,
    enabled: true,
    icon: '🧠'
  },
  {
    id: 'cantian-bazi',
    name: 'cantian-bazi',
    descriptionKey: 'shell.settings.skill.cantianBazi.description',
    builtIn: true,
    enabled: false,
    icon: '🔮'
  },
  {
    id: 'cloud-upload-backup',
    name: 'cloud-upload-backup',
    descriptionKey: 'shell.settings.skill.cloudUploadBackup.description',
    builtIn: true,
    enabled: true,
    icon: '☁️'
  },
  {
    id: 'email-skill',
    name: 'email-skill',
    descriptionKey: 'shell.settings.skill.emailSkill.description',
    builtIn: true,
    enabled: true,
    icon: '📬'
  },
  {
    id: 'desktop-organizer',
    name: 'desktop-organizer',
    displayNameKey: 'shell.settings.skill.desktopOrganizer.name',
    descriptionKey: 'shell.settings.skill.desktopOrganizer.description',
    builtIn: true,
    enabled: true,
    icon: '🗃️'
  }
];
