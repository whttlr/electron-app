# Plugin Signature Verification Guide

## Overview

The CNC Jog Controls application implements a comprehensive plugin signature verification system to ensure plugin authenticity, integrity, and security. This guide covers the cryptographic signing process, verification mechanisms, build integration, and security best practices for plugin development and distribution.

## Table of Contents

1. [Signature System Architecture](#signature-system-architecture)
2. [Cryptographic Implementation](#cryptographic-implementation)
3. [Plugin Signing Process](#plugin-signing-process)
4. [Verification Workflow](#verification-workflow)
5. [Build Integration](#build-integration)
6. [Certificate Management](#certificate-management)
7. [Security Policies](#security-policies)
8. [CI/CD Integration](#cicd-integration)
9. [Plugin Store Integration](#plugin-store-integration)
10. [Troubleshooting](#troubleshooting)
11. [Security Best Practices](#security-best-practices)

---

## Signature System Architecture

### Signature Infrastructure Overview

```
Plugin Signature Ecosystem
├── Signing Authority
│   ├── Root Certificate Authority (CA)
│   ├── Intermediate CA (Plugin Signing)
│   └── Code Signing Certificates
├── Plugin Developers
│   ├── Developer Certificates
│   ├── Signing Tools
│   └── Plugin Packages
├── Distribution System
│   ├── Plugin Store
│   ├── Signature Database
│   └── Verification API
└── Application Runtime
    ├── Signature Verifier
    ├── Trust Store
    └── Policy Enforcement
```

### Core Components

```typescript
// src/services/plugin-signature/types.ts
export interface PluginSignature {
  version: string;
  algorithm: SignatureAlgorithm;
  timestamp: Date;
  signer: SignerInfo;
  signature: string;
  metadata: SignatureMetadata;
}

export interface SignerInfo {
  commonName: string;
  organization?: string;
  email?: string;
  certificateFingerprint: string;
  issuer: string;
  validFrom: Date;
  validTo: Date;
}

export interface SignatureMetadata {
  pluginId: string;
  pluginVersion: string;
  fileHash: string;
  hashAlgorithm: HashAlgorithm;
  manifestHash: string;
  buildInfo?: BuildInfo;
}

export interface BuildInfo {
  buildId: string;
  buildTimestamp: Date;
  sourceCommit: string;
  environment: 'development' | 'staging' | 'production';
  reproducible: boolean;
}

export type SignatureAlgorithm = 'RSA-PSS' | 'ECDSA-P256' | 'EdDSA';
export type HashAlgorithm = 'SHA-256' | 'SHA-384' | 'SHA-512';
```

---

## Cryptographic Implementation

### Signature Service

```typescript
// src/services/plugin-signature/signature-service.ts
import * as crypto from 'crypto';
import * as forge from 'node-forge';

export class PluginSignatureService {
  private signingKey: forge.pki.PrivateKey | null = null;
  private certificate: forge.pki.Certificate | null = null;
  private trustedCertificates: Map<string, forge.pki.Certificate> = new Map();

  constructor(private config: SignatureConfig) {
    this.loadSigningCredentials();
    this.loadTrustedCertificates();
  }

  async signPlugin(
    pluginData: Buffer,
    manifest: PluginManifest,
    signingOptions: SigningOptions = {}
  ): Promise<PluginSignature> {
    if (!this.signingKey || !this.certificate) {
      throw new Error('Signing credentials not loaded');
    }

    try {
      // Calculate plugin hash
      const fileHash = this.calculateHash(pluginData, signingOptions.hashAlgorithm || 'SHA-256');
      
      // Calculate manifest hash
      const manifestData = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');
      const manifestHash = this.calculateHash(manifestData, signingOptions.hashAlgorithm || 'SHA-256');

      // Create signature payload
      const signaturePayload = this.createSignaturePayload({
        pluginId: manifest.id,
        pluginVersion: manifest.version,
        fileHash,
        manifestHash,
        hashAlgorithm: signingOptions.hashAlgorithm || 'SHA-256',
        buildInfo: signingOptions.buildInfo
      });

      // Sign the payload
      const signature = this.createSignature(signaturePayload, signingOptions.algorithm || 'RSA-PSS');

      // Create signature object
      const pluginSignature: PluginSignature = {
        version: '1.0',
        algorithm: signingOptions.algorithm || 'RSA-PSS',
        timestamp: new Date(),
        signer: this.extractSignerInfo(this.certificate),
        signature,
        metadata: {
          pluginId: manifest.id,
          pluginVersion: manifest.version,
          fileHash,
          manifestHash,
          hashAlgorithm: signingOptions.hashAlgorithm || 'SHA-256',
          buildInfo: signingOptions.buildInfo
        }
      };

      return pluginSignature;
    } catch (error) {
      console.error('Plugin signing failed:', error);
      throw new Error(`Failed to sign plugin: ${error.message}`);
    }
  }

  async verifyPlugin(
    pluginData: Buffer,
    manifest: PluginManifest,
    signature: PluginSignature
  ): Promise<VerificationResult> {
    const result: VerificationResult = {
      valid: false,
      trusted: false,
      errors: [],
      warnings: [],
      signerInfo: signature.signer,
      verifiedAt: new Date()
    };

    try {
      // Verify signature format
      if (!this.validateSignatureFormat(signature)) {
        result.errors.push('Invalid signature format');
        return result;
      }

      // Verify certificate
      const certificateVerification = await this.verifyCertificate(signature.signer);
      if (!certificateVerification.valid) {
        result.errors.push(`Certificate verification failed: ${certificateVerification.reason}`);
        return result;
      }

      result.trusted = certificateVerification.trusted;

      // Verify file integrity
      const fileHash = this.calculateHash(pluginData, signature.metadata.hashAlgorithm);
      if (fileHash !== signature.metadata.fileHash) {
        result.errors.push('Plugin file integrity check failed');
        return result;
      }

      // Verify manifest integrity
      const manifestData = Buffer.from(JSON.stringify(manifest, null, 2), 'utf8');
      const manifestHash = this.calculateHash(manifestData, signature.metadata.hashAlgorithm);
      if (manifestHash !== signature.metadata.manifestHash) {
        result.errors.push('Plugin manifest integrity check failed');
        return result;
      }

      // Verify cryptographic signature
      const signaturePayload = this.createSignaturePayload(signature.metadata);
      const signatureValid = await this.verifySignature(
        signaturePayload,
        signature.signature,
        signature.signer.certificateFingerprint,
        signature.algorithm
      );

      if (!signatureValid) {
        result.errors.push('Cryptographic signature verification failed');
        return result;
      }

      // Check expiration
      if (new Date() > signature.signer.validTo) {
        result.errors.push('Signing certificate has expired');
        return result;
      }

      // Check if signature is too old
      const maxAge = 365 * 24 * 60 * 60 * 1000; // 1 year
      if (Date.now() - signature.timestamp.getTime() > maxAge) {
        result.warnings.push('Signature is older than 1 year');
      }

      result.valid = true;
    } catch (error) {
      result.errors.push(`Verification error: ${error.message}`);
    }

    return result;
  }

  private loadSigningCredentials(): void {
    try {
      if (this.config.signingKeyPath && this.config.certificatePath) {
        const keyPem = require('fs').readFileSync(this.config.signingKeyPath, 'utf8');
        const certPem = require('fs').readFileSync(this.config.certificatePath, 'utf8');

        this.signingKey = forge.pki.privateKeyFromPem(keyPem);
        this.certificate = forge.pki.certificateFromPem(certPem);
      }
    } catch (error) {
      console.warn('Failed to load signing credentials:', error);
    }
  }

  private loadTrustedCertificates(): void {
    try {
      // Load trusted CA certificates
      const trustedCerts = this.config.trustedCertificates || [];
      
      for (const certData of trustedCerts) {
        try {
          let cert: forge.pki.Certificate;
          
          if (certData.startsWith('-----BEGIN CERTIFICATE-----')) {
            cert = forge.pki.certificateFromPem(certData);
          } else {
            // Assume it's a file path
            const certPem = require('fs').readFileSync(certData, 'utf8');
            cert = forge.pki.certificateFromPem(certPem);
          }

          const fingerprint = this.calculateCertificateFingerprint(cert);
          this.trustedCertificates.set(fingerprint, cert);
        } catch (error) {
          console.warn(`Failed to load trusted certificate: ${certData}`, error);
        }
      }
    } catch (error) {
      console.warn('Failed to load trusted certificates:', error);
    }
  }

  private calculateHash(data: Buffer, algorithm: HashAlgorithm): string {
    const hashAlgorithmMap = {
      'SHA-256': 'sha256',
      'SHA-384': 'sha384',
      'SHA-512': 'sha512'
    };

    const hash = crypto.createHash(hashAlgorithmMap[algorithm]);
    hash.update(data);
    return hash.digest('hex');
  }

  private createSignaturePayload(metadata: SignatureMetadata): string {
    // Create a canonical representation of the data to be signed
    const payload = {
      pluginId: metadata.pluginId,
      pluginVersion: metadata.pluginVersion,
      fileHash: metadata.fileHash,
      manifestHash: metadata.manifestHash,
      hashAlgorithm: metadata.hashAlgorithm,
      buildInfo: metadata.buildInfo
    };

    return JSON.stringify(payload, Object.keys(payload).sort());
  }

  private createSignature(payload: string, algorithm: SignatureAlgorithm): string {
    if (!this.signingKey) {
      throw new Error('No signing key available');
    }

    const payloadBuffer = Buffer.from(payload, 'utf8');

    switch (algorithm) {
      case 'RSA-PSS':
        return this.createRSAPSSSignature(payloadBuffer);
      case 'ECDSA-P256':
        return this.createECDSASignature(payloadBuffer);
      case 'EdDSA':
        return this.createEdDSASignature(payloadBuffer);
      default:
        throw new Error(`Unsupported signature algorithm: ${algorithm}`);
    }
  }

  private createRSAPSSSignature(data: Buffer): string {
    const md = forge.md.sha256.create();
    md.update(data.toString('binary'));

    const pss = forge.pss.create({
      md: forge.md.sha256.create(),
      mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
      saltLength: 32
    });

    const signature = this.signingKey!.sign(md, pss);
    return forge.util.encode64(signature);
  }

  private createECDSASignature(data: Buffer): string {
    // Implementation for ECDSA signatures
    throw new Error('ECDSA signatures not yet implemented');
  }

  private createEdDSASignature(data: Buffer): string {
    // Implementation for EdDSA signatures
    throw new Error('EdDSA signatures not yet implemented');
  }

  private async verifySignature(
    payload: string,
    signature: string,
    certificateFingerprint: string,
    algorithm: SignatureAlgorithm
  ): Promise<boolean> {
    const certificate = this.trustedCertificates.get(certificateFingerprint);
    if (!certificate) {
      throw new Error('Certificate not found in trust store');
    }

    const publicKey = certificate.publicKey;
    const signatureBytes = forge.util.decode64(signature);
    const payloadBuffer = Buffer.from(payload, 'utf8');

    switch (algorithm) {
      case 'RSA-PSS':
        return this.verifyRSAPSSSignature(payloadBuffer, signatureBytes, publicKey);
      case 'ECDSA-P256':
        return this.verifyECDSASignature(payloadBuffer, signatureBytes, publicKey);
      case 'EdDSA':
        return this.verifyEdDSASignature(payloadBuffer, signatureBytes, publicKey);
      default:
        throw new Error(`Unsupported signature algorithm: ${algorithm}`);
    }
  }

  private verifyRSAPSSSignature(
    data: Buffer,
    signature: string,
    publicKey: forge.pki.PublicKey
  ): boolean {
    const md = forge.md.sha256.create();
    md.update(data.toString('binary'));

    const pss = forge.pss.create({
      md: forge.md.sha256.create(),
      mgf: forge.mgf.mgf1.create(forge.md.sha256.create()),
      saltLength: 32
    });

    return publicKey.verify(md.digest().bytes(), signature, pss);
  }

  private verifyECDSASignature(
    data: Buffer,
    signature: string,
    publicKey: forge.pki.PublicKey
  ): boolean {
    // Implementation for ECDSA verification
    throw new Error('ECDSA verification not yet implemented');
  }

  private verifyEdDSASignature(
    data: Buffer,
    signature: string,
    publicKey: forge.pki.PublicKey
  ): boolean {
    // Implementation for EdDSA verification
    throw new Error('EdDSA verification not yet implemented');
  }

  private async verifyCertificate(signerInfo: SignerInfo): Promise<CertificateVerification> {
    const certificate = this.trustedCertificates.get(signerInfo.certificateFingerprint);
    
    if (!certificate) {
      return {
        valid: false,
        trusted: false,
        reason: 'Certificate not found in trust store'
      };
    }

    // Check certificate validity period
    const now = new Date();
    if (now < signerInfo.validFrom || now > signerInfo.validTo) {
      return {
        valid: false,
        trusted: false,
        reason: 'Certificate is expired or not yet valid'
      };
    }

    // Verify certificate chain (simplified - in practice, would check full chain)
    const trustedRoot = this.findTrustedRoot(certificate);
    if (!trustedRoot) {
      return {
        valid: true,
        trusted: false,
        reason: 'Certificate not issued by trusted CA'
      };
    }

    return {
      valid: true,
      trusted: true,
      reason: 'Certificate is valid and trusted'
    };
  }

  private findTrustedRoot(certificate: forge.pki.Certificate): forge.pki.Certificate | null {
    // Simplified trust check - in practice, would verify full certificate chain
    for (const [, trustedCert] of this.trustedCertificates) {
      try {
        if (trustedCert.verify(certificate)) {
          return trustedCert;
        }
      } catch (error) {
        // Certificate doesn't verify against this root
        continue;
      }
    }
    return null;
  }

  private validateSignatureFormat(signature: PluginSignature): boolean {
    return !!(
      signature.version &&
      signature.algorithm &&
      signature.timestamp &&
      signature.signer &&
      signature.signature &&
      signature.metadata
    );
  }

  private extractSignerInfo(certificate: forge.pki.Certificate): SignerInfo {
    const subject = certificate.subject;
    const issuer = certificate.issuer;
    
    return {
      commonName: this.getAttributeValue(subject, 'commonName') || 'Unknown',
      organization: this.getAttributeValue(subject, 'organizationName'),
      email: this.getAttributeValue(subject, 'emailAddress'),
      certificateFingerprint: this.calculateCertificateFingerprint(certificate),
      issuer: this.formatDistinguishedName(issuer),
      validFrom: certificate.validity.notBefore,
      validTo: certificate.validity.notAfter
    };
  }

  private getAttributeValue(attributes: forge.pki.Attribute[], name: string): string | undefined {
    const attr = attributes.find(a => a.name === name || a.type === name);
    return attr?.value as string;
  }

  private formatDistinguishedName(attributes: forge.pki.Attribute[]): string {
    return attributes
      .map(attr => `${attr.name}=${attr.value}`)
      .join(', ');
  }

  private calculateCertificateFingerprint(certificate: forge.pki.Certificate): string {
    const der = forge.asn1.toDer(forge.pki.certificateToAsn1(certificate));
    const md = forge.md.sha256.create();
    md.update(der.getBytes());
    return md.digest().toHex();
  }
}

export interface SignatureConfig {
  signingKeyPath?: string;
  certificatePath?: string;
  trustedCertificates?: string[];
  timestampServer?: string;
}

export interface SigningOptions {
  algorithm?: SignatureAlgorithm;
  hashAlgorithm?: HashAlgorithm;
  buildInfo?: BuildInfo;
}

export interface VerificationResult {
  valid: boolean;
  trusted: boolean;
  errors: string[];
  warnings: string[];
  signerInfo: SignerInfo;
  verifiedAt: Date;
}

export interface CertificateVerification {
  valid: boolean;
  trusted: boolean;
  reason: string;
}

export interface PluginManifest {
  id: string;
  name: string;
  version: string;
  description: string;
  author: string;
  entryPoint: string;
  permissions: string[];
  dependencies?: Record<string, string>;
}
```

---

## Plugin Signing Process

### Build-Time Signing

```typescript
// scripts/sign-plugin.ts
import { PluginSignatureService } from '../src/services/plugin-signature/signature-service';
import * as fs from 'fs';
import * as path from 'path';
import * as archiver from 'archiver';

export class PluginSigner {
  private signatureService: PluginSignatureService;

  constructor(config: SignatureConfig) {
    this.signatureService = new PluginSignatureService(config);
  }

  async signPluginPackage(
    pluginDir: string,
    outputPath: string,
    signingOptions: SigningOptions = {}
  ): Promise<SignedPluginPackage> {
    try {
      // Load plugin manifest
      const manifest = await this.loadPluginManifest(pluginDir);
      
      // Validate plugin structure
      await this.validatePluginStructure(pluginDir, manifest);

      // Create plugin package
      const packageBuffer = await this.createPluginPackage(pluginDir);

      // Sign the plugin
      const signature = await this.signatureService.signPlugin(
        packageBuffer,
        manifest,
        {
          ...signingOptions,
          buildInfo: await this.getBuildInfo()
        }
      );

      // Create signed package
      const signedPackage = await this.createSignedPackage(
        packageBuffer,
        manifest,
        signature
      );

      // Write to output
      await fs.promises.writeFile(outputPath, signedPackage);

      return {
        packagePath: outputPath,
        signature,
        manifest,
        size: signedPackage.length
      };
    } catch (error) {
      console.error('Plugin signing failed:', error);
      throw error;
    }
  }

  private async loadPluginManifest(pluginDir: string): Promise<PluginManifest> {
    const manifestPath = path.join(pluginDir, 'package.json');
    
    if (!fs.existsSync(manifestPath)) {
      throw new Error('Plugin manifest (package.json) not found');
    }

    const manifestData = await fs.promises.readFile(manifestPath, 'utf8');
    const packageJson = JSON.parse(manifestData);

    // Extract plugin-specific fields
    const cncControls = packageJson.cncControls || {};
    
    return {
      id: packageJson.name,
      name: packageJson.name,
      version: packageJson.version,
      description: packageJson.description || '',
      author: packageJson.author || 'Unknown',
      entryPoint: cncControls.entryPoint || 'index.js',
      permissions: cncControls.permissions || [],
      dependencies: packageJson.dependencies
    };
  }

  private async validatePluginStructure(
    pluginDir: string,
    manifest: PluginManifest
  ): Promise<void> {
    const requiredFiles = [
      'package.json',
      manifest.entryPoint
    ];

    for (const file of requiredFiles) {
      const filePath = path.join(pluginDir, file);
      if (!fs.existsSync(filePath)) {
        throw new Error(`Required file missing: ${file}`);
      }
    }

    // Validate permissions
    const validPermissions = [
      'machine.control',
      'machine.status',
      'workspace.read',
      'workspace.write',
      'settings.read',
      'settings.write',
      'api.access'
    ];

    for (const permission of manifest.permissions) {
      if (!validPermissions.includes(permission)) {
        throw new Error(`Invalid permission: ${permission}`);
      }
    }
  }

  private async createPluginPackage(pluginDir: string): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Add all files to archive
      archive.directory(pluginDir, false);
      archive.finalize();
    });
  }

  private async createSignedPackage(
    packageBuffer: Buffer,
    manifest: PluginManifest,
    signature: PluginSignature
  ): Promise<Buffer> {
    // Create a new ZIP with the original package and signature
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = [];
      const archive = archiver('zip', { zlib: { level: 9 } });

      archive.on('data', (chunk) => chunks.push(chunk));
      archive.on('end', () => resolve(Buffer.concat(chunks)));
      archive.on('error', reject);

      // Add original package
      archive.append(packageBuffer, { name: 'plugin.zip' });
      
      // Add signature file
      archive.append(JSON.stringify(signature, null, 2), { name: 'signature.json' });
      
      // Add manifest for easy access
      archive.append(JSON.stringify(manifest, null, 2), { name: 'manifest.json' });

      archive.finalize();
    });
  }

  private async getBuildInfo(): Promise<BuildInfo> {
    const { execSync } = require('child_process');
    
    try {
      const commit = execSync('git rev-parse HEAD', { encoding: 'utf8' }).trim();
      const buildId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      return {
        buildId,
        buildTimestamp: new Date(),
        sourceCommit: commit,
        environment: (process.env.NODE_ENV as any) || 'development',
        reproducible: true
      };
    } catch (error) {
      return {
        buildId: `local-${Date.now()}`,
        buildTimestamp: new Date(),
        sourceCommit: 'unknown',
        environment: 'development',
        reproducible: false
      };
    }
  }
}

export interface SignedPluginPackage {
  packagePath: string;
  signature: PluginSignature;
  manifest: PluginManifest;
  size: number;
}
```

### CLI Signing Tool

```typescript
// cli/sign-plugin.ts
#!/usr/bin/env node

import { Command } from 'commander';
import { PluginSigner } from '../scripts/sign-plugin';
import * as path from 'path';

const program = new Command();

program
  .name('sign-plugin')
  .description('Sign a CNC Controls plugin package')
  .version('1.0.0');

program
  .command('sign')
  .description('Sign a plugin package')
  .argument('<plugin-dir>', 'Path to plugin directory')
  .option('-o, --output <path>', 'Output path for signed package')
  .option('-k, --key <path>', 'Path to signing key')
  .option('-c, --cert <path>', 'Path to signing certificate')
  .option('--algorithm <alg>', 'Signature algorithm (RSA-PSS, ECDSA-P256, EdDSA)', 'RSA-PSS')
  .option('--hash <hash>', 'Hash algorithm (SHA-256, SHA-384, SHA-512)', 'SHA-256')
  .action(async (pluginDir, options) => {
    try {
      const signer = new PluginSigner({
        signingKeyPath: options.key,
        certificatePath: options.cert
      });

      const outputPath = options.output || path.join(
        path.dirname(pluginDir),
        `${path.basename(pluginDir)}-signed.zip`
      );

      console.log(`Signing plugin: ${pluginDir}`);
      console.log(`Output: ${outputPath}`);

      const result = await signer.signPluginPackage(pluginDir, outputPath, {
        algorithm: options.algorithm,
        hashAlgorithm: options.hash
      });

      console.log('✓ Plugin signed successfully');
      console.log(`  Package: ${result.packagePath}`);
      console.log(`  Size: ${(result.size / 1024).toFixed(2)} KB`);
      console.log(`  Signer: ${result.signature.signer.commonName}`);
      console.log(`  Algorithm: ${result.signature.algorithm}`);
    } catch (error) {
      console.error('✗ Signing failed:', error.message);
      process.exit(1);
    }
  });

program
  .command('verify')
  .description('Verify a signed plugin package')
  .argument('<package-path>', 'Path to signed plugin package')
  .option('--trusted-certs <paths...>', 'Paths to trusted CA certificates')
  .action(async (packagePath, options) => {
    try {
      const verifier = new PluginVerifier({
        trustedCertificates: options.trustedCerts || []
      });

      console.log(`Verifying plugin: ${packagePath}`);

      const result = await verifier.verifySignedPackage(packagePath);

      if (result.valid) {
        console.log('✓ Signature is valid');
        console.log(`  Trusted: ${result.trusted ? 'Yes' : 'No'}`);
        console.log(`  Signer: ${result.signerInfo.commonName}`);
        console.log(`  Organization: ${result.signerInfo.organization || 'N/A'}`);
      } else {
        console.log('✗ Signature verification failed');
        result.errors.forEach(error => console.log(`  Error: ${error}`));
      }

      if (result.warnings.length > 0) {
        console.log('Warnings:');
        result.warnings.forEach(warning => console.log(`  Warning: ${warning}`));
      }
    } catch (error) {
      console.error('✗ Verification failed:', error.message);
      process.exit(1);
    }
  });

program.parse();
```

---

## Verification Workflow

### Runtime Verification

```typescript
// src/services/plugin-signature/verifier.ts
export class PluginVerifier {
  private signatureService: PluginSignatureService;

  constructor(config: SignatureConfig) {
    this.signatureService = new PluginSignatureService(config);
  }

  async verifySignedPackage(packagePath: string): Promise<VerificationResult> {
    try {
      // Extract package contents
      const packageContents = await this.extractPackage(packagePath);
      
      // Load signature
      const signature = this.loadSignature(packageContents);
      
      // Load manifest
      const manifest = this.loadManifest(packageContents);
      
      // Load plugin data
      const pluginData = packageContents.get('plugin.zip');
      if (!pluginData) {
        throw new Error('Plugin data not found in package');
      }

      // Verify signature
      return await this.signatureService.verifyPlugin(pluginData, manifest, signature);
    } catch (error) {
      return {
        valid: false,
        trusted: false,
        errors: [`Verification failed: ${error.message}`],
        warnings: [],
        signerInfo: {} as SignerInfo,
        verifiedAt: new Date()
      };
    }
  }

  async verifyPluginAtRuntime(
    pluginPath: string,
    securityPolicy: SecurityPolicy
  ): Promise<RuntimeVerificationResult> {
    const result: RuntimeVerificationResult = {
      allowed: false,
      reason: 'Not verified',
      verificationResult: null,
      policyViolations: [],
      runtimeChecks: {
        signatureValid: false,
        certificateTrusted: false,
        permissionsValid: false,
        notRevoked: false,
        withinPolicy: false
      }
    };

    try {
      // Verify signature
      const verificationResult = await this.verifySignedPackage(pluginPath);
      result.verificationResult = verificationResult;
      result.runtimeChecks.signatureValid = verificationResult.valid;
      result.runtimeChecks.certificateTrusted = verificationResult.trusted;

      if (!verificationResult.valid) {
        result.reason = 'Invalid signature';
        return result;
      }

      // Check against security policy
      const policyCheck = await this.checkSecurityPolicy(verificationResult, securityPolicy);
      result.policyViolations = policyCheck.violations;
      result.runtimeChecks.withinPolicy = policyCheck.compliant;

      if (!policyCheck.compliant) {
        result.reason = 'Security policy violation';
        return result;
      }

      // Check certificate revocation
      const revocationCheck = await this.checkRevocationStatus(verificationResult.signerInfo);
      result.runtimeChecks.notRevoked = !revocationCheck.revoked;

      if (revocationCheck.revoked) {
        result.reason = 'Certificate has been revoked';
        return result;
      }

      // Validate permissions
      const manifest = this.loadManifest(await this.extractPackage(pluginPath));
      const permissionsValid = this.validatePermissions(manifest.permissions, securityPolicy);
      result.runtimeChecks.permissionsValid = permissionsValid;

      if (!permissionsValid) {
        result.reason = 'Invalid or excessive permissions';
        return result;
      }

      result.allowed = true;
      result.reason = 'Plugin verified and approved';
    } catch (error) {
      result.reason = `Runtime verification failed: ${error.message}`;
    }

    return result;
  }

  private async extractPackage(packagePath: string): Promise<Map<string, Buffer>> {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(packagePath);
    const entries = zip.getEntries();
    const contents = new Map<string, Buffer>();

    for (const entry of entries) {
      if (!entry.isDirectory) {
        contents.set(entry.entryName, entry.getData());
      }
    }

    return contents;
  }

  private loadSignature(packageContents: Map<string, Buffer>): PluginSignature {
    const signatureData = packageContents.get('signature.json');
    if (!signatureData) {
      throw new Error('Signature file not found');
    }

    try {
      return JSON.parse(signatureData.toString('utf8'));
    } catch (error) {
      throw new Error('Invalid signature file format');
    }
  }

  private loadManifest(packageContents: Map<string, Buffer>): PluginManifest {
    const manifestData = packageContents.get('manifest.json');
    if (!manifestData) {
      throw new Error('Manifest file not found');
    }

    try {
      return JSON.parse(manifestData.toString('utf8'));
    } catch (error) {
      throw new Error('Invalid manifest file format');
    }
  }

  private async checkSecurityPolicy(
    verificationResult: VerificationResult,
    policy: SecurityPolicy
  ): Promise<PolicyCheckResult> {
    const violations: PolicyViolation[] = [];

    // Check required trust level
    if (policy.requireTrustedCertificate && !verificationResult.trusted) {
      violations.push({
        type: 'trust',
        message: 'Plugin must be signed by a trusted certificate',
        severity: 'high'
      });
    }

    // Check signer restrictions
    if (policy.allowedSigners && policy.allowedSigners.length > 0) {
      const signerAllowed = policy.allowedSigners.some(allowed =>
        verificationResult.signerInfo.commonName.includes(allowed) ||
        (verificationResult.signerInfo.organization && 
         verificationResult.signerInfo.organization.includes(allowed))
      );

      if (!signerAllowed) {
        violations.push({
          type: 'signer',
          message: `Signer not in allowed list: ${verificationResult.signerInfo.commonName}`,
          severity: 'high'
        });
      }
    }

    // Check signature age
    if (policy.maxSignatureAge) {
      const signatureAge = Date.now() - verificationResult.verifiedAt.getTime();
      if (signatureAge > policy.maxSignatureAge) {
        violations.push({
          type: 'age',
          message: 'Signature is too old',
          severity: 'medium'
        });
      }
    }

    return {
      compliant: violations.length === 0,
      violations
    };
  }

  private async checkRevocationStatus(signerInfo: SignerInfo): Promise<RevocationCheckResult> {
    try {
      // In a real implementation, this would check OCSP or CRL
      // For now, we'll simulate with a simple check
      const revokedCertificates = await this.loadRevokedCertificates();
      
      const revoked = revokedCertificates.includes(signerInfo.certificateFingerprint);
      
      return {
        revoked,
        checkPerformed: true,
        reason: revoked ? 'Certificate found in revocation list' : 'Certificate not revoked'
      };
    } catch (error) {
      return {
        revoked: false,
        checkPerformed: false,
        reason: `Revocation check failed: ${error.message}`
      };
    }
  }

  private async loadRevokedCertificates(): Promise<string[]> {
    // In practice, this would fetch from OCSP or CRL
    return [];
  }

  private validatePermissions(permissions: string[], policy: SecurityPolicy): boolean {
    if (!policy.allowedPermissions) {
      return true; // No restrictions
    }

    return permissions.every(permission => 
      policy.allowedPermissions!.includes(permission)
    );
  }
}

export interface SecurityPolicy {
  requireTrustedCertificate: boolean;
  allowedSigners?: string[];
  allowedPermissions?: string[];
  maxSignatureAge?: number;
  blocklistedCertificates?: string[];
}

export interface RuntimeVerificationResult {
  allowed: boolean;
  reason: string;
  verificationResult: VerificationResult | null;
  policyViolations: PolicyViolation[];
  runtimeChecks: {
    signatureValid: boolean;
    certificateTrusted: boolean;
    permissionsValid: boolean;
    notRevoked: boolean;
    withinPolicy: boolean;
  };
}

export interface PolicyCheckResult {
  compliant: boolean;
  violations: PolicyViolation[];
}

export interface PolicyViolation {
  type: 'trust' | 'signer' | 'age' | 'permission';
  message: string;
  severity: 'low' | 'medium' | 'high';
}

export interface RevocationCheckResult {
  revoked: boolean;
  checkPerformed: boolean;
  reason: string;
}
```

---

## Build Integration

### Webpack Plugin for Signing

```typescript
// build/webpack-plugin-signer.ts
import { Compiler, WebpackPluginInstance } from 'webpack';
import { PluginSigner } from '../scripts/sign-plugin';
import * as path from 'path';

export class PluginSigningWebpackPlugin implements WebpackPluginInstance {
  private signer: PluginSigner;
  private options: PluginSigningOptions;

  constructor(options: PluginSigningOptions) {
    this.options = options;
    this.signer = new PluginSigner(options.signingConfig);
  }

  apply(compiler: Compiler): void {
    compiler.hooks.afterEmit.tapPromise('PluginSigningWebpackPlugin', async (compilation) => {
      if (!this.options.enabled) {
        return;
      }

      try {
        console.log('Starting plugin signing process...');

        const outputPath = compilation.outputOptions.path!;
        const pluginDir = path.resolve(outputPath);

        // Sign the plugin
        const signedPackagePath = path.join(
          path.dirname(pluginDir),
          `${path.basename(pluginDir)}-signed.zip`
        );

        const result = await this.signer.signPluginPackage(
          pluginDir,
          signedPackagePath,
          this.options.signingOptions
        );

        console.log(`✓ Plugin signed successfully: ${result.packagePath}`);
        console.log(`  Signer: ${result.signature.signer.commonName}`);
        console.log(`  Algorithm: ${result.signature.algorithm}`);

        // Add signed package to assets
        compilation.assets[path.basename(signedPackagePath)] = {
          source: () => require('fs').readFileSync(signedPackagePath),
          size: () => result.size
        };

      } catch (error) {
        compilation.errors.push(new Error(`Plugin signing failed: ${error.message}`));
      }
    });
  }
}

export interface PluginSigningOptions {
  enabled: boolean;
  signingConfig: SignatureConfig;
  signingOptions?: SigningOptions;
}
```

### GitHub Actions Integration

```yaml
# .github/workflows/plugin-signing.yml
name: Plugin Signing & Verification

on:
  push:
    paths:
      - 'plugins/**'
  pull_request:
    paths:
      - 'plugins/**'

jobs:
  build-and-sign:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build plugins
        run: npm run build:plugins

      - name: Setup signing certificates
        run: |
          echo "${{ secrets.PLUGIN_SIGNING_CERT }}" | base64 -d > signing-cert.pem
          echo "${{ secrets.PLUGIN_SIGNING_KEY }}" | base64 -d > signing-key.pem
          chmod 600 signing-key.pem

      - name: Sign plugins
        run: |
          for plugin_dir in plugins/*/; do
            if [ -f "$plugin_dir/package.json" ]; then
              echo "Signing plugin: $plugin_dir"
              npm run sign-plugin -- sign "$plugin_dir" \
                --key signing-key.pem \
                --cert signing-cert.pem \
                --output "dist/$(basename "$plugin_dir")-signed.zip"
            fi
          done

      - name: Verify signatures
        run: |
          echo "${{ secrets.TRUSTED_CA_CERT }}" | base64 -d > trusted-ca.pem
          
          for signed_package in dist/*-signed.zip; do
            echo "Verifying: $signed_package"
            npm run sign-plugin -- verify "$signed_package" \
              --trusted-certs trusted-ca.pem
          done

      - name: Upload signed plugins
        uses: actions/upload-artifact@v3
        with:
          name: signed-plugins
          path: dist/*-signed.zip

      - name: Cleanup certificates
        if: always()
        run: |
          rm -f signing-cert.pem signing-key.pem trusted-ca.pem

  security-scan:
    runs-on: ubuntu-latest
    needs: build-and-sign
    steps:
      - uses: actions/checkout@v4

      - name: Download signed plugins
        uses: actions/download-artifact@v3
        with:
          name: signed-plugins
          path: signed-plugins/

      - name: Security scan
        run: |
          for signed_package in signed-plugins/*.zip; do
            echo "Scanning: $signed_package"
            
            # Extract and scan plugin contents
            unzip -q "$signed_package" -d temp/
            
            # Run security checks
            npm run security:scan temp/plugin.zip
            
            # Clean up
            rm -rf temp/
          done

  publish:
    runs-on: ubuntu-latest
    needs: [build-and-sign, security-scan]
    if: github.ref == 'refs/heads/main'
    steps:
      - name: Download signed plugins
        uses: actions/download-artifact@v3
        with:
          name: signed-plugins
          path: signed-plugins/

      - name: Publish to plugin store
        run: |
          for signed_package in signed-plugins/*.zip; do
            echo "Publishing: $signed_package"
            
            curl -X POST "${{ secrets.PLUGIN_STORE_URL }}/upload" \
              -H "Authorization: Bearer ${{ secrets.PLUGIN_STORE_TOKEN }}" \
              -F "package=@$signed_package"
          done
```

---

## Certificate Management

### Certificate Authority Setup

```typescript
// scripts/setup-ca.ts
import * as forge from 'node-forge';
import * as fs from 'fs';
import * as path from 'path';

export class CertificateAuthorityManager {
  async createRootCA(config: RootCAConfig): Promise<CAResult> {
    try {
      // Generate root CA key pair
      const keyPair = forge.pki.rsa.generateKeyPair(4096);
      
      // Create root CA certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keyPair.publicKey;
      cert.serialNumber = '01';
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + config.validityYears);

      // Set certificate subject (same as issuer for root CA)
      const attrs = [
        { name: 'commonName', value: config.commonName },
        { name: 'organizationName', value: config.organization },
        { name: 'countryName', value: config.country }
      ];
      cert.subject.attributes = attrs;
      cert.issuer.attributes = attrs;

      // Add extensions
      cert.setExtensions([
        {
          name: 'basicConstraints',
          cA: true,
          critical: true
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          cRLSign: true,
          critical: true
        },
        {
          name: 'subjectKeyIdentifier'
        }
      ]);

      // Self-sign the certificate
      cert.sign(keyPair.privateKey, forge.md.sha256.create());

      // Save certificate and key
      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

      await fs.promises.writeFile(config.certPath, certPem);
      await fs.promises.writeFile(config.keyPath, keyPem, { mode: 0o600 });

      return {
        success: true,
        certificate: cert,
        privateKey: keyPair.privateKey,
        certPath: config.certPath,
        keyPath: config.keyPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async createIntermediateCA(
    rootCAConfig: CAResult,
    config: IntermediateCAConfig
  ): Promise<CAResult> {
    try {
      if (!rootCAConfig.success || !rootCAConfig.certificate || !rootCAConfig.privateKey) {
        throw new Error('Invalid root CA configuration');
      }

      // Generate intermediate CA key pair
      const keyPair = forge.pki.rsa.generateKeyPair(2048);
      
      // Create intermediate CA certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keyPair.publicKey;
      cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + config.validityYears);

      // Set certificate subject
      const attrs = [
        { name: 'commonName', value: config.commonName },
        { name: 'organizationName', value: config.organization },
        { name: 'countryName', value: config.country }
      ];
      cert.subject.attributes = attrs;
      cert.issuer.attributes = rootCAConfig.certificate.subject.attributes;

      // Add extensions
      cert.setExtensions([
        {
          name: 'basicConstraints',
          cA: true,
          pathLenConstraint: 0,
          critical: true
        },
        {
          name: 'keyUsage',
          keyCertSign: true,
          cRLSign: true,
          critical: true
        },
        {
          name: 'extKeyUsage',
          codeSigning: true
        },
        {
          name: 'subjectKeyIdentifier'
        },
        {
          name: 'authorityKeyIdentifier',
          keyIdentifier: rootCAConfig.certificate.generateSubjectKeyIdentifier().getBytes()
        }
      ]);

      // Sign with root CA
      cert.sign(rootCAConfig.privateKey, forge.md.sha256.create());

      // Save certificate and key
      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

      await fs.promises.writeFile(config.certPath, certPem);
      await fs.promises.writeFile(config.keyPath, keyPem, { mode: 0o600 });

      return {
        success: true,
        certificate: cert,
        privateKey: keyPair.privateKey,
        certPath: config.certPath,
        keyPath: config.keyPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  async issueCodeSigningCertificate(
    issuerCA: CAResult,
    config: CodeSigningCertConfig
  ): Promise<CAResult> {
    try {
      if (!issuerCA.success || !issuerCA.certificate || !issuerCA.privateKey) {
        throw new Error('Invalid issuer CA configuration');
      }

      // Generate code signing key pair
      const keyPair = forge.pki.rsa.generateKeyPair(2048);
      
      // Create code signing certificate
      const cert = forge.pki.createCertificate();
      cert.publicKey = keyPair.publicKey;
      cert.serialNumber = forge.util.bytesToHex(forge.random.getBytesSync(16));
      cert.validity.notBefore = new Date();
      cert.validity.notAfter = new Date();
      cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + config.validityYears);

      // Set certificate subject
      const attrs = [
        { name: 'commonName', value: config.commonName },
        { name: 'organizationName', value: config.organization },
        { name: 'emailAddress', value: config.email },
        { name: 'countryName', value: config.country }
      ];
      cert.subject.attributes = attrs;
      cert.issuer.attributes = issuerCA.certificate.subject.attributes;

      // Add extensions
      cert.setExtensions([
        {
          name: 'basicConstraints',
          cA: false,
          critical: true
        },
        {
          name: 'keyUsage',
          digitalSignature: true,
          critical: true
        },
        {
          name: 'extKeyUsage',
          codeSigning: true,
          critical: true
        },
        {
          name: 'subjectKeyIdentifier'
        },
        {
          name: 'authorityKeyIdentifier',
          keyIdentifier: issuerCA.certificate.generateSubjectKeyIdentifier().getBytes()
        }
      ]);

      // Sign with issuer CA
      cert.sign(issuerCA.privateKey, forge.md.sha256.create());

      // Save certificate and key
      const certPem = forge.pki.certificateToPem(cert);
      const keyPem = forge.pki.privateKeyToPem(keyPair.privateKey);

      await fs.promises.writeFile(config.certPath, certPem);
      await fs.promises.writeFile(config.keyPath, keyPem, { mode: 0o600 });

      return {
        success: true,
        certificate: cert,
        privateKey: keyPair.privateKey,
        certPath: config.certPath,
        keyPath: config.keyPath
      };
    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export interface RootCAConfig {
  commonName: string;
  organization: string;
  country: string;
  validityYears: number;
  certPath: string;
  keyPath: string;
}

export interface IntermediateCAConfig {
  commonName: string;
  organization: string;
  country: string;
  validityYears: number;
  certPath: string;
  keyPath: string;
}

export interface CodeSigningCertConfig {
  commonName: string;
  organization: string;
  email: string;
  country: string;
  validityYears: number;
  certPath: string;
  keyPath: string;
}

export interface CAResult {
  success: boolean;
  certificate?: forge.pki.Certificate;
  privateKey?: forge.pki.PrivateKey;
  certPath?: string;
  keyPath?: string;
  error?: string;
}
```

---

## Security Policies

### Policy Engine

```typescript
// src/services/plugin-signature/policy-engine.ts
export class PluginSecurityPolicyEngine {
  private policies: Map<string, SecurityPolicy> = new Map();
  private defaultPolicy: SecurityPolicy;

  constructor() {
    this.initializeDefaultPolicies();
  }

  private initializeDefaultPolicies(): void {
    // Default restrictive policy
    this.defaultPolicy = {
      requireTrustedCertificate: true,
      allowedSigners: [],
      allowedPermissions: [
        'machine.status',
        'workspace.read',
        'settings.read'
      ],
      maxSignatureAge: 365 * 24 * 60 * 60 * 1000, // 1 year
      blocklistedCertificates: []
    };

    // Development policy (more permissive)
    this.policies.set('development', {
      requireTrustedCertificate: false,
      allowedSigners: [],
      allowedPermissions: [
        'machine.control',
        'machine.status',
        'workspace.read',
        'workspace.write',
        'settings.read',
        'settings.write',
        'api.access'
      ],
      maxSignatureAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      blocklistedCertificates: []
    });

    // Production policy (very restrictive)
    this.policies.set('production', {
      requireTrustedCertificate: true,
      allowedSigners: [
        'CNC Controls Official',
        'Verified Plugin Developer'
      ],
      allowedPermissions: [
        'machine.status',
        'workspace.read',
        'settings.read'
      ],
      maxSignatureAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      blocklistedCertificates: []
    });

    // Enterprise policy (configurable)
    this.policies.set('enterprise', {
      requireTrustedCertificate: true,
      allowedSigners: [],
      allowedPermissions: [],
      maxSignatureAge: 180 * 24 * 60 * 60 * 1000, // 180 days
      blocklistedCertificates: []
    });
  }

  getPolicy(environment: string = 'default'): SecurityPolicy {
    return this.policies.get(environment) || this.defaultPolicy;
  }

  setPolicy(environment: string, policy: SecurityPolicy): void {
    this.policies.set(environment, policy);
  }

  updatePolicy(environment: string, updates: Partial<SecurityPolicy>): void {
    const currentPolicy = this.getPolicy(environment);
    const updatedPolicy = { ...currentPolicy, ...updates };
    this.setPolicy(environment, updatedPolicy);
  }

  evaluatePlugin(
    verificationResult: VerificationResult,
    manifest: PluginManifest,
    environment: string = 'default'
  ): PolicyEvaluationResult {
    const policy = this.getPolicy(environment);
    const violations: PolicyViolation[] = [];
    const warnings: string[] = [];

    // Check signature validity
    if (!verificationResult.valid) {
      violations.push({
        type: 'trust',
        message: 'Plugin signature is invalid',
        severity: 'high'
      });
    }

    // Check certificate trust requirement
    if (policy.requireTrustedCertificate && !verificationResult.trusted) {
      violations.push({
        type: 'trust',
        message: 'Plugin must be signed by a trusted certificate',
        severity: 'high'
      });
    }

    // Check allowed signers
    if (policy.allowedSigners && policy.allowedSigners.length > 0) {
      const signerAllowed = this.isSignerAllowed(
        verificationResult.signerInfo,
        policy.allowedSigners
      );

      if (!signerAllowed) {
        violations.push({
          type: 'signer',
          message: `Signer not in allowed list: ${verificationResult.signerInfo.commonName}`,
          severity: 'high'
        });
      }
    }

    // Check permissions
    if (policy.allowedPermissions && policy.allowedPermissions.length > 0) {
      const unauthorizedPermissions = manifest.permissions.filter(
        permission => !policy.allowedPermissions!.includes(permission)
      );

      if (unauthorizedPermissions.length > 0) {
        violations.push({
          type: 'permission',
          message: `Unauthorized permissions: ${unauthorizedPermissions.join(', ')}`,
          severity: 'high'
        });
      }
    }

    // Check signature age
    if (policy.maxSignatureAge) {
      const signatureAge = Date.now() - verificationResult.verifiedAt.getTime();
      if (signatureAge > policy.maxSignatureAge) {
        violations.push({
          type: 'age',
          message: 'Plugin signature is too old',
          severity: 'medium'
        });
      } else if (signatureAge > policy.maxSignatureAge * 0.8) {
        warnings.push('Plugin signature is approaching expiration');
      }
    }

    // Check certificate blocklist
    if (policy.blocklistedCertificates && policy.blocklistedCertificates.length > 0) {
      const isBlocked = policy.blocklistedCertificates.includes(
        verificationResult.signerInfo.certificateFingerprint
      );

      if (isBlocked) {
        violations.push({
          type: 'trust',
          message: 'Signing certificate is blocklisted',
          severity: 'high'
        });
      }
    }

    return {
      allowed: violations.length === 0,
      violations,
      warnings,
      policy: environment,
      evaluatedAt: new Date()
    };
  }

  private isSignerAllowed(signerInfo: SignerInfo, allowedSigners: string[]): boolean {
    return allowedSigners.some(allowed => {
      return (
        signerInfo.commonName.toLowerCase().includes(allowed.toLowerCase()) ||
        (signerInfo.organization && 
         signerInfo.organization.toLowerCase().includes(allowed.toLowerCase()))
      );
    });
  }

  exportPolicy(environment: string): string {
    const policy = this.getPolicy(environment);
    return JSON.stringify(policy, null, 2);
  }

  importPolicy(environment: string, policyJson: string): void {
    try {
      const policy = JSON.parse(policyJson);
      this.validatePolicy(policy);
      this.setPolicy(environment, policy);
    } catch (error) {
      throw new Error(`Failed to import policy: ${error.message}`);
    }
  }

  private validatePolicy(policy: any): void {
    const requiredFields = ['requireTrustedCertificate'];
    
    for (const field of requiredFields) {
      if (!(field in policy)) {
        throw new Error(`Missing required policy field: ${field}`);
      }
    }

    if (policy.allowedPermissions && !Array.isArray(policy.allowedPermissions)) {
      throw new Error('allowedPermissions must be an array');
    }

    if (policy.allowedSigners && !Array.isArray(policy.allowedSigners)) {
      throw new Error('allowedSigners must be an array');
    }
  }
}

export interface PolicyEvaluationResult {
  allowed: boolean;
  violations: PolicyViolation[];
  warnings: string[];
  policy: string;
  evaluatedAt: Date;
}
```

---

## CI/CD Integration

### Automated Signing Pipeline

```typescript
// scripts/ci-plugin-pipeline.ts
export class CIPluginPipeline {
  private signer: PluginSigner;
  private verifier: PluginVerifier;

  constructor(private config: CIPipelineConfig) {
    this.signer = new PluginSigner(config.signingConfig);
    this.verifier = new PluginVerifier(config.verificationConfig);
  }

  async processPlugins(): Promise<PipelineResult> {
    const result: PipelineResult = {
      success: true,
      processedPlugins: [],
      errors: []
    };

    try {
      // Discover plugins
      const plugins = await this.discoverPlugins();
      
      for (const pluginPath of plugins) {
        try {
          const pluginResult = await this.processPlugin(pluginPath);
          result.processedPlugins.push(pluginResult);
        } catch (error) {
          result.success = false;
          result.errors.push(`Failed to process ${pluginPath}: ${error.message}`);
        }
      }
    } catch (error) {
      result.success = false;
      result.errors.push(`Pipeline failed: ${error.message}`);
    }

    return result;
  }

  private async discoverPlugins(): Promise<string[]> {
    const glob = require('glob');
    return new Promise((resolve, reject) => {
      glob(this.config.pluginPattern, (err: any, matches: string[]) => {
        if (err) reject(err);
        else resolve(matches);
      });
    });
  }

  private async processPlugin(pluginPath: string): Promise<PluginProcessResult> {
    const pluginName = path.basename(pluginPath);
    
    console.log(`Processing plugin: ${pluginName}`);

    // Build plugin
    await this.buildPlugin(pluginPath);

    // Sign plugin
    const signedPackagePath = path.join(
      this.config.outputDir,
      `${pluginName}-signed.zip`
    );

    const signResult = await this.signer.signPluginPackage(
      pluginPath,
      signedPackagePath,
      this.config.signingOptions
    );

    // Verify signature
    const verifyResult = await this.verifier.verifySignedPackage(signedPackagePath);

    // Security scan
    const securityResult = await this.securityScan(signedPackagePath);

    return {
      pluginName,
      pluginPath,
      signedPackagePath,
      signature: signResult.signature,
      verificationResult: verifyResult,
      securityResult,
      success: verifyResult.valid && securityResult.passed
    };
  }

  private async buildPlugin(pluginPath: string): Promise<void> {
    const { execSync } = require('child_process');
    
    // Run build command in plugin directory
    const buildCommand = this.config.buildCommand || 'npm run build';
    
    try {
      execSync(buildCommand, {
        cwd: pluginPath,
        stdio: 'inherit'
      });
    } catch (error) {
      throw new Error(`Build failed for ${pluginPath}: ${error.message}`);
    }
  }

  private async securityScan(packagePath: string): Promise<SecurityScanResult> {
    // Implement security scanning
    // This could include:
    // - Static analysis of plugin code
    // - Dependency vulnerability scanning
    // - Malware scanning
    // - Permission analysis

    return {
      passed: true,
      issues: [],
      score: 100
    };
  }
}

export interface CIPipelineConfig {
  pluginPattern: string;
  outputDir: string;
  signingConfig: SignatureConfig;
  verificationConfig: SignatureConfig;
  signingOptions?: SigningOptions;
  buildCommand?: string;
}

export interface PipelineResult {
  success: boolean;
  processedPlugins: PluginProcessResult[];
  errors: string[];
}

export interface PluginProcessResult {
  pluginName: string;
  pluginPath: string;
  signedPackagePath: string;
  signature: PluginSignature;
  verificationResult: VerificationResult;
  securityResult: SecurityScanResult;
  success: boolean;
}

export interface SecurityScanResult {
  passed: boolean;
  issues: SecurityIssue[];
  score: number;
}

export interface SecurityIssue {
  type: 'vulnerability' | 'malware' | 'suspicious' | 'policy';
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  recommendation?: string;
}
```

---

## Plugin Store Integration

### Store API Integration

```typescript
// src/services/plugin-store/store-client.ts
export class PluginStoreClient {
  private apiClient: ApiClient;
  private verifier: PluginVerifier;

  constructor(config: PluginStoreConfig) {
    this.apiClient = new ApiClient(config.apiConfig);
    this.verifier = new PluginVerifier(config.verificationConfig);
  }

  async searchPlugins(query: PluginSearchQuery): Promise<PluginSearchResult[]> {
    const response = await this.apiClient.get('/plugins/search', {
      params: {
        q: query.query,
        category: query.category,
        verified: query.verifiedOnly,
        limit: query.limit || 20,
        offset: query.offset || 0
      }
    });

    return response.plugins.map(this.mapPluginData);
  }

  async getPluginDetails(pluginId: string): Promise<PluginDetails> {
    const response = await this.apiClient.get(`/plugins/${pluginId}`);
    return this.mapPluginDetails(response);
  }

  async downloadPlugin(pluginId: string, version?: string): Promise<PluginDownloadResult> {
    try {
      // Get download URL
      const downloadUrl = await this.getDownloadUrl(pluginId, version);
      
      // Download plugin package
      const packageData = await this.downloadPackage(downloadUrl);
      
      // Verify signature before allowing installation
      const verificationResult = await this.verifyDownloadedPlugin(packageData);
      
      if (!verificationResult.valid) {
        throw new Error('Plugin signature verification failed');
      }

      return {
        success: true,
        packageData,
        verificationResult,
        downloadUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        packageData: Buffer.alloc(0),
        verificationResult: null,
        downloadUrl: ''
      };
    }
  }

  async uploadPlugin(packagePath: string): Promise<PluginUploadResult> {
    try {
      // Verify plugin before upload
      const verificationResult = await this.verifier.verifySignedPackage(packagePath);
      
      if (!verificationResult.valid) {
        throw new Error('Plugin must be signed with a valid signature');
      }

      // Read package data
      const packageData = await fs.promises.readFile(packagePath);
      
      // Extract manifest for metadata
      const manifest = await this.extractManifest(packageData);
      
      // Upload to store
      const formData = new FormData();
      formData.append('package', new Blob([packageData]), path.basename(packagePath));
      formData.append('manifest', JSON.stringify(manifest));
      formData.append('signature', JSON.stringify(verificationResult));

      const response = await this.apiClient.post('/plugins/upload', {
        body: formData,
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      return {
        success: true,
        pluginId: response.pluginId,
        version: response.version,
        uploadUrl: response.uploadUrl
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        pluginId: '',
        version: '',
        uploadUrl: ''
      };
    }
  }

  async getPluginVerificationStatus(pluginId: string): Promise<VerificationStatus> {
    const response = await this.apiClient.get(`/plugins/${pluginId}/verification`);
    
    return {
      verified: response.verified,
      verifiedAt: new Date(response.verifiedAt),
      verifiedBy: response.verifiedBy,
      trustLevel: response.trustLevel,
      issues: response.issues || []
    };
  }

  private async getDownloadUrl(pluginId: string, version?: string): Promise<string> {
    const params = version ? { version } : {};
    const response = await this.apiClient.get(`/plugins/${pluginId}/download`, { params });
    return response.downloadUrl;
  }

  private async downloadPackage(url: string): Promise<Buffer> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Download failed: ${response.statusText}`);
    }
    
    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
  }

  private async verifyDownloadedPlugin(packageData: Buffer): Promise<VerificationResult> {
    // Create temporary file for verification
    const tempPath = path.join(require('os').tmpdir(), `plugin-${Date.now()}.zip`);
    
    try {
      await fs.promises.writeFile(tempPath, packageData);
      return await this.verifier.verifySignedPackage(tempPath);
    } finally {
      // Clean up temporary file
      try {
        await fs.promises.unlink(tempPath);
      } catch (error) {
        // Ignore cleanup errors
      }
    }
  }

  private async extractManifest(packageData: Buffer): Promise<PluginManifest> {
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(packageData);
    
    const manifestEntry = zip.getEntry('manifest.json');
    if (!manifestEntry) {
      throw new Error('Manifest not found in plugin package');
    }
    
    const manifestData = manifestEntry.getData().toString('utf8');
    return JSON.parse(manifestData);
  }

  private mapPluginData(data: any): PluginSearchResult {
    return {
      id: data.id,
      name: data.name,
      description: data.description,
      version: data.version,
      author: data.author,
      category: data.category,
      verified: data.verified,
      downloadCount: data.downloadCount,
      rating: data.rating,
      updatedAt: new Date(data.updatedAt)
    };
  }

  private mapPluginDetails(data: any): PluginDetails {
    return {
      ...this.mapPluginData(data),
      fullDescription: data.fullDescription,
      screenshots: data.screenshots || [],
      versions: data.versions || [],
      dependencies: data.dependencies || {},
      permissions: data.permissions || [],
      license: data.license,
      homepage: data.homepage,
      repository: data.repository,
      verificationStatus: data.verificationStatus
    };
  }
}

export interface PluginStoreConfig {
  apiConfig: ApiConfig;
  verificationConfig: SignatureConfig;
}

export interface PluginSearchQuery {
  query?: string;
  category?: string;
  verifiedOnly?: boolean;
  limit?: number;
  offset?: number;
}

export interface PluginSearchResult {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  category: string;
  verified: boolean;
  downloadCount: number;
  rating: number;
  updatedAt: Date;
}

export interface PluginDetails extends PluginSearchResult {
  fullDescription: string;
  screenshots: string[];
  versions: string[];
  dependencies: Record<string, string>;
  permissions: string[];
  license?: string;
  homepage?: string;
  repository?: string;
  verificationStatus: VerificationStatus;
}

export interface PluginDownloadResult {
  success: boolean;
  packageData: Buffer;
  verificationResult: VerificationResult | null;
  downloadUrl: string;
  error?: string;
}

export interface PluginUploadResult {
  success: boolean;
  pluginId: string;
  version: string;
  uploadUrl: string;
  error?: string;
}

export interface VerificationStatus {
  verified: boolean;
  verifiedAt: Date;
  verifiedBy: string;
  trustLevel: 'low' | 'medium' | 'high';
  issues: string[];
}
```

---

## Troubleshooting

### Common Issues and Solutions

#### 1. **Signature Verification Failures**

```typescript
// Debug signature verification issues
const debugSignatureVerification = async (packagePath: string) => {
  console.log('=== Signature Verification Debug ===');
  
  try {
    // Extract package contents
    const AdmZip = require('adm-zip');
    const zip = new AdmZip(packagePath);
    const entries = zip.getEntries();
    
    console.log('Package contents:');
    entries.forEach(entry => {
      console.log(`  ${entry.entryName} (${entry.header.size} bytes)`);
    });

    // Check for required files
    const requiredFiles = ['plugin.zip', 'signature.json', 'manifest.json'];
    const missingFiles = requiredFiles.filter(file => 
      !entries.some(entry => entry.entryName === file)
    );

    if (missingFiles.length > 0) {
      console.error('Missing required files:', missingFiles);
      return;
    }

    // Load and validate signature
    const signatureEntry = zip.getEntry('signature.json');
    const signatureData = JSON.parse(signatureEntry.getData().toString('utf8'));
    
    console.log('Signature details:');
    console.log(`  Algorithm: ${signatureData.algorithm}`);
    console.log(`  Signer: ${signatureData.signer.commonName}`);
    console.log(`  Timestamp: ${signatureData.timestamp}`);

    // Check certificate validity
    const now = new Date();
    const validFrom = new Date(signatureData.signer.validFrom);
    const validTo = new Date(signatureData.signer.validTo);
    
    console.log('Certificate validity:');
    console.log(`  Valid from: ${validFrom}`);
    console.log(`  Valid to: ${validTo}`);
    console.log(`  Currently valid: ${now >= validFrom && now <= validTo}`);

    // Verify hashes
    const pluginEntry = zip.getEntry('plugin.zip');
    const pluginData = pluginEntry.getData();
    const calculatedHash = require('crypto')
      .createHash('sha256')
      .update(pluginData)
      .digest('hex');
    
    console.log('Hash verification:');
    console.log(`  Expected: ${signatureData.metadata.fileHash}`);
    console.log(`  Calculated: ${calculatedHash}`);
    console.log(`  Match: ${calculatedHash === signatureData.metadata.fileHash}`);

  } catch (error) {
    console.error('Debug failed:', error);
  }
};
```

#### 2. **Certificate Issues**

```bash
# Check certificate details
openssl x509 -in certificate.pem -text -noout

# Verify certificate chain
openssl verify -CAfile ca-bundle.pem certificate.pem

# Check certificate expiration
openssl x509 -in certificate.pem -noout -dates

# Generate certificate fingerprint
openssl x509 -in certificate.pem -noout -fingerprint -sha256
```

#### 3. **Signing Key Problems**

```bash
# Check private key format
openssl rsa -in private-key.pem -check -noout

# Verify key matches certificate
openssl x509 -in certificate.pem -noout -modulus | openssl md5
openssl rsa -in private-key.pem -noout -modulus | openssl md5

# Generate new key pair if needed
openssl genrsa -out private-key.pem 2048
openssl req -new -x509 -key private-key.pem -out certificate.pem -days 365
```

---

## Security Best Practices

### 1. **Key Management**
- Use hardware security modules (HSMs) for production signing keys
- Implement key rotation policies
- Separate signing keys by environment (dev/staging/prod)
- Use strong key lengths (RSA 2048+ bits, ECDSA P-256+)

### 2. **Certificate Management**
- Use proper certificate chains with trusted root CAs
- Implement certificate revocation checking (OCSP/CRL)
- Monitor certificate expiration dates
- Use time-stamping for long-term signature validity

### 3. **Build Security**
- Sign plugins in isolated, secure build environments
- Implement reproducible builds
- Use source code integrity verification
- Audit build dependencies and tools

### 4. **Runtime Security**
- Verify signatures before plugin installation and loading
- Implement proper security policies for different environments
- Monitor for signature verification failures
- Use security sandboxing for plugin execution

### 5. **Policy Enforcement**
- Define clear security policies for plugin acceptance
- Implement automated policy checking
- Regular policy review and updates
- User education on security implications

This comprehensive plugin signature verification guide provides the complete infrastructure needed to implement secure plugin signing and verification for the CNC Jog Controls application. The system ensures plugin authenticity, integrity, and provides the necessary security controls for enterprise deployment.