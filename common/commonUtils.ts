const getRandomPos = (widthOrHeight: number) => {
  return 80 + Math.random() * (widthOrHeight - 160);
};

export const getRandomPlayerPos = ({ canvasWidth, canvasHeight, scale }) => {
  const x = getRandomPos(canvasWidth * scale);
  const y = getRandomPos(canvasHeight * scale);
  return { x, y };
};
