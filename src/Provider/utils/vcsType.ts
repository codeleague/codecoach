import { URL } from 'url';

export function isGitlab(url: string | undefined): boolean {
  if (url == null || url == '') {
    return false;
  }
  const urlObj = new URL(url);
  return urlObj.hostname.includes('gitlab');
}
