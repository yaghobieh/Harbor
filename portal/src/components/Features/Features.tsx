import { FC } from 'react';
import { GradientText } from '../GradientText/GradientText';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { FEATURES } from '@/constants';

export const Features: FC = () => {
  return (
    <section id="features" className="py-32 relative">
      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText>Everything You Need</GradientText>
          </h2>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto">
            A complete toolkit for building production-ready Node.js backends
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </div>
      </div>
    </section>
  );
};

