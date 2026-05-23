// Singapore Traffic Cameras API Service
// Free, real-time CCTV feed from Data.gov.sg

const API_URL = 'https://api.data.gov.sg/v1/transport/traffic-images';

export interface CameraLocation {
    latitude: number;
    longitude: number;
}

export interface CameraMetadata {
    height: number;
    width: number;
    md5: string;
}

export interface TrafficCamera {
    timestamp: string;
    image: string;
    location: CameraLocation;
    camera_id: string;
    image_metadata: CameraMetadata;
}

export interface TrafficImagesResponse {
    items: Array<{
        timestamp: string;
        cameras: TrafficCamera[];
    }>;
    api_info: {
        status: string;
    };
}

/**
 * Fetch real-time traffic camera images from Singapore Data.gov.sg
 * Updates every 1-2 minutes
 * @returns Promise with camera data
 */
export async function fetchTrafficImages(): Promise<TrafficImagesResponse> {
    try {
        const response = await fetch(API_URL, {
            method: 'GET',
            headers: {
                'Accept': 'application/json',
            },
        });

        if (!response.ok) {
            throw new Error(`API Error: ${response.status} ${response.statusText}`);
        }

        const data: TrafficImagesResponse = await response.json();
        return data;
    } catch (error) {
        console.error('Failed to fetch traffic images:', error);
        throw error;
    }
}

/**
 * Get a specific camera by index
 * @param index Camera index (0-86, total 87 cameras)
 * @returns Single camera data
 */
export async function getCameraByIndex(index: number = 0): Promise<TrafficCamera | null> {
    try {
        const data = await fetchTrafficImages();

        if (data.items.length === 0) {
            throw new Error('No camera data available');
        }

        const cameras = data.items[0].cameras;

        if (index < 0 || index >= cameras.length) {
            console.warn(`Invalid camera index ${index}. Using first camera.`);
            return cameras[0];
        }

        return cameras[index];
    } catch (error) {
        console.error('Failed to get camera:', error);
        return null;
    }
}

/**
 * Get all available cameras
 * @returns Array of all cameras
 */
export async function getAllCameras(): Promise<TrafficCamera[]> {
    try {
        const data = await fetchTrafficImages();

        if (data.items.length === 0) {
            return [];
        }

        return data.items[0].cameras;
    } catch (error) {
        console.error('Failed to get all cameras:', error);
        return [];
    }
}

/**
 * Format camera location name (simplified)
 * @param camera Camera object
 * @returns Readable location string
 */
export function getCameraLocationName(camera: TrafficCamera): string {
    // In production, you would map camera_id to actual location names
    // For now, just return the camera ID
    return `Traffic Camera ${camera.camera_id}`;
}

/**
 * Calculate time since last update
 * @param timestamp ISO timestamp string
 * @returns Human-readable time difference
 */
export function getTimeSinceUpdate(timestamp: string): string {
    const now = new Date();
    const updated = new Date(timestamp);
    const diffMs = now.getTime() - updated.getTime();
    const diffSec = Math.floor(diffMs / 1000);

    if (diffSec < 60) {
        return `${diffSec} seconds ago`;
    } else if (diffSec < 3600) {
        const diffMin = Math.floor(diffSec / 60);
        return `${diffMin} minute${diffMin > 1 ? 's' : ''} ago`;
    } else {
        const diffHour = Math.floor(diffSec / 3600);
        return `${diffHour} hour${diffHour > 1 ? 's' : ''} ago`;
    }
}
