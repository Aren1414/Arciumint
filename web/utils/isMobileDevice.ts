export default function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|webOS/i.test(navigator.userAgent);
}
