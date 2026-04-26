import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

type AppProfile = {
  name: string;
  shortName: string;
  themeColor: string;
  iconPath: string;
  /** Caminho para o manifest estático em /public, ou null para gerar blob (booking dinâmico). */
  staticManifest: string | null;
  /** Usado apenas quando staticManifest === null (booking com slug dinâmico). */
  startPath?: string;
};

const PLATFORM_PROFILE: AppProfile = {
  name: 'Shafar Plataforma',
  shortName: 'Shafar Admin',
  themeColor: '#c8922a',
  iconPath: '/icon-platform.png',
  staticManifest: '/manifest-platform.json',
};

const DASHBOARD_PROFILE: AppProfile = {
  name: 'Shafar Barbearia',
  shortName: 'Shafar Barber',
  themeColor: '#2ac96f',
  iconPath: '/icon-dashboard.png',
  staticManifest: '/manifest-dashboard.json',
};

const bookingProfile = (startPath: string): AppProfile => ({
  name: 'Shafar Agendamento',
  shortName: 'Shafar Agenda',
  themeColor: '#6f7ef7',
  iconPath: '/icon-booking.png',
  staticManifest: null,
  startPath,
});

const DEFAULT_PROFILE: AppProfile = {
  name: 'Shafar',
  shortName: 'Shafar',
  themeColor: '#c09a5c',
  iconPath: '/logo.png',
  staticManifest: null,
  startPath: '/#/',
};

const resolveProfile = (pathname: string, role?: UserRole): AppProfile => {
  if (pathname.startsWith('/platform')) return PLATFORM_PROFILE;
  if (pathname.startsWith('/dashboard')) return DASHBOARD_PROFILE;
  if (pathname.startsWith('/book/')) return bookingProfile(`/#${pathname}`);
  if (role === UserRole.PLATFORM_ADMIN) return PLATFORM_PROFILE;
  if (role === UserRole.ADMIN || role === UserRole.MEMBER) return DASHBOARD_PROFILE;
  return DEFAULT_PROFILE;
};

const upsertMeta = (name: string, content: string): void => {
  let el = document.querySelector<HTMLMetaElement>(`meta[name="${name}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute('name', name);
    document.head.appendChild(el);
  }
  el.content = content;
};

const upsertLink = (rel: string, href: string, type?: string): HTMLLinkElement => {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }
  if (type) link.type = type;
  link.href = href;
  return link;
};

export const ProfileAppMeta = () => {
  const location = useLocation();
  const { user } = useAuth();
  const blobUrlRef = useRef<string | null>(null);

  const profile = useMemo(
    () => resolveProfile(location.pathname, user?.role),
    [location.pathname, user?.role]
  );

  useEffect(() => {
    const origin = window.location.origin;

    // Ícone e cor — funcionam em iOS e Android
    upsertLink('icon', profile.iconPath, 'image/png');
    upsertLink('apple-touch-icon', profile.iconPath);
    upsertMeta('theme-color', profile.themeColor);
    upsertMeta('apple-mobile-web-app-title', profile.shortName);
    upsertMeta('apple-mobile-web-app-capable', 'yes');
    upsertMeta('apple-mobile-web-app-status-bar-style', 'black-translucent');

    // Manifest
    if (profile.staticManifest) {
      // Arquivo estático — iOS Safari lê start_url corretamente
      upsertLink('manifest', profile.staticManifest);
      // Limpa blob anterior se existir
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    } else {
      // Booking: slug dinâmico — usa blob (Android Chrome suporta; iOS usa a URL atual da página)
      const startUrl = new URL(profile.startPath ?? '/#/', origin).toString();
      const manifest = {
        id: startUrl,
        name: profile.name,
        short_name: profile.shortName,
        description: 'Agendamento de clientes.',
        theme_color: profile.themeColor,
        background_color: '#0d0d0d',
        display: 'standalone',
        orientation: 'portrait',
        scope: origin + '/',
        start_url: startUrl,
        icons: [
          {
            src: new URL(profile.iconPath, origin).toString(),
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      };

      const blob = new Blob([JSON.stringify(manifest)], {
        type: 'application/manifest+json',
      });
      const blobUrl = URL.createObjectURL(blob);
      upsertLink('manifest', blobUrl);

      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = blobUrl;
    }
  }, [profile]);

  // Cleanup no unmount
  useEffect(
    () => () => {
      if (blobUrlRef.current) URL.revokeObjectURL(blobUrlRef.current);
    },
    []
  );

  return null;
};
