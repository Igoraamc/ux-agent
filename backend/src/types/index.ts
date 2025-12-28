export type DetectedElement = {
  index: number;
  selector: string;
  tagName: string;
  text: string;
  boundingBox: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  attributes: Record<string, string>;
};
