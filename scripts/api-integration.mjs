import { execSync } from 'child_process';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

class ApiIntegrator {
  constructor(options = {}) {
    this.apiRepoPath = options.apiRepoPath || '../api';
    this.buildDir = path.join(__dirname, '..', 'build-resources', 'api');
    this.tempDir = path.join(__dirname, '..', 'temp-api');
  }

  async integrateApi() {
    console.log('🔄 Starting API integration...');
    
    try {
      await this.cleanBuildDir();
      await this.fetchApiCode();
      await this.prepareApiForProduction();
      await this.copyToBuildResources();
      await this.cleanup();
      
      console.log('✅ API integration complete!');
    } catch (error) {
      console.error('❌ API integration failed:', error);
      await this.cleanup();
      throw error;
    }
  }

  async cleanBuildDir() {
    console.log('🧹 Cleaning build directory...');
    await fs.emptyDir(this.buildDir);
  }

  async fetchApiCode() {
    console.log('📥 Fetching API code...');
    
    // Remove existing temp directory
    await fs.remove(this.tempDir);
    
    // Method 1: Local copy (for development)
    if (fs.existsSync(this.apiRepoPath)) {
      await fs.copy(this.apiRepoPath, this.tempDir, {
        filter: (src) => {
          // Exclude unnecessary files
          const excludes = [
            'node_modules', '.git', '.github', 
            'coverage', 'dist', '.env', 
            '*.log', '.DS_Store'
          ];
          return !excludes.some(exclude => src.includes(exclude));
        }
      });
    }
    // Method 2: Git clone (for CI/CD)
    else if (process.env.API_REPO_URL) {
      execSync(`git clone ${process.env.API_REPO_URL} ${this.tempDir}`, {
        stdio: 'inherit'
      });
    }
    // Method 3: Download from GitHub releases
    else {
      throw new Error('API source not found. Set API_REPO_URL or ensure ../api exists');
    }
  }

  async prepareApiForProduction() {
    console.log('🔧 Preparing API for production...');
    
    const apiPackageJson = path.join(this.tempDir, 'package.json');
    const originalPkg = await fs.readJson(apiPackageJson);
    
    // Install production dependencies
    execSync('npm ci --production', {
      cwd: this.tempDir,
      stdio: 'inherit'
    });
    
    // Create production package.json
    const prodPkg = {
      name: originalPkg.name,
      version: originalPkg.version,
      description: originalPkg.description,
      main: originalPkg.main,
      type: originalPkg.type,
      dependencies: originalPkg.dependencies,
      scripts: {
        start: originalPkg.scripts.start
      }
    };
    
    await fs.writeJson(apiPackageJson, prodPkg, { spaces: 2 });
  }

  async copyToBuildResources() {
    console.log('📦 Copying to build resources...');
    await fs.copy(this.tempDir, this.buildDir);
  }

  async cleanup() {
    console.log('🧽 Cleaning up temporary files...');
    await fs.remove(this.tempDir);
  }
}

// CLI usage
if (import.meta.url === `file://${process.argv[1]}`) {
  const integrator = new ApiIntegrator();
  integrator.integrateApi().catch((error) => {
    console.error(error);
    process.exit(1);
  });
}

export default ApiIntegrator;