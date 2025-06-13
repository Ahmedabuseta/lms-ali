'use client';

import { MathRenderer } from '@/components/math-renderer';
import { Card } from '@/components/ui/card';

export default function MathExamples() { const examples = [
    {
      title: 'Basic Algebra',
      content: 'Solve for x: $x^2 - 5x + 6 = 0$', },
    { title: 'Pythagoras Theorem',
      content:
        'In a right triangle, the square of the length of the hypotenuse equals the sum of squares of the other two sides: $a^2 + b^2 = c^2$', },
    { title: 'Quadratic Formula',
      content: 'The roots of $ax^2 + bx + c = 0$ are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac }}{2a}$$',
    },
    { title: 'Calculus - Integration',
      content: 'The integral of $f(x) = x^2$ is:\n\n$$\\int x^2 dx = \\frac{x^3 }{3} + C$$',
    },
    { title: 'Calculus - Derivative',
      content: 'The derivative of $f(x) = \\sin(x)$ is:\n\n$$\\frac{d }{dx}\\sin(x) = \\cos(x)$$',
    },
    { title: 'Sequence & Series',
      content:
        'The sum of an infinite geometric series with first term $a$ and common ratio $r$ (where $|r| < 1$) is:\n\n$$S = \\frac{a }{1-r}$$',
    },
    { title: 'Matrix',
      content:
        'A matrix can be represented as:\n\n$$A = \\begin{pmatrix } a_{11} & a_{12} \\\\ a_{21} & a_{22} \\end{pmatrix}$$',
    },
    { title: 'Probability',
      content: 'If $A$ and $B$ are independent events, then $P(A \\cap B) = P(A) \\cdot P(B)$', },
    { title: 'Statistics - Normal Distribution',
      content:
        'The probability density function of a normal distribution is:\n\n$$f(x) = \\frac{1 }{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$',
    },
    { title: 'Physics - Einstein\'s Equation',
      content: 'The mass-energy equivalence is given by:\n\n$$E = mc^2$$', },
  ];

  return (
    <div className="space-y-6 p-6">
      <h1 className="text-2xl font-bold">Math Examples for Testing</h1>
      <p className="text-gray-500">These examples demonstrate how math formulas will appear in your exam questions</p>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        { examples.map((example, index) => (
          <Card key={index } className="p-4 shadow-md">
            <h2 className="mb-2 text-xl font-semibold">{example.title}</h2>
            <div className="rounded-md bg-gray-50 p-3">
              <MathRenderer content={example.content} />
            </div>
          </Card>
        ))}
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Sample Multiple Choice Question</h2>
        <Card className="p-4 shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Question:</h3>
            <MathRenderer content="If $f(x) = 3x^2 - 4x + 2$, what is the value of $f'(2)$?" className="text-lg" />
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium">Options:</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-md border p-2">
                <MathRenderer content="A. $8$" />
              </div>
              <div className="rounded-md border border-green-200 bg-green-50 p-2">
                <MathRenderer content="B. $8 - 4 = 4$" /> ✓
              </div>
              <div className="rounded-md border p-2">
                <MathRenderer content="C. $12 - 4 = 8$" />
              </div>
              <div className="rounded-md border p-2">
                <MathRenderer content="D. $2$" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="mb-4 text-xl font-bold">Sample True/False Question</h2>
        <Card className="p-4 shadow-md">
          <div className="mb-4">
            <h3 className="text-lg font-medium">Question:</h3>
            <MathRenderer
              content="The equation $\\frac{d}{dx}(x^n) = nx^{n-1}$ is true for all values of $n$."
              className="text-lg"
            />
          </div>

          <div className="space-y-2">
            <h3 className="text-md font-medium">Options:</h3>
            <div className="grid grid-cols-1 gap-2">
              <div className="rounded-md border p-2">
                <MathRenderer content="True" />
              </div>
              <div className="rounded-md border border-green-200 bg-green-50 p-2">
                <MathRenderer content="False" /> ✓
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
