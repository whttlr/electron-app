import React, { useRef, useEffect } from 'react';

interface WorkingAreaPreviewProps {
  width?: number;
  height?: number;
  depth?: number;
  highlightAxis?: 'x' | 'y' | 'z' | null;
  toolPosition?: { x: number; y: number; z: number };
}

export const WorkingAreaPreview: React.FC<WorkingAreaPreviewProps> = ({
  width = 200,
  height = 200,
  depth = 100,
  highlightAxis = null,
  toolPosition = { x: 0, y: 0, z: 0 }
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Set up isometric projection constants
    const scale = 1;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Isometric transformation
    const toIso = (x: number, y: number, z: number) => ({
      x: centerX + (x - z) * Math.cos(Math.PI / 6) * scale,
      y: centerY + (x + z) * Math.sin(Math.PI / 6) * scale - y * scale
    });

    // Draw machine boundaries (dashed box)
    ctx.strokeStyle = '#666';
    ctx.setLineDash([5, 5]);
    ctx.lineWidth = 1;

    const corners = [
      { x: -width/2, y: -height/2, z: -depth/2 },
      { x: width/2, y: -height/2, z: -depth/2 },
      { x: width/2, y: height/2, z: -depth/2 },
      { x: -width/2, y: height/2, z: -depth/2 },
      { x: -width/2, y: -height/2, z: depth/2 },
      { x: width/2, y: -height/2, z: depth/2 },
      { x: width/2, y: height/2, z: depth/2 },
      { x: -width/2, y: height/2, z: depth/2 }
    ];

    const isoCorners = corners.map(corner => toIso(corner.x, corner.y, corner.z));

    // Draw bottom face
    ctx.beginPath();
    ctx.moveTo(isoCorners[0].x, isoCorners[0].y);
    ctx.lineTo(isoCorners[1].x, isoCorners[1].y);
    ctx.lineTo(isoCorners[2].x, isoCorners[2].y);
    ctx.lineTo(isoCorners[3].x, isoCorners[3].y);
    ctx.closePath();
    ctx.stroke();

    // Draw top face
    ctx.beginPath();
    ctx.moveTo(isoCorners[4].x, isoCorners[4].y);
    ctx.lineTo(isoCorners[5].x, isoCorners[5].y);
    ctx.lineTo(isoCorners[6].x, isoCorners[6].y);
    ctx.lineTo(isoCorners[7].x, isoCorners[7].y);
    ctx.closePath();
    ctx.stroke();

    // Draw vertical edges
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(isoCorners[i].x, isoCorners[i].y);
      ctx.lineTo(isoCorners[i + 4].x, isoCorners[i + 4].y);
      ctx.stroke();
    }

    // Draw stock material (solid box)
    ctx.setLineDash([]);
    const stockWidth = width * 0.6;
    const stockHeight = height * 0.6;
    const stockDepth = depth * 0.6;

    const stockCorners = [
      { x: -stockWidth/2, y: -stockHeight/2, z: -stockDepth/2 },
      { x: stockWidth/2, y: -stockHeight/2, z: -stockDepth/2 },
      { x: stockWidth/2, y: stockHeight/2, z: -stockDepth/2 },
      { x: -stockWidth/2, y: stockHeight/2, z: -stockDepth/2 },
      { x: -stockWidth/2, y: -stockHeight/2, z: stockDepth/2 },
      { x: stockWidth/2, y: -stockHeight/2, z: stockDepth/2 },
      { x: stockWidth/2, y: stockHeight/2, z: stockDepth/2 },
      { x: -stockWidth/2, y: stockHeight/2, z: stockDepth/2 }
    ];

    const isoStockCorners = stockCorners.map(corner => toIso(corner.x, corner.y, corner.z));

    // Determine face colors based on highlight
    const getFaceColor = (face: string) => {
      if (highlightAxis === 'x' && (face === 'left' || face === 'right')) return '#ff4d4f';
      if (highlightAxis === 'y' && (face === 'front' || face === 'back')) return '#52c41a';
      if (highlightAxis === 'z' && (face === 'top' || face === 'bottom')) return '#1890ff';
      return '#d9d9d9';
    };

    // Draw stock faces
    // Top face
    ctx.fillStyle = getFaceColor('top');
    ctx.beginPath();
    ctx.moveTo(isoStockCorners[4].x, isoStockCorners[4].y);
    ctx.lineTo(isoStockCorners[5].x, isoStockCorners[5].y);
    ctx.lineTo(isoStockCorners[6].x, isoStockCorners[6].y);
    ctx.lineTo(isoStockCorners[7].x, isoStockCorners[7].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Right face
    ctx.fillStyle = getFaceColor('right');
    ctx.beginPath();
    ctx.moveTo(isoStockCorners[1].x, isoStockCorners[1].y);
    ctx.lineTo(isoStockCorners[2].x, isoStockCorners[2].y);
    ctx.lineTo(isoStockCorners[6].x, isoStockCorners[6].y);
    ctx.lineTo(isoStockCorners[5].x, isoStockCorners[5].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Front face
    ctx.fillStyle = getFaceColor('front');
    ctx.beginPath();
    ctx.moveTo(isoStockCorners[0].x, isoStockCorners[0].y);
    ctx.lineTo(isoStockCorners[1].x, isoStockCorners[1].y);
    ctx.lineTo(isoStockCorners[5].x, isoStockCorners[5].y);
    ctx.lineTo(isoStockCorners[4].x, isoStockCorners[4].y);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Draw tool position
    const toolIso = toIso(toolPosition.x, toolPosition.y, toolPosition.z);
    ctx.fillStyle = '#ff7f00';
    ctx.beginPath();
    ctx.arc(toolIso.x, toolIso.y, 4, 0, 2 * Math.PI);
    ctx.fill();

    // Draw axis labels
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.fillText('X', centerX + 50, centerY + 20);
    ctx.fillText('Y', centerX - 60, centerY + 20);
    ctx.fillText('Z', centerX, centerY - 40);

  }, [width, height, depth, highlightAxis, toolPosition]);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
      <canvas
        ref={canvasRef}
        width={300}
        height={250}
        style={{ border: '1px solid #d9d9d9', borderRadius: '4px' }}
      />
    </div>
  );
};

export default WorkingAreaPreview;