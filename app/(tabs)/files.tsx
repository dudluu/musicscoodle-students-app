import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Linking, 
  Alert, 
  ActivityIndicator,
  Modal,
  Image,
  Dimensions,
  Platform
} from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
} from 'expo-audio';
import * as WebBrowser from 'expo-web-browser';

import Constants from 'expo-constants';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import FileCard from '../../components/FileCard';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import VideoPlayerView from '../../components/VideoPlayerView';
import { Ionicons } from '@expo/vector-icons';

interface FileData {
  originalFileNameNoExtension: string;
  link: string;
  lernkategorie: string;
}

interface MediaData {
  title?: string;
  url: string;
  type: string; // 'v' for video, 'f' for photo, 'a' for audio
  originalFileName?: string;
  image?: string;
  fileUrl?: string;
  audio?: string;
}


interface LinkData {
  title?: string;
  link: string;
  description?: string;
}

interface MediaResponse {
  type?: string;
  mode?: string;
  url?: string;
  playbackUrl?: string;
  raw?: string;
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const FilesScreen: React.FC = () => {
  const { wixData, chosenIndex } = useAuth();
  const { t, language } = useLanguage();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  
  // Modal states for displaying media
  const [mediaModalVisible, setMediaModalVisible] = useState(false);
  const [currentMediaTitle, setCurrentMediaTitle] = useState<string>('');
  const [currentMediaType, setCurrentMediaType] = useState<'image' | 'video' | null>(null);
  const [currentMediaUrl, setCurrentMediaUrl] = useState<string | null>(null);
  const [mediaLoading, setMediaLoading] = useState(true);

  // Audio playback state (expo-audio)
  const [audioPlayer, setAudioPlayer] = useState<AudioPlayer | null>(null);
  const [playingAudioIndex, setPlayingAudioIndex] = useState<number | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioPlayer) {
        try {
          audioPlayer.remove();
        } catch (err) {
          console.warn('Audio remove error:', err);
        }
      }
    };
  }, [audioPlayer]);

  
  const getFilesData = (): FileData[] => {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    return selectedOption?.filesData || [];
  };

  const getMediaData = (): MediaData[] => {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    return selectedOption?.mediaData || [];
  };

  const getLinksData = (): LinkData[] => {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    return selectedOption?.linksData || [];
  };
  
  const filesData = getFilesData();
  const mediaData = getMediaData();
  const linksData = getLinksData();

  // Log the Meine Dateien (filesData) list contents whenever it changes
  useEffect(() => {
    console.log('=== Meine Dateien (filesData) list ===');
    console.log('Count:', filesData.length);
    console.log('Data:', JSON.stringify(filesData, null, 2));
    filesData.forEach((file, idx) => {
      console.log(`File [${idx}]:`, JSON.stringify(file, null, 2));
    });
  }, [filesData]);


  const formatUrl = (url: string): string => {
    // Trim whitespace
    let formattedUrl = url.trim();
    
    // Check if the URL has a protocol, if not add https://
    if (!formattedUrl.match(/^https?:\/\//i)) {
      formattedUrl = 'https://' + formattedUrl;
    }
    
    return formattedUrl;
  };

  const formatAudioUrl = (url: string): string => {
    if (!url) return '';

    if (url.startsWith('wix:audio://v1/')) {
      // Match supported audio file extensions (case-insensitive)
      const match = url.match(/wix:audio:\/\/v1\/([^/]+\.(mp3|wav|flac|m4a|wma|aac|aif|aiff))/i);
      if (match?.[1]) {
        return `https://static.wixstatic.com/mp3/${match[1]}`;
      }
    }

    return url;
  };



  const getUserAgent = (): string => {
    // Get device user agent
    if (Platform.OS === 'web' && typeof navigator !== 'undefined' && navigator.userAgent) {
      return navigator.userAgent;
    }
    
    // For native platforms, construct a user agent string
    const deviceName = Constants.deviceName || 'Unknown Device';
    const osName = Platform.OS;
    const osVersion = Platform.Version;
    const appVersion = Constants.expoConfig?.version || '1.0.0';
    
    return `MusicScoodle/${appVersion} (${osName} ${osVersion}; ${deviceName})`;
  };

  const fetchMediaUrl = async (fileUrl: string): Promise<MediaResponse | null> => {
    try {
      const userAgent = getUserAgent();
      
      const body = {
        fileUrl: fileUrl,
        userAgent: userAgent
      };
      
      console.log('Fetching playback URL with body:', body);
      
      const response = await fetch("https://musicscoodle.com/_functions/getPlaybackUrl", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      const text = await response.text();
      console.log("status", response.status, "text", text);

      let data: MediaResponse;
      try { 
        data = JSON.parse(text); 
      } catch { 
        data = { raw: text }; 
      }
      
      return data;
    } catch (error) {
      console.error('Error fetching playback URL:', error);
      return null;
    }
  };


  const handleAudioPress = async (media: MediaData, index: number) => {
    const audioUrl = media.audio;
    if (!audioUrl) {
      Alert.alert(
        language === 'de' ? 'Fehler' : 'Error',
        language === 'de' ? 'Audio-Datei nicht gefunden' : 'Audio file not found'
      );
      return;
    }

    try {
      // If this audio is already playing, stop it (toggle behaviour)
      if (playingAudioIndex === index && audioPlayer) {
        try {
          audioPlayer.pause();
          audioPlayer.remove();
        } catch (e) {
          console.warn('Error stopping audio:', e);
        }
        setAudioPlayer(null);
        setPlayingAudioIndex(null);
        return;
      }

      // Stop any currently playing audio
      if (audioPlayer) {
        try {
          audioPlayer.pause();
          audioPlayer.remove();
        } catch (e) {
          console.warn('Error stopping previous audio:', e);
        }
        setAudioPlayer(null);
      }

      setLoadingIndex(index);

      // Configure audio mode for playback (expo-audio)
      try {
        await setAudioModeAsync({
          allowsRecording: false,
          playsInSilentMode: true,
          shouldPlayInBackground: false,
          shouldRouteThroughEarpiece: false,
          interruptionMode: 'duckOthers',
        } as any);
      } catch (e) {
        console.warn('setAudioModeAsync error:', e);
      }

      const formattedAudioUrl = formatAudioUrl(audioUrl);
      console.log('Loading audio - Original:', audioUrl, '| Formatted:', formattedAudioUrl);

      // Create the player and start playback
      const player = createAudioPlayer({ uri: formattedAudioUrl });

      // Listen for playback completion to clean up.
      // IMPORTANT: Only react to `didJustFinish` here. On some native devices
      // the very first `playbackStatusUpdate` event fires synchronously with
      // `isLoaded: false` (because loading hasn't finished yet). If we treat
      // that as "playback ended" we immediately reset `playingAudioIndex` back
      // to null, which is why the button label never flips to "Stop" on those
      // devices even though audio is actually playing.
      try {
        const sub = player.addListener('playbackStatusUpdate', (status: any) => {
          if (status?.didJustFinish) {
            try {
              sub.remove();
            } catch {}
            try {
              player.remove();
            } catch {}
            setAudioPlayer((current) => (current === player ? null : current));
            setPlayingAudioIndex((current) => (current === index ? null : current));
          }
        });
      } catch (e) {
        console.warn('Could not attach playback listener:', e);
      }

      player.play();

      setAudioPlayer(player);
      setPlayingAudioIndex(index);

    } catch (error) {
      console.error('Error playing audio:', error);
      Alert.alert(
        language === 'de' ? 'Fehler' : 'Error',
        language === 'de' ? 'Audio konnte nicht abgespielt werden' : 'Could not play audio'
      );
      setPlayingAudioIndex(null);
    } finally {
      setLoadingIndex(null);
    }
  };

  const handleMediaPress = async (media: MediaData, index: number) => {
    // For audio (type 'a'), play the audio file directly
    if (media.type === 'a') {
      await handleAudioPress(media, index);
      return;
    }


    // For both videos (type 'v') and photos (type 'f'), call getPlaybackUrl
    if (media.type === 'v' || media.type === 'f') {
      setLoadingIndex(index);
      setCurrentMediaTitle(media.title || '');
      setCurrentMediaType(null);
      setCurrentMediaUrl(null);
      setMediaLoading(true);
      
      try {
        if (!media.fileUrl) {
          Alert.alert(
            language === 'de' ? 'Fehler' : 'Error',
            language === 'de' ? 'Datei-URL nicht gefunden' : 'File URL not found'
          );
          setLoadingIndex(null);
          return;
        }
        
        // Get user agent string for React Native
        const userAgentString = `${Platform.OS}/${Platform.Version} ${Constants.expoVersion || ''} Expo/${Constants.expoVersion || ''}`.trim();
        
        const body = {
          fileUrl: media.fileUrl,
          userAgent: userAgentString
        };

        const url = "https://musicscoodle.com/_functions/getPlaybackUrl";
        
        // Log the request for getPlaybackUrl
        console.log('=== getPlaybackUrl Request ===');
        console.log('URL:', url);
        console.log('Media type:', media.type);
        console.log('Request body:', JSON.stringify(body, null, 2));
        
        const options = {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        };
        
        const response = await fetch(url, options);
        const data = await response.json();
        
        console.log('=== getPlaybackUrl Response ===');
        console.log(JSON.stringify(data, null, 2));

        // Handle response based on type
        // If response type is "image", display the image at response.url
        if (data.type === 'image' && data.url) {
          console.log('Response type is image, using url:', data.url);
          setCurrentMediaType('image');
          setCurrentMediaUrl(data.url);
          setMediaModalVisible(true);
        }
        // If response type is "video", stream the video at response.playbackUrl
        else if (data.type === 'video' && data.playbackUrl) {
          console.log('Response type is video, using playbackUrl:', data.playbackUrl);
          setCurrentMediaType('video');
          setCurrentMediaUrl(data.playbackUrl);
          setMediaModalVisible(true);
        }
        // Fallback: if playbackUrl exists but type doesn't match expected values
        else if (data.playbackUrl) {
          console.log('Fallback: using playbackUrl for type:', data.type);
          if (media.type === 'v') {
            setCurrentMediaType('video');
            setCurrentMediaUrl(data.playbackUrl);
            setMediaModalVisible(true);
          } else {
            setCurrentMediaType('image');
            setCurrentMediaUrl(data.playbackUrl);
            setMediaModalVisible(true);
          }
        }
        // Fallback: if url exists but no playbackUrl
        else if (data.url) {
          console.log('Fallback: using url for type:', data.type);
          if (media.type === 'v') {
            setCurrentMediaType('video');
            setCurrentMediaUrl(data.url);
            setMediaModalVisible(true);
          } else {
            setCurrentMediaType('image');
            setCurrentMediaUrl(data.url);
            setMediaModalVisible(true);
          }
        }
        else {
          Alert.alert(
            language === 'de' ? 'Fehler' : 'Error',
            language === 'de' ? 'Medien-URL nicht gefunden' : 'Media URL not found'
          );
        }

      } catch (error) {
        console.error('Error fetching playback URL:', error);
        Alert.alert(
          language === 'de' ? 'Fehler' : 'Error',
          language === 'de' ? 'Medien konnten nicht geladen werden' : 'Could not load media'
        );
      } finally {
        setLoadingIndex(null);
        setMediaLoading(false);
      }

    } else {
      // Fallback for any other types - just show directly
      setCurrentMediaTitle(media.title || '');
      if (media.url) {
        setCurrentMediaType('image');
        setCurrentMediaUrl(media.url);
        setMediaModalVisible(true);
      }
    }
  };




  const handleLinkPress = (linkData: LinkData) => {
    if (linkData.link) {
      const formattedUrl = formatUrl(linkData.link);
      console.log('Opening link - Original:', linkData.link, '| Formatted URL:', formattedUrl);
      Linking.openURL(formattedUrl);
    }
  };

  // Build a download URL for Wix static files. Appending ?dn=<filename>
  // tells Wix to send Content-Disposition: attachment, which forces the
  // browser/OS to download the file instead of trying to play it inline
  // (important for formats like WAV, FLAC, M4A, WMA, AAC, AIF, AIFF that
  // many browsers cannot play natively).
  const buildDownloadUrl = (formattedUrl: string, originalUrl: string): string => {
    if (!formattedUrl) return formattedUrl;

    // Extract filename from the formatted URL or the original wix:audio URL
    let filename = '';
    const urlMatch = formattedUrl.match(/\/([^/?#]+\.[a-zA-Z0-9]+)(?:[?#]|$)/);
    if (urlMatch?.[1]) {
      filename = urlMatch[1];
    } else {
      const wixMatch = originalUrl.match(/wix:audio:\/\/v1\/([^/]+\.[a-zA-Z0-9]+)/i);
      if (wixMatch?.[1]) filename = wixMatch[1];
    }

    if (!filename) return formattedUrl;

    const separator = formattedUrl.includes('?') ? '&' : '?';
    return `${formattedUrl}${separator}dn=${encodeURIComponent(filename)}`;
  };

  const handleAudioDownload = async (media: MediaData) => {
    const audioUrl = media.audio;
    if (!audioUrl) {
      Alert.alert(
        language === 'de' ? 'Fehler' : 'Error',
        language === 'de' ? 'Audio-Datei nicht gefunden' : 'Audio file not found'
      );
      return;
    }

    const formattedAudioUrl = formatAudioUrl(audioUrl);
    const downloadUrl = buildDownloadUrl(formattedAudioUrl, audioUrl);
    console.log(
      'Downloading audio - Original:',
      audioUrl,
      '| Formatted:',
      formattedAudioUrl,
      '| Download:',
      downloadUrl
    );

    try {
      if (Platform.OS === 'web') {
        // On web, the download URL already has ?dn=<filename> appended,
        // which causes Wix to send Content-Disposition: attachment. That
        // header alone makes the browser download the file without
        // navigating away.
        //
        // IMPORTANT: We do NOT use target="_blank" here. With target="_blank"
        // the browser opens a new tab first (showing about:blank), and
        // because the download is cross-origin (static.wixstatic.com),
        // the `download` attribute is ignored and the new tab is left
        // stranded on about:blank instead of triggering a download.
        // Navigating in the same window works because the
        // Content-Disposition header triggers the download directly.
        if (typeof document !== 'undefined') {
          const filenameMatch = downloadUrl.match(/dn=([^&]+)/);
          const filename = filenameMatch?.[1]
            ? decodeURIComponent(filenameMatch[1])
            : 'audio';
          const a = document.createElement('a');
          a.href = downloadUrl;
          a.download = filename; // hint for same-origin; ignored cross-origin
          // No target="_blank" — the Content-Disposition header on the
          // response will make the browser download instead of navigating.
          a.style.display = 'none';
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
        } else if (typeof window !== 'undefined') {
          // Fallback: navigate the current window to the download URL.
          // The Content-Disposition: attachment header makes the browser
          // download the file rather than actually navigating.
          window.location.href = downloadUrl;
        }
        return;
      }

      // On native (iOS/Android), open the download URL in an in-app
      // browser using expo-web-browser instead of handing it off to the
      // system browser via Linking.openURL.
      //
      // Why expo-web-browser instead of Linking?
      //  - Linking.openURL launches the external system browser. Once the
      //    OS browser is in the foreground, our app is backgrounded and
      //    any follow-up Linking.openURL calls (e.g. to redirect home)
      //    are silently dropped, which is why the browser was being left
      //    stranded on Wix's /plans-pricing landing page after the file
      //    download was triggered.
      //  - WebBrowser.openBrowserAsync opens an in-app browser tab. The
      //    Wix CDN's Content-Disposition: attachment header still
      //    triggers the file download, but the user stays inside our
      //    app and can dismiss the in-app browser with a single tap to
      //    return to the Files screen — no plans-pricing detour.
      try {
        await WebBrowser.openBrowserAsync(downloadUrl, {
          showTitle: false,
          enableBarCollapsing: true,
          dismissButtonStyle: 'close',
        });
      } catch (wbError) {
        // Fall back to Linking if the in-app browser is unavailable for
        // any reason (older Android WebView, etc.).
        console.warn('WebBrowser.openBrowserAsync failed, falling back to Linking:', wbError);
        await Linking.openURL(downloadUrl);
      }
    } catch (error) {
      console.error('Error downloading audio:', error);
      Alert.alert(
        language === 'de' ? 'Fehler' : 'Error',
        language === 'de'
          ? 'Audio konnte nicht heruntergeladen werden'
          : 'Could not download audio'
      );
    }
  };







  const getMediaTypeIcon = (type: string): string => {
    if (type === 'v') {
      return 'videocam';
    } else if (type === 'f') {
      return 'image';
    } else if (type === 'a') {
      return 'musical-notes';
    }
    return 'document';
  };

  const closeMediaModal = () => {
    setMediaModalVisible(false);
    setCurrentMediaUrl(null);
    setCurrentMediaTitle('');
    setCurrentMediaType(null);
    setMediaLoading(true);
  };

  const getCloseButtonText = (): string => {
    return language === 'de' ? 'Schliessen' : 'Close';
  };

  const renderMediaItem = (media: MediaData, index: number) => {
    const iconName = getMediaTypeIcon(media.type);
    const isLoading = loadingIndex === index;
    const isAudio = media.type === 'a';
    const isPlaying = isAudio && playingAudioIndex === index;
    const buttonLabel = isAudio ? (isPlaying ? 'Stop' : t('listen')) : t('view');


    return (
      <View
        key={index}
        style={styles.mediaCard}
      >
        <View style={styles.mediaInfo}>
          <Ionicons
            name={(isPlaying ? 'pause' : iconName) as any}
            size={24}
            color="#64a8d1"
            style={styles.mediaTypeIcon}
          />

          <Text style={styles.mediaTitle} numberOfLines={2}>
            {media.title || ''}
          </Text>
        </View>
        <View style={styles.mediaActions}>
          {isAudio && (
            <TouchableOpacity
              style={styles.downloadButton}
              onPress={() => handleAudioDownload(media)}
              activeOpacity={0.7}
              disabled={isLoading}
              accessibilityLabel={language === 'de' ? 'Herunterladen' : 'Download'}
            >
              <Ionicons name="download-outline" size={20} color="#64a8d1" />
            </TouchableOpacity>
          )}
          <TouchableOpacity
            style={[styles.viewButton, isLoading && styles.viewButtonDisabled]}
            onPress={() => handleMediaPress(media, index)}
            activeOpacity={0.7}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="white" />
            ) : (
              <Text style={styles.viewButtonText}>{buttonLabel}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    );
  };




  const renderLinkItem = (linkData: LinkData, index: number) => {
    return (
      <TouchableOpacity 
        key={index} 
        style={styles.linkCard}
        onPress={() => handleLinkPress(linkData)}
        activeOpacity={0.7}
      >
        <View style={styles.linkInfo}>
          <Text style={styles.linkTitle} numberOfLines={2}>
            {linkData.title || linkData.link}
          </Text>
          {linkData.description && (
            <Text style={styles.linkDescription} numberOfLines={2}>
              {linkData.description}
            </Text>
          )}
          <Text style={styles.linkUrl} numberOfLines={1}>
            {linkData.link}
          </Text>
        </View>
      </TouchableOpacity>
    );
  };

  // Unified Media Modal Component (for both images and videos)
  const renderMediaModal = () => (
    <Modal
      visible={mediaModalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={closeMediaModal}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          {/* Header with title */}
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle} numberOfLines={2}>
              {currentMediaTitle}
            </Text>
          </View>
          
          {/* Content area */}
          <View style={styles.modalContent}>
            {/* Show photo - with loading state */}
            {currentMediaType === 'image' && (
              <>
                {mediaLoading && (
                  <View style={[styles.mediaModalImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                    <ActivityIndicator size="large" color="#64a8d1" />
                    <Text style={{ color: '#333', marginTop: 10 }}>
                      {language === 'de' ? 'Foto wird geladen...' : 'Loading photo...'}
                    </Text>
                  </View>
                )}
                {currentMediaUrl ? (
                  <Image
                    source={{ uri: currentMediaUrl }}
                    style={styles.mediaModalImage}
                    resizeMode="contain"
                    onLoadStart={() => setMediaLoading(true)}
                    onLoadEnd={() => setMediaLoading(false)}
                    onError={(error) => {
                      console.error('Image load error:', error);
                      setMediaLoading(false);
                    }}
                  />
                ) : !mediaLoading && (
                  <View style={[styles.mediaModalImage, { justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }]}>
                    <Text style={{ color: '#333' }}>
                      {language === 'de' ? 'Foto konnte nicht geladen werden' : 'Failed to load photo'}
                    </Text>
                  </View>
                )}
              </>
            )}
            
            {/* Show video - with loading state */}
            {currentMediaType === 'video' && (
              <>
                {mediaLoading && (
                  <View style={[styles.mediaModalVideo, { justifyContent: 'center', alignItems: 'center' }]}>
                    <ActivityIndicator size="large" color="#64a8d1" />
                    <Text style={{ color: '#fff', marginTop: 10 }}>
                      {language === 'de' ? 'Video wird geladen...' : 'Loading video...'}
                    </Text>
                  </View>
                )}
                {currentMediaUrl ? (
                  <VideoPlayerView
                    uri={currentMediaUrl}
                    style={styles.mediaModalVideo}
                    onLoadStart={() => setMediaLoading(true)}
                    onLoad={() => setMediaLoading(false)}
                    onError={(error) => {
                      console.error('Video load error:', error);
                      setMediaLoading(false);
                    }}
                  />
                ) : !mediaLoading && (
                  <View style={[styles.mediaModalVideo, { justifyContent: 'center', alignItems: 'center' }]}>
                    <Text style={{ color: '#fff' }}>
                      {language === 'de' ? 'Video konnte nicht geladen werden' : 'Failed to load video'}
                    </Text>
                  </View>
                )}
              </>
            )}
          </View>
          
          {/* Close button at bottom */}
          <View style={styles.modalFooter}>
            <TouchableOpacity 
              style={styles.closeButton} 
              onPress={closeMediaModal}
              activeOpacity={0.7}
            >
              <Text style={styles.closeButtonText}>{getCloseButtonText()}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );




  return (
    <View style={styles.container}>
      <Header title="" />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        {/* Files Section */}
        <Text style={styles.title}>{t('myFiles')}</Text>
        {filesData.length === 0 ? (
          <View style={styles.noFilesContainer}>
            <Text style={styles.noFilesText}>
              {language === 'de' ? 'Keine Dateien verfügbar' : 'No files available'}
            </Text>
          </View>
        ) : (
          filesData.map((fileData, index) => (
            <FileCard key={index} fileData={fileData} />
          ))
        )}

        {/* Videos and Photos Section */}
        <Text style={styles.sectionTitle}>{t('videosAndPhotos')}</Text>
        {mediaData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="images-outline" size={40} color="#999" style={styles.noDataIcon} />
            <Text style={styles.noDataText}>
              {t('noDataAvailable')}
            </Text>
          </View>
        ) : (
          <View style={styles.mediaList}>
            {mediaData.map((media, index) => renderMediaItem(media, index))}
          </View>
        )}

        {/* Links Section */}
        <Text style={styles.sectionTitle}>{t('links')}</Text>
        {linksData.length === 0 ? (
          <View style={styles.noDataContainer}>
            <Ionicons name="link-outline" size={40} color="#999" style={styles.noDataIcon} />
            <Text style={styles.noDataText}>
              {t('noLinksAvailable')}
            </Text>
          </View>
        ) : (
          <View style={styles.linksList}>
            {linksData.map((link, index) => renderLinkItem(link, index))}
          </View>
        )}

        {/* Bottom spacing */}
        <View style={{ height: 30 }} />
      </ScrollView>
      <Footer />
      
      {/* Media Modal */}
      {renderMediaModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 30,
    marginBottom: 20,
    color: '#333',
  },
  noFilesContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noFilesText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  noDataContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noDataIcon: {
    marginBottom: 10,
  },
  noDataText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  // Media list styles (vertical list)
  mediaList: {
    gap: 10,
  },
  mediaCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  mediaInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 10,
  },
  mediaTypeIcon: {
    marginRight: 12,
  },

  mediaTitle: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  viewButton: {
    backgroundColor: '#64a8d1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
    minWidth: 80,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewButtonDisabled: {
    backgroundColor: '#9fc9e3',
  },
  viewButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
  mediaActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#64a8d1',
    backgroundColor: '#f0f7fc',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  // Links styles

  linksList: {
    gap: 10,
  },
  linkCard: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    marginBottom: 10,
  },
  linkInfo: {
    flex: 1,
  },
  linkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  linkDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  linkUrl: {
    fontSize: 12,
    color: '#64a8d1',
  },

  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: screenWidth,
    height: screenHeight,
    backgroundColor: '#000',
    flexDirection: 'column',
  },
  modalHeader: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 15,
    backgroundColor: '#1a1a1a',
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
    textAlign: 'center',
  },
  modalContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingContainer: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  modalImage: {
    width: screenWidth,
    height: screenHeight - 200,
  },
  mediaModalImage: {
    width: screenWidth,
    height: screenHeight - 200,
  },
  mediaModalVideo: {
    width: screenWidth,
    height: screenHeight - 200,
    backgroundColor: '#000',
  },

  modalFooter: {
    paddingVertical: 15,
    paddingHorizontal: 20,
    paddingBottom: 40,
    backgroundColor: '#1a1a1a',
    borderTopWidth: 1,
    borderTopColor: '#333',
    alignItems: 'center',
  },
  closeButton: {
    backgroundColor: '#64a8d1',
    paddingHorizontal: 40,
    paddingVertical: 12,
    borderRadius: 8,
    minWidth: 150,
    alignItems: 'center',
  },

  closeButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default FilesScreen;
