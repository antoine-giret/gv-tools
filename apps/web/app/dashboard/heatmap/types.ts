export const layers = ['traces', 'tiles'] as const;
export type TLayer = (typeof layers)[number];
