

import {
  type StyleProp,
  type ViewStyle,
} from 'react-native';

export type LoginCredentials = {
  email: string;
  password: string;
};

export type SignupCredentials = {
  email: string;
  password: string;
  name: string;
};

export type AuthResponse = {
  token: string;
  user: {
    _id: string;
    email: string;
    name: string;
  };
};
export type LatLng = {
  lat: number;
  lng: number;
};

export type Comment = {
  _id: string;
  userId?: string;
  userName?: string;
  /** API may return 'name' (e.g. "Maria Lopez") */
  name?: string;
  owner?:{
    _id: string;
    name: string;
  },
  text?: string;
  /** API may return 'comment' for the review text */
  comment?: string;
  rating: number;
  createdAt?: string;
  /** API may return 'date' */
  date?: string;
};

export type Restaurant = {
  _id: string;
  address?: string;
  avgRating?: number;
  name: string;
  owner: string;
  description: string;
  reviews: Comment[];
  location?: {
    type: string;
    coordinates: [number, number];
  };
  latlng?: LatLng;
  image: string;
  price?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type RestaurantListResponse = {
  restaurantList: Restaurant[];
  total: number;
  page: number;
  limit: number;
};

export type CreateRestaurantDTO = {
  name: string;
  address: string;
  image: string;
  description: string;
  latlng: LatLng;
};
export type UpdateRestaurantDTO = Partial<CreateRestaurantDTO>;

/** Create comment – body: { "comment": string, "rating": number (1-5) } */
export type CreateCommentDTO = {
  comment: string;
  rating: number;
};

export type UpdateCommentDTO = Partial<CreateCommentDTO>;

export type PresignRequest = {
  contentType: string;
  sizeBytes: number;
};

export type PresignResponse = {
  uploadUrl: string;
  publicUrl: string;
  objectKey: string;
  expiresIn: number;
  maxSizeBytes: number;
};


export type RestaurantCardProps = {
  data: Restaurant;
  isFavorite: boolean;
  hideComments?: boolean;
  variant?: 'default' | 'map';
  onToggleFavorite: (restaurant: Restaurant) => void;
  onPress?: () => void;
  containerStyle?: StyleProp<ViewStyle>;
  cardStyle?: StyleProp<ViewStyle>;
};

