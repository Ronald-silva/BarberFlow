import styled, { css } from 'styled-components';

// Layout Containers
export const Container = styled.div<{ $maxWidth?: string; $padding?: boolean }>`
  min-height: 100vh;
  background-color: ${props => props.theme.colors.background.primary};
  color: ${props => props.theme.colors.text.secondary};
  
  ${props => props.$padding !== false && css`
    padding: ${props => props.theme.spacing[4]};
    
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      padding: ${props => props.theme.spacing[6]};
    }
    
    @media (min-width: ${props => props.theme.breakpoints.lg}) {
      padding: ${props => props.theme.spacing[8]};
    }
  `}
  
  ${props => props.$maxWidth && css`
    max-width: ${props.$maxWidth};
    margin: 0 auto;
  `}
`;

export const PageContainer = styled.div`
  max-width: 1280px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[4]};
  min-height: calc(100vh - 80px); /* Account for mobile header */
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[4]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[7]} ${props => props.theme.spacing[6]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[9]} ${props => props.theme.spacing[7]};
    min-height: 100vh; /* Full height on desktop */
  }
`;

/** Largura e ritmo vertical únicos do painel da barbearia (rotas /dashboard/*). */
export const DashboardShell = styled(PageContainer)`
  max-width: 1100px;
  width: 100%;
  box-sizing: border-box;
`;

// Cards
export const Card = styled.div<{ $variant?: 'default' | 'elevated' | 'outlined' | 'glass' }>`
  background: ${props => props.theme.colors.bg.card};
  border-radius: ${props => props.theme.radii.xl};
  border: 1px solid ${props => props.theme.colors.bg.border};
  overflow: hidden;
  transition: all 400ms cubic-bezier(0.16, 1, 0.3, 1);
  
  ${props => props.$variant === 'elevated' && css`
    box-shadow: ${props => props.theme.shadows.lg};
    
    &:hover {
      border-color: color-mix(in srgb, var(--bs-brand-main, #c8922a) 30%, ${props => props.theme.colors.bg.border});
      box-shadow: ${props => props.theme.shadows.xl};
      transform: translateY(-4px);
    }
  `}
  
  ${props => props.$variant === 'outlined' && css`
    background: transparent;
    border: 1px solid ${props => props.theme.colors.bg.border};
    
    &:hover {
      border-color: ${props => props.theme.colors.border.secondary};
      background: ${props => props.theme.colors.bg.hover};
    }
  `}

  ${props => props.$variant === 'glass' && css`
    background: ${props => props.theme.colors.bg.glass};
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid ${props => props.theme.colors.bg.glassBorder};
    box-shadow: ${props => props.theme.shadows.base};

    &:hover {
      border-color: rgba(255, 255, 255, 0.1);
      box-shadow: ${props => props.theme.shadows.md};
    }
  `}
  
  ${props => (props.$variant === 'default' || !props.$variant) && css`
    box-shadow: ${props => props.theme.shadows.base};
    &:hover {
      border-color: ${props => props.theme.colors.border.secondary};
      box-shadow: ${props => props.theme.shadows.md};
    }
  `}
`;

export const CardHeader = styled.div<{ $withBorder?: boolean }>`
  padding: ${props => props.theme.spacing[5]};
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[4]};
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
  
  ${props => props.$withBorder && css`
    border-bottom: 1px solid ${props => props.theme.colors.bg.border};
  `}
`;

export const CardContent = styled.div<{ $padding?: 'sm' | 'md' | 'lg' | 'none' }>`
  ${props => {
    const basePadding = props.theme.spacing[4];
    const smPadding = props.theme.spacing[3];
    const lgPadding = props.theme.spacing[6];
    
    switch (props.$padding) {
      case 'sm': 
        return css`
          padding: ${smPadding};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            padding: ${props.theme.spacing[4]};
          }
        `;
      case 'lg': 
        return css`
          padding: ${basePadding};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            padding: ${lgPadding};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            padding: ${props.theme.spacing[8]};
          }
        `;
      case 'none': 
        return 'padding: 0;';
      default: 
        return css`
          padding: ${basePadding};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            padding: ${props.theme.spacing[5]};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            padding: ${props.theme.spacing[6]};
          }
        `;
    }
  }}
`;

export const CardTitle = styled.h2`
  font-size: ${props => props.theme.typography.fontSizes.xl};
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
`;

export const CardSubtitle = styled.p`
  font-size: ${props => props.theme.typography.fontSizes.sm};
  color: ${props => props.theme.colors.text.tertiary};
  margin: ${props => props.theme.spacing[1]} 0 0 0;
`;

