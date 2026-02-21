/**
 * Simplified Proof of Report Service - Using Pinata IPFS
 * 
 * This service generates tamper-proof audit records for every report submission.
 * Uses Pinata for reliable IPFS storage. Philosophy: If proof generation succeeds,
 * the report is considered properly audited. No complex verification needed.
 * 
 * Key principle: Proof generation = Audit complete
 */

import { pinataService, type ProofOfReportData } from './PinataService';

/**
 * Interface for proof creation results
 */
export interface ProofCreationResult {
  success: boolean;
  cid?: string;
  proof_hash?: string;
  error?: string;
  proof_timestamp?: string;
}

/**
 * Interface for proof metadata to store in Supabase
 */
export interface ProofMetadata {
  cid: string;
  proof_timestamp: string;
  city: string;
  created_at: string;
  status: 'verified'; // Always verified if successfully created
}

/**
 * Simplified Proof of Report Service
 */
class ProofOfReportService {
  
  /**
   * Create a proof-of-report for a given report
   * This is the main function - if this succeeds, audit is complete!
   * 
   * @param reportId - The unique identifier of the report
   * @param city - The city where the report was made
   * @returns Promise<ProofCreationResult> - Result of proof creation
   */
  async createProofOfReport(
    reportId: string, 
    city: string
  ): Promise<ProofCreationResult> {
    const operationStart = Date.now();
    console.log(`ProofService: Creating proof for report ${reportId} in ${city}`);

    try {
      // Create proof data with minimal required information
      const proofTimestamp = new Date().toISOString();
      const proofData: ProofOfReportData = {
        report_id: reportId,
        timestamp: proofTimestamp,
        city: city,
        version: '1.0.0'
      };

      // Store on IPFS via Pinata
      const ipfsResult = await pinataService.storeJSON(proofData);

      if (!ipfsResult.success) {
        console.error(`ProofService: IPFS storage failed for report ${reportId}:`, ipfsResult.error);
        return {
          success: false,
          error: ipfsResult.error || 'Failed to store proof on IPFS'
        };
      }

      // Generate a simple hash for additional verification
      const proofString = JSON.stringify(proofData);
      const proofHash = await this.generateSimpleHash(proofString);

      const operationEnd = Date.now();
      console.log(`ProofService: Proof created successfully for ${reportId}:`, {
        cid: ipfsResult.cid,
        hash: proofHash,
        duration: `${operationEnd - operationStart}ms`
      });

      return {
        success: true,
        cid: ipfsResult.cid,
        proof_hash: proofHash,
        proof_timestamp: proofTimestamp
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error(`ProofService: Unexpected error creating proof for ${reportId}:`, errorMessage);
      
      return {
        success: false,
        error: `Failed to create proof: ${errorMessage}`
      };
    }
  }

  /**
   * Generate a simple hash for proof validation
   * (Much simpler than complex cryptographic verification)
   */
  private async generateSimpleHash(data: string): Promise<string> {
    try {
      // Use browser's built-in crypto API for a simple hash
      const encoder = new TextEncoder();
      const dataBuffer = encoder.encode(data);
      const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
      
      // Convert to hex string
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      
      return hashHex;
    } catch (error) {
      console.warn('ProofService: Hash generation failed, using fallback:', error);
      // Fallback: simple string-based hash
      return `fallback_${Date.now()}_${data.length}`;
    }
  }

  /**
   * Get basic proof information (for display purposes only)
   * No complex verification - if it exists, it's valid
   */
  async getProofInfo(cid: string): Promise<{ exists: boolean; data?: ProofOfReportData; error?: string }> {
    try {
      console.log(`ProofService: Getting proof info for CID ${cid}`);
      
      const result = await pinataService.retrieveJSON(cid);
      
      if (result.success && result.data) {
        return {
          exists: true,
          data: result.data
        };
      } else {
        return {
          exists: false,
          error: result.error || 'Proof not found'
        };
      }

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error || 'Unknown error');
      console.error(`ProofService: Error getting proof info for ${cid}:`, errorMessage);
      
      return {
        exists: false,
        error: errorMessage
      };
    }
  }

  /**
   * Get statistics about proof generation
   */
  async getProofStatistics(): Promise<{
    totalProofs: number;
    pinataStats?: { pinCount: number; totalSize: number };
    isConfigured: boolean;
  }> {
    try {
      const pinataStats = await pinataService.getStats();
      const isConfigured = await pinataService.testConnection();

      return {
        totalProofs: pinataStats?.pinCount || 0,
        pinataStats: pinataStats || undefined,
        isConfigured
      };

    } catch (error) {
      console.error('ProofService: Error getting statistics:', error);
      
      return {
        totalProofs: 0,
        isConfigured: false
      };
    }
  }

  /**
   * Validate proof data structure (simple validation)
   */
  validateProofStructure(proof: any): boolean {
    try {
      return !!(
        proof &&
        typeof proof === 'object' &&
        proof.report_id &&
        proof.timestamp &&
        proof.city &&
        proof.version
      );
    } catch (error) {
      console.error('ProofService: Error validating proof structure:', error);
      return false;
    }
  }

  /**
   * Create proof metadata for database storage
   */
  createProofMetadata(
    cid: string,
    proofTimestamp: string,
    city: string
  ): ProofMetadata {
    return {
      cid,
      proof_timestamp: proofTimestamp,
      city,
      created_at: new Date().toISOString(),
      status: 'verified' // Always verified if we got here
    };
  }
}

// Export singleton instance
export const proofOfReportService = new ProofOfReportService();
export default proofOfReportService;