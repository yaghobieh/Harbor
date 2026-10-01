import { FC } from 'react';
import {
  Typography,
  GradientText,
  Badge,
  CodeBlock,
  Tabs,
  TabList,
  Tab,
  TabPanel,
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
    <section id="api" className="py-20 md:py-32 relative" style={{ background: 'linear-gradient(to bottom, transparent, rgba(0,102,204,0.05), transparent)' }}>
      <div className="max-w-6xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10 md:mb-16">
          <Typography variant="h2" className="text-3xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-3xl md:text-5xl font-bold">
              API Reference
            </GradientText>
          </Typography>
          <Typography className="text-lg md:text-xl opacity-50">
            Each function, with the example that calls it
          </Typography>
        </div>

        <Tabs defaultTab={API_ITEMS[0]?.id} variant="pills">
          <TabList className="flex gap-2 overflow-x-auto pb-2 mb-8">
            {API_ITEMS.map((item) => (
              <Tab key={item.id} id={item.id}>
                {item.tab}
              </Tab>
            ))}
          </TabList>

          {API_ITEMS.map((item) => (
            <TabPanel key={item.id} tabId={item.id}>
              <div className="flex flex-wrap items-center gap-3 mb-3">
                <Badge variant={(TYPE_VARIANTS[item.type] ?? 'primary') as 'primary'}>
                  {item.type}
                </Badge>
                <Typography variant="h4" className="font-bold font-mono text-base sm:text-lg break-all">
                  {item.name}
                </Typography>
              </div>
              <Typography className="opacity-60 mb-4">{item.description}</Typography>
              <CodeBlock
                code={item.signature}
                language="typescript"
                copyable
                showLineNumbers
              />
            </TabPanel>
          ))}
        </Tabs>
      </div>
    </section>
  );
};
