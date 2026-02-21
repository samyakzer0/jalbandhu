export interface EarthquakeEvent {
    id: string;
    place: string;
    magnitude: number;
    time: number;
    url: string;
    coordinates: [number, number, number]; // lon, lat, depth
}

const BASE_URL = 'https://earthquake.usgs.gov/fdsnws/event/1/query';

export const getNearbyEarthquakes = async (lat: number, lon: number, radiusKm: number = 500): Promise<EarthquakeEvent[]> => {
    try {
        // Format: ISO8601
        const today = new Date();
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(today.getDate() - 30);

        const startTime = thirtyDaysAgo.toISOString();
        const endTime = today.toISOString();

        const url = `${BASE_URL}?format=geojson&starttime=${startTime}&endtime=${endTime}&latitude=${lat}&longitude=${lon}&maxradiuskm=${radiusKm}&minmagnitude=2.5&orderby=time&limit=5`;

        const response = await fetch(url);
        if (!response.ok) throw new Error('Earthquake fetch failed');

        const data = await response.json();

        return data.features.map((feature: any) => ({
            id: feature.id,
            place: feature.properties.place,
            magnitude: feature.properties.mag,
            time: feature.properties.time,
            url: feature.properties.url,
            coordinates: feature.geometry.coordinates
        }));

    } catch (error) {
        console.error("Earthquake Service Error:", error);
        return [];
    }
};
