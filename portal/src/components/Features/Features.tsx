import { FC } from 'react';
import {
  Typography,
  Container,
  Flex,
  Masonry,
  GradientText,
} from '@forgedevstack/bear';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { FEATURES } from '@/constants';

export const Features: FC = () => {
  return (
    <section id="features" className="py-16 md:py-20 relative">
      <Container style={{ maxWidth: '76rem' }}>
        <Flex direction="column" align="center" className="mb-8">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
              Everything You Need
            </GradientText>
          </Typography>
          <Typography className="text-xl opacity-50 max-w-2xl text-center">
            A complete toolkit for building production-ready Node.js backends
          </Typography>
        </Flex>

        <Masonry columns={{ base: 1, sm: 2, lg: 3, xl: 4 }} gap={12}>
          {FEATURES.map((feature) => (
            <FeatureCard key={feature.id} feature={feature} />
          ))}
        </Masonry>
      </Container>
    </section>
  );
};
