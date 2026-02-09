export const periodTypes = ['week', 'month', 'year'] as const;

export type TPeriodType = (typeof periodTypes)[number];

export type TPeriod = { endDate: Date; startDate: Date; type: TPeriodType };
