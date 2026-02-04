// src/lib/permissions.ts

export const extractPermNames = (permissions: any[]): string[] => {
  let permList: string[] = [];
  for (const perm of permissions) {
    if (perm.perm_name && perm.perm_name.startsWith("/")) {
      permList.push(perm.perm_name);
    }
    if (Array.isArray(perm.children) && perm.children.length > 0) {
      permList = permList.concat(extractPermNames(perm.children));
    }
  }
  return permList;
};
