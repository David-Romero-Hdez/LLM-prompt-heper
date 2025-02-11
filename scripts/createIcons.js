import { writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Basic blue square PNG for each size
const iconSizes = [16, 48, 128];

// Simple base64 encoded PNG (blue square)
const base64Icon = 'iVBORw0KGgoAAAANSUhEUgAAAIAAAACACAYAAADDPmHLAAAABHNCSVQICAgIfAhkiAAAAAlwSFlzAAADsQAAA7EB9YPtSQAAABl0RVh0U29mdHdhcmUAd3d3Lmlua3NjYXBlLm9yZ5vuPBoAAAGQSURBVHic7d0xTsNAFEbhN4j0SNmULIk1sAF2EhqUBVCwAJZAg0QH9EQUkVCUiQJl5P/PvO+TvICLq9GM7RkbJEmSJEmSJEmSJEmSpJ4tgBvgGdgBH8Ar8ADcnvG4NLEF4Al//JzWgDPgHtj/43nWa3VmK+CddvHHtQFmJ6xjKHPglXbRD2sLXBz5PkMYgBX94r+f+F5DGIBb+sU+rPsTj38IrfN3+6+19tFHNQCFGYDCDEBhBqAwA1CYASjMABRmAAozAIUZgMIMQGEGoDADUJgBKMwAFGYACjMAhRmAwgxAYQagMANQmAEozAAUZgAKMwCFGYDCDEBhBqAwA1CYASjMABRmAAozAIUZgMIMQGEGoDADUJgBKMwAFGYACjMAhRmAwgxAYQagMANQmAEozAAUZgAKMwCFGYDCDEBhBqAwA1CYASjMABRmAAozAIUZgMIMQGEGoDADUJgBKMwAFGYACjMAhRmAwgxAYQagMANQ2AJ4BHbAJ/AGPANXZzwuSZIkSZIkSZIkSZKkSfwAR5Z6bh5ZCNAAAAAASUVORK5CYII=';

iconSizes.forEach(size => {
  const iconPath = resolve(__dirname, `../public/icon${size}.png`);
  const buffer = Buffer.from(base64Icon, 'base64');
  writeFileSync(iconPath, buffer);
}); 