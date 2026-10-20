import { Platform } from 'react-native';

export const colors = {
  primary: '#07866F', primaryDark: '#075F51', primarySoft: '#DDF3EB', lime: '#D9F39A',
  ink: '#17352E', inkMuted: '#6B7E79', background: '#F3F7F5', surface: '#FFFFFF',
  surfaceMuted: '#F7FAF8', border: '#D8E5E0', danger: '#C94646', warning: '#F4B946', blue: '#4F86EC',
} as const;

export const spacing = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 } as const;
export const radius = { sm: 10, md: 16, lg: 22, pill: 999 } as const;

export const shadow = Platform.select({
  ios: { shadowColor: '#17352E', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.07, shadowRadius: 18 },
  android: { elevation: 2 },
  default: { boxShadow: '0 8px 22px rgba(23, 53, 46, 0.07)' },
});
