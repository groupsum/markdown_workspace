export type ExtensionIcon = LucideIconDescriptor | SvgIconDescriptor | AssetIconDescriptor;
export interface LucideIconDescriptor {
    readonly kind: "lucide";
    readonly name: string;
}
export interface SvgIconDescriptor {
    readonly kind: "svg";
    readonly svg: string;
}
export interface AssetIconDescriptor {
    readonly kind: "asset";
    readonly path: string;
}
//# sourceMappingURL=icon.d.ts.map