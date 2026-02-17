import { FC } from 'react';
import {
  Typography,
  GradientText,
  Card,
  CardBody,
  Badge,
  CodeBlock,
} from '@forgedevstack/bear';
import { API_ITEMS } from '@/constants';

const TYPE_VARIANTS: Record<string, string> = {
  function: 'primary',
  class: 'secondary',
  object: 'info',
  type: 'success',
};

export const ApiReference: FC = () => {
  return (
    <section id="api" className="py-32 relative" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,102,204,0.05), transparent)' }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center mb-16">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
              API Reference
            </GradientText>
          </Typography>
          <Typography className="text-xl opacity-50">
            Complete documentation for all exports
          </Typography>
        </div>

        <div className="grid gap-6">
          {API_ITEMS.map((item, index) => (
            <Card key={index} variant="ghost" padding="lg" radius="2xl">
              <CardBody>
                <div className="flex items-center gap-3 mb-4">
                  <Badge variant={TYPE_VARIANTS[item.type] as any || 'primary'}>
                    {item.type}
                  </Badge>
                  <Typography variant="h4" className="font-bold font-mono">{item.name}</Typography>
                </div>
                <Typography className="opacity-60 mb-4">{item.description}</Typography>
                <CodeBlock
                  code={item.signature}
                  language="typescript"
                  copyable
                />
              </CardBody>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
