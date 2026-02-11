export const generateSlug = (agencyName: string): string => {
  return agencyName
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
};

export const validateSlug = (slug: string): boolean => {
  const slugRegex = /^[a-z0-9-]+$/;
  return slugRegex.test(slug) && slug.length >= 2 && slug.length <= 50;
};

export const getSubdomainFromHost = (host: string): string | null => {
  if (!host) return null;

  host = host.replace(/^https?:\/\//, '');

  const parts = host.split('.');

  if (parts.length >= 3) {
    const subdomain = parts[0];
    if (['www', 'api', 'admin', 'mail', 'ftp'].includes(subdomain)) {
      return null;
    }
    return subdomain;
  }

  return null;
};

export const getAgencySlug = (): string | null => {
  if (typeof window === 'undefined') return null;

  const urlParams = new URLSearchParams(window.location.search);
  const agencyParam = urlParams.get('agency');
  if (agencyParam && agencyParam !== 'undefined' && agencyParam !== 'null') {
    return agencyParam;
  }

  return getSubdomainFromHost(window.location.host);
};

export const isAgencySubdomain = (): boolean => {
  if (typeof window === 'undefined') return false;

  const urlParams = new URLSearchParams(window.location.search);
  const agencyParam = urlParams.get('agency');
  if (agencyParam && agencyParam !== 'undefined' && agencyParam !== 'null') {
    return true;
  }

  const host = window.location.host;

  if (host.includes('localhost') ||
      host.includes('onrender.com') ||
      host.includes('vercel.app') ||
      host.includes('netlify.app') ||
      host.includes('railway.app') ||
      host.includes('heroku.com') ||
      host.includes('azurestaticapps.net') ||
      host.includes('127.0.0.1')) {
    return false;
  }

  const subdomain = getSubdomainFromHost(host);
  return subdomain !== null;
};

export const buildAgencyUrl = (slug: string, path: string = ''): string => {
  if (typeof window === 'undefined') return '';

  const currentHost = window.location.host;
  const currentProtocol = window.location.protocol;

  if (currentHost.includes('localhost') || currentHost.includes('127.0.0.1')) {
    return `${currentProtocol}//${currentHost}${path}?agency=${slug}`;
  }

  if (currentHost.includes('onrender.com') ||
      currentHost.includes('vercel.app') ||
      currentHost.includes('netlify.app') ||
      currentHost.includes('railway.app') ||
      currentHost.includes('heroku.com') ||
      currentHost.includes('azurestaticapps.net')) {
    return `${currentProtocol}//${currentHost}${path}?agency=${slug}`;
  }

  const parts = currentHost.split('.');
  if (parts.length >= 2) {
    const rootDomain = parts.slice(-2).join('.');
    return `${currentProtocol}//${slug}.${rootDomain}${path}`;
  }

  return `${currentProtocol}//${currentHost}${path}?agency=${slug}`;
};