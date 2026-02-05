export type TPoint = GeoJSON.Feature<GeoJSON.Point, { title: string }>;

export type TCommuteToWork = {
  id: number;
  home: TPoint;
  homeToWorkDistance: number;
  work: TPoint;
  workToHomeDistance: number;
};
