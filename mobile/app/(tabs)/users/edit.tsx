import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  TextInput,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Image } from 'expo-image';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { useTheme } from '@/contexts/ThemeContext';
import { Colors } from '@/constants/theme';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useFetchSelf } from '@/hooks/users/useFetchSelf';
import { useFetchProfileHeader } from '@/hooks/users/useFetchProfileHeader';
import { ScreenHeader } from '@/components/ScreenHeader';
import { useUpdateProfileImage } from '@/hooks/users/useUpdateProfileImage';
import { useUpdateProfile } from '@/hooks/users/useUpdateProfile';

const BIO_MAX = 160;
const NAME_MAX = 50;
const LOCATION_MAX = 100;
const WEBSITE_MAX = 100;

export default function EditProfileScreen() {
  const router = useRouter();
  const { colorScheme, isDark } = useTheme();
  const colors = Colors[colorScheme ?? 'light'];

  const borderColor = isDark ? '#3d4146' : '#d8dde1';
  const textColor = colors.text;
  const mutedColor = colors.icon;
  const inputBg = isDark ? '#16181c' : '#f7f9f9';

  const { data: self } = useFetchSelf();
  const { data: profile, isLoading } = useFetchProfileHeader(self?.username || '');

  const [displayName, setDisplayName] = useState('');
  const [bio, setBio] = useState('');
  const [location, setLocation] = useState('');
  const [website, setWebsite] = useState('');
  const [birthday, setBirthday] = useState('');
  const [bannerUri, setBannerUri] = useState<string | null>(null);
  const [avatarUri, setAvatarUri] = useState<string | null>(null);
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showBirthdayPicker, setShowBirthdayPicker] = useState(false);

  useEffect(() => {
    if (profile) {
      setDisplayName(profile.displayName ?? '');
      setBio(profile.bio ?? '');
      setLocation(profile.location ?? '');
      setWebsite(profile.website ?? '');
      setBirthday(profile.birthday ?? '');
      setBannerUri(profile.bannerUrl ?? null);
    }
  }, [profile]);

  const pickImage = async (mode: 'banner' | 'avatar') => {
    if (Platform.OS === 'web') {
      Alert.alert('Image upload', 'Change photo in the iOS or Android app.');
      return;
    }
    const ImagePicker = require('expo-image-picker');

    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Allow access to photos to change your photo.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: mode === 'banner' ? [3, 1] : [1, 1],
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const uri = result.assets[0].uri;
      if (mode === 'banner') setBannerUri(uri);
      else setAvatarUri(uri);
    }
  };

  const validate = (): string | null => {
    if (birthday) {
      const d = new Date(birthday);
      d.setHours(0, 0, 0, 0);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (d > today) return 'Birth date cannot be in the future';
    }
    if (bio.length > BIO_MAX) return `Bio must be at most ${BIO_MAX} characters`;
    if (displayName.length > NAME_MAX) return `Name must be at most ${NAME_MAX} characters`;
    if (location.length > LOCATION_MAX) return `Location must be at most ${LOCATION_MAX} characters`;
    if (website.length > WEBSITE_MAX) return `Website must be at most ${WEBSITE_MAX} characters`;
    return null;
  };

  const handleSave = async () => {
    const err = validate();
    if (err) {
      setError(err);
      return;
    }
    setError(null);

    try {
      if (avatarUri) {
        await useUpdateProfileImage().mutateAsync(avatarUri);
      }

      const formData = new FormData();
      formData.append('displayName', displayName);
      formData.append('bio', bio);
      formData.append('location', location);
      formData.append('website', website);
      formData.append('birthday', birthday || '');

      if (bannerUri && bannerUri.startsWith('file://')) {
        const name = bannerUri.split('/').pop() || 'banner.jpg';
        formData.append('banner', { uri: bannerUri, name, type: 'image/jpeg' } as unknown as Blob);
      }

      await useUpdateProfile().mutateAsync(formData);

      router.back();
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to update profile');
    }
  };

  if (!self?.username) return null;
  if (isLoading || !profile) {
    return (
      <View style={[styles.center, { backgroundColor: colors.background }]}>
        <ActivityIndicator size="large" color={colors.tint} />
      </View>
    );
  }

  const bannerPreview = bannerUri || profile.bannerUrl;
  const avatarPreview = avatarUri || profile.imageUrl;

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <ScreenHeader
        title="Edit profile"
        leftAction="back"
        rightAction={
          <TouchableOpacity
            onPress={handleSave}
            disabled={isPending}
          >
            <View style={[styles.saveBtn, { backgroundColor: isPending ? '#1d9bf080' : '#1d9bf0' }]}>
              {isPending ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </View>
          </TouchableOpacity>
        }
      />

      <KeyboardAwareScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid
        enableAutomaticScroll
        extraScrollHeight={120}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.bannerWrap, { backgroundColor: isDark ? '#2f3336' : '#cfd9de' }]}
          onPress={() => pickImage('banner')}
          activeOpacity={0.9}
        >
          {bannerPreview ? (
            <Image source={{ uri: bannerPreview }} style={StyleSheet.absoluteFill} />
          ) : (
            <View style={styles.bannerPlaceholder}>
              <MaterialIcons name="camera-alt" size={32} color={mutedColor} />
            </View>
          )}
        </TouchableOpacity>

        <View style={styles.avatarWrap}>
          <TouchableOpacity
            style={[styles.avatarOuter, { borderColor: colors.background }]}
            onPress={() => pickImage('avatar')}
            activeOpacity={0.9}
          >
            {avatarPreview ? (
              <Image source={{ uri: avatarPreview }} style={styles.avatar} />
            ) : (
              <View style={[styles.avatarBadge, { backgroundColor: isDark ? '#2f3336' : '#cfd9de' }]}>
                <MaterialIcons name="camera-alt" size={24} color={mutedColor} />
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.form}>
          <View style={[styles.field, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Name</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
              placeholder="Name"
              placeholderTextColor={mutedColor}
              value={displayName}
              onChangeText={setDisplayName}
              maxLength={NAME_MAX}
              editable={!isPending}
            />
            <Text style={[styles.count, { color: mutedColor }]}>
              {displayName.length}/{NAME_MAX}
            </Text>
          </View>

          <View style={[styles.field, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Bio</Text>
            <TextInput
              style={[styles.input, styles.bioInput, { color: textColor, backgroundColor: inputBg }]}
              placeholder="Add a bio"
              placeholderTextColor={mutedColor}
              value={bio}
              onChangeText={setBio}
              maxLength={BIO_MAX}
              multiline
              editable={!isPending}
            />
            <Text style={[styles.count, { color: mutedColor }]}>
              {bio.length}/{BIO_MAX}
            </Text>
          </View>

          <View style={[styles.field, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Location</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
              placeholder="Location"
              placeholderTextColor={mutedColor}
              value={location}
              onChangeText={setLocation}
              maxLength={LOCATION_MAX}
              editable={!isPending}
            />
          </View>

          <View style={[styles.field, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Website</Text>
            <TextInput
              style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
              placeholder="https://example.com"
              placeholderTextColor={mutedColor}
              value={website}
              onChangeText={setWebsite}
              maxLength={WEBSITE_MAX}
              keyboardType="url"
              autoCapitalize="none"
              editable={!isPending}
            />
          </View>

          <View style={[styles.field, { borderBottomColor: borderColor }]}>
            <Text style={[styles.label, { color: textColor }]}>Birth date</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => !isPending && setShowBirthdayPicker(true)}
            >
              <TextInput
                style={[styles.input, { color: textColor, backgroundColor: inputBg }]}
                placeholder="YYYY-MM-DD"
                placeholderTextColor={mutedColor}
                value={birthday}
                editable={false}
                pointerEvents="none"
              />
            </TouchableOpacity>
            {showBirthdayPicker && (
              <DateTimePicker
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                value={birthday ? new Date(birthday) : new Date(2000, 0, 1)}
                maximumDate={new Date()}
                onChange={(event, date) => {
                  if (Platform.OS === 'android') {
                    setShowBirthdayPicker(false);
                  }
                  // @ts-ignore - event.type exists on native event
                  if (event.type === 'dismissed') {
                    if (Platform.OS === 'ios') {
                      setShowBirthdayPicker(false);
                    }
                    return;
                  }
                  if (date) {
                    const d = new Date(date);
                    const iso = d.toISOString().slice(0, 10);
                    setBirthday(iso);
                  }
                }}
              />
            )}
          </View>

          {error && <Text style={styles.error}>{error}</Text>}
        </View>
      </KeyboardAwareScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  saveText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#fff',
  },
  scroll: { flex: 1 },
  scrollContent: { paddingBottom: 40 },
  bannerWrap: {
    height: 120,
    width: '100%',
    overflow: 'hidden',
  },
  bannerPlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarWrap: {
    paddingHorizontal: 16,
    marginTop: -44,
    marginBottom: 12,
  },
  avatarOuter: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 88,
    height: 88,
    borderRadius: 44,
    borderWidth: 4,
    overflow: 'hidden',
  },
  avatar: { width: '100%', height: '100%' },
  avatarBadge: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  form: { paddingHorizontal: 16 },
  field: {
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    fontSize: 16,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  bioInput: { minHeight: 80, textAlignVertical: 'top' },
  count: { fontSize: 12, marginTop: 4 },
  error: {
    fontSize: 14,
    marginTop: 12,
    color: '#f91880',
  },
});