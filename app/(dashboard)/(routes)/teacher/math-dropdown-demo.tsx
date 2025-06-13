'use client';

import { MathDropdown } from '@/components/ui/math-dropdown';
import { Card } from '@/components/ui/card';

export default function MathDropdownDemo() { const examples = [
    {
      title: 'Quadratic Formula',
      content:
        'The roots of $ax^2 + bx + c = 0$ are given by:\n\n$$x = \\frac{-b \\pm \\sqrt{b^2 - 4ac }}{2a}$$\n\nThis formula is derived by completing the square for a general quadratic equation.',
    },
    { title: 'Calculus: Integration by Parts',
      content:
        'The integration by parts formula is:\n\n$$\\int u(x)v\'(x)\\,dx = u(x)v(x) - \\int u\'(x)v(x)\\,dx$$\n\nThis is often remembered with the mnemonic: \'LIATE\' (Logarithm, Inverse trig, Algebraic, Trigonometric, Exponential).', },
    { title: 'Multiple Choice Question Example',
      content:
        'If $f(x) = 3x^2 - 4x + 2$, what is the value of $f\'(2)$?\n\n**Options:**\n\nA. $8$\n\nB. $8 - 4 = 4$\n\nC. $12 - 4 = 8$\n\nD. $2$\n\n**Answer:** Option B is correct because $f\'(x) = 6x - 4$, so $f\'(2) = 6(2) - 4 = 12 - 4 = 8$.', },
    { title: 'Statistics: Normal Distribution',
      content:
        'The probability density function of the normal distribution is:\n\n$$f(x) = \\frac{1 }{\\sigma\\sqrt{2\\pi}}e^{-\\frac{1}{2}\\left(\\frac{x-\\mu}{\\sigma}\\right)^2}$$\n\nWhere:\n- $\\mu$ is the mean\n- $\\sigma$ is the standard deviation',
    },
    { title: 'Linear Algebra: Determinant of a 2×2 Matrix',
      content:
        'For a matrix $A = \\begin{pmatrix } a & b \\\\ c & d \\end{pmatrix}$, the determinant is calculated as:\n\n$$\\det(A) = ad - bc$$',
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-muted/30 to-background">
      {/* Enhanced decorative elements for both themes */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute left-10 top-20 h-48 w-48 animate-pulse rounded-full bg-gradient-to-br from-primary/5 to-secondary/5 blur-3xl" />
        <div
          className="absolute bottom-1/4 right-20 h-64 w-64 animate-pulse rounded-full bg-gradient-to-br from-accent/5 to-primary/5 blur-3xl"
          style={ { animationDelay: '2s' }}
         />
      </div>

      <div className="relative z-10 space-y-6 p-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">أمثلة القوائم المنسدلة للرياضيات</h1>
          <p className="mt-2 text-muted-foreground">
            انقر على كل قائمة منسدلة لرؤية الصيغ الرياضية المعروضة باستخدام MDX
          </p>
        </div>

        <div className="space-y-4">
          { examples.map((example, index) => (
            <MathDropdown key={index } title={example.title} content={example.content} defaultOpen={index === 0} />
          ))}
        </div>

        <Card className="mt-8 border border-border/50 bg-card/60 p-6 shadow-lg backdrop-blur-sm">
          <h2 className="mb-4 text-xl font-semibold text-foreground">تعليمات الاستخدام</h2>
          <div className="space-y-3">
            <p className="text-foreground">يدعم مكون القائمة المنسدلة للرياضيات:</p>
            <ul className="list-disc space-y-1 pl-5 text-muted-foreground">
              <li>التعبيرات الرياضية في كل من العنوان والمحتوى</li>
              <li>
                الرياضيات المضمنة مع علامات الدولار المفردة:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">$x^2$</code>
              </li>
              <li>
                الرياضيات المعروضة مع علامات الدولار المزدوجة:{' '}
                <code className="rounded bg-muted px-1.5 py-0.5 text-sm">$$\int_0^1 x^2 dx$$</code>
              </li>
              <li>تنسيق Markdown (عريض، مائل، قوائم) في المحتوى</li>
            </ul>
            <p className="mt-3 text-sm text-muted-foreground">
              للاستخدام في الكود:
              <code className="ml-2 mt-1 block rounded bg-muted px-2 py-1 text-xs">
                {`<MathDropdown title="Title with $math$" content="Content with $$math$$" />`}
              </code>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}
