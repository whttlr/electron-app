import React from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from '../../../ui/shared';

export const TypographyDemo: React.FC = () => {
  return (
    <section>
      <h2 className="text-2xl font-semibold text-foreground mb-6 heading">
        Typography
      </h2>
      <div className="space-y-6">
        {/* Headings */}
        <Card>
          <CardHeader>
            <CardTitle>Headings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <h1 className="text-4xl font-bold text-foreground heading">Heading 1 - Main Title</h1>
              <h2 className="text-3xl font-semibold text-foreground heading">Heading 2 - Section Title</h2>
              <h3 className="text-2xl font-semibold text-foreground">Heading 3 - Subsection</h3>
              <h4 className="text-xl font-medium text-foreground">Heading 4 - Component Title</h4>
              <h5 className="text-lg font-medium text-foreground">Heading 5 - Small Header</h5>
              <h6 className="text-base font-medium text-foreground">Heading 6 - Smallest Header</h6>
            </div>
          </CardContent>
        </Card>

        {/* Body Text */}
        <Card>
          <CardHeader>
            <CardTitle>Body Text & Paragraphs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <p className="text-lg text-foreground">
                Large body text - This is the largest body text size, used for prominent descriptions and introductory content.
              </p>
              <p className="text-base text-foreground">
                Regular body text - This is the standard body text size for most content, providing good readability.
              </p>
              <p className="text-sm text-foreground">
                Small body text - This is smaller text used for captions, labels, and secondary information.
              </p>
              <p className="text-xs text-foreground">
                Extra small text - Used for very minor details, timestamps, and fine print.
              </p>
              <p className="text-muted-foreground">
                Muted text - Used for secondary information with reduced emphasis.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Special Text */}
        <Card>
          <CardHeader>
            <CardTitle>Text Variants & Styles</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <p className="font-bold text-foreground">Bold text for emphasis</p>
              <p className="font-semibold text-foreground">Semibold text for headings</p>
              <p className="font-medium text-foreground">Medium weight text</p>
              <p className="font-normal text-foreground">Normal weight text</p>
              <p className="font-light text-foreground">Light weight text</p>
              <p className="italic text-foreground">Italic text for emphasis</p>
              <p className="underline text-foreground">Underlined text for links</p>
              <p className="line-through text-muted-foreground">Strikethrough text</p>
              <p className="font-mono text-sm bg-muted px-2 py-1 rounded text-foreground">
                Monospace text for code: function() {'{ return true; }'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Color Variants */}
        <Card>
          <CardHeader>
            <CardTitle>Text Colors</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p className="text-foreground">Primary text color</p>
              <p className="text-muted-foreground">Muted text color</p>
              <p className="text-primary">Primary brand color</p>
              <p className="text-green-400">Success color</p>
              <p className="text-red-400">Error/danger color</p>
              <p className="text-amber-400">Warning color</p>
              <p className="text-blue-400">Info color</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
};