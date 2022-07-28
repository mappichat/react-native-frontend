import { h3ToGeoBoundary, h3ToGeo } from "h3-reactnative";

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

export function mapRegionFromH3(h3) {
  const [h3lat, h3lng] = h3ToGeo(h3);
  const [latDelta, lngDelta] = deltaFromH3(h3);
  return {
    latitude: h3lat,
    longitude: h3lng,
    latitudeDelta: latDelta * 1.5,
    longitudeDelta: lngDelta * 1.5,
  };
}