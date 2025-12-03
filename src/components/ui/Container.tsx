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
  max-width: 1200px;
  margin: 0 auto;
  padding: ${props => props.theme.spacing[4]};
  min-height: calc(100vh - 80px); /* Account for mobile header */
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[5]} ${props => props.theme.spacing[4]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]} ${props => props.theme.spacing[5]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.lg}) {
    padding: ${props => props.theme.spacing[8]} ${props => props.theme.spacing[6]};
    min-height: 100vh; /* Full height on desktop */
  }
`;

// Cards
export const Card = styled.div<{ $variant?: 'default' | 'elevated' | 'outlined' }>`
  background-color: ${props => props.theme.colors.background.elevated};
  border-radius: ${props => props.theme.radii.xl};
  overflow: hidden;
  transition: ${props => props.theme.transitions.base};
  
  ${props => props.$variant === 'elevated' && css`
    box-shadow: ${props => props.theme.shadows.lg};
    border: 1px solid ${props => props.theme.colors.border.primary};
    
    &:hover {
      box-shadow: ${props => props.theme.shadows.xl};
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.$variant === 'outlined' && css`
    border: 1px solid ${props => props.theme.colors.border.primary};
    
    &:hover {
      border-color: ${props => props.theme.colors.border.secondary};
    }
  `}
  
  ${props => props.$variant === 'default' && css`
    box-shadow: ${props => props.theme.shadows.base};
  `}
`;

export const CardHeader = styled.div<{ $withBorder?: boolean }>`
  padding: ${props => props.theme.spacing[4]};
  background: linear-gradient(135deg, ${props => props.theme.colors.background.elevated} 0%, ${props => props.theme.colors.background.tertiary} 100%);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: ${props => props.theme.spacing[3]};
  
  @media (min-width: ${props => props.theme.breakpoints.sm}) {
    padding: ${props => props.theme.spacing[5]};
    gap: ${props => props.theme.spacing[4]};
  }
  
  @media (min-width: ${props => props.theme.breakpoints.md}) {
    padding: ${props => props.theme.spacing[6]};
  }
  
  ${props => props.$withBorder && css`
    border-bottom: 1px solid ${props => props.theme.colors.border.primary};
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
  gap: ${props => props.$gap || props.theme.spacing[4]};
  
  ${props => props.$responsive !== false ? css`
    /* Mobile first approach */
    grid-template-columns: 1fr;
    
    /* Small screens - 2 columns max */
    @media (min-width: ${props => props.theme.breakpoints.sm}) {
      grid-template-columns: repeat(${Math.min(props.$columns || 2, 2)}, 1fr);
      gap: ${props => props.$gap || props.theme.spacing[5]};
    }
    
    /* Medium screens - 3 columns max */
    @media (min-width: ${props => props.theme.breakpoints.md}) {
      grid-template-columns: repeat(${Math.min(props.$columns || 3, 3)}, 1fr);
      gap: ${props => props.$gap || props.theme.spacing[6]};
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

// Typography
export const Heading = styled.h1<{ 
  $level?: 1 | 2 | 3 | 4 | 5 | 6;
  $color?: 'primary' | 'secondary' | 'tertiary';
  $gradient?: boolean;
}>`
  font-weight: ${props => props.theme.typography.fontWeights.bold};
  line-height: ${props => props.theme.typography.lineHeights.tight};
  margin: 0;
  
  ${props => {
    const level = props.$level || 1;
    
    // Mobile-first responsive font sizes
    switch (level) {
      case 1: 
        return css`
          font-size: ${props.theme.typography.fontSizes['2xl']};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes['3xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes['4xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes['5xl']};
          }
        `;
      case 2: 
        return css`
          font-size: ${props.theme.typography.fontSizes.xl};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes['2xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes['3xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes['4xl']};
          }
        `;
      case 3: 
        return css`
          font-size: ${props.theme.typography.fontSizes.lg};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes.xl};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes['2xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes['3xl']};
          }
        `;
      case 4: 
        return css`
          font-size: ${props.theme.typography.fontSizes.base};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes.lg};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes.xl};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes['2xl']};
          }
        `;
      case 5: 
        return css`
          font-size: ${props.theme.typography.fontSizes.sm};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes.base};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes.lg};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes.xl};
          }
        `;
      case 6: 
        return css`
          font-size: ${props.theme.typography.fontSizes.xs};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes.sm};
          }
          
          @media (min-width: ${props.theme.breakpoints.md}) {
            font-size: ${props.theme.typography.fontSizes.base};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes.lg};
          }
        `;
      default: 
        return css`
          font-size: ${props.theme.typography.fontSizes.xl};
          
          @media (min-width: ${props.theme.breakpoints.sm}) {
            font-size: ${props.theme.typography.fontSizes['2xl']};
          }
          
          @media (min-width: ${props.theme.breakpoints.lg}) {
            font-size: ${props.theme.typography.fontSizes['3xl']};
          }
        `;
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
    background: linear-gradient(135deg, ${props => props.theme.colors.primary} 0%, ${props => props.theme.colors.primaryLight} 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  `}
`;

export const Text = styled.p<{ 
  $size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl';
  $color?: 'primary' | 'secondary' | 'tertiary' | 'disabled';
  $weight?: 'light' | 'normal' | 'medium' | 'semibold' | 'bold';
}>`
  margin: 0;
  
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
      default: return `color: ${props.theme.colors.text.secondary};`;
    }
  }}
  
  ${props => {
    switch (props.$weight) {
      case 'light': return `font-weight: ${props.theme.typography.fontWeights.light};`;
      case 'normal': return `font-weight: ${props.theme.typography.fontWeights.normal};`;
      case 'medium': return `font-weight: ${props.theme.typography.fontWeights.medium};`;
      case 'semibold': return `font-weight: ${props.theme.typography.fontWeights.semibold};`;
      case 'bold': return `font-weight: ${props.theme.typography.fontWeights.bold};`;
      default: return `font-weight: ${props.theme.typography.fontWeights.normal};`;
    }
  }}
`;