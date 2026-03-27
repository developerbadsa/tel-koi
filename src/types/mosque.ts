export type MosqueItem = {
  _id: string;
  name: string;
  area: string;
  address?: string;
  location: {
    coordinates: [number, number];
  };
  aggregates: {
    yesCount: number;
    noCount: number;
    lastVotedAt: string | Date | null;
    confidenceScore: number;
  };
};

export type TrendingRow = {
  _id: string;
  total: number;
  mosque: { name: string };
};

export type HomeDictionary = {
  search: string;
  allAreas: string;
  list: string;
  map: string;
  trending: string;
  yes: string;
  no: string;
  openMaps: string;
  lastReport: string;
  topYes: string;
  topNo: string;
  mostActive: string;
};
