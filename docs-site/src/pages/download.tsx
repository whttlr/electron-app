import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';
import Heading from '@theme/Heading';

export default function DownloadPage(): JSX.Element {
  return (
    <Layout
      title="Download CNC Jog Controls"
      description="Download the latest version of CNC Jog Controls for your platform">
      <div className="container margin-vert--lg">
        <div className="row">
          <div className="col col--8 col--offset-2">
            <Heading as="h1">Download CNC Jog Controls</Heading>
            <p>
              Get the latest version of CNC Jog Controls for your platform. 
              All downloads are automatically built and tested with every release.
            </p>
            
            <div className="card-demo margin-vert--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">🚀 Latest Release</Heading>
                </div>
                <div className="card__body">
                  <p>
                    The latest version is automatically built from the main branch. 
                    Download links are updated with every push to the repository.
                  </p>
                  
                  <div className="button-group button-group--block">
                    <Link
                      className="button button--primary button--lg"
                      href="https://github.com/whttlr/electron-app/releases/latest">
                      📥 View All Downloads
                    </Link>
                  </div>
                  
                  <div className="margin-top--md">
                    <Heading as="h4">Platform-Specific Downloads</Heading>
                    <div className="row margin-top--md">
                      <div className="col col--4">
                        <div className="card">
                          <div className="card__header">
                            <Heading as="h5">🍎 macOS</Heading>
                          </div>
                          <div className="card__body">
                            <p><strong>Universal Binary</strong></p>
                            <p>Compatible with Intel and Apple Silicon Macs</p>
                            <Link
                              className="button button--secondary button--sm"
                              href="https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.dmg">
                              Download .dmg
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="col col--4">
                        <div className="card">
                          <div className="card__header">
                            <Heading as="h5">🪟 Windows</Heading>
                          </div>
                          <div className="card__body">
                            <p><strong>Installer</strong></p>
                            <p>Windows 10 and later</p>
                            <Link
                              className="button button--secondary button--sm"
                              href="https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls-Setup.exe">
                              Download .exe
                            </Link>
                          </div>
                        </div>
                      </div>
                      <div className="col col--4">
                        <div className="card">
                          <div className="card__header">
                            <Heading as="h5">🐧 Linux</Heading>
                          </div>
                          <div className="card__body">
                            <p><strong>AppImage</strong></p>
                            <p>Portable, no installation required</p>
                            <Link
                              className="button button--secondary button--sm"
                              href="https://github.com/whttlr/electron-app/releases/latest/download/CNC-Jog-Controls.AppImage">
                              Download .AppImage
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="margin-top--md">
                    <p>
                      <strong>Need help?</strong> Check out our{' '}
                      <Link to="/docs/getting-started/installation">installation guide</Link>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="margin-top--lg">
              <Heading as="h2">System Requirements</Heading>
              <div className="row">
                <div className="col col--4">
                  <div className="card">
                    <div className="card__header">
                      <Heading as="h4">🍎 macOS</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>macOS 10.15 (Catalina) or later</li>
                        <li>Intel or Apple Silicon processor</li>
                        <li>4 GB RAM minimum</li>
                        <li>50 MB free disk space</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col col--4">
                  <div className="card">
                    <div className="card__header">
                      <Heading as="h4">🪟 Windows</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>Windows 10 or later</li>
                        <li>64-bit processor</li>
                        <li>4 GB RAM minimum</li>
                        <li>50 MB free disk space</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col col--4">
                  <div className="card">
                    <div className="card__header">
                      <Heading as="h4">🐧 Linux</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>Modern Linux distribution</li>
                        <li>64-bit processor</li>
                        <li>4 GB RAM minimum</li>
                        <li>50 MB free disk space</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="margin-top--lg">
              <Heading as="h2">Installation Instructions</Heading>
              
              <div className="margin-top--md">
                <Heading as="h3">macOS Installation</Heading>
                <ol>
                  <li>Download the <code>.dmg</code> file</li>
                  <li>Double-click to mount the disk image</li>
                  <li>Drag the CNC Jog Controls app to your Applications folder</li>
                  <li>Launch from Applications or Spotlight</li>
                  <li>If you see a security warning, go to System Preferences → Security & Privacy and click "Open Anyway"</li>
                </ol>
              </div>

              <div className="margin-top--md">
                <Heading as="h3">Windows Installation</Heading>
                <ol>
                  <li>Download the <code>.exe</code> installer</li>
                  <li>Right-click and select "Run as administrator" (if needed)</li>
                  <li>Follow the installation wizard</li>
                  <li>Launch from the Start Menu or Desktop shortcut</li>
                </ol>
              </div>

              <div className="margin-top--md">
                <Heading as="h3">Linux Installation</Heading>
                <ol>
                  <li>Download the <code>.AppImage</code> file</li>
                  <li>Make it executable: <code>chmod +x CNC-Jog-Controls.AppImage</code></li>
                  <li>Run it: <code>./CNC-Jog-Controls.AppImage</code></li>
                  <li>Optionally, integrate with your desktop environment using AppImageLauncher</li>
                </ol>
              </div>
            </div>

            <div className="margin-top--lg">
              <Heading as="h2">Release Information</Heading>
              <div className="card">
                <div className="card__body">
                  <p>
                    <strong>Automatic Builds:</strong> Every push to the main branch triggers automated builds for all platforms.
                  </p>
                  <p>
                    <strong>Testing:</strong> All releases pass automated testing including unit tests, integration tests, and linting.
                  </p>
                  <p>
                    <strong>Beta Releases:</strong> Pre-release versions are available for testing new features.
                  </p>
                  <p>
                    <strong>Security:</strong> All builds are created in GitHub's secure environment and are automatically signed.
                  </p>
                  
                  <div className="margin-top--md">
                    <Link
                      className="button button--outline"
                      href="https://github.com/whttlr/electron-app/releases">
                      View All Releases
                    </Link>
                    {' '}
                    <Link
                      className="button button--outline"
                      href="https://github.com/whttlr/electron-app/actions">
                      View Build Status
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}