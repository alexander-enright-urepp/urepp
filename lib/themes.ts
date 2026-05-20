// Premium Theme Engine for UREPP
// Each theme completely changes the profile layout and style

export interface ThemeConfig {
  id: string
  name: string
  preview: string // emoji or color
  premium: boolean
  
  // Layout
  layout: 'centered' | 'compact' | 'horizontal-card' | 'banner' | 'minimal' | 'minimal-pro' | 'athlete-dark' | 'compact-scout'
  headerHeight: 'small' | 'medium' | 'large' | 'banner'
  headerStyle: 'solid' | 'gradient' | 'glass' | 'dark' | 'transparent'
  
  // Typography
  typography: 'minimal' | 'bold' | 'athletic' | 'influencer' | 'professional'
  nameSize: 'small' | 'medium' | 'large' | 'xl'
  nameWeight: 'normal' | 'medium' | 'bold' | 'black'
  
  // Cards
  cardStyle: 'shadow' | 'outline' | 'glass' | 'flat' | 'minimal'
  cardBackground: 'white' | 'glass' | 'dark' | 'transparent'
  
  // Spacing
  spacing: 'tight' | 'normal' | 'loose'
  sectionGap: 'small' | 'medium' | 'large'
  
  // Visual
  borderRadius: 'none' | 'small' | 'medium' | 'large' | 'full'
  shadow: 'none' | 'small' | 'medium' | 'large' | 'glow'
  iconStyle: 'minimal' | 'filled' | 'outlined' | 'floating'
  buttonStyle: 'pill' | 'rounded' | 'square' | 'ghost'
  
  // Background
  background: 'white' | 'gradient' | 'dark' | 'glass'
  backgroundGradient?: string
  backgroundColor?: string
  
  // Header specific
  avatarPosition: 'center' | 'left' | 'floating' | 'overlapping'
  avatarSize: 'small' | 'medium' | 'large' | 'xl'
  statsPosition: 'inline' | 'below' | 'hidden' | 'chips'
  socialPosition: 'center' | 'right' | 'floating' | 'below'
}

export const PREMIUM_THEMES: ThemeConfig[] = [
  // THEME 1: Minimal Pro - Clean white with subtle shadows
  {
    id: 'minimal-pro',
    name: 'Minimal Pro',
    preview: '⚪',
    premium: true,
    layout: 'minimal-pro',
    headerHeight: 'small',
    headerStyle: 'transparent',
    typography: 'minimal',
    nameSize: 'large',
    nameWeight: 'medium',
    cardStyle: 'flat',
    cardBackground: 'transparent',
    spacing: 'tight',
    sectionGap: 'small',
    borderRadius: 'small',
    shadow: 'none',
    iconStyle: 'minimal',
    buttonStyle: 'ghost',
    background: 'white',
    avatarPosition: 'left',
    avatarSize: 'small',
    statsPosition: 'inline',
    socialPosition: 'below',
  },
  
  // THEME 2: Athlete Dark
  {
    id: 'athlete-dark',
    name: 'Athlete Dark',
    preview: '🌑',
    premium: true,
    layout: 'athlete-dark',
    headerHeight: 'small',
    headerStyle: 'dark',
    typography: 'bold',
    nameSize: 'large',
    nameWeight: 'black',
    cardStyle: 'glass',
    cardBackground: 'glass',
    spacing: 'tight',
    sectionGap: 'small',
    borderRadius: 'large',
    shadow: 'glow',
    iconStyle: 'filled',
    buttonStyle: 'pill',
    background: 'dark',
    backgroundColor: '#0B0B0F',
    avatarPosition: 'center',
    avatarSize: 'medium',
    statsPosition: 'inline',
    socialPosition: 'center',
  },
  
  // THEME 3: Recruiter Card
  {
    id: 'recruiter-card',
    name: 'Recruiter Card',
    preview: '💼',
    premium: true,
    layout: 'horizontal-card',
    headerHeight: 'medium',
    headerStyle: 'solid',
    typography: 'professional',
    nameSize: 'medium',
    nameWeight: 'bold',
    cardStyle: 'outline',
    cardBackground: 'white',
    spacing: 'tight',
    sectionGap: 'small',
    borderRadius: 'small',
    shadow: 'none',
    iconStyle: 'outlined',
    buttonStyle: 'square',
    background: 'white',
    avatarPosition: 'left',
    avatarSize: 'medium',
    statsPosition: 'hidden',
    socialPosition: 'right',
  },
  
  // THEME 4: Bold Gradient
  {
    id: 'bold-gradient',
    name: 'Bold Gradient',
    preview: '🌈',
    premium: true,
    layout: 'banner',
    headerHeight: 'large',
    headerStyle: 'gradient',
    typography: 'bold',
    nameSize: 'xl',
    nameWeight: 'bold',
    cardStyle: 'shadow',
    cardBackground: 'white',
    spacing: 'loose',
    sectionGap: 'large',
    borderRadius: 'large',
    shadow: 'large',
    iconStyle: 'filled',
    buttonStyle: 'pill',
    background: 'white',
    backgroundGradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    avatarPosition: 'overlapping',
    avatarSize: 'large',
    statsPosition: 'below',
    socialPosition: 'center',
  },
  
  // THEME 5: Compact Scout
  {
    id: 'compact-scout',
    name: 'Compact Scout',
    preview: '⚡',
    premium: true,
    layout: 'compact-scout',
    headerHeight: 'small',
    headerStyle: 'transparent',
    typography: 'athletic',
    nameSize: 'medium',
    nameWeight: 'bold',
    cardStyle: 'flat',
    cardBackground: 'transparent',
    spacing: 'tight',
    sectionGap: 'small',
    borderRadius: 'small',
    shadow: 'none',
    iconStyle: 'minimal',
    buttonStyle: 'ghost',
    background: 'white',
    avatarPosition: 'left',
    avatarSize: 'small',
    statsPosition: 'inline',
    socialPosition: 'below',
  },
  
  // THEME 6: Sports Card
  {
    id: 'sports-card',
    name: 'Sports Card',
    preview: '🏆',
    premium: true,
    layout: 'banner',
    headerHeight: 'banner',
    headerStyle: 'solid',
    typography: 'athletic',
    nameSize: 'large',
    nameWeight: 'black',
    cardStyle: 'shadow',
    cardBackground: 'white',
    spacing: 'normal',
    sectionGap: 'medium',
    borderRadius: 'medium',
    shadow: 'medium',
    iconStyle: 'filled',
    buttonStyle: 'pill',
    background: 'white',
    avatarPosition: 'overlapping',
    avatarSize: 'xl',
    statsPosition: 'chips',
    socialPosition: 'below',
  },
]