// Layout Components
export const Grid = styled.div<{ 
  $columns?: number; 
  $gap?: string; 
  $minWidth?: string;
  $responsive?: boolean;
}>`
  display: grid;
  gap: ${props => props.$gap || props.theme.spacing[5]};
  
  ${props => props.$responsive !== false ? css`
    /* Mobile first approach */
    grid-template-columns: 1fr;
    
    /* Small screens - 2 columns max */
    @media (min-width: ${props.theme.breakpoints.sm}) {
      grid-template-columns: repeat(${Math.min(props.$columns || 2, 2)}, 1fr);
      gap: ${props.$gap || props.theme.spacing[6]};
    }
    
    /* Medium screens - 3 columns max */
    @media (min-width: ${props.theme.breakpoints.md}) {
      grid-template-columns: repeat(${Math.min(props.$columns || 3, 3)}, 1fr);
      gap: ${props.$gap || props.theme.spacing[7]};
    }
    
    /* Large screens - full columns */
    @media (min-width: ${props => props.theme.breakpoints.lg}) {
      grid-template-columns: repeat(${props.$columns || 3}, 1fr);
    }
  ` : css`
    grid-template-columns: repeat(${props.$columns || 1}, 1fr);
  `}
  
  ${props => props.$minWidth && css`
    grid-template-columns: repeat(auto-fit, minmax(${props.$minWidth}, 1fr));
  `}
`;

export const Flex = styled.div<{ 
  $direction?: 'row' | 'column';
  $justify?: 'start' | 'center' | 'end' | 'between' | 'around' | 'evenly';
  $align?: 'start' | 'center' | 'end' | 'stretch' | 'baseline';
  $gap?: string;
  $wrap?: boolean;
  $responsive?: boolean;
}>`
  display: flex;
  flex-direction: ${props => props.$direction || 'row'};
  justify-content: ${props => {
    switch (props.$justify) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'between': return 'space-between';
      case 'around': return 'space-around';
      case 'evenly': return 'space-evenly';
      default: return 'flex-start';
    }
  }};
  align-items: ${props => {
    switch (props.$align) {
      case 'start': return 'flex-start';
      case 'center': return 'center';
      case 'end': return 'flex-end';
      case 'stretch': return 'stretch';
      case 'baseline': return 'baseline';
      default: return 'flex-start';
    }
  }};
  gap: ${props => props.$gap || '0'};
  flex-wrap: ${props => props.$wrap ? 'wrap' : 'nowrap'};
  
  ${props => props.$responsive && css`
    @media (max-width: ${props => props.theme.breakpoints.md}) {
      flex-direction: column;
    }
  `}
`;

// Typographyexport const Heading = styled.h1<{ 
  $level?: 1 | 2 | 3 | 4 | 5 | 6;
  $color?: 'primary' | 'secondary' | 'tertiary';
  $gradient?: boolean;
}>`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  line-height: ${props => props.theme.typography.lineHeights.tight};
  letter-spacing: ${props => props.theme.typography.letterSpacings.tighter};
  margin: 0;
  
  ${props => {
    const level = props.$level || 1;
    
    switch (level) {
      case 1: 
        return css`
          font-size: ${props.theme.typography.fontSizes['3xl']};
          @media (min-width: 768px) { font-size: ${props.theme.typography.fontSizes['4xl']}; }
          @media (min-width: 1280px) { font-size: 56px; }
        `;
      case 2: 
        return css`
          font-size: ${props.theme.typography.fontSizes['2xl']};
          @media (min-width: 768px) { font-size: ${props.theme.typography.fontSizes['3xl']}; }
        `;
      case 3: 
        return css`
          font-size: ${props.theme.typography.fontSizes.xl};
          @media (min-width: 768px) { font-size: ${props.theme.typography.fontSizes['2xl']}; }
        `;
      default: 
        return css`font-size: ${props.theme.typography.fontSizes.xl};`;
    }
  }}
  
  ${props => {
    switch (props.$color) {
      case 'primary': return `color: ${props.theme.colors.text.primary};`;
      case 'secondary': return `color: ${props.theme.colors.text.secondary};`;
      case 'tertiary': return `color: ${props.theme.colors.text.tertiary};`;
      default: return `color: ${props.theme.colors.text.primary};`;
    }
  }}
  
  ${props => props.$gradient && css`
    background: linear-gradient(
      135deg,
      var(--bs-brand-main, ${props.theme.colors.primary.main}) 0%,
      var(--bs-brand-light, ${props.theme.colors.primary.light}) 100%
    );
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    display: inline-block;
  `}
`;

export const Text = styled.p<{ 
  $size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  $color?: 'primary' | 'secondary' | 'tertiary' | 'disabled' | 'success';
  $weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  margin: 0;
  line-height: ${props => props.theme.typography.lineHeights.normal};
  
  ${props => {
    switch (props.$size) {
      case 'xs': return `font-size: ${props.theme.typography.fontSizes.xs};`;
      case 'sm': return `font-size: ${props.theme.typography.fontSizes.sm};`;
      case 'lg': return `font-size: ${props.theme.typography.fontSizes.lg};`;
      case 'xl': return `font-size: ${props.theme.typography.fontSizes.xl};`;
      default: return `font-size: ${props.theme.typography.fontSizes.base};`;
    }
  }}
  
  ${props => {
    switch (props.$color) {
      case 'primary': return `color: ${props.theme.colors.text.primary};`;
      case 'secondary': return `color: ${props.theme.colors.text.secondary};`;
      case 'tertiary': return `color: ${props.theme.colors.text.tertiary};`;
      case 'disabled': return `color: ${props.theme.colors.text.disabled};`;
      case 'success': return `color: ${props.theme.colors.success.main};`;
      default: return `color: ${props.theme.colors.text.secondary};`;
    }
  }}
  
  ${props => {
    const weight = props.$weight || 'normal';
    return `font-weight: ${props.theme.typography.fontWeights[weight]};`;
  }}
`;
;