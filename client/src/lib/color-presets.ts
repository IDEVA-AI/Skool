export type ColorPreset = 'slate' | 'blue' | 'green' | 'purple' | 'orange' | 'rose';

export interface ColorPresetConfig {
  name: string;
  primary: string; // HSL format: "h s% l%"
  secondary: string; // HSL format: "h s% l%"
  accent?: string; // HSL format: "h s% l%"
}

export const colorPresets: Record<ColorPreset, ColorPresetConfig> = {
  slate: {
    name: 'Slate',
    primary: '217 23% 23%', // #2D3748
    secondary: '207 73% 57%', // #4299E1
    accent: '145 47% 51%', // #48BB78
  },
  blue: {
    name: 'Azul',
    primary: '217 91% 60%', // #1E40AF -> ajustado para melhor contraste
    secondary: '217 91% 60%', // #3B82F6
    accent: '199 89% 48%', // Azul mais vibrante
  },
  green: {
    name: 'Verde',
    primary: '142 76% 36%', // #166534
    secondary: '142 71% 45%', // #22C55E
    accent: '142 71% 45%', // Verde vibrante
  },
  purple: {
    name: 'Roxo',
    primary: '262 83% 58%', // #7C3AED
    secondary: '262 83% 58%', // #A78BFA
    accent: '262 83% 58%', // Roxo vibrante
  },
  orange: {
    name: 'Laranja',
    primary: '24 95% 53%', // #EA580C
    secondary: '24 95% 53%', // #FB923C
    accent: '24 95% 53%', // Laranja vibrante
  },
  rose: {
    name: 'Rosa',
    primary: '346 77% 50%', // #BE123C
    secondary: '346 77% 50%', // #FB7185
    accent: '346 77% 50%', // Rosa vibrante
  },
};

/**
 * Aplica um preset de cores ao documento atual
 */
export function applyColorPreset(preset: ColorPreset | null) {
  const root = document.documentElement;
  
  if (!preset || !colorPresets[preset]) {
    // Resetar para valores padrão (slate)
    const defaultPreset = colorPresets.slate;
    root.style.setProperty('--primary', defaultPreset.primary);
    root.style.setProperty('--secondary', defaultPreset.secondary);
    if (defaultPreset.accent) {
      root.style.setProperty('--accent', defaultPreset.accent);
    }
    return;
  }

  const config = colorPresets[preset];
  root.style.setProperty('--primary', config.primary);
  root.style.setProperty('--secondary', config.secondary);
  if (config.accent) {
    root.style.setProperty('--accent', config.accent);
  }
}

/**
 * Obtém o preset atual aplicado
 */
export function getCurrentPreset(): ColorPreset | null {
  const root = document.documentElement;
  const computedPrimary = getComputedStyle(root).getPropertyValue('--primary').trim();
  
  // Comparar com os presets disponíveis
  for (const [key, config] of Object.entries(colorPresets)) {
    if (config.primary === computedPrimary) {
      return key as ColorPreset;
    }
  }
  
  return null;
}

