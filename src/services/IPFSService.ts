/**
 * IPFS Service - Handles decentralized storage using Helia (modern IPFS client)
 * 
 * This service provides a modular interface for interacting with IPFS networks
 * to store and retrieve proof-of-report data in a tamper-proof, decentralized manner.
 * 
 * Features:
 * - Connection to public IPFS nodes
 * - JSON data storage and retrieval
 * - Error handling and fallback mechanisms
 * - CID generation and verification
 */

import { createHelia } from 'helia';
import { json } from '@helia/json';
import { strings } from '@helia/strings';
import { webSockets } from '@libp2p/websockets';
import { circuitRelayTransport } from '@libp2p/circuit-relay-v2';
import { all } from '@libp2p/websockets/filters';
import { noise } from '@chainsafe/libp2p-noise';
import { yamux } from '@chainsafe/libp2p-yamux';
import type { Helia } from 'helia';
import type { JSON as HeliaJSON } from '@helia/json';
import type { Strings } from '@helia/strings';

/**
 * Interface for proof-of-report data structure
 */
export interface ProofOfReportData {
  report_id: string;
  timestamp: string; // ISO-8601 format
  city: string;
}

/**
 * IPFS operation result interface
 */
export interface IPFSResult {
  success: boolean;
  cid?: string;
  data?: any;
  error?: string;
}

/**
 * IPFS Service class for handling decentralized storage operations
 */
class IPFSService {
  private helia: Helia | null = null;
  private jsonAPI: HeliaJSON | null = null;
  private stringsAPI: Strings | null = null;
  private isInitialized: boolean = false;
  private initializationPromise: Promise<void> | null = null;

  /**
   * Initialize Helia IPFS node
   * This method is idempotent and can be called multiple times safely
   */
  private async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    if (this.initializationPromise) {
      return this.initializationPromise;
    }

