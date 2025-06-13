'use client';

import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription } from '@/components/ui/form';
import { Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Plus,
  Trash2,
  Eye,
  Calculator,
  FileText,
  BookOpen,
  AlertCircle,
  Lightbulb } from 'lucide-react';
import { MathRenderer } from '@/components/math-renderer';
import { MDXRenderer } from '@/components/mdx-renderer';
import { cn } from '@/lib/utils';

const questionSchema = z.object({ text: z.string().min(1, 'نص السؤال مطلوب'),
  type: z.enum(['MULTIPLE_CHOICE', 'TRUE_FALSE', 'PASSAGE']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD']).optional(),
  points: z.number().min(1, 'النقاط مطلوبة').max(100).optional(),
  explanation: z.string().optional(),
  questionBankId: z.string().min(1, 'بنك الأسئلة مطلوب'),
  passageId: z.string().optional(),
  options: z.array(
    z.object({
      text: z.string().min(1, 'نص الخيار مطلوب'),
      isCorrect: z.boolean(), })
  ).min(2, 'يجب أن يكون هناك خياران على الأقل')
    .refine((options) => options.some((option) => option.isCorrect), { message: 'يجب اختيار إجابة صحيحة واحدة على الأقل', }),
});

export type QuestionFormData = z.infer<typeof questionSchema>;

export interface QuestionFormProps { initialData?: {
    id?: string;
    text: string;
    type: 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'PASSAGE';
    difficulty?: 'EASY' | 'MEDIUM' | 'HARD';
    points?: number;
    explanation?: string;
    questionBankId: string;
    passageId?: string;
    options: Array<{
      id?: string;
      text: string;
      isCorrect: boolean; }>;
  };
  questionBanks: Array<{ id: string;
    title: string;
    course: { title: string };
    chapter?: { title: string };
  }>;
  passages?: Array<{ id: string;
    title: string;
    content: string; }>;
  onSubmit: (data: QuestionFormData) => Promise<void>;
  onCancel?: () => void;
  isSubmitting?: boolean;
  mode?: 'create' | 'edit';
  className?: string;
  // Layout options
  layout?: 'standard' | 'compact';
  // Show options
  showPreview?: boolean;
  showMathHelp?: boolean;
  // Constraints
  allowPassageType?: boolean;
  maxOptions?: number;
  defaultQuestionBank?: string;
}

const getDifficultyLabel = (difficulty?: string) => { switch (difficulty) {
    case 'EASY': return 'سهل';
    case 'MEDIUM': return 'متوسط';
    case 'HARD': return 'صعب';
    default: return ''; }
};

const getTypeLabel = (type: string) => { switch (type) {
    case 'MULTIPLE_CHOICE': return 'اختيار متعدد';
    case 'TRUE_FALSE': return 'صح أم خطأ';
    case 'PASSAGE': return 'قطعة';
    default: return type; }
};

export const QuestionForm: React.FC<QuestionFormProps> = ({ initialData,
  questionBanks,
  passages = [],
  onSubmit,
  onCancel,
  isSubmitting = false,
  mode = 'create',
  className,
  layout = 'standard',
  showPreview = true,
  showMathHelp = true,
  allowPassageType = true,
  maxOptions = 6,
  defaultQuestionBank, }) => { const [showQuestionPreview, setShowQuestionPreview] = useState(false);
  const [currentPassage, setCurrentPassage] = useState<any>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      text: initialData?.text || '',
      type: initialData?.type || 'MULTIPLE_CHOICE',
      difficulty: initialData?.difficulty || 'MEDIUM',
      points: initialData?.points || 1,
      explanation: initialData?.explanation || '',
      questionBankId: initialData?.questionBankId || defaultQuestionBank || '',
      passageId: initialData?.passageId || '',
      options: initialData?.options || [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ],
    },
  });

  const { fields, append, remove } = useFieldArray({ control: form.control,
    name: 'options', });

  const questionType = form.watch('type');
  const selectedPassageId = form.watch('passageId');
  const questionText = form.watch('text');

  // Update passage info when selection changes
  useEffect(() => {
    if (selectedPassageId) {
      const passage = passages.find(p => p.id === selectedPassageId);
      setCurrentPassage(passage);
    } else {
      setCurrentPassage(null);
    }
  }, [selectedPassageId, passages]);

  // Reset options when changing question type
  useEffect(() => { if (questionType === 'TRUE_FALSE') {
      form.setValue('options', [
        { text: 'صحيح', isCorrect: false },
        { text: 'خطأ', isCorrect: false },
      ]);
    } else if (questionType === 'MULTIPLE_CHOICE' && fields.length < 2) { form.setValue('options', [
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
        { text: '', isCorrect: false },
      ]);
    }
  }, [questionType, form, fields.length]);

  // Clear passage if not passage type
  useEffect(() => { if (questionType !== 'PASSAGE') {
      form.setValue('passageId', ''); }
  }, [questionType, form]);

  const addOption = () => { if (fields.length < maxOptions) {
      append({ text: '', isCorrect: false });
    }
  };

  const removeOption = (index: number) => {
    if (fields.length > 2) {
      remove(index);
    }
  };

  const toggleCorrectAnswer = (index: number) => { const currentOptions = form.getValues('options');

    if (questionType === 'TRUE_FALSE') {
      // For true/false, only one can be correct
      currentOptions.forEach((option, i) => {
        option.isCorrect = i === index; });
    } else { // For multiple choice, toggle the selected option
      currentOptions[index].isCorrect = !currentOptions[index].isCorrect; }

    form.setValue('options', currentOptions);
  };

  const containsMath = (text: string) => {
    return text.includes('$') || text.includes('\\') || text.includes('```');
  };

  const renderPreview = (content: string) => {
    if (!content.trim()) return null;

    if (containsMath(content)) {
      return <MDXRenderer content={content} />;
    }
    return <MathRenderer content={content} />;
  };

  const handleSubmit = async (data: QuestionFormData) => {
    try {
      // Transform placeholder values back to proper values before submission
      const transformedData = {
        ...data,
        passageId: data.passageId === 'NO_PASSAGE' ? undefined : data.passageId,
      };
      
      await onSubmit(transformedData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <div className={ cn('space-y-6', className) }>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">

          {/* Question Bank Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                معلومات السؤال
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="questionBankId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>بنك الأسئلة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر بنك الأسئلة" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {questionBanks.map((qb) => (
                            <SelectItem key={qb.id} value={qb.id}>
                              <div className="text-right">
                                <div className="font-medium">{qb.title}</div>
                                <div className="text-sm text-gray-500">
                                  {qb.course.title}
                                  {qb.chapter && ` - ${qb.chapter.title}`}
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>نوع السؤال</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر نوع السؤال" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="MULTIPLE_CHOICE">اختيار متعدد</SelectItem>
                          <SelectItem value="TRUE_FALSE">صح أم خطأ</SelectItem>
                          {allowPassageType && (
                            <SelectItem value="PASSAGE">قطعة</SelectItem>
                          )}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="difficulty"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>مستوى الصعوبة</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                        disabled={isSubmitting}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="اختر المستوى" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EASY">سهل</SelectItem>
                          <SelectItem value="MEDIUM">متوسط</SelectItem>
                          <SelectItem value="HARD">صعب</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="points"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>النقاط</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          min="1"
                          max="100"
                          disabled={isSubmitting}
                          placeholder="1"
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {questionType === 'PASSAGE' && passages.length > 0 && (
                  <FormField
                    control={form.control}
                    name="passageId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>القطعة</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          disabled={isSubmitting}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="اختر القطعة" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="NO_PASSAGE">بدون قطعة</SelectItem>
                            {passages.map((passage) => (
                              <SelectItem key={passage.id} value={passage.id}>
                                {passage.title}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </CardContent>
          </Card>

          {/* Passage Display */}
          { currentPassage && (
            <Card className="border-blue-200 bg-blue-50/50 dark:bg-blue-900/10">
              <CardHeader>
                <CardTitle className="text-blue-900 dark:text-blue-100">
                  القطعة: {currentPassage.title }
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none text-blue-800 dark:text-blue-200">
                  {renderPreview(currentPassage.content)}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Question Text */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  نص السؤال
                </CardTitle>
                {showPreview && questionText && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setShowQuestionPreview(!showQuestionPreview)}
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    { showQuestionPreview ? 'إخفاء المعاينة' : 'معاينة' }
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="text"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>السؤال</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل نص السؤال... يمكنك استخدام صيغ رياضية مثل $x^2$ أو $$\int x dx$$"
                        className="min-h-[100px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      يمكنك استخدام صيغ LaTeX للرياضيات والـ MDX للمحتوى المتقدم
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              { showMathHelp && (
                <Alert>
                  <Calculator className="h-4 w-4" />
                  <AlertDescription>
                    <div className="text-sm">
                      <strong>أمثلة على الصيغ الرياضية:</strong>
                      <br />• للرياضيات المدمجة: {"$x^2 + y^2 = z^2$" }
                      <br />• للمعادلات المعروضة: {"$$\\int_0^1 x^2 dx = \\frac{1}{3}$$"}
                      <br />• للكسور: {"$\\frac{1}{2}$"} أو {"$\\frac{x}{y}$"}
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Question Preview */}
              { showQuestionPreview && questionText && (
                <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg border">
                  <div className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                    معاينة السؤال:
                  </div>
                  <div className="prose prose-sm max-w-none">
                    {renderPreview(questionText) }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Options */}
          <Card>
            <CardHeader>
              <CardTitle>خيارات الإجابة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              { fields.map((field, index) => (
                <div key={field.id } className="flex items-start gap-3 p-4 border rounded-lg">
                  <FormField
                    control={form.control}
                    name={`options.${index}.isCorrect`}
                    render={ ({ field: checkboxField }) => (
                      <FormItem className="flex items-center space-y-0">
                        <FormControl>
                          <Checkbox
                            checked={checkboxField.value}
                            onCheckedChange={() => toggleCorrectAnswer(index)}
                            disabled={isSubmitting}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />

                  <div className="flex-1 space-y-2">
                    <FormField
                      control={form.control}
                      name={`options.${index}.text`}
                      render={ ({ field: textField }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                              placeholder={`الخيار ${String.fromCharCode(65 + index)}`}
                              disabled={isSubmitting || (questionType === 'TRUE_FALSE')}
                              {...textField}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    {/* Option Preview */}
                    {form.watch(`options.${index}.text`) && containsMath(form.watch(`options.${index}.text`)) && (
                      <div className="p-2 bg-gray-50 dark:bg-gray-800 rounded border text-sm">
                        {renderPreview(form.watch(`options.${index}.text`))}
                      </div>
                    )}
                  </div>

                  {questionType === 'MULTIPLE_CHOICE' && fields.length > 2 && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeOption(index)}
                      disabled={isSubmitting}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}

              {questionType === 'MULTIPLE_CHOICE' && fields.length < maxOptions && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={addOption}
                  disabled={isSubmitting}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  إضافة خيار
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Explanation */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                تفسير الإجابة (اختياري)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="explanation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>تفسير الإجابة الصحيحة</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="أدخل تفسير الإجابة الصحيحة (اختياري)..."
                        className="min-h-[80px]"
                        disabled={isSubmitting}
                        {...field}
                      />
                    </FormControl>
                    <FormDescription>
                      سيظهر هذا التفسير للطلاب بعد إجابة السؤال
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Explanation Preview */}
              { form.watch('explanation') && (
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-900/10 rounded-lg border border-amber-200">
                  <div className="text-sm font-medium text-amber-800 dark:text-amber-300 mb-2">
                    معاينة التفسير:
                  </div>
                  <div className="text-amber-700 dark:text-amber-200">
                    {renderPreview(form.watch('explanation') || '') }
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-4">
            {onCancel && (
              <Button
                type="button"
                variant="outline"
                onClick={onCancel}
                disabled={isSubmitting}
              >
                إلغاء
              </Button>
            )}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="min-w-[120px]"
            >
              { isSubmitting ? (
                <>جاري الحفظ...</>
              ) : (
                <>{mode === 'edit' ? 'حفظ التغييرات' : 'إنشاء السؤال' }</>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};
