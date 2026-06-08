import { useHomepageStore } from '../stores/homepageStore';

export function useHomepageLayout() {
  const segments = useHomepageStore((s) => s.segments);
  const isCardActive = useHomepageStore((s) => s.isCardActive);
  const addCard = useHomepageStore((s) => s.addCard);
  const removeCard = useHomepageStore((s) => s.removeCard);
  const toggleCard = useHomepageStore((s) => s.toggleCard);
  const moveCard = useHomepageStore((s) => s.moveCard);
  const moveUp = useHomepageStore((s) => s.moveUp);
  const moveDown = useHomepageStore((s) => s.moveDown);
  const resetToDefault = useHomepageStore((s) => s.resetToDefault);

  return {
    segments,
    isCardActive,
    addCard,
    removeCard,
    toggleCard,
    moveCard,
    moveUp,
    moveDown,
    resetToDefault,
  };
}
