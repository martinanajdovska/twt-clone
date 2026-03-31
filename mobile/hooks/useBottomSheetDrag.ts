import { useEffect, useMemo, useRef } from "react";
import { Animated, PanResponder } from "react-native";

const DRAG_CLOSE_THRESHOLD = 90;

export function useBottomSheetDrag(visible: boolean, onClose: () => void) {
  const translateY = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) translateY.setValue(0);
  }, [visible, translateY]);

  const panResponder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onStartShouldSetPanResponderCapture: () => true,
        onMoveShouldSetPanResponder: (_, g) => g.dy > 6 && Math.abs(g.dy) > Math.abs(g.dx),
        onMoveShouldSetPanResponderCapture: (_, g) => g.dy > 2 && Math.abs(g.dy) > Math.abs(g.dx),
        onPanResponderMove: (_, g) => translateY.setValue(Math.max(0, g.dy)),
        onPanResponderRelease: (_, g) => {
          const shouldClose = g.dy > DRAG_CLOSE_THRESHOLD || g.vy > 1.1;
          if (shouldClose) {
            Animated.timing(translateY, {
              toValue: 420,
              duration: 140,
              useNativeDriver: true,
            }).start(() => {
              translateY.setValue(0);
              onClose();
            });
            return;
          }

          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
        onPanResponderTerminate: () => {
          Animated.spring(translateY, { toValue: 0, useNativeDriver: true }).start();
        },
      }),
    [onClose, translateY],
  );

  return { translateY, panHandlers: panResponder.panHandlers };
}
