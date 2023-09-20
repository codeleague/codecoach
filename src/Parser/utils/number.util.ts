export function NoNaN(nStr: string): number | undefined {
  const result = Number(nStr);
  return isNaN(result) ? undefined : result;
}
