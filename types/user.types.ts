export interface User {
  id?: string;
  name?: string;
  avatarImage?: AvatarImage;
}

export interface AvatarImage {
  cdn: string;
  prefix: string;
  ext: string;
  variations?: {
    postfix: string;
    width: number;
    height: number;
  };
  aspectRatio?: number;
}

export interface MeUser {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  avatarImage: AvatarImage;
}


export interface MeConnectionUser extends MeUser {
  connectionConnection: {
    nodes: {
      id: string;
      sourceType: "youtube" | "twitch";
    }[];
  };
}

