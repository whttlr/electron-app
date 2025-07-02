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
              All downloads are automatically built and tested.
            </p>
            
            <div className="card-demo margin-vert--lg">
              <div className="card">
                <div className="card__header">
                  <Heading as="h3">Latest Release: v0.1.0</Heading>
                </div>
                <div className="card__body">
                  <div className="button-group button-group--block">
                    <Link
                      className="button button--primary button--lg"
                      href="https://github.com/whttlr/electron-app/releases/tag/v0.1.0">
                      View All Downloads
                    </Link>
                  </div>
                  
                  <div className="margin-top--md">
                    <Heading as="h4">Quick Downloads</Heading>
                    <ul>
                      <li>
                        <strong>macOS</strong>: Download the .dmg file for universal compatibility (Intel + Apple Silicon)
                      </li>
                      <li>
                        <strong>Windows</strong>: Download the .exe installer for Windows 10+
                      </li>
                      <li>
                        <strong>Linux</strong>: Download the .AppImage for portable installation
                      </li>
                    </ul>
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
                      <Heading as="h4">macOS</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>macOS 10.15 (Catalina) or later</li>
                        <li>Intel or Apple Silicon processor</li>
                        <li>4 GB RAM minimum</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col col--4">
                  <div className="card">
                    <div className="card__header">
                      <Heading as="h4">Windows</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>Windows 10 or later</li>
                        <li>64-bit processor</li>
                        <li>4 GB RAM minimum</li>
                      </ul>
                    </div>
                  </div>
                </div>
                <div className="col col--4">
                  <div className="card">
                    <div className="card__header">
                      <Heading as="h4">Linux</Heading>
                    </div>
                    <div className="card__body">
                      <ul>
                        <li>Modern Linux distribution</li>
                        <li>64-bit processor</li>
                        <li>4 GB RAM minimum</li>
                      </ul>
                    </div>
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
