'use client';

import { MathDropdown } from "@/components/ui/math-dropdown";
import { Card } from "@/components/ui/card";

export default function MathDropdownDemo() {
  const examples = [
    {
      title: "Quadratic Formula",
      content: "The roots of $ax^2 + bx + c = 0$ are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$$\n\nThis formula is derived by completing the square for a general quadratic equation."
    },
    {
      title: "Calculus: Integration by Parts",
      content: "The integration by parts formula is:\n\n$$\\int u(x)v'(x)\\,dx = u(x)v(x) - \\int u'(x)v(x)\\,dx$$\n\nThis is often remembered with the mnemonic: 'LIATE' (Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential)."
    },
    {
      title: "Multiple Choice Question Example",
      content: "If $f(x) = 3x^2 - 4x + 2$, what is the value of $f'(2)$?\n\n**Options:**\n\nA. $8$\n\nB. $8 - 4 = 4$\n\nC. $12 - 4 = 8$\n\nD. $2$\n\n**Answer:** Option B is correct because $f'(x) = 6x - 4$, so $f'(2) = 6(2) - 4 = 12 - 4 = 8$."
    },
    {
      title: "Statistics: Normal Distribution",
      content: "The probability density function of the normal distribution is:\n\n$$f(x) = \\frac{1}{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$\n\nWhere:\n- $\\mu$ is the mean\n- $\\sigma$ is the standard deviation"
    },
    {
      title: "Linear Algebra: Determinant of a 2×2 Matrix",
      content: "For a matrix $A = \\begin{pmatrix} a & b \\\\ c & d \\end{pmatrix}$, the determinant is calculated as:\n\n$$\\det(A) = ad - bc$$"
    }
  ];

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold">Math Dropdown Examples</h1>
      <p className="text-gray-500">Click on each dropdown to see mathematical formulas rendered with MDX</p>
      
      <div className="space-y-4">
        {examples.map((example, index) => (
          <MathDropdown 
            key={index}
            title={example.title}
            content={example.content}
            defaultOpen={index === 0}
          />
        ))}
      </div>

      <Card className="p-4 mt-8">
        <h2 className="text-xl font-semibold mb-2">Usage Instructions</h2>
        <div className="space-y-2">
          <p>The MathDropdown component supports:</p>
          <ul className="list-disc pl-5">
            <li>Math expressions in both title and content</li>
            <li>Inline math with single dollar signs: <code>$x^2$</code></li>
            <li>Display math with double dollar signs: <code>$$\int_0^1 x^2 dx$$</code></li>
            <li>Markdown formatting (bold, italic, lists) in the content</li>
          </ul>
          <p className="text-sm text-gray-500 mt-2">
            To use in your code: <code>{`<MathDropdown title="Title with $math$" content="Content with $$math$$" />`}</code>
          </p>
        </div>
      </Card>
    </div>
  );
}