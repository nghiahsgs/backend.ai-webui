import { ThemeConfig } from 'antd';
import _ from 'lodash';
import { useEffect, useState } from 'react';

type LogoConfig = {
  src: string;
  srcCollapsed: string;
  logoTitle?: string;
  logoTitleCollapsed?: string;
  alt?: string;
  href?: string;
};
let _customTheme: { light: ThemeConfig; dark: ThemeConfig; logo: LogoConfig };

export const loadCustomThemeConfig = () => {
  fetch('resources/theme.json')
    .then((response) => response.json())
    .then((theme) => {
      if (_.isUndefined(theme.light)) {
        _customTheme = { light: theme, dark: theme, logo: theme.logo };
      } else {
        _customTheme = theme;
      }
      document.dispatchEvent(new CustomEvent('custom-theme-loaded'));
    });
};

export const useCustomThemeConfig = () => {
  const [customThemeConfig, setCustomThemeConfig] = useState(_customTheme);
  useEffect(() => {
    if (!customThemeConfig) {
      const handler = () => {
        setCustomThemeConfig(_customTheme);
      };
      document.addEventListener('custom-theme-loaded', handler);

      return () => {
        document.removeEventListener('custom-theme-loaded', handler);
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return customThemeConfig;
};
