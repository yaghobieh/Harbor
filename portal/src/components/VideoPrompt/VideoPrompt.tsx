import { FC } from 'react';
import { TorchPlayer, TorchProvider } from '@forgedevstack/torch';
import { WALKTHROUGH_VIDEO } from '@/constants';

export const VideoPrompt: FC = () => {
  return (
    <section className="px-4 sm:px-6 pb-16">
      <div className="max-w-4xl mx-auto">
        <TorchProvider config={{ accentColor: '#3385ff' }}>
          {WALKTHROUGH_VIDEO ? (
            <TorchPlayer
              src={WALKTHROUGH_VIDEO}
              size="full"
              centerOverlay
              title="Harbor"
              accentColor="#3385ff"
            />
          ) : (
            <div
              className="aspect-video rounded-2xl"
              style={{ backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}
              aria-label="Harbor video"
            />
          )}
        </TorchProvider>
      </div>
    </section>
  );
};
