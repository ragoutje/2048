import { onMounted, ref, Ref } from 'vue';

export type SwipeCallback = (event: TouchEvent) => void;

export type SwipeOptions = {
    directional_threshold: number; // Pixels offset to trigger swipe
};

export const useSwipe = (touchableElement: HTMLElement|null = null, options: Ref<SwipeOptions> = ref({
    directional_threshold: 10
})) => {
    const touchStartX = ref(0);
    const touchEndX = ref(0);
    const touchStartY = ref(0);
    const touchEndY = ref(0);

    onMounted(() => {
        if (!touchableElement)
            touchableElement = document.body;
        touchableElement.addEventListener('touchstart', (event) => {
            touchStartX.value = event.changedTouches[0].screenX;
            touchStartY.value = event.changedTouches[0].screenY;
        }, false);

        touchableElement.addEventListener('touchend', (event) => {
            touchEndX.value = event.changedTouches[0].screenX;
            touchEndY.value = event.changedTouches[0].screenY;
            handleGesture(event);
        }, false);
    });

    const onSwipeLeft: Array<SwipeCallback> = [];
    const onSwipeRight: Array<SwipeCallback> = [];
    const onSwipeUp: Array<SwipeCallback> = [];
    const onSwipeDown: Array<SwipeCallback> = [];
    const onTap: Array<SwipeCallback> = [];

    const addEventListener = (arr: Array<SwipeCallback>, callback: SwipeCallback) => {
        arr.push(callback);
    };

    const handleGesture = (event: TouchEvent) => {
        if (touchEndX.value < touchStartX.value && (Math.max(touchStartY.value, touchEndY.value) - Math.min(touchStartY.value, touchEndY.value)) < options.value.directional_threshold) {
            onSwipeLeft.forEach(callback => callback(event));
        }

        if (touchEndX.value > touchStartX.value && (Math.max(touchStartY.value, touchEndY.value) - Math.min(touchStartY.value, touchEndY.value)) < options.value.directional_threshold) {
            onSwipeRight.forEach(callback => callback(event));
        }

        if (touchEndY.value < touchStartY.value && (Math.max(touchStartX.value, touchEndX.value) - Math.min(touchStartX.value, touchEndX.value)) < options.value.directional_threshold) {
            onSwipeUp.forEach(callback => callback(event));
        }

        if (touchEndY.value > touchStartY.value && (Math.max(touchStartX.value, touchEndX.value) - Math.min(touchStartX.value, touchEndX.value)) < options.value.directional_threshold) {
            onSwipeDown.forEach(callback => callback(event));
        }

        if (touchEndY.value === touchStartY.value) {
            onTap.forEach(callback => callback(event));
        }
    }
    return {
        onSwipeLeft: (callback: SwipeCallback) => addEventListener(onSwipeLeft, callback),
        onSwipeRight: (callback: SwipeCallback) => addEventListener(onSwipeRight, callback),
        onSwipeUp: (callback: SwipeCallback) => addEventListener(onSwipeUp, callback),
        onSwipeDown: (callback: SwipeCallback) => addEventListener(onSwipeDown, callback),
        onTap: (callback: SwipeCallback) => addEventListener(onTap, callback)
    }
}