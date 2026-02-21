# Pinata IPFS Setup Guide

## Overview
The Nivaran platform uses Pinata as the IPFS provider for decentralized proof-of-report storage. This simplified approach replaces complex browser-based IPFS networking with reliable HTTP API calls.

## Account Setup

### 1. Create Pinata Account
1. Visit [https://pinata.cloud](https://pinata.cloud)
2. Sign up for a free account
3. Free tier includes 1GB storage and 100,000 requests/month

### 2. Generate API Keys
1. Go to the Pinata dashboard
2. Navigate to "API Keys" section
3. Click "New Key"
4. Select the following permissions:
   - `pinFileToIPFS`
   - `pinJSONToIPFS`
   - `unpin`
   - `userPinList`
5. Give your key a descriptive name (e.g., "Nivaran Development")
6. Copy the API Key and Secret

## Environment Configuration

### 1. Create Environment File
Copy `.env.example` to `.env` and add your Pinata credentials:

```env
# Pinata IPFS Configuration
VITE_PINATA_API_KEY=your_api_key_here
VITE_PINATA_SECRET_API_KEY=your_secret_key_here
VITE_PINATA_JWT=your_jwt_token_here
```

### 2. Environment Variables Explanation
- `VITE_PINATA_API_KEY`: Your Pinata API key
- `VITE_PINATA_SECRET_API_KEY`: Your Pinata secret key
- `VITE_PINATA_JWT`: JWT token (if using newer Pinata authentication)

## Testing the Connection

### 1. Run API Key Test
```bash
npm run test:pinata
```

### 2. Manual Testing
Visit the API key tester at `/api-key-tester.html` and enter your credentials to verify connectivity.

## Development vs Production

### Development Mode
- When no API keys are provided, the service runs in mock mode
- Generates fake IPFS hashes for testing
- No actual data is stored on IPFS

### Production Mode
- Requires valid Pinata API credentials
- All proof data is stored on IPFS via Pinata
- Provides real decentralized storage

## Proof of Report Architecture

### Simplified Approach
The new proof system follows a simplified philosophy:
- **If proof is generated → Audit is complete**
- No complex verification requirements
- Focus on proof existence rather than cryptographic validation

### Data Structure
```json
{
  "reportId": "report_123",
  "timestamp": "2024-01-15T10:30:00Z",
  "proofHash": "QmXxXxXxXxXxXxXxXxXx",
  "status": "proven",
  "metadata": {
    "category": "infrastructure",
    "location": "coordinates",
    "description": "Brief description"
  }
}
```

### IPFS Gateway Access
Proofs can be viewed via IPFS gateways:
- Pinata Gateway: `https://gateway.pinata.cloud/ipfs/{hash}`
- Public Gateway: `https://ipfs.io/ipfs/{hash}`

## Cost Considerations

### Free Tier Limits
- 1GB storage
- 100,000 requests/month
- Rate limiting applies

### Paid Plans
- Pro: $20/month - 100GB storage, 1M requests
- Enterprise: Custom pricing for higher usage

## Security Best Practices

1. **Environment Variables**: Never commit API keys to version control
2. **Key Rotation**: Regularly rotate API keys
3. **Permissions**: Use minimal required permissions for API keys
4. **Rate Limiting**: Implement client-side rate limiting to avoid quota exhaustion

## Troubleshooting

### Common Issues
1. **401 Unauthorized**: Check API key validity
2. **403 Forbidden**: Verify API key permissions
3. **429 Rate Limited**: Reduce request frequency
4. **Network Errors**: Check internet connectivity

### Debug Mode
Enable detailed logging by setting:
```env
VITE_DEBUG_PINATA=true
```

## Migration from Complex IPFS

The new Pinata service replaces the previous complex Helia-based IPFS implementation:

### Removed Dependencies
- `@helia/unixfs`
- `@helia/block-brokers`
- `@chainsafe/libp2p-*`
- Complex WebRTC configurations

### Benefits
- Reliable HTTP API instead of P2P networking
- No browser compatibility issues
- Simplified error handling
- Better performance and stability

## Support

For Pinata-specific issues:
- [Pinata Documentation](https://docs.pinata.cloud/)
- [Pinata Support](https://pinata.cloud/support)

For Nivaran integration issues:
- Check the console for detailed error messages
- Verify environment variables are correctly set
- Test API connectivity using the built-in tester