    this.initializationPromise = this._doInitialize();
    return this.initializationPromise;
  }

  /**
   * Internal initialization method with fallback configurations
   */
  private async _doInitialize(): Promise<void> {
    console.log('IPFSService: Initializing Helia node...');

    // Try different configurations in order of preference
    const configurations = [
      // Configuration 1: Full WebSocket + Circuit Relay
      {
        name: 'WebSocket + Circuit Relay',
        config: {
          start: true,
          libp2p: {
            transports: [
              webSockets({ filter: all }),
              circuitRelayTransport()
            ],
            connectionEncrypters: [noise()],
            streamMuxers: [yamux()]
          }
        }
      },
      // Configuration 2: WebSocket only
      {
        name: 'WebSocket only',
        config: {
          start: true,
          libp2p: {
            transports: [webSockets({ filter: all })],
            connectionEncrypters: [noise()],
            streamMuxers: [yamux()]
          }
        }
      },
      // Configuration 3: Default Helia configuration
      {
        name: 'Default',
        config: {
          start: true
        }
      }
    ];

    let lastError: Error | null = null;

    for (const { name, config } of configurations) {
      try {
        console.log(`IPFSService: Trying configuration: ${name}`);
        
        this.helia = await createHelia(config as any);

        // Initialize JSON and strings APIs
        this.jsonAPI = json(this.helia);
        this.stringsAPI = strings(this.helia);

        this.isInitialized = true;
        console.log(`IPFSService: Helia node initialized successfully with ${name} configuration`);

        // Log peer ID for debugging
        console.log('IPFSService: Peer ID:', this.helia.libp2p.peerId.toString());
        
        return; // Success, exit the function

      } catch (error) {
        console.warn(`IPFSService: Configuration "${name}" failed:`, error);
        lastError = error as Error;
        
        // Clean up if initialization failed
        if (this.helia) {
          try {
            await this.helia.stop();
          } catch (stopError) {
            console.warn('IPFSService: Error stopping failed Helia instance:', stopError);
          }
          this.helia = null;
        }
        
        // Continue to next configuration
        continue;
      }
    }

    // If we get here, all configurations failed
    console.error('IPFSService: All initialization configurations failed');
    this.isInitialized = false;
    this.initializationPromise = null;
    
    throw new Error(`Failed to initialize IPFS service with any configuration. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Store JSON data on IPFS and return the Content Identifier (CID)
   * 
   * @param data - The JSON data to store
   * @returns Promise<IPFSResult> - Result containing success status and CID
   */
  async storeJSON(data: ProofOfReportData): Promise<IPFSResult> {
    try {
      await this.initialize();
      
      if (!this.jsonAPI) {
        throw new Error('JSON API not initialized');
      }

      console.log('IPFSService: Storing JSON data:', data);
      
      // Store JSON data and get CID
      const cid = await this.jsonAPI.add(data);
      const cidString = cid.toString();
      
      console.log('IPFSService: JSON data stored successfully with CID:', cidString);
      
      return {
        success: true,
        cid: cidString,
        data: data
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('IPFSService: Failed to store JSON data:', errorMessage);
      
      return {
        success: false,
        error: `Failed to store data on IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Retrieve JSON data from IPFS using a CID
   * 
   * @param cidString - The Content Identifier as a string
   * @returns Promise<IPFSResult> - Result containing success status and retrieved data
   */
  async retrieveJSON(cidString: string): Promise<IPFSResult> {
    try {
      await this.initialize();
      
      if (!this.jsonAPI) {
        throw new Error('JSON API not initialized');
      }

      console.log('IPFSService: Retrieving JSON data for CID:', cidString);
      
      // Validate CID format
      if (!cidString || typeof cidString !== 'string' || cidString.length < 10) {
        throw new Error('Invalid CID format');
      }
      
      // Add timeout to prevent hanging
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('IPFS retrieval timeout after 30 seconds')), 30000);
      });
      
      // Parse CID and retrieve data with timeout
      const data = await Promise.race([
        this.jsonAPI.get(cidString as any),
        timeoutPromise
      ]) as any;
      
      console.log('IPFSService: JSON data retrieved successfully:', data);
      
      return {
        success: true,
        cid: cidString,
        data: data
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error('IPFSService: Failed to retrieve JSON data:', errorMessage);
      console.error('IPFSService: Error details:', error);
      
      return {
        success: false,
        error: `Failed to retrieve data from IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Store a string on IPFS and return the CID
   * 
   * @param text - The string to store
   * @returns Promise<IPFSResult> - Result containing success status and CID
   */
  async storeString(text: string): Promise<IPFSResult> {
    try {
      await this.initialize();
      
      if (!this.stringsAPI) {
        throw new Error('Strings API not initialized');
      }

      console.log('IPFSService: Storing string data');
      
      const cid = await this.stringsAPI.add(text);
      const cidString = cid.toString();
      
      console.log('IPFSService: String data stored successfully with CID:', cidString);
      
      return {
        success: true,
        cid: cidString,
        data: text
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('IPFSService: Failed to store string data:', errorMessage);
      
      return {
        success: false,
        error: `Failed to store string on IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Retrieve a string from IPFS using a CID
   * 
   * @param cidString - The Content Identifier as a string
   * @returns Promise<IPFSResult> - Result containing success status and retrieved string
   */
  async retrieveString(cidString: string): Promise<IPFSResult> {
    try {
      await this.initialize();
      
      if (!this.stringsAPI) {
        throw new Error('Strings API not initialized');
      }

      console.log('IPFSService: Retrieving string data for CID:', cidString);
      
      const data = await this.stringsAPI.get(cidString as any);
      
      console.log('IPFSService: String data retrieved successfully');
      
      return {
        success: true,
        cid: cidString,
        data: data
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('IPFSService: Failed to retrieve string data:', errorMessage);
      
      return {
        success: false,
        error: `Failed to retrieve string from IPFS: ${errorMessage}`
      };
    }
  }

  /**
   * Check if the IPFS service is ready for operations
   * 
   * @returns boolean - True if service is initialized and ready
   */
  isReady(): boolean {
    return this.isInitialized && this.helia !== null;
  }

  /**
   * Get node information for debugging
   * 
   * @returns Object containing node information
   */
  async getNodeInfo(): Promise<{ peerId?: string; isOnline?: boolean; error?: string }> {
    try {
      await this.initialize();
      
      if (!this.helia) {
        return { error: 'Helia node not initialized' };
      }

      return {
        peerId: this.helia.libp2p.peerId.toString(),
        isOnline: this.helia.libp2p.status === 'started'
      };

    } catch (error) {
      return {
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Clean up resources and stop the Helia node
   */
  async cleanup(): Promise<void> {
    try {
      if (this.helia) {
        console.log('IPFSService: Stopping Helia node...');
        await this.helia.stop();
        this.helia = null;
        this.jsonAPI = null;
        this.stringsAPI = null;
        this.isInitialized = false;
        this.initializationPromise = null;
        console.log('IPFSService: Helia node stopped successfully');
      }
    } catch (error) {
      console.error('IPFSService: Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const ipfsService = new IPFSService();

// Export the class for testing purposes
export { IPFSService };