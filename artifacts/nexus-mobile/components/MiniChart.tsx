import React from 'react';
import Svg, { Polyline, Path, Defs, LinearGradient, Stop } from 'react-native-svg';

interface MiniChartProps {
  data: number[];
  width: number;
  height: number;
  color: string;
  showGradient?: boolean;
}

export function MiniChart({ data, width, height, color, showGradient = false }: MiniChartProps) {
  if (!data || data.length < 2) return null;

  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const padding = height * 0.08;
  const usableHeight = height - padding * 2;

  const points = data.map((val, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = padding + usableHeight - ((val - min) / range) * usableHeight;
    return [x, y] as [number, number];
  });

  const polylinePoints = points.map(([x, y]) => `${x},${y}`).join(' ');

  // Build a closed path for the gradient fill area
  const pathD = points.reduce((acc, [x, y], i) => {
    return acc + (i === 0 ? `M${x},${y}` : ` L${x},${y}`);
  }, '') + ` L${points[points.length - 1][0]},${height} L${points[0][0]},${height} Z`;

  return (
    <Svg width={width} height={height}>
      {showGradient && (
        <Defs>
          <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
            <Stop offset="0" stopColor={color} stopOpacity={0.25} />
            <Stop offset="1" stopColor={color} stopOpacity={0} />
          </LinearGradient>
        </Defs>
      )}
      {showGradient && (
        <Path d={pathD} fill="url(#grad)" />
      )}
      <Polyline
        points={polylinePoints}
        fill="none"
        stroke={color}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
