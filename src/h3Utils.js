import { h3ToGeoBoundary } from "h3-reactnative";

export function deltaFromH3(h3) {
  const bounds = h3ToGeoBoundary(h3);
  let minlat = Number.POSITIVE_INFINITY;
  let maxlat = Number.NEGATIVE_INFINITY;
  let minlng = Number.POSITIVE_INFINITY;
  let maxlng = Number.NEGATIVE_INFINITY;
  bounds.forEach(coord => {
    if (coord[0] < minlat) {
      minlat = coord[0];
    }
    if (coord[0] > maxlat) {
      maxlat = coord[0];
    }
    if (coord[1] < minlng) {
      minlng = coord[1];
    }
    if (coord[1] > maxlng) {
      maxlng = coord[1];
    }
  });
  return [maxlat - minlat, maxlng - minlng];
}

export function deltaFromBoundary(boundary) {
  let minlat = Number.POSITIVE_INFINITY;
  let maxlat = Number.NEGATIVE_INFINITY;
  let minlng = Number.POSITIVE_INFINITY;
  let maxlng = Number.NEGATIVE_INFINITY;
  boundary.forEach(coord => {
    if (coord[0] < minlat) {
      minlat = coord[0];
    }
    if (coord[0] > maxlat) {
      maxlat = coord[0];
    }
    if (coord[1] < minlng) {
      minlng = coord[1];
    }
    if (coord[1] > maxlng) {
      maxlng = coord[1];
    }
  });
  return [maxlat - minlat, maxlng - minlng];
}