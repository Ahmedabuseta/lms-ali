import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Formats time in milliseconds to HH:MM:SS or MM:SS format
 */
export function formatTime(milliseconds: number): string {
  // Handle edge cases
  if (isNaN(milliseconds) || milliseconds < 0) {
    return '00:00';
  }

  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds
      .toString()
      .padStart(2, '0')}`;
  }

  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * Formats math expressions for use in MDX and ensures LaTeX is properly formatted
 */
export function formatMathExpression(content: string): string {
  // For inline math, make sure it's properly delimited
  // e.g., $E = mc^2$ would be correctly formatted
  const inlineMathFormatted = content.replace(
    /(?<!\$)\$(?!\$)([^$]+?)(?<!\$)\$(?!\$)/g,
    (_, equation) => `$${equation.trim()}$`,
  );

  // For display/block math, make sure it's properly delimited and spaced
  // e.g., $$\frac{1}{2}$$ should have proper spacing around it
  return inlineMathFormatted.replace(/\$\$([\s\S]*?)\$\$/g, (_, equation) => `\n\n$$${equation.trim()}$$\n\n`);
}

/**
 * Helper to format a complete mathematical solution with proper LaTeX
 * Useful for AI Tutor responses involving step-by-step math solutions
 */
export function formatMathSolution(problem: string, steps: string[]): string {
  const formattedProblem = `## Problem:\n\n${problem}\n\n`;

  const formattedSteps = steps
    .map((step, index) => {
      return `### Step ${index + 1}:\n\n${formatMathExpression(step)}\n`;
    })
    .join('\n');

  return formatMathExpression(formattedProblem + '## Solution:\n\n' + formattedSteps);
}

/**
 * Creates a properly formatted mathematical equation for display
 */
export function createEquation(equation: string, isInline: boolean = false): string {
  if (isInline) {
    return `$${equation.trim()}$`;
  } else {
    return `\n\n$$${equation.trim()}$$\n\n`;
  }
}

/**
 * Specifically formats calculus derivative problems for proper rendering
 */
export function formatDerivativeProblem(functionText: string, steps: { title: string; content: string }[]): string {
  let result = `## Problem:\n\nFind the derivative of $${functionText}$.\n\n`;
  result += `## Solution:\n\n`;

  steps.forEach((step) => {
    result += `### ${step.title}\n\n${formatMathExpression(step.content)}\n\n`;
  });

  return result;
}

/**
 * Properly formats LaTeX with the correct escape sequences
 * This is useful for complex mathematical expressions
 */
export function formatLatex(latex: string): string {
  return (
    latex
      // Properly escape backslashes for LaTeX commands
      .replace(/\\(?!(begin|end|left|right|text|frac|sum|int|prod))/g, '\\\\')

      // Ensure proper spacing around display math
      .replace(/\$\$([\s\S]*?)\$\$/g, '\n\n$$$$1$$\n\n')

      // Fix potential broken inline math formulas
      .replace(/\$([^$\n]+?)(\n)([^$\n]+?)\$/g, '$$$1 $3$$')
  );
}
