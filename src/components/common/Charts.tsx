import React from 'react';
import { Card, CardContent, Box, Typography } from '@mui/material';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';

export interface BarChartData {
  name: string;
  value: number;
  color?: string;
}

export interface LineChartData {
  name: string;
  value: number;
  date?: string;
}

export interface PieChartData {
  name: string;
  value: number;
  color: string;
}

export interface CustomBarChartProps {
  data: BarChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  loading?: boolean;
}

export interface CustomLineChartProps {
  data: LineChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  color?: string;
  loading?: boolean;
}

export interface CustomPieChartProps {
  data: PieChartData[];
  title?: string;
  subtitle?: string;
  height?: number;
  loading?: boolean;
}

const COLORS = [
  '#2196f3', '#ff9800', '#4caf50', '#f44336',
  '#9c27b0', '#00bcd4', '#ffc107', '#795548'
];

export const CustomBarChart: React.FC<CustomBarChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  color = '#2196f3',
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
            <Typography color="text.secondary">차트 로딩 중...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Bar
              dataKey="value"
              fill={color}
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const CustomLineChart: React.FC<CustomLineChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  color = '#2196f3',
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
            <Typography color="text.secondary">차트 로딩 중...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            />
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={3}
              dot={{ fill: color, strokeWidth: 2, r: 6 }}
              activeDot={{ r: 8, fill: color }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};

export const CustomPieChart: React.FC<CustomPieChartProps> = ({
  data,
  title,
  subtitle,
  height = 300,
  loading = false
}) => {
  if (loading) {
    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height }}>
            <Typography color="text.secondary">차트 로딩 중...</Typography>
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent>
        {(title || subtitle) && (
          <Box sx={{ mb: 2 }}>
            {title && (
              <Typography variant="h6" sx={{ fontWeight: 600 }}>
                {title}
              </Typography>
            )}
            {subtitle && (
              <Typography variant="body2" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>
        )}

        <ResponsiveContainer width="100%" height={height}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};