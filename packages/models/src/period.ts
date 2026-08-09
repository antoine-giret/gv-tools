export const periodTypes = ['week', 'month', 'year', 'allTime'] as const;

export type TPeriodType = (typeof periodTypes)[number];

export type TPeriod = { endDate: Date; startDate: Date; type: TPeriodType };
