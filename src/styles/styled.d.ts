import "styled-components";

declare module "styled-components" {
  export interface DefaultTheme {
    colors: {
      primary: string;
      primaryHover: string;
      primaryLight: string;
      primaryDark: string;
      background: {
        primary: string;
        secondary: string;
        tertiary: string;
        elevated: string;
      };
      text: {
        primary: string;
        secondary: string;
        tertiary: string;
        disabled: string;
        inverse: string;
      };
      success: string;
      successLight: string;
      warning: string;
      warningLight: string;
      error: string;
      errorLight: string;
      info: string;
      infoLight: string;
      interactive: {
        hover: string;
        pressed: string;
        focus: string;
        disabled: string;
      };
      border: {
        primary: string;
        secondary: string;
        focus: string;
        error: string;
      };
    };
    typography: {
      fonts: {
        primary: string;
        mono: string;
      };
      fontSizes: {
        xs: string;
        sm: string;
        base: string;
        lg: string;
        xl: string;
        "2xl": string;
        "3xl": string;
        "4xl": string;
        "5xl": string;
      };
      fontWeights: {
        light: number;
        normal: number;
        medium: number;
        semibold: number;
        bold: number;
        extrabold: number;
      };
      lineHeights: {
        tight: number;
        normal: number;
        relaxed: number;
      };
    };
    spacing: {
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      8: string;
      10: string;
      12: string;
      16: string;
      20: string;
      24: string;
    };
    radii: {
      none: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      full: string;
    };
    shadows: {
      none: string;
      sm: string;
      base: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
      glow: string;
    };
    breakpoints: {
      sm: string;
      md: string;
      lg: string;
      xl: string;
      "2xl": string;
    };
    zIndex: {
      hide: number;
      auto: string;
      base: number;
      docked: number;
      dropdown: number;
      sticky: number;
      banner: number;
      overlay: number;
      modal: number;
      popover: number;
      skipLink: number;
      toast: number;
      tooltip: number;
    };
    transitions: {
      fast: string;
      base: string;
      slow: string;
      slower: string;
    };
  }
}
