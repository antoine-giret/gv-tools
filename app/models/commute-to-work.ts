export type TPoint = GeoJSON.Feature<GeoJSON.Point, { title: string }>;

export type TCommuteToWork = {
  id: number;
  home: TPoint;
  homeToWorkDistance: number;
  work: TPoint;
  workToHomeDistance: number;
};

export type TCommuteToWorkOccurence = {
  candidate: boolean;
  commuteToWorkId: number;
  direction: 'homeToWork' | 'workToHome';
  date: Date;
  enabled: boolean;
  id: number;
  order: number;
};

export type TCommuteToWorkOccurencesMap = {
  [day: string]: { homeToWork: TCommuteToWorkOccurence[]; workToHome: TCommuteToWorkOccurence[] };
};
