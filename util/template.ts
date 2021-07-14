export function idTag(callSite: TemplateStringsArray, ...substitutions: any[]): string {
    substitutions.push('');

    return substitutions.map((subst, i) => callSite[i] + subst).join('');
}