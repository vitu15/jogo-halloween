/**
 * Trilhas de fundo. Os arquivos ficam em `public/audio/`.
 * `BASE_URL` mantém os caminhos válidos quando o site é publicado em subpasta.
 * @type {readonly import('../infrastructure/audio/MusicPlayer.js').Track[]}
 */
export const TRACKS = Object.freeze([
  { name: 'Trilha sonora do Halloween', src: audioUrl('trilha-sonora-do-halloween.mp3') },
  { name: 'Dead Silence (trilha de gritos mortais)', src: audioUrl('dead-silence.mp3') },
  { name: 'Fear (Cinematic Horror Thriller)', src: audioUrl('fear-cinematic-horror-thriller.mp3') },
  { name: 'Dark Horror Trailer', src: audioUrl('dark-horror-trailer.mp3') },
  { name: 'Look Behind You', src: audioUrl('look-behind-you.mp3') },
  { name: 'Hello Zepp (Saw Theme)', src: audioUrl('hello-zepp-saw-theme.mp3') },
]);

/** @param {string} file */
function audioUrl(file) {
  return `${import.meta.env.BASE_URL}audio/${file}`;
}
