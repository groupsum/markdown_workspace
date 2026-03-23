import type React from "react";
export interface MarkdownRendererThemeVariables {
    readonly foreground?: string;
    readonly foregroundMuted?: string;
    readonly background?: string;
    readonly border?: string;
    readonly accent?: string;
    readonly codeBackground?: string;
    readonly codeForeground?: string;
    readonly codeBorder?: string;
    readonly fontUi?: string;
    readonly fontMono?: string;
}
export interface MarkdownLinkAttributeResult {
    readonly target?: string;
    readonly rel?: string;
}
export interface MarkdownRendererProps {
    readonly markdown: string;
    readonly className?: string;
    readonly style?: React.CSSProperties;
    readonly themeStyle?: React.CSSProperties;
    readonly onLinkClick?: (event: React.MouseEvent<HTMLAnchorElement>, href?: string) => void;
    readonly getLinkAttributes?: (href?: string) => MarkdownLinkAttributeResult | undefined;
    readonly components?: Record<string, React.ComponentType<any>>;
    readonly syntaxTheme?: Record<string, React.CSSProperties>;
}
//# sourceMappingURL=types.d.ts.map