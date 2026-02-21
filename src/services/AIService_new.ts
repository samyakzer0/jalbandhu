/**
 * AI Image Analysis Service using Clarifai
 * Clarifai offers a robust free tier with their General Image Recognition model
 */

// Interface for AI analysis result
export interface AIAnalysisResult {
  title: string;
  category: string;
  description: string;
  confidence: number;
}

// Clarifai API configuration
const CLARIFAI_API_KEY = import.meta.env.VITE_CLARIFAI_API_KEY;
const CLARIFAI_USER_ID = 'clarifai'; // Clarifai's public models use 'clarifai' as user ID
const CLARIFAI_APP_ID = 'main'; // Public models are in the 'main' app
const CLARIFAI_MODEL_ID = 'general-image-recognition'; // Free model for general image classification
const CLARIFAI_API_BASE = 'https://api.clarifai.com/v2';

// Main image analysis function using Clarifai
export const analyzeImage = async (imageData: string): Promise<AIAnalysisResult> => {
  try {
    // Check if API key is provided
    if (!CLARIFAI_API_KEY || CLARIFAI_API_KEY === 'your_clarifai_api_key_here') {
      console.warn('Clarifai API key not provided. Using fallback analysis.');
      return fallbackAnalysis(imageData);
    }

    // Check if we should force fallback for testing
    const forceFallback = import.meta.env.VITE_FORCE_AI_FALLBACK === 'true';
    if (forceFallback) {
      console.warn('Fallback forced. Using mock analysis.');
      const mockResult = fallbackAnalysis(imageData);
      mockResult.description = '[MOCK DATA] ' + mockResult.description;
      return mockResult;
    }

    console.log('Starting Clarifai image analysis...');

    // Prepare the image data for Clarifai API
    const base64Data = imageData.replace(/^data:image\/[a-z]+;base64,/, '');

    // Prepare the API request
    const requestBody = {
      user_app_id: {
        user_id: CLARIFAI_USER_ID,
        app_id: CLARIFAI_APP_ID
      },
      inputs: [{
        data: {
          image: {
            base64: base64Data
          }
        }
      }]
    };

    // Make API call to Clarifai
    const response = await fetch(`${CLARIFAI_API_BASE}/models/${CLARIFAI_MODEL_ID}/outputs`, {
      method: 'POST',
      headers: {
        'Authorization': `Key ${CLARIFAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    if (!response.ok) {
      throw new Error(`Clarifai API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();

    // Check if we got valid results
    if (!data.outputs || !data.outputs[0] || !data.outputs[0].data || !data.outputs[0].data.concepts) {
      throw new Error('Invalid response format from Clarifai API');
    }

    const concepts = data.outputs[0].data.concepts;
    const result = processClarifaiResults(concepts);
    
    console.log('Clarifai analysis completed:', result);
    return result;

  } catch (error) {
    console.error('Error analyzing image with Clarifai:', error);
    console.log('Falling back to mock analysis due to error');
    return fallbackAnalysis(imageData);
  }
};

/**
 * Process Clarifai API results into Nivaran format
 */
function processClarifaiResults(concepts: any[]): AIAnalysisResult {
  try {
    // Map Clarifai concepts to civic categories
    const categoryMapping: Record<string, string> = {
      // Water related
      'water': 'Water',
      'pipe': 'Water',
      'leak': 'Water',
      'flood': 'Water',
      'fountain': 'Water',
      'puddle': 'Water',
      'river': 'Water',
      'lake': 'Water',
      'plumbing': 'Water',
      'drainage': 'Water',

      // Electricity related
      'light': 'Electricity',
      'lamp': 'Electricity',
      'bulb': 'Electricity',
      'streetlight': 'Electricity',
      'electric': 'Electricity',
      'power': 'Electricity',
      'wire': 'Electricity',
      'cable': 'Electricity',
      'pole': 'Electricity',
      'electrical': 'Electricity',

      // Infrastructure related
      'road': 'Roads',
      'street': 'Roads',
      'highway': 'Roads',
      'path': 'Roads',
      'sidewalk': 'Roads',
      'pavement': 'Roads',
      'building': 'Infrastructure',
      'bridge': 'Infrastructure',
      'construction': 'Infrastructure',
      'wall': 'Infrastructure',
      'house': 'Infrastructure',
      'structure': 'Infrastructure',

      // Sanitation related
      'garbage': 'Sanitation',
      'trash': 'Sanitation',
      'waste': 'Sanitation',
      'bin': 'Sanitation',
      'litter': 'Sanitation',
      'dumpster': 'Sanitation',
      'debris': 'Sanitation',
      'dirty': 'Sanitation',
      'pollution': 'Sanitation'
    };

    // Find the most relevant civic category
    let bestCategory = 'Others';
    let bestScore = 0;
    const topConcepts = concepts.slice(0, 5); // Top 5 concepts

    for (const concept of topConcepts) {
      const name = concept.name.toLowerCase();
      const score = concept.value;

      for (const [keyword, category] of Object.entries(categoryMapping)) {
        if (name.includes(keyword) || keyword.includes(name)) {
          if (score > bestScore) {
            bestCategory = category;
            bestScore = score;
          }
        }
      }
    }

    // Generate title based on category and top concept
    const topConcept = topConcepts[0]?.name || '';
    const title = generateTitle(bestCategory, topConcept);

    // Generate description
    const conceptDescriptions = topConcepts.map(c =>
      `${c.name} (${(c.value * 100).toFixed(1)}%)`
    );
    const description = `AI detected: ${conceptDescriptions.join(', ')}`;

    return {
      title,
      category: bestCategory,
      description,
      confidence: topConcepts[0]?.value || 0.5
    };
  } catch (error) {
    console.error('Error processing Clarifai results:', error);
    // Return a generic result if parsing fails
    return {
      title: 'Civic Issue Detected',
      category: 'Others',
      description: 'An issue was detected but could not be classified automatically. Please provide more details.',
      confidence: 0.5
    };
  }
}

/**
 * Generate appropriate title based on category and detected object
 */
function generateTitle(category: string, topConcept: string): string {
  const concept = topConcept.toLowerCase();

  switch (category) {
    case 'Water':
      if (concept.includes('leak') || concept.includes('pipe')) return 'Water Leakage';
      if (concept.includes('flood') || concept.includes('flooding')) return 'Water Flooding';
      if (concept.includes('drainage') || concept.includes('drain')) return 'Drainage Issue';
      return 'Water Issue';

    case 'Electricity':
      if (concept.includes('light') || concept.includes('lamp')) return 'Streetlight Issue';
      if (concept.includes('power') || concept.includes('electric')) return 'Power Issue';
      if (concept.includes('wire') || concept.includes('cable')) return 'Electrical Wiring Issue';
      return 'Electrical Problem';

    case 'Roads':
      if (concept.includes('pothole') || concept.includes('damage')) return 'Road Damage';
      if (concept.includes('crack') || concept.includes('broken')) return 'Road Surface Issue';
      if (concept.includes('sidewalk') || concept.includes('path')) return 'Sidewalk Issue';
      return 'Road Issue';

    case 'Sanitation':
      if (concept.includes('garbage') || concept.includes('trash')) return 'Garbage Disposal Issue';
      if (concept.includes('overflow') || concept.includes('full')) return 'Bin Overflow';
      if (concept.includes('litter') || concept.includes('debris')) return 'Littering Problem';
      return 'Sanitation Problem';

    case 'Infrastructure':
      if (concept.includes('building') || concept.includes('structure')) return 'Building Issue';
      if (concept.includes('bridge')) return 'Bridge Problem';
      if (concept.includes('wall') || concept.includes('fence')) return 'Structure Damage';
      return 'Infrastructure Issue';

    default:
      return 'Civic Issue Detected';
  }
}

/**
 * Fallback mock analysis for when Clarifai API is unavailable or fails
 */
function fallbackAnalysis(imageData: string): AIAnalysisResult {
  // Simple mock implementation that uses image data length as a deterministic way to choose responses
  const mockResponses = [
    {
      title: 'Streetlight not working',
      category: 'Electricity',
      description: 'A streetlight appears to be malfunctioning or not illuminating properly.',
      confidence: 0.92
    },
    {
      title: 'Water leakage',
      category: 'Water',
      description: 'There is a water pipe leakage that needs immediate attention.',
      confidence: 0.89
    },
    {
      title: 'Damaged road/pothole',
      category: 'Roads',
      description: 'The road surface is damaged with a significant pothole that poses risk to vehicles.',
      confidence: 0.95
    },
    {
      title: 'Fallen tree branch',
      category: 'Infrastructure',
      description: 'A large tree branch has fallen and is blocking the pathway.',
      confidence: 0.87
    },
    {
      title: 'Overflowing garbage bin',
      category: 'Sanitation',
      description: 'Garbage bin is overflowing and needs to be collected.',
      confidence: 0.91
    }
  ];

  // Use image data to deterministically select a mock response
  const hashCode = imageData.split('').reduce((acc, char, i) => {
    // Only use a subset of chars to reduce computation
    if (i % 100 === 0) {
      return acc + char.charCodeAt(0);
    }
    return acc;
  }, 0);
  
  const mockResult = mockResponses[hashCode % mockResponses.length];
  
  return mockResult;
}
