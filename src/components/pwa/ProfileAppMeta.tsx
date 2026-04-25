import { useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole } from '../../types';

type AppProfile = {
  name: string;
  shortName: string;
  description: string;
  iconPath: string;
  startPath: string;
  themeColor: string;
};

const PLATFORM_PROFILE: AppProfile = {
  name: 'Shafar Plataforma',
  shortName: 'Shafar Admin',
  description: 'Administração da plataforma Shafar.',
  iconPath: '/icon-platform.png',
  startPath: '/#/platform',
  themeColor: '#c8922a',
};

const DASHBOARD_PROFILE: AppProfile = {
  name: 'Shafar Barbearia',
  shortName: 'Shafar Barber',
  description: 'Gestão da operação da barbearia.',
  iconPath: '/icon-dashboard.png',
  startPath: '/#/dashboard',
  themeColor: '#2ac96f',
};

const BOOKING_PROFILE = (startPath: string): AppProfile => ({
  name: 'Shafar Agendamento',
  shortName: 'Shafar Agenda',
  description: 'Agendamento de clientes.',
  iconPath: '/icon-booking.png',
  startPath,
  themeColor: '#6f7ef7',
});

const resolveProfile = (pathname: string, role?: UserRole): AppProfile => {
  if (pathname.startsWith('/platform')) {
    return PLATFORM_PROFILE;
  }

  if (pathname.startsWith('/dashboard')) {
    return DASHBOARD_PROFILE;
  }

  if (pathname.startsWith('/book/')) {
    return BOOKING_PROFILE(`/#${pathname}`);
  }

  if (role === UserRole.PLATFORM_ADMIN) {
    return PLATFORM_PROFILE;
  }

  if (role === UserRole.ADMIN || role === UserRole.MEMBER) {
    return DASHBOARD_PROFILE;
  }

  return {
    name: 'Shafar',
    shortName: 'Shafar',
    description: 'Plataforma Shafar para barbearias.',
    iconPath: '/logo.png',
    startPath: '/#/',
    themeColor: '#c09a5c',
  };
};

const upsertLink = (rel: string, href: string, type?: string): HTMLLinkElement => {
  let link = document.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', rel);
    document.head.appendChild(link);
  }

  if (type) {
    link.type = type;
  }
  link.href = href;
  return link;
};

export const ProfileAppMeta = () => {
  const location = useLocation();
  const { user } = useAuth();
  const previousManifestUrlRef = useRef<string | null>(null);

  const profile = useMemo(
    () => resolveProfile(location.pathname, user?.role),
    [location.pathname, user?.role]
  );

  useEffect(() => {
    const origin = window.location.origin;
    const absoluteStartUrl = new URL(profile.startPath, origin).toString();
    const absoluteScopeUrl = new URL('/', origin).toString();
    const absoluteIconUrl = new URL(profile.iconPath, origin).toString();

    upsertLink('icon', profile.iconPath, 'image/png');
    upsertLink('apple-touch-icon', profile.iconPath);

    const themeMeta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]');
    if (themeMeta) {
      themeMeta.content = profile.themeColor;
    }

    const manifest = {
      id: absoluteStartUrl,
      name: profile.name,
      short_name: profile.shortName,
      description: profile.description,
      theme_color: profile.themeColor,
      background_color: '#0d0d0d',
      display: 'standalone',
      scope: absoluteScopeUrl,
      start_url: absoluteStartUrl,
      icons: [
        {
          src: absoluteIconUrl,
          sizes: '512x512',
          type: 'image/png',
          purpose: 'any maskable',
        },
      ],
    };

    const manifestBlob = new Blob([JSON.stringify(manifest)], {
      type: 'application/manifest+json',
    });
    const manifestUrl = URL.createObjectURL(manifestBlob);
    upsertLink('manifest', manifestUrl);

    if (previousManifestUrlRef.current) {
      URL.revokeObjectURL(previousManifestUrlRef.current);
    }
    previousManifestUrlRef.current = manifestUrl;
  }, [profile]);

  useEffect(
    () => () => {
      if (previousManifestUrlRef.current) {
        URL.revokeObjectURL(previousManifestUrlRef.current);
      }
    },
    []
  );

  return null;
};
