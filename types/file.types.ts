export interface FileRel {
  id: string;
  key: string;
  fileObj: File;
}

export type FileType = "image" | "video" | "other";

export interface File {
  id: string;
  cdn: string;
  data: {
    aspectRatio: number;
  };
  prefix: string;
  type: FileType;
  variations: any;
  ext: string;
  signedUrl: string;
}
