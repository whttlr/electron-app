import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export class MacApiIntegrator {
  constructor() {
    this.apiSourcePath = path.resolve(__dirname, '..', '..', 'api');
    this.buildDir = path.join(__dirname, '..', 'build-resources', 'api');
    this.tempDir = path.join(__dirname, '..', 'temp-api');
  }

  async integrateApi() {
    console.log('🍎 Starting Mac API integration...');
    
    try {
      await this.validateApiSource();
      await this.cleanBuildDir();
      await this.copyApiCode();
      await this.installApiDependencies();
      await this.createProductionPackage();
      await this.cleanup();
      
      console.log('✅ Mac API integration complete!');
      return true;
    } catch (error) {
      console.error('❌ Mac API integration failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  async validateApiSource() {
    console.log('🔍 Validating API source...');
    
    if (!fs.existsSync(this.apiSourcePath)) {
      throw new Error(`API source not found at: ${this.apiSourcePath}`);
    }
    
    const apiPackageJson = path.join(this.apiSourcePath, 'package.json');
    if (!fs.existsSync(apiPackageJson)) {
      throw new Error('API package.json not found');
    }
    
    console.log('✅ API source validated');
  }

  async cleanBuildDir() {
    console.log('🧹 Cleaning build directory...');
    await fs.emptyDir(this.buildDir);
    await fs.emptyDir(this.tempDir);
  }

  async copyApiCode() {
    console.log('📥 Copying API code...');
    
    await fs.copy(this.apiSourcePath, this.tempDir, {
      filter: (src) => {
        // Exclude unnecessary files for production
        const excludes = [
          'node_modules', '.git', '.github', '.gitignore',
          'coverage', 'dist', '.env', '.env.local', '.env.development',
          '*.log', '.DS_Store', '__tests__', '*.test.js', '*.spec.js',
          'jest.config.js', '.eslintrc', '.prettierrc', 'README.md',
          'CLAUDE.md', 'ELECTRON_DISTRIBUTION_STRATEGY.md', 
          'SEPARATE_REPO_DISTRIBUTION_STRATEGY.md'
        ];
        
        const relativePath = path.relative(this.apiSourcePath, src);
        return !excludes.some(exclude => relativePath.includes(exclude));
      }
    });
    
    console.log('✅ API code copied to temp directory');
  }

  async installApiDependencies() {
    console.log('📦 Installing API production dependencies...');
    
    try {
      // Install only production dependencies
      execSync('npm ci --omit=dev --omit=optional', {
        cwd: this.tempDir,
        stdio: 'inherit',
        env: { ...process.env, NODE_ENV: 'production' }
      });
      
      console.log('✅ API dependencies installed');
    } catch (error) {
      console.error('❌ Failed to install API dependencies:', error);
      throw error;
    }
  }

  async createProductionPackage() {
    console.log('📝 Creating production package.json...');
    
    const originalPkg = await fs.readJson(path.join(this.tempDir, 'package.json'));
    
    // Create minimal production package.json
    const prodPkg = {
      name: originalPkg.name,
      version: originalPkg.version,
      description: originalPkg.description,
      main: originalPkg.main,
      type: originalPkg.type,
      dependencies: originalPkg.dependencies,
      scripts: {
        start: originalPkg.scripts.start
      },
      // Add embedded mode flag
      embedded: true
    };
    
    await fs.writeJson(path.join(this.tempDir, 'package.json'), prodPkg, { spaces: 2 });
    
    // Copy to final build directory
    await fs.copy(this.tempDir, this.buildDir);
    
    console.log('✅ Production package created');
  }

  async cleanup() {
    console.log('🧽 Cleaning up temporary files...');
    await fs.remove(this.tempDir).catch(() => {}); // Ignore cleanup errors
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const integrator = new MacApiIntegrator();
  integrator.integrateApi()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}