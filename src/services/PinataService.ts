/**
 * Pinata IPFS Service - Simplified and reliable IPFS storage using Pinata
 * 
 * This service provides a much simpler and more reliable way to store proof data
 * on IPFS using Pinata's pinning service. No browser compatibility issues!
 * 
 * Features:
 * - Direct HTTP API to Pinata
 * - No complex P2P networking in browser
 * - Reliable pinning ensures data persistence
 * - Simple JSON storage with instant CID generation
 */

import axios from 'axios';

/**
 * Interface for proof data stored on IPFS
 */
export interface ProofOfReportData {
  report_id: string;
  timestamp: string;
  city: string;
  version: string;
}

/**
 * Interface for Pinata API responses
 */
interface PinataResult {
  success: boolean;
  cid?: string;
  data?: ProofOfReportData;
  error?: string;
}

/**
 * Pinata IPFS Service class
 */
class PinataService {
  private apiKey: string;
  private apiSecret: string;
  private baseUrl = 'https://api.pinata.cloud';

  constructor() {
    // Get Pinata credentials from environment variables
    this.apiKey = import.meta.env.VITE_PINATA_API_KEY || '';
    this.apiSecret = import.meta.env.VITE_PINATA_SECRET_API_KEY || '';
    
    if (!this.apiKey || !this.apiSecret) {
      console.warn('PinataService: API credentials not configured. Proof storage will be disabled.');
    }
  }

  /**
   * Check if Pinata is properly configured
   */
  private isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret);
  }

  /**
   * Get Pinata request headers
   */
  private getHeaders() {
    return {
      'pinata_api_key': this.apiKey,
      'pinata_secret_api_key': this.apiSecret,
      'Content-Type': 'application/json'
    };
  }

  /**
   * Store JSON data on IPFS via Pinata
   * 
   * @param data - The JSON data to store
   * @returns Promise<PinataResult> - Result containing success status and CID
   */
  async storeJSON(data: ProofOfReportData): Promise<PinataResult> {
    try {
      if (!this.isConfigured()) {
        console.warn('PinataService: Not configured, returning mock CID');
        // Return a mock result for development/testing
        return {
          success: true,
          cid: `mock_${Date.now()}_${data.report_id}`,
          data: data
        };
      }

      console.log('PinataService: Storing JSON data on IPFS via Pinata');

      const response = await axios.post(
        `${this.baseUrl}/pinning/pinJSONToIPFS`,
        {
          pinataContent: data,
          pinataMetadata: {
            name: `proof_${data.report_id}`,
            keyvalues: {
              report_id: data.report_id,
              city: data.city,
              type: 'proof_of_report'
            }
          },
          pinataOptions: {
            cidVersion: 1
          }
        },
        {
          headers: this.getHeaders(),
          timeout: 30000 // 30 second timeout
        }
      );

      if (response.data && response.data.IpfsHash) {
        console.log('PinataService: JSON data stored successfully:', response.data.IpfsHash);
        
        return {
          success: true,
          cid: response.data.IpfsHash,
          data: data
        };
      } else {
        throw new Error('Invalid response from Pinata API');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error('PinataService: Failed to store JSON data:', errorMessage);
      
      return {
        success: false,
        error: `Failed to store data on IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Retrieve JSON data from IPFS using a CID (via IPFS gateway)
   * 
   * @param cidString - The Content Identifier as a string
   * @returns Promise<PinataResult> - Result containing success status and retrieved data
   */
  async retrieveJSON(cidString: string): Promise<PinataResult> {
    try {
      console.log('PinataService: Retrieving JSON data for CID:', cidString);
      
      // Handle mock CIDs for development
      if (cidString.startsWith('mock_')) {
        console.log('PinataService: Mock CID detected, returning sample data');
        const reportId = cidString.split('_')[2];
        return {
          success: true,
          cid: cidString,
          data: {
            report_id: reportId,
            timestamp: new Date().toISOString(),
            city: 'Mock City',
            version: '1.0.0'
          }
        };
      }

      // Validate CID format
      if (!cidString || typeof cidString !== 'string' || cidString.length < 10) {
        throw new Error('Invalid CID format');
      }
      
      // Use IPFS gateway to retrieve data
      const gatewayUrl = `https://gateway.pinata.cloud/ipfs/${cidString}`;
      
      const response = await axios.get(gatewayUrl, {
        timeout: 30000, // 30 second timeout
        headers: {
          'Accept': 'application/json'
        }
      });

      if (response.data) {
        console.log('PinataService: JSON data retrieved successfully:', response.data);
        
        return {
          success: true,
          cid: cidString,
          data: response.data
        };
      } else {
        throw new Error('No data received from IPFS gateway');
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error('PinataService: Failed to retrieve JSON data:', errorMessage);
      console.error('PinataService: Error details:', error);
      
      return {
        success: false,
        error: `Failed to retrieve data from IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Get statistics about pinned content (if configured)
   */
  async getStats(): Promise<{ pinCount: number; totalSize: number } | null> {
    try {
      if (!this.isConfigured()) {
        return null;
      }

      const response = await axios.get(
        `${this.baseUrl}/data/userPinnedDataTotal`,
        {
          headers: this.getHeaders(),
          timeout: 10000
        }
      );

      return {
        pinCount: response.data.pin_count || 0,
        totalSize: response.data.pin_size_total || 0
      };

    } catch (error) {
      console.error('PinataService: Failed to get stats:', error);
      return null;
    }
  }

  /**
   * Test Pinata connection
   */
  async testConnection(): Promise<boolean> {
    try {
      if (!this.isConfigured()) {
        console.log('PinataService: Not configured, connection test skipped');
        return false;
      }

      const response = await axios.get(
        `${this.baseUrl}/data/testAuthentication`,
        {
          headers: this.getHeaders(),
          timeout: 10000
        }
      );

      return response.data && response.data.message === 'Congratulations! You are communicating with the Pinata API!';

    } catch (error) {
      console.error('PinataService: Connection test failed:', error);
      return false;
    }
  }
}

// Export singleton instance
export const pinataService = new PinataService();
export default pinataService;