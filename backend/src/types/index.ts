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
  attributes: {
    placeholder?: string;
    type?: string;
    href?: string;
    role?: string;
  };
};