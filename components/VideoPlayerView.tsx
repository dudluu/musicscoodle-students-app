import React, { useEffect } from 'react';
import { StyleProp, ViewStyle } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

interface VideoPlayerViewProps {
  uri: string;
  style?: StyleProp<ViewStyle>;
  onLoadStart?: () => void;
  onLoad?: () => void;
  onError?: (error: any) => void;
}

const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({
  uri,
  style,
  onLoadStart,
  onLoad,
  onError,
}) => {
  const player = useVideoPlayer({ uri }, (p) => {
    p.loop = false;
  });

  useEffect(() => {
    if (onLoadStart) onLoadStart();

    const sub = player.addListener('statusChange', (event: any) => {
      const status = event?.status;
      if (status === 'readyToPlay') {
        if (onLoad) onLoad();
      } else if (status === 'error') {
        if (onError) onError(event?.error || new Error('Video error'));
      }
    });

    return () => {
      try {
        sub.remove();
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [player]);

  return (
    <VideoView
      style={style}
      player={player}
      allowsFullscreen
      nativeControls
      contentFit="contain"
    />
  );
};

export default VideoPlayerView;