// Free theme (default)
export const FREE_THEME: ThemeConfig = {
  id: 'default',
  name: 'Default',
  preview: '🔵',
  premium: false,
  layout: 'centered',
  headerHeight: 'medium',
  headerStyle: 'solid',
  typography: 'bold',
  nameSize: 'large',
  nameWeight: 'bold',
  cardStyle: 'shadow',
  cardBackground: 'white',
  spacing: 'normal',
  sectionGap: 'medium',
  borderRadius: 'large',
  shadow: 'medium',
  iconStyle: 'filled',
  buttonStyle: 'rounded',
  background: 'white',
  avatarPosition: 'center',
  avatarSize: 'large',
  statsPosition: 'below',
  socialPosition: 'center',
}

// Get theme by ID
export function getThemeById(id: string): ThemeConfig {
  return PREMIUM_THEMES.find(t => t.id === id) || FREE_THEME
}

// Check if theme is premium
export function isPremiumTheme(id: string): boolean {
  const theme = getThemeById(id)
  return theme.premium
}

// Generate CSS classes based on theme
export function getThemeClasses(theme: ThemeConfig): Record<string, string> {
  const classes: Record<string, string> = {
    // Container
    container: '',
    // Header
    header: '',
    avatar: '',
    name: '',
    // Cards
    card: '',
    // Buttons
    button: '',
    // Social icons
    socialIcon: '',
  }
  
  // Background
  if (theme.background === 'dark') {
    classes.container = 'bg-[#0B0B0F] text-white'
  } else if (theme.background === 'gradient' && theme.backgroundGradient) {
    classes.container = `bg-gradient-to-br`
  } else if (theme.background === 'glass') {
    classes.container = 'bg-gradient-to-br from-blue-900/80 to-purple-900/80 text-white'
  } else {
    classes.container = 'bg-gradient-to-br from-[#2980cc] via-[#51b5ff] to-[#1a5a99]'
  }
  
  // Header height (reduced by 25%)
  const headerHeightMap: Record<string, string> = {
    'small': 'pt-4 pb-4',
    'medium': 'pt-5 pb-5',
    'large': 'pt-6 pb-6',
    'banner': 'pt-16 pb-16',
  }
  classes.header = headerHeightMap[theme.headerHeight] || 'pt-5 pb-5'
  
  // Avatar size
  const avatarSizeMap: Record<string, string> = {
    'small': 'w-20 h-20',
    'medium': 'w-24 h-24',
    'large': 'w-28 h-28',
    'xl': 'w-32 h-32',
  }
  classes.avatar = avatarSizeMap[theme.avatarSize] || 'w-24 h-24'
  
  // Name typography
  const nameSizeMap: Record<string, string> = {
    'small': 'text-xl',
    'medium': 'text-2xl',
    'large': 'text-3xl',
    'xl': 'text-4xl',
  }
  const nameWeightMap: Record<string, string> = {
    'normal': 'font-normal',
    'medium': 'font-medium',
    'bold': 'font-bold',
    'black': 'font-black',
  }
  classes.name = `${nameSizeMap[theme.nameSize]} ${nameWeightMap[theme.nameWeight]}`
  
  // Card style
  const cardStyles: Record<string, string> = {
    'shadow': 'bg-white rounded-2xl shadow-xl border border-babyblue-100',
    'outline': 'bg-white rounded-xl border border-gray-200',
    'glass': 'bg-white/10 backdrop-blur-md rounded-2xl border border-white/20',
    'flat': 'bg-gray-50 rounded-lg',
    'minimal': 'bg-white rounded-xl border border-babyblue-100/50',
  }
  classes.card = cardStyles[theme.cardStyle] || cardStyles['shadow']
  
  // Button style
  const buttonStyles: Record<string, string> = {
    'pill': 'rounded-full px-6 py-2',
    'rounded': 'rounded-xl px-4 py-2',
    'square': 'rounded px-4 py-2',
    'ghost': 'bg-transparent hover:bg-gray-100',
  }
  classes.button = buttonStyles[theme.buttonStyle] || buttonStyles['rounded']
  
  // Spacing (tightened)
  const spacingMap: Record<string, string> = {
    'tight': 'space-y-2',
    'normal': 'space-y-4',
    'loose': 'space-y-6',
  }
  classes.spacing = spacingMap[theme.spacing] || 'space-y-3'
  
  return classes
}