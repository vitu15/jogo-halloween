/**
 * Reflete no `<body>` a intensidade visual e se as animações estão ativas.
 * @param {{ int: string }} settings
 * @param {import('./MotionPolicy.js').MotionPolicy} motion
 */
export function applyVisualSettings(settings, motion) {
  document.body.dataset.int = settings.int;
  document.body.classList.toggle('noanim', !motion.isEnabled());
}
