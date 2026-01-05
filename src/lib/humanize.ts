export function humanizeIdentifier(input: string): string {
  // Supports snake_case, kebab-case, and camelCase/PascalCase.
  const withSpaces = input
    .replace(/[_-]+/g, " ")
    .replace(/([a-z0-9])([A-Z])/g, "$1 $2")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();

  if (!withSpaces) return "";

  return withSpaces[0].toUpperCase() + withSpaces.slice(1);
}
