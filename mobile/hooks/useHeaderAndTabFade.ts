import { useState, useRef, useCallback, useEffect } from "react";
import { Animated, StyleSheet } from "react-native";

interface UseAutoHideHeaderOptions {
  headerMaxHeight?: number;
  tabBarMaxHeight?: number;
  animationDuration?: number;
  navigation?: any;
}

interface UseAutoHideHeaderReturn {
  headerVisible: boolean;
  tabBarVisible: boolean;
  headerOpacity: Animated.Value;
  headerHeight: Animated.Value;
  handleScroll: (event: any) => void;
}

export function useHeaderAndTabFade(
  options: UseAutoHideHeaderOptions = {},
): UseAutoHideHeaderReturn {
  const {
    headerMaxHeight = 46,
    tabBarMaxHeight = 49,
    animationDuration = 200,
    navigation,
  } = options;

  const [headerVisible, setHeaderVisible] = useState(true);
  const [tabBarVisible, setTabBarVisible] = useState(true);
  const headerOpacity = useRef(new Animated.Value(1)).current;
  const headerHeight = useRef(new Animated.Value(headerMaxHeight)).current;
  const lastScrollY = useRef(0);

  useEffect(() => {
    if (!navigation?.setOptions) return;

    navigation.setOptions({
      tabBarStyle: {
        opacity: tabBarVisible ? 1 : 0,
        height: tabBarVisible ? tabBarMaxHeight : 0,
        borderTopWidth: StyleSheet.hairlineWidth,
      },
    });
  }, [navigation, tabBarVisible, tabBarMaxHeight]);

  const handleScroll = useCallback(
    (event: any) => {
      const currentY = event.nativeEvent.contentOffset.y;
      const isAtTop = currentY <= 0;
      const isScrollingUp = currentY < lastScrollY.current;

      if (isAtTop || isScrollingUp) {
        if (!headerVisible) {
          setHeaderVisible(true);
          Animated.parallel([
            Animated.timing(headerOpacity, {
              toValue: 1,
              duration: animationDuration,
              useNativeDriver: false,
            }),
            Animated.timing(headerHeight, {
              toValue: headerMaxHeight,
              duration: animationDuration,
              useNativeDriver: false,
            }),
          ]).start();
        }
        if (!tabBarVisible) {
          setTabBarVisible(true);
        }
      } else {
        if (headerVisible) {
          setHeaderVisible(false);
          Animated.parallel([
            Animated.timing(headerOpacity, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: false,
            }),
            Animated.timing(headerHeight, {
              toValue: 0,
              duration: animationDuration,
              useNativeDriver: false,
            }),
          ]).start();
        }
        if (tabBarVisible) {
          setTabBarVisible(false);
        }
      }

      lastScrollY.current = currentY;
    },
    [
      headerVisible,
      headerOpacity,
      headerHeight,
      tabBarVisible,
      headerMaxHeight,
      animationDuration,
    ],
  );

  return {
    headerVisible,
    tabBarVisible,
    headerOpacity,
    headerHeight,
    handleScroll,
  };
}
