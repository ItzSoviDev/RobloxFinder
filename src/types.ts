export interface RobloxUser {
  id: number;
  name: string;
  displayName: string;
  hasVerifiedBadge: boolean;
  thumbnailUrl: string;
}

export interface WornAsset {
  id: number;
  name: string;
  itemType?: string;
  assetType?: {
    id: number;
    name: string;
  };
  thumbnailUrl: string;
  price?: number;
  creatorName?: string;
}

export interface BodyColors {
  headColorHex: string;
  torsoColorHex: string;
  leftArmColorHex: string;
  rightArmColorHex: string;
  leftLegColorHex: string;
  rightLegColorHex: string;
}

export interface RobloxProfile {
  id: number;
  name: string;
  displayName: string;
  description: string;
  created: string;
  hasVerifiedBadge: boolean;
  fullBodyUrl: string;
  avatarType: "R15" | "R6";
  bodyColors: BodyColors;
  scales: {
    width: number;
    height: number;
    depth: number;
    head: number;
    proportion?: number;
    bodyType?: number;
  };
  assets: WornAsset[];
}

export interface CatalogItem {
  id: number;
  name: string;
  itemType: string;
  creatorName?: string;
  price: number;
  thumbnailUrl: string;
  assetType?: {
    id: number;
    name: string;
  };
}

export interface CustomOutfit {
  id: string;
  title: string;
  bodyColors: BodyColors;
  equippedAssets: WornAsset[];
  faceType: string; // "smile", "cheeky", "man", "woman", "beast"
  accessory3D: string; // "none", "top_hat", "fedora", "crown", "headphones", "angel_wings", "swords"
  createdAt: string;
}
