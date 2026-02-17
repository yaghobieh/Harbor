import { FC } from 'react';
import {
  Typography,
  Container,
  Flex,
  Grid,
  GridItem,
  GradientText,
} from '@forgedevstack/bear';
import { FeatureCard } from '../FeatureCard/FeatureCard';
import { FEATURES } from '@/constants';

export const Features: FC = () => {
  return (
    <section id="features" className="py-32 relative">
      <Container style={{ maxWidth: '72rem' }}>
        <Flex direction="column" align="center" className="mb-20">
          <Typography variant="h2" className="text-4xl md:text-5xl font-bold mb-4">
            <GradientText preset="ocean" className="text-4xl md:text-5xl font-bold">
              Everything You Need
            </GradientText>
          </Typography>
          <Typography className="text-xl opacity-50 max-w-2xl text-center">
            A complete toolkit for building production-ready Node.js backends
          </Typography>
        </Flex>

        <Grid cols={{ base: 1, md: 2, lg: 3 }} gap={6}>
          {FEATURES.map((feature) => (
            <GridItem key={feature.id}>
              <FeatureCard feature={feature} />
            </GridItem>
          ))}
        </Grid>
      </Container>
    </section>
  );
};
