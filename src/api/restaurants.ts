import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import api from './client';
 
import { Comment, CreateCommentDTO, CreateRestaurantDTO, PresignRequest, PresignResponse, Restaurant, RestaurantListResponse, UpdateCommentDTO, UpdateRestaurantDTO } from '../types/index';

// --- Restaurant API Functions ---

async function fetchRestaurants(page = 1, limit = 10): Promise<RestaurantListResponse> {
  const response = await api.get<RestaurantListResponse>('/restaurant/list', {
    params: { page, limit },
  });
  return response.data;
}

async function fetchRestaurantDetail(id: string): Promise<Restaurant> {
  const response = await api.get<Restaurant>(`/restaurant/detail/${id}`);
  return response.data;
}

async function createRestaurant(data: CreateRestaurantDTO): Promise<Restaurant> {
  const response = await api.post<Restaurant>('/restaurant/create', data);
  return response.data;
}

async function updateRestaurant(id: string, data: UpdateRestaurantDTO): Promise<Restaurant> {
  const response = await api.put<Restaurant>(`/restaurant/${id}`, data);
  return response.data;
}

async function deleteRestaurant(id: string): Promise<void> {
  await api.delete(`/restaurant/${id}`);
}

// --- Comment API Functions ---

async function createComment(restaurantId: string, data: CreateCommentDTO): Promise<Comment> {
  const response = await api.post<Comment>(`/restaurant/${restaurantId}/comment`, data);
  return response.data;
}

async function updateComment(restaurantId: string, commentId: string, data: UpdateCommentDTO): Promise<Comment> {
  const response = await api.put<Comment>(`/restaurant/${restaurantId}/comment/${commentId}`, data);
  return response.data;
}

async function deleteComment(restaurantId: string, commentId: string): Promise<void> {
  await api.delete(`/restaurant/${restaurantId}/comment/${commentId}`);
}

// --- Upload API Functions ---

async function getPresignedUrl(body: PresignRequest): Promise<PresignResponse> {
  const response = await api.post<PresignResponse>('/upload/presign', body);
  return response.data;
}

/**
 * Uploads an image file (local URI from ImagePicker) to S3 via presigned URL.
 * Request: { contentType, sizeBytes }. Response: { uploadUrl, publicUrl, objectKey, ... }.
 * Uses PUT to uploadUrl with the file body.
 * Returns the public image URL to use in create/update restaurant.
 */
export async function uploadRestaurantImage(fileUri: string): Promise<string> {
  const contentType = fileUri.toLowerCase().endsWith('.png') ? 'image/png' : 'image/jpeg';

  const response = await fetch(fileUri);
  const blob = await response.blob();
  const sizeBytes = blob.size;

  const presign = await getPresignedUrl({ contentType, sizeBytes });

  if (sizeBytes > presign.maxSizeBytes) {
    throw new Error(`El archivo supera el tamaño máximo (${presign.maxSizeBytes} bytes)`);
  }

  const uploadResponse = await fetch(presign.uploadUrl, {
    method: 'PUT',
    body: blob,
    headers: {
      'Content-Type': contentType,
    },
  });

  if (!uploadResponse.ok) {
    const text = await uploadResponse.text();
    throw new Error(text || `Upload failed: ${uploadResponse.status}`);
  }

  return presign.publicUrl;
}

// --- React Query Hooks ---

export const useRestaurantsQuery = (page = 1, limit = 10) =>
  useQuery({
    queryKey: ['restaurants', page, limit],
    queryFn: () => fetchRestaurants(page, limit),
  });

export const useRestaurantDetailQuery = (id: string) =>
  useQuery({
    queryKey: ['restaurant', id],
    queryFn: () => fetchRestaurantDetail(id),
    enabled: !!id,
  });

export const useCreateRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createRestaurant,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useUpdateRestaurantMutation = (id: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateRestaurantDTO) => updateRestaurant(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
      queryClient.invalidateQueries({ queryKey: ['restaurant', id] });
    },
  });
};

export const useDeleteRestaurantMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteRestaurant(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurants'] });
    },
  });
};

export const useCreateCommentMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateCommentDTO) => createComment(restaurantId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

export const useUpdateCommentMutation = (restaurantId: string, commentId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: UpdateCommentDTO) => updateComment(restaurantId, commentId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

export const useDeleteCommentMutation = (restaurantId: string) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: string) => deleteComment(restaurantId, commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['restaurant', restaurantId] });
    },
  });
};

export const usePresignedUrlMutation = () =>
  useMutation({
    mutationFn: (body: PresignRequest) => getPresignedUrl(body),
  });
