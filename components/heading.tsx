import { LucideIcon } from 'lucide-react';

interface HeadingProps { title: string;
  description: string;
  icon: LucideIcon;
  iconColor?: string;
  bgColor?: string; }

export const Heading = ({ title, description, icon: Icon, iconColor, bgColor }: HeadingProps) => {
  return (
    <div className="mb-8 flex items-center gap-x-3">
      <div className={`w-fit rounded-md p-2 ${bgColor}`}>
        <Icon className={`h-10 w-10 ${iconColor}`} />
      </div>
      <div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
};
