/* eslint-disable no-console */
export function extractVidyardId(url) {
  const match = url.match(/watch\/([A-Za-z0-9]+)/);
  return match ? match[1] : null;
}

export async function fetchVidyardMetadata(id) {
  const response = await fetch(`https://play.vidyard.com/player/${id}.json`);
  return response.json();
}

export function getVidyardMp4(json) {
  const vidyardMp4 = json.payload.chapters[0].sources.mp4[0].url;
  return vidyardMp4 || null;
}

export async function getVidyardVideoFile(url) {
  const id = extractVidyardId(url);
  if (!id) return null;

  const metadata = await fetchVidyardMetadata(id);
  return getVidyardMp4(metadata);
}

export function embedVidyardAudio(url) {
  console.log(url);
  // return (`
  // <audio id="vy-audio" preload="metadata" src=""></audio>
  // <img src="" alt="Vidyard audio thumbnail" />
  // `);
  return '<img style="width: 100%; margin: auto; display: block;" class="vidyard-player-embed" src="https://play.vidyard.com/E16tuRdC8MYekAvHKqAonF.jpg"   data-uuid="E16tuRdC8MYekAvHKqAonF" data-v="4" data-type="inline">';
}

export function decorateVidyardAudio(block) {
  console.log(block);
}
