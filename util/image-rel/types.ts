export interface FileRel {
  cdn: string;
  prefix: string;
  contentType: string;
  type: "image" | "video" | "other";
  variations: any;
  ext: string;
  signedUrl: string;
  data: {
    aspectRatio: number;
  };
}
