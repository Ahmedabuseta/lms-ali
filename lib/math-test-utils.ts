// Sample complex math examples for testing the math rendering capabilities
// You can paste any of these examples into your AI tutor to test rendering

export const mathExamples = { // Simple inline math
  inlineMath: 'The formula for the area of a circle is $A = \\pi r^2$.',

  // Display math with fractions
  fractions: `
A fraction example:

$$\\frac{1 }{2} + \\frac{1}{3} = \\frac{3}{6} + \\frac{2}{6} = \\frac{5}{6}$$
`,

  // Complex equation with multiple elements
  complexEquation: `
Here's a more complex equation:

$$\\int_{0}^{\\infty} e^{-x^2} dx = \\frac{\\sqrt{\\pi}}{2}$$
`,

  // Calculus problem example
  calculus: `
## Problem:

A conical tank (vertex down) has a height of 4 meters and a base radius of 2 meters. Water is pumped into the tank at a rate of 3 m³/min. How fast is the water level rising when the water is 1 meter deep?

## Solution:

Step 1: Define Variables and Relationships

Let $h$ be the height of the water at time $t$.
Let $r$ be the radius of the water's surface at time $t$.

Similar triangles relate $r$ and $h$:

$$\\frac{r}{h} = \\frac{\\text{base radius}}{\\text{height}} = \\frac{2}{4} \\quad \\Rightarrow \\quad r = \\frac{h}{2}$$

Step 2: Express Volume in Terms of $h$

Volume of a cone:

$$V = \\frac{1}{3} \\pi r^2 h$$

Substitute $r = \\frac{h}{2}$:

$$V = \\frac{1}{3} \\pi \\left(\\frac{h}{2}\\right)^2 h = \\frac{1}{12} \\pi h^3$$

Step 3: Differentiate with Respect to Time

$$\\frac{dV}{dt} = \\frac{1}{4} \\pi h^2 \\frac{dh}{dt}$$

Step 4: Plug in Values

We know $\\frac{dV}{dt} = 3$ (water is pumped in at 3 m³/min) and $h = 1$ (current water height).

$$3 = \\frac{1}{4} \\pi (1)^2 \\frac{dh}{dt}$$

$$3 = \\frac{\\pi}{4} \\frac{dh}{dt}$$

$$\\frac{dh}{dt} = \\frac{12}{\\pi} \\approx 3.82 \\text{ m/min}$$

The water level is rising at approximately 3.82 meters per minute when the water is 1 meter deep.
`,

  // Matrix example
  matrix: `
A matrix example:

$$\\begin{pmatrix}
a & b & c \\\\
d & e & f \\\\
g & h & i
\\end{pmatrix}
\\cdot
\\begin{pmatrix}
x \\\\
y \\\\
z
\\end{pmatrix}
=
\\begin{pmatrix}
ax + by + cz \\\\
dx + ey + fz \\\\
gx + hy + iz
\\end{pmatrix}$$
`,
};

// Function to generate a test message for the AI tutor
export function generateMathTestMessage(example: keyof typeof mathExamples): string { return `Here's an example of complex math that should render correctly:

${mathExamples[example] }

Please let me know if the math rendering looks correct.`;
}
