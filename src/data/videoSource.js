// ─── Where the app looks for footage ───
//
// Every mp4 URL in the prototype pointed at a bucket that now returns 404, so
// nothing has actually played for a while. This is the one place to change when
// real files land: drop a file at public/day-video.mp4, or point this at a CDN
// path, and every player picks it up.
//
// Players that use it must fall back to their poster on error, so a missing file
// shows the still rather than a black rectangle.
export const SAMPLE_VIDEO = "/day-video.mp4";